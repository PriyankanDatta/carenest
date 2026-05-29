const { db } = require('../config/db');

function browseCaregivers(req, res) {
  const { city, care_type, shift, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const conditions = ["cp.approval_status = 'approved'", "u.status = 'active'"];
  const params = [];

  if (city)      { conditions.push('cp.city = ?');           params.push(city); }
  if (care_type) { conditions.push('cp.care_types LIKE ?');  params.push(`%${care_type}%`); }
  if (shift)     { conditions.push('cp.shifts LIKE ?');      params.push(`%${shift}%`); }

  const where = 'WHERE ' + conditions.join(' AND ');

  const { total } = db.prepare(`
    SELECT COUNT(*) as total
    FROM caregiver_profiles cp
    JOIN users u ON cp.user_id = u.id
    ${where}
  `).get(...params);

  const caregivers = db.prepare(`
    SELECT cp.id, cp.user_id, u.name, u.phone, cp.bio, cp.city,
           cp.care_types, cp.shifts, cp.experience_years,
           cp.hourly_rate, cp.daily_rate, cp.profile_photo_url,
           cp.is_available, cp.agency_id, a.agency_name
    FROM caregiver_profiles cp
    JOIN users u ON cp.user_id = u.id
    LEFT JOIN agency_profiles a ON cp.agency_id = a.user_id
    ${where}
    ORDER BY cp.experience_years DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset).map(parse);

  res.json({ caregivers, total, page: parseInt(page), limit: parseInt(limit) });
}

function getCaregiverProfile(req, res) {
  const row = db.prepare(`
    SELECT cp.*, u.name, u.email, u.phone, a.agency_name
    FROM caregiver_profiles cp
    JOIN users u ON cp.user_id = u.id
    LEFT JOIN agency_profiles a ON cp.agency_id = a.user_id
    WHERE cp.user_id = ? OR cp.id = ?
  `).get(req.params.id, req.params.id);

  if (!row) return res.status(404).json({ error: 'Caregiver not found' });
  res.json(parse(row));
}

function getMyProfile(req, res) {
  const row = db.prepare(`
    SELECT cp.*, u.name, u.email, u.phone, a.agency_name
    FROM caregiver_profiles cp
    JOIN users u ON cp.user_id = u.id
    LEFT JOIN agency_profiles a ON cp.agency_id = a.user_id
    WHERE cp.user_id = ?
  `).get(req.user.id);

  if (!row) return res.status(404).json({ error: 'Profile not found' });
  res.json(parse(row));
}

function updateMyProfile(req, res) {
  const { bio, city, care_types, shifts, experience_years, hourly_rate, daily_rate, is_available } = req.body;

  const existing = db.prepare('SELECT id FROM caregiver_profiles WHERE user_id = ?').get(req.user.id);
  if (!existing) return res.status(404).json({ error: 'Profile not found' });

  db.prepare(`
    UPDATE caregiver_profiles SET
      bio             = COALESCE(?, bio),
      city            = COALESCE(?, city),
      care_types      = COALESCE(?, care_types),
      shifts          = COALESCE(?, shifts),
      experience_years= COALESCE(?, experience_years),
      hourly_rate     = COALESCE(?, hourly_rate),
      daily_rate      = COALESCE(?, daily_rate),
      is_available    = COALESCE(?, is_available)
    WHERE user_id = ?
  `).run(
    bio ?? null,
    city ?? null,
    care_types ? JSON.stringify(care_types) : null,
    shifts     ? JSON.stringify(shifts)     : null,
    experience_years ?? null,
    hourly_rate      ?? null,
    daily_rate       ?? null,
    is_available !== undefined ? (is_available ? 1 : 0) : null,
    req.user.id
  );

  if (city) db.prepare('UPDATE users SET city = ? WHERE id = ?').run(city, req.user.id);

  const updated = db.prepare('SELECT * FROM caregiver_profiles WHERE user_id = ?').get(req.user.id);
  res.json(parse(updated));
}

function parse(row) {
  return {
    ...row,
    care_types: JSON.parse(row.care_types || '[]'),
    shifts:     JSON.parse(row.shifts     || '[]'),
  };
}

module.exports = { browseCaregivers, getCaregiverProfile, getMyProfile, updateMyProfile };
