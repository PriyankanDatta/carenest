const { db } = require('../config/db');

function getAgencyProfile(req, res) {
  const profile = db.prepare(`
    SELECT ap.*, u.name, u.email, u.phone, u.status
    FROM agency_profiles ap
    JOIN users u ON ap.user_id = u.id
    WHERE ap.user_id = ?
  `).get(req.user.id);

  if (!profile) return res.status(404).json({ error: 'Agency profile not found' });
  res.json(profile);
}

function updateAgencyProfile(req, res) {
  const { agency_name, bio, city } = req.body;

  db.prepare(`
    UPDATE agency_profiles SET
      agency_name = COALESCE(?, agency_name),
      bio         = COALESCE(?, bio),
      city        = COALESCE(?, city)
    WHERE user_id = ?
  `).run(agency_name ?? null, bio ?? null, city ?? null, req.user.id);

  if (city) db.prepare('UPDATE users SET city = ? WHERE id = ?').run(city, req.user.id);

  res.json(db.prepare('SELECT * FROM agency_profiles WHERE user_id = ?').get(req.user.id));
}

function getRoster(req, res) {
  const rows = db.prepare(`
    SELECT cp.*, u.name, u.email, u.phone, u.status
    FROM caregiver_profiles cp
    JOIN users u ON cp.user_id = u.id
    WHERE cp.agency_id = ?
    ORDER BY u.name ASC
  `).all(req.user.id);

  res.json(rows.map(r => ({
    ...r,
    care_types: JSON.parse(r.care_types || '[]'),
    shifts:     JSON.parse(r.shifts     || '[]'),
  })));
}

function addToRoster(req, res) {
  const { caregiver_user_id } = req.body;
  if (!caregiver_user_id) return res.status(400).json({ error: 'caregiver_user_id required' });

  const cg = db.prepare(`
    SELECT cp.agency_id, u.role
    FROM caregiver_profiles cp
    JOIN users u ON cp.user_id = u.id
    WHERE cp.user_id = ?
  `).get(caregiver_user_id);

  if (!cg)           return res.status(404).json({ error: 'Caregiver not found' });
  if (cg.agency_id)  return res.status(400).json({ error: 'Caregiver is already affiliated with an agency' });

  db.prepare('UPDATE caregiver_profiles SET agency_id = ? WHERE user_id = ?').run(req.user.id, caregiver_user_id);
  res.json({ success: true, message: 'Caregiver added to roster' });
}

function removeFromRoster(req, res) {
  const cg = db.prepare(
    'SELECT id FROM caregiver_profiles WHERE user_id = ? AND agency_id = ?'
  ).get(req.params.caregiverId, req.user.id);

  if (!cg) return res.status(404).json({ error: 'Caregiver not in your roster' });

  db.prepare('UPDATE caregiver_profiles SET agency_id = NULL WHERE user_id = ?').run(req.params.caregiverId);
  res.json({ success: true, message: 'Caregiver removed from roster' });
}

function getAgencyBookings(req, res) {
  const rows = db.prepare(`
    SELECT b.*, cu.name as customer_name, cg.name as caregiver_name
    FROM bookings b
    JOIN users cu ON b.customer_id  = cu.id
    JOIN users cg ON b.caregiver_id = cg.id
    JOIN caregiver_profiles cp ON b.caregiver_id = cp.user_id
    WHERE cp.agency_id = ?
    ORDER BY b.created_at DESC
  `).all(req.user.id);

  res.json(rows);
}

module.exports = { getAgencyProfile, updateAgencyProfile, getRoster, addToRoster, removeFromRoster, getAgencyBookings };
