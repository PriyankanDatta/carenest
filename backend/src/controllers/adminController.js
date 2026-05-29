const { db } = require('../config/db');

function getDashboard(req, res) {
  const totalUsers      = db.prepare("SELECT COUNT(*) as c FROM users WHERE role != 'admin'").get().c;
  const pendingApprovals= db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'pending_approval'").get().c;
  const totalBookings   = db.prepare("SELECT COUNT(*) as c FROM bookings").get().c;
  const activeBookings  = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status IN ('confirmed','in_progress')").get().c;
  const openTickets     = db.prepare("SELECT COUNT(*) as c FROM support_tickets WHERE status != 'resolved'").get().c;
  const totalRevenue    = db.prepare("SELECT COALESCE(SUM(total_amount),0) as t FROM bookings WHERE payment_status='paid'").get().t;

  const recentBookings  = db.prepare(`
    SELECT b.id, b.status, b.total_amount, b.created_at, b.care_type,
           cu.name as customer_name, cg.name as caregiver_name
    FROM bookings b
    JOIN users cu ON b.customer_id  = cu.id
    JOIN users cg ON b.caregiver_id = cg.id
    ORDER BY b.created_at DESC LIMIT 5
  `).all();

  const recentTickets   = db.prepare(`
    SELECT t.id, t.subject, t.status, t.created_at, u.name as created_by_name
    FROM support_tickets t
    JOIN users u ON t.created_by = u.id
    ORDER BY t.created_at DESC LIMIT 5
  `).all();

  res.json({ totalUsers, pendingApprovals, totalBookings, activeBookings, openTickets, totalRevenue, recentBookings, recentTickets });
}

function getPendingApprovals(req, res) {
  const pending = db.prepare(`
    SELECT id, email, name, phone, role, city, created_at
    FROM users WHERE status = 'pending_approval'
    ORDER BY created_at ASC
  `).all();

  const result = pending.map(u => {
    if (u.role === 'caregiver') {
      const p = db.prepare('SELECT * FROM caregiver_profiles WHERE user_id = ?').get(u.id);
      return { ...u, profile: p ? { ...p, care_types: JSON.parse(p.care_types || '[]'), shifts: JSON.parse(p.shifts || '[]') } : null };
    }
    if (u.role === 'agency') {
      return { ...u, profile: db.prepare('SELECT * FROM agency_profiles WHERE user_id = ?').get(u.id) };
    }
    return u;
  });

  res.json(result);
}

function processApproval(req, res) {
  const { action } = req.body;
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'action must be approve or reject' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newStatus = action === 'approve' ? 'active' : 'suspended';
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(newStatus, user.id);

  if (action === 'approve') {
    if (user.role === 'caregiver') db.prepare("UPDATE caregiver_profiles SET approval_status='approved' WHERE user_id=?").run(user.id);
    if (user.role === 'agency')    db.prepare("UPDATE agency_profiles    SET approval_status='approved' WHERE user_id=?").run(user.id);
  } else {
    if (user.role === 'caregiver') db.prepare("UPDATE caregiver_profiles SET approval_status='rejected' WHERE user_id=?").run(user.id);
    if (user.role === 'agency')    db.prepare("UPDATE agency_profiles    SET approval_status='rejected' WHERE user_id=?").run(user.id);
  }

  res.json({ success: true, userId: user.id, action, newStatus });
}

function getAllUsers(req, res) {
  const { role: filterRole, status: filterStatus, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const conditions = ['1=1'];
  const params = [];
  if (filterRole)   { conditions.push('role = ?');   params.push(filterRole); }
  if (filterStatus) { conditions.push('status = ?'); params.push(filterStatus); }
  const where = 'WHERE ' + conditions.join(' AND ');

  const total = db.prepare(`SELECT COUNT(*) as c FROM users ${where}`).get(...params).c;
  const users = db.prepare(`
    SELECT id, email, name, phone, role, status, city, created_at
    FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
}

function updateUser(req, res) {
  const { status, name, phone } = req.body;
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  db.prepare(`
    UPDATE users SET
      status = COALESCE(?, status),
      name   = COALESCE(?, name),
      phone  = COALESCE(?, phone)
    WHERE id = ?
  `).run(status ?? null, name ?? null, phone ?? null, req.params.id);

  res.json(db.prepare('SELECT id, email, name, phone, role, status, city, created_at FROM users WHERE id = ?').get(req.params.id));
}

function getAllBookings(req, res) {
  const { status: filterStatus, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const conditions = ['1=1'];
  const params = [];
  if (filterStatus) { conditions.push('b.status = ?'); params.push(filterStatus); }
  const where = 'WHERE ' + conditions.join(' AND ');

  const rows = db.prepare(`
    SELECT b.*, cu.name as customer_name, cg.name as caregiver_name
    FROM bookings b
    JOIN users cu ON b.customer_id  = cu.id
    JOIN users cg ON b.caregiver_id = cg.id
    ${where}
    ORDER BY b.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json(rows);
}

function getAllTickets(req, res) {
  const { status: filterStatus, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const conditions = ['1=1'];
  const params = [];
  if (filterStatus) { conditions.push('t.status = ?'); params.push(filterStatus); }
  const where = 'WHERE ' + conditions.join(' AND ');

  const rows = db.prepare(`
    SELECT t.*, u.name as created_by_name, u.role as created_by_role
    FROM support_tickets t
    JOIN users u ON t.created_by = u.id
    ${where}
    ORDER BY t.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json(rows);
}

module.exports = { getDashboard, getPendingApprovals, processApproval, getAllUsers, updateUser, getAllBookings, getAllTickets };
