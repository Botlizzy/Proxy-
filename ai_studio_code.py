import os
import uuid
from flask import Flask, render_template, request, jsonify, send_file, after_this_request
import yt_dlp

app = Flask(__name__)

# Directory to temporarily store downloads
DOWNLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloads")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/info", methods=["POST"])
def get_video_info():
    """Fetches title, thumbnail, and duration before downloading."""
    data = request.get_json() or {}
    url = data.get("url", "").strip()

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return jsonify({
                "title": info.get("title", "Video"),
                "thumbnail": info.get("thumbnail"),
                "duration": info.get("duration"),
                "uploader": info.get("uploader"),
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/download", methods=["POST"])
def download_video():
    """Downloads the video to the server and serves it to the user."""
    data = request.get_json() or {}
    url = data.get("url", "").strip()
    download_format = data.get("format", "mp4")  # 'mp4' or 'mp3'

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    # Unique ID to avoid filename collisions
    unique_id = str(uuid.uuid4())
    template_path = os.path.join(DOWNLOAD_DIR, f"{unique_id}_%(title).100s.%(ext)s")

    if download_format == "mp3":
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": template_path,
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }],
            "quiet": True,
        }
    else:
        ydl_opts = {
            # Best video + best audio merged into mp4
            "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "outtmpl": template_path,
            "merge_output_format": "mp4",
            "quiet": True,
        }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(url, download=True)
            # Find the actual generated file
            downloaded_file = ydl.prepare_filename(result)
            if download_format == "mp3":
                base, _ = os.path.splitext(downloaded_file)
                downloaded_file = base + ".mp3"

        if not os.path.exists(downloaded_file):
            return jsonify({"error": "File processing failed"}), 500

        filename = os.path.basename(downloaded_file)

        # Cleanup file after sending
        @after_this_request
        def remove_file(response):
            try:
                if os.path.exists(downloaded_file):
                    os.remove(downloaded_file)
            except Exception as err:
                app.logger.error(f"Error removing file: {err}")
            return response

        return send_file(
            downloaded_file,
            as_attachment=True,
            download_name=filename.split("_", 1)[-1]  # Remove UUID prefix
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)