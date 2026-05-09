import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

app.use(cors());
app.use(express.json());

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Initial Database Structure
const INITIAL_DB = {
  users: [
    { id: 'admin', username: 'admin', password: 'password', role: 'admin', name: 'System Admin' }
  ],
  stats: {}, // userId -> stats object
  settings: {}, // userId -> settings object
  config: { signupsEnabled: true }
};

// Database Helper Functions
const readDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2));
    return INITIAL_DB;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) {
    return INITIAL_DB;
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// --- Auth API ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, name } = req.body;
  const db = readDB();
  
  if (!db.config.signupsEnabled) {
    return res.status(403).json({ success: false, message: 'Signups are disabled.' });
  }
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: 'Username exists.' });
  }

  const newUser = { id: Date.now().toString(), username, password, name, role: 'user' };
  db.users.push(newUser);
  writeDB(db);
  res.json({ success: true, user: newUser });
});

// --- Config API ---
app.get('/api/config', (req, res) => {
  const db = readDB();
  res.json(db.config);
});

app.post('/api/config', (req, res) => {
  const db = readDB();
  db.config = { ...db.config, ...req.body };
  writeDB(db);
  res.json(db.config);
});

app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});

// --- Data API ---
app.get('/api/data/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDB();
  res.json({
    stats: db.stats[userId] || null,
    settings: db.settings[userId] || null
  });
});

app.post('/api/data/:userId/stats', (req, res) => {
  const { userId } = req.params;
  const db = readDB();
  db.stats[userId] = req.body;
  writeDB(db);
  res.json({ success: true });
});

app.post('/api/data/:userId/settings', (req, res) => {
  const { userId } = req.params;
  const db = readDB();
  db.settings[userId] = req.body;
  writeDB(db);
  res.json({ success: true });
});

// Admin: Delete User
app.delete('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  if (userId === 'admin') return res.status(403).json({ success: false });
  
  const db = readDB();
  db.users = db.users.filter(u => u.id !== userId);
  delete db.stats[userId];
  delete db.settings[userId];
  writeDB(db);
  res.json({ success: true });
});

// Admin: Change Password
app.post('/api/users/:userId/password', (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.password = newPassword;
    writeDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

// Health check
app.get('/health.json', (req, res) => {
  res.json({ status: 'up', persistence: 'server-side', version: '1.3.0' });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Persistence data stored in ${DB_PATH}`);
});
