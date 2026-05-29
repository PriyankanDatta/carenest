const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function register(req, res) {
  const { email, password, name, phone, role, city } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'email, password, name, and role are required' });
  }
  if (!['customer', 'caregiver', 'agency'].includes(role)) {
    return res.status(400).json({ error: 'Role must be customer, caregiver, or agency' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const password_hash = await bcrypt.hash(password, 10);
  const status = role === 'customer' ? 'active' : 'pending_approval';

  const result = db.prepare(`
    INSERT INTO users (email, password_hash, name, phone, role, status, city)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(email, password_hash, name, phone || null, role, status, city || null);

  const userId = result.lastInsertRowid;

  if (role === 'caregiver') {
    db.prepare(`
      INSERT INTO caregiver_profiles (user_id, city, care_types, shifts)
      VALUES (?, ?, '[]', '[]')
    `).run(userId, city || '');
  }

  if (role === 'agency') {
    db.prepare(`
      INSERT INTO agency_profiles (user_id, agency_name, city)
      VALUES (?, ?, ?)
    `).run(userId, name, city || '');
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.status(201).json({
    token: signToken(user),
    user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status },
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Account suspended. Please contact support.' });
  }

  res.json({
    token: signToken(user),
    user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status },
  });
}

function getMe(req, res) {
  const user = db.prepare(
    'SELECT id, email, name, phone, role, status, city, created_at FROM users WHERE id = ?'
  ).get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}

module.exports = { register, login, getMe };
