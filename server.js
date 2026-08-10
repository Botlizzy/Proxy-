const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 7050;

app.use(express.json());
app.use(express.static('public'));

// --- Keys ---
const KEYS_FILE = 'keys.json';
let keys = {};
if (fs.existsSync(KEYS_FILE)) {
  keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
} else {
  const defaultKey = crypto.randomBytes(8).toString('hex');
  keys[defaultKey] = { ip: '', activated: false, created_at: Date.now() };
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

// --- Whitelist ---
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

function isAuthorized(req) {
  const ip = getClientIP(req);
  if (whitelist.includes(ip)) return true;
  for (const key in keys) {
    if (keys[key].ip === ip && keys[key].activated === true) return true;
  }
  return false;
}

// ---- API Routes (for the dashboard) ----

// GET /config – returns JSON settings (for modded APK)
app.get('/config', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  try {
    const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
    res.json(settings);
  } catch {
    res.status(500).json({ error: 'Settings error' });
  }
});

// POST /settings – update toggles (for dashboard)
app.post('/settings', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  try {
    const current = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
    const updated = { ...current, aimbot: { ...current.aimbot, ...req.body.aimbot } };
    fs.writeFileSync('settings.json', JSON.stringify(updated, null, 2));
    res.json({ success: true, settings: updated });
  } catch {
    res.status(500).json({ error: 'Update failed' });
  }
});

// POST /activate – key activation
app.post('/activate', (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: 'Key required' });
  const ip = getClientIP(req);
  if (keys[key]) {
    if (keys[key].activated && keys[key].ip !== ip) {
      return res.status(403).json({ error: 'Key already activated on another IP' });
    }
    keys[key].ip = ip;
    keys[key].activated = true;
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
    if (!whitelist.includes(ip)) {
      whitelist.push(ip);
      fs.writeFileSync(WHITELIST_FILE, JSON.stringify(whitelist, null, 2));
    }
    res.json({ success: true, message: 'Key activated for this IP' });
  } else {
    res.status(404).json({ error: 'Invalid key' });
  }
});

// GET /admin/generate-key – generate new key
app.get('/admin/generate-key', (req, res) => {
  const secret = req.query.secret;
  if (secret !== 'admin123') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const newKey = crypto.randomBytes(8).toString('hex');
  keys[newKey] = { ip: '', activated: false, created_at: Date.now() };
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
  res.json({ key: newKey, message: 'New key generated' });
});

// GET /ip – returns the client's IP (for dashboard)
app.get('/ip', (req, res) => {
  const ip = getClientIP(req);
  res.json({ ip });
});

// ---- Dashboard HTML (served at root) ----
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Black Proxy running on port ${PORT}`);
  console.log(`📡 Dashboard: http://<your-ip>:${PORT}/`);
  console.log(`🔑 Generate a key: http://<your-ip>:${PORT}/admin/generate-key?secret=admin123`);
  console.log(`📋 Existing keys:`, Object.keys(keys));
});