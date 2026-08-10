const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 7050;

app.use(express.json());
app.use(express.static('public'));

// --- Key management ---
const KEYS_FILE = 'keys.json';
let keys = {};
if (fs.existsSync(KEYS_FILE)) {
  keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
} else {
  // Generate a default key for demonstration
  const defaultKey = crypto.randomBytes(8).toString('hex');
  keys[defaultKey] = { ip: '', activated: false, created_at: Date.now() };
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

// --- Whitelist (IPs that are already registered) ---
const WHITELIST_FILE = 'whitelist.json';
let whitelist = [];
if (fs.existsSync(WHITELIST_FILE)) {
  whitelist = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf8'));
} else {
  whitelist = ['127.0.0.1'];
  fs.writeFileSync(WHITELIST_FILE, JSON.stringify(whitelist, null, 2));
}

function getClientIP(req) {
  return (req.ip || req.connection.remoteAddress || '').replace(/^::ffff:/, '');
}

// Middleware: check if request is authorized (key + IP)
function isAuthorized(req) {
  const ip = getClientIP(req);
  // First check if IP is in whitelist (legacy, or for admin)
  if (whitelist.includes(ip)) return true;
  // Check if any key is activated with this IP
  for (const key in keys) {
    if (keys[key].ip === ip && keys[key].activated === true) {
      return true;
    }
  }
  return false;
}

// Global middleware to check authorization
app.use((req, res, next) => {
  // Skip authorization for /register, /activate, and /admin/generate-key
  if (req.path === '/register' || req.path === '/activate' || req.path === '/admin/generate-key') {
    return next();
  }
  if (isAuthorized(req)) {
    return next();
  }
  res.status(403).json({ error: 'Not authorized. Please activate a valid key first.' });
});

// GET /register – shows IP and instructions
app.get('/register', (req, res) => {
  const ip = getClientIP(req);
  res.send(`
    <html><body style="background:#0a0a1a;color:#fff;font-family:monospace;padding:20px;">
      <h2>🔐 IP Registration</h2>
      <p>Your IP: <strong style="color:#8b5cf6;">${ip}</strong></p>
      <p>To register, activate a key via the dashboard (or ask admin to whitelist you).</p>
    </body></html>
  `);
});

// POST /activate – validate key and bind it to the caller's IP
app.post('/activate', (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: 'Key required' });
  const ip = getClientIP(req);
  if (keys[key]) {
    // Key exists
    if (keys[key].activated && keys[key].ip !== ip) {
      return res.status(403).json({ error: 'Key already activated on another IP' });
    }
    // Activate for this IP
    keys[key].ip = ip;
    keys[key].activated = true;
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
    // Also add IP to whitelist for convenience (so subsequent requests pass)
    if (!whitelist.includes(ip)) {
      whitelist.push(ip);
      fs.writeFileSync(WHITELIST_FILE, JSON.stringify(whitelist, null, 2));
    }
    res.json({ success: true, message: 'Key activated for this IP' });
  } else {
    res.status(404).json({ error: 'Invalid key' });
  }
});

// GET /admin/generate-key – generate a new key (admin only – no auth for simplicity, but you can add a secret)
app.get('/admin/generate-key', (req, res) => {
  // Optional: check for admin secret (e.g., ?secret=admin123)
  const secret = req.query.secret;
  if (secret !== 'admin123') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const newKey = crypto.randomBytes(8).toString('hex');
  keys[newKey] = { ip: '', activated: false, created_at: Date.now() };
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
  res.json({ key: newKey, message: 'New key generated' });
});

// GET / – serve current config (only if authorized)
app.get('/', (req, res) => {
  try {
    const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
    res.json(settings);
  } catch {
    res.status(500).json({ error: 'Settings error' });
  }
});

// POST /settings – update toggles (only if authorized)
app.post('/settings', (req, res) => {
  try {
    const current = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
    const updated = { ...current, aimbot: { ...current.aimbot, ...req.body.aimbot } };
    fs.writeFileSync('settings.json', JSON.stringify(updated, null, 2));
    res.json({ success: true, settings: updated });
  } catch {
    res.status(500).json({ error: 'Update failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Black Proxy running on port ${PORT}`);
  console.log(`📡 Dashboard: http://<your-ip>:${PORT}/`);
  console.log(`🔑 Generate a new key: http://<your-ip>:${PORT}/admin/generate-key?secret=admin123`);
  console.log(`📋 Existing keys:`, Object.keys(keys));
});