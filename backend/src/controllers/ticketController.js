const { db } = require('../config/db');

function createTicket(req, res) {
  const { subject, description, booking_id } = req.body;
  if (!subject || !description) return res.status(400).json({ error: 'Subject and description required' });

  if (booking_id && !db.prepare('SELECT id FROM bookings WHERE id = ?').get(booking_id)) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const result = db.prepare(`
    INSERT INTO support_tickets (created_by, subject, description, status, booking_id)
    VALUES (?, ?, ?, 'open', ?)
  `).run(req.user.id, subject, description, booking_id || null);

  res.status(201).json(db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(result.lastInsertRowid));
}

function getTickets(req, res) {
  const { role, id } = req.user;
  const base = `
    SELECT t.*, u.name as created_by_name, u.role as created_by_role
    FROM support_tickets t
    JOIN users u ON t.created_by = u.id
  `;
  const rows = role === 'admin'
    ? db.prepare(base + ' ORDER BY t.created_at DESC').all()
    : db.prepare(base + ' WHERE t.created_by = ? ORDER BY t.created_at DESC').all(id);

  res.json(rows);
}

function getTicketById(req, res) {
  const ticket = db.prepare(`
    SELECT t.*, u.name as created_by_name, u.role as created_by_role
    FROM support_tickets t
    JOIN users u ON t.created_by = u.id
    WHERE t.id = ?
  `).get(req.params.id);

  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (req.user.role !== 'admin' && ticket.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const replies = db.prepare(`
    SELECT tr.*, u.name as author_name, u.role as author_role
    FROM ticket_replies tr
    JOIN users u ON tr.user_id = u.id
    WHERE tr.ticket_id = ?
    ORDER BY tr.created_at ASC
  `).all(ticket.id);

  res.json({ ...ticket, replies });
}

function addReply(req, res) {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  if (req.user.role !== 'admin' && ticket.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  if (ticket.status === 'resolved') {
    return res.status(400).json({ error: 'Cannot reply to a resolved ticket' });
  }

  if (req.user.role === 'admin' && ticket.status === 'open') {
    db.prepare("UPDATE support_tickets SET status = 'in_progress' WHERE id = ?").run(ticket.id);
  }

  const result = db.prepare(
    'INSERT INTO ticket_replies (ticket_id, user_id, message) VALUES (?, ?, ?)'
  ).run(ticket.id, req.user.id, message);

  const reply = db.prepare(`
    SELECT tr.*, u.name as author_name, u.role as author_role
    FROM ticket_replies tr
    JOIN users u ON tr.user_id = u.id
    WHERE tr.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(reply);
}

function updateTicketStatus(req, res) {
  const { status } = req.body;
  if (!['open', 'in_progress', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  db.prepare('UPDATE support_tickets SET status = ? WHERE id = ?').run(status, ticket.id);
  res.json({ ...ticket, status });
}

module.exports = { createTicket, getTickets, getTicketById, addReply, updateTicketStatus };
