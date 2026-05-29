const { db } = require('../config/db');

const DETAIL_SELECT = `
  SELECT b.*,
    cu.name  as customer_name,  cu.phone  as customer_phone,  cu.email  as customer_email,
    cg.name  as caregiver_name, cg.phone  as caregiver_phone, cg.email  as caregiver_email
  FROM bookings b
  JOIN users cu ON b.customer_id  = cu.id
  JOIN users cg ON b.caregiver_id = cg.id
`;

function createBooking(req, res) {
  const { caregiver_id, care_type, shift, city, start_date, end_date, notes } = req.body;

  if (!caregiver_id || !care_type || !shift || !city || !start_date || !end_date) {
    return res.status(400).json({ error: 'caregiver_id, care_type, shift, city, start_date, end_date are required' });
  }

  const cg = db.prepare(`
    SELECT cp.daily_rate, u.status, cp.approval_status
    FROM caregiver_profiles cp
    JOIN users u ON cp.user_id = u.id
    WHERE cp.user_id = ?
  `).get(caregiver_id);

  if (!cg || cg.approval_status !== 'approved' || cg.status !== 'active') {
    return res.status(404).json({ error: 'Caregiver not found or unavailable' });
  }

  const days = Math.max(1, Math.ceil(
    (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)
  ));
  const total_amount = days * (cg.daily_rate || 1500);

  const result = db.prepare(`
    INSERT INTO bookings
      (customer_id, caregiver_id, care_type, shift, city, start_date, end_date, status, total_amount, payment_status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, 'pending', ?)
  `).run(req.user.id, caregiver_id, care_type, shift, city, start_date, end_date, total_amount, notes || null);

  res.status(201).json(db.prepare(DETAIL_SELECT + ' WHERE b.id = ?').get(result.lastInsertRowid));
}

function getBookings(req, res) {
  const { role, id } = req.user;
  let rows;

  if (role === 'customer') {
    rows = db.prepare(DETAIL_SELECT + ' WHERE b.customer_id = ? ORDER BY b.created_at DESC').all(id);
  } else if (role === 'caregiver') {
    rows = db.prepare(DETAIL_SELECT + ' WHERE b.caregiver_id = ? ORDER BY b.created_at DESC').all(id);
  } else if (role === 'agency') {
    rows = db.prepare(DETAIL_SELECT + `
      JOIN caregiver_profiles cp ON b.caregiver_id = cp.user_id
      WHERE cp.agency_id = ? ORDER BY b.created_at DESC
    `).all(id);
  } else {
    rows = db.prepare(DETAIL_SELECT + ' ORDER BY b.created_at DESC').all();
  }

  res.json(rows);
}

function getBookingById(req, res) {
  const booking = db.prepare(DETAIL_SELECT + ' WHERE b.id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const { role, id } = req.user;
  if (role === 'customer'  && booking.customer_id  !== id) return res.status(403).json({ error: 'Access denied' });
  if (role === 'caregiver' && booking.caregiver_id !== id) return res.status(403).json({ error: 'Access denied' });
  if (role === 'agency') {
    const inRoster = db.prepare('SELECT id FROM caregiver_profiles WHERE user_id = ? AND agency_id = ?').get(booking.caregiver_id, id);
    if (!inRoster) return res.status(403).json({ error: 'Access denied' });
  }

  res.json(booking);
}

function updateBookingStatus(req, res) {
  const { status } = req.body;
  const { role, id } = req.user;
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);

  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const valid = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  if (role === 'customer') {
    if (booking.customer_id !== id) return res.status(403).json({ error: 'Access denied' });
    if (status !== 'cancelled')     return res.status(403).json({ error: 'Customers can only cancel bookings' });
  }
  if (role === 'caregiver') {
    if (booking.caregiver_id !== id) return res.status(403).json({ error: 'Access denied' });
  }

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, booking.id);
  res.json({ ...booking, status });
}

function mockPayment(req, res) {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND customer_id = ?').get(req.params.id, req.user.id);
  if (!booking)                          return res.status(404).json({ error: 'Booking not found' });
  if (booking.payment_status === 'paid') return res.status(400).json({ error: 'Already paid' });

  db.prepare("UPDATE bookings SET payment_status = 'paid', status = 'confirmed' WHERE id = ?").run(booking.id);
  res.json({ success: true, message: 'Payment successful (demo)', booking_id: booking.id, amount: booking.total_amount });
}

module.exports = { createBooking, getBookings, getBookingById, updateBookingStatus, mockPayment };
