import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { VERSION } from './src/version.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.sqlite');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const SIGNUPS_ENABLED = process.env.SIGNUPS_ENABLED !== 'false';

app.use(cors());
app.use(express.json());

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// --- Database setup ---
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role     TEXT NOT NULL DEFAULT 'user',
    name     TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token   TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_stats (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data    TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data    TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS config (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Seed admin if absent
if (!db.prepare('SELECT id FROM users WHERE id = ?').get('admin')) {
  db.prepare('INSERT INTO users (id, username, password, role, name) VALUES (?, ?, ?, ?, ?)')
    .run('admin', ADMIN_USER, bcrypt.hashSync(ADMIN_PASSWORD, 10), 'admin', 'System Admin');
}

// Seed signupsEnabled config if absent
if (!db.prepare("SELECT key FROM config WHERE key = 'signupsEnabled'").get()) {
  db.prepare("INSERT INTO config (key, value) VALUES ('signupsEnabled', ?)").run(JSON.stringify(SIGNUPS_ENABLED));
}

// --- One-time migration from db.json ---
const JSON_DB_PATH = path.join(DATA_DIR, 'db.json');
if (fs.existsSync(JSON_DB_PATH)) {
  try {
    const old = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
    db.transaction(() => {
      for (const u of old.users || []) {
        if (!db.prepare('SELECT id FROM users WHERE id = ?').get(u.id)) {
          db.prepare('INSERT INTO users (id, username, password, role, name) VALUES (?, ?, ?, ?, ?)')
            .run(u.id, u.username, u.password, u.role || 'user', u.name || u.username);
        }
      }
      for (const [token, userId] of Object.entries(old.sessions || {})) {
        db.prepare('INSERT OR IGNORE INTO sessions (token, user_id) VALUES (?, ?)').run(token, userId);
      }
      for (const [userId, data] of Object.entries(old.stats || {})) {
        db.prepare('INSERT OR IGNORE INTO user_stats (user_id, data) VALUES (?, ?)').run(userId, JSON.stringify(data));
      }
      for (const [userId, data] of Object.entries(old.settings || {})) {
        db.prepare('INSERT OR IGNORE INTO user_settings (user_id, data) VALUES (?, ?)').run(userId, JSON.stringify(data));
      }
      for (const [key, value] of Object.entries(old.config || {})) {
        db.prepare('INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)').run(key, JSON.stringify(value));
      }
    })();
    fs.renameSync(JSON_DB_PATH, JSON_DB_PATH + '.migrated');
    console.log('Migrated db.json → SQLite');
  } catch (e) {
    console.error('db.json migration failed:', e.message);
  }
}

const safeUser = (u) => ({ id: u.id, username: u.username, name: u.name, role: u.role });

const getConfig = () => {
  const rows = db.prepare('SELECT key, value FROM config').all();
  return Object.fromEntries(rows.map(r => [r.key, JSON.parse(r.value)]));
};

// --- Auth middleware ---
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const token = header.slice(7);
  const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id);
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }
  req.userId = user.id;
  req.userRole = user.role;
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
};

// --- Auth API ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isBcrypt = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
  if (!isBcrypt) {
    // Migrate plaintext password on first login
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(password, 10), user.id);
  } else if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, user.id);
  res.json({ success: true, token, user: safeUser(user) });
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  }
  if (!getConfig().signupsEnabled) {
    return res.status(403).json({ success: false, message: 'Signups are disabled.' });
  }
  if (db.prepare('SELECT id FROM users WHERE username = ?').get(username)) {
    return res.status(400).json({ success: false, message: 'Username exists.' });
  }
  const newUser = {
    id: Date.now().toString(),
    username,
    password: bcrypt.hashSync(password, 10),
    name,
    role: 'user'
  };
  db.prepare('INSERT INTO users (id, username, password, name, role) VALUES (?, ?, ?, ?, ?)')
    .run(newUser.id, newUser.username, newUser.password, newUser.name, newUser.role);
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, newUser.id);
  res.json({ success: true, token, user: safeUser(newUser) });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(req.headers.authorization.slice(7));
  res.json({ success: true });
});

// --- Config API ---
app.get('/api/config', (req, res) => {
  res.json(getConfig());
});

app.post('/api/config', requireAuth, requireAdmin, (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(key, JSON.stringify(value));
  }
  res.json(getConfig());
});

app.get('/api/users', requireAuth, requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM users').all().map(safeUser));
});

// --- Data API ---
app.get('/api/data/:userId', requireAuth, (req, res) => {
  const { userId } = req.params;
  if (req.userId !== userId && req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  const statsRow = db.prepare('SELECT data FROM user_stats WHERE user_id = ?').get(userId);
  const settingsRow = db.prepare('SELECT data FROM user_settings WHERE user_id = ?').get(userId);
  res.json({
    stats: statsRow ? JSON.parse(statsRow.data) : null,
    settings: settingsRow ? JSON.parse(settingsRow.data) : null
  });
});

app.post('/api/data/:userId/stats', requireAuth, (req, res) => {
  const { userId } = req.params;
  if (req.userId !== userId && req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  db.prepare('INSERT OR REPLACE INTO user_stats (user_id, data) VALUES (?, ?)').run(userId, JSON.stringify(req.body));
  res.json({ success: true });
});

app.post('/api/data/:userId/settings', requireAuth, (req, res) => {
  const { userId } = req.params;
  if (req.userId !== userId && req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  db.prepare('INSERT OR REPLACE INTO user_settings (user_id, data) VALUES (?, ?)').run(userId, JSON.stringify(req.body));
  res.json({ success: true });
});

// Admin: Delete User — CASCADE cleans sessions, stats, settings
app.delete('/api/users/:userId', requireAuth, requireAdmin, (req, res) => {
  const { userId } = req.params;
  if (userId === 'admin') return res.status(403).json({ success: false });
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.json({ success: true });
});

// Change Password (self or admin)
app.post('/api/users/:userId/password', requireAuth, (req, res) => {
  const { userId } = req.params;
  if (req.userId !== userId && req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  }
  if (!db.prepare('SELECT id FROM users WHERE id = ?').get(userId)) {
    return res.status(404).json({ success: false });
  }
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), userId);
  res.json({ success: true });
});

// Health check
app.get('/health.json', (req, res) => {
  res.json({ status: 'up', persistence: 'sqlite', version: VERSION });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${DB_PATH}`);
});
