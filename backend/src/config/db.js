const initSqlJs = require('sql.js');
const bcrypt    = require('bcrypt');
const fs        = require('fs');
const path      = require('path');

const DB_PATH = path.join(__dirname, '../../database/carenest.db');
const dbDir   = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// ── Compatibility wrapper ─────────────────────────────────────────────────────
// Provides a better-sqlite3-style synchronous API on top of sql.js so all
// controllers work without modification.

class Statement {
  constructor(sql, sqlDb, onWrite) {
    this._sql     = sql;
    this._sqlDb   = sqlDb;
    this._onWrite = onWrite;
    this._isWrite = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|REPLACE)/i.test(sql.trim());
  }

  _rows(args) {
    const params = args.flat();
    const stmt   = this._sqlDb.prepare(this._sql);
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  get(...args)  { return this._rows(args)[0]; }
  all(...args)  { return this._rows(args); }

  run(...args) {
    const params = args.flat();
    this._sqlDb.run(this._sql, params.length ? params : undefined);
    const res  = this._sqlDb.exec('SELECT last_insert_rowid()');
    const id   = Number(res[0]?.values?.[0]?.[0] ?? 0);
    if (this._isWrite) this._onWrite();
    return { lastInsertRowid: id };
  }
}

class DbWrapper {
  constructor(sqlDb, saveDb) {
    this._sqlDb  = sqlDb;
    this._saveDb = saveDb;
  }
  prepare(sql)  { return new Statement(sql, this._sqlDb, this._saveDb); }
  exec(sql)     { this._sqlDb.exec(sql); this._saveDb(); }
  pragma(str)   { try { this._sqlDb.run(`PRAGMA ${str}`); } catch {} }
}

// Proxy lets controllers do `const { db } = require('./db')` at module load time
// (before async init) and still get a live reference once init completes.
let _instance = null;
const db = new Proxy({}, {
  get(_, prop) {
    if (!_instance) throw new Error('DB not initialised — call initDatabase() first');
    const v = _instance[prop];
    return typeof v === 'function' ? v.bind(_instance) : v;
  },
});

// ── Initialise sql.js ─────────────────────────────────────────────────────────
async function initDatabase() {
  const SQL   = await initSqlJs();
  const sqlDb = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  sqlDb.run('PRAGMA foreign_keys = ON');

  function saveDb() {
    fs.writeFileSync(DB_PATH, Buffer.from(sqlDb.export()));
  }

  _instance = new DbWrapper(sqlDb, saveDb);
}

// ── Schema ────────────────────────────────────────────────────────────────────
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT    UNIQUE NOT NULL,
      password_hash TEXT    NOT NULL,
      name          TEXT    NOT NULL,
      phone         TEXT,
      role          TEXT    NOT NULL CHECK(role IN ('customer','caregiver','agency','admin')),
      status        TEXT    NOT NULL DEFAULT 'active' CHECK(status IN ('active','pending_approval','suspended')),
      city          TEXT,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS caregiver_profiles (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id          INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      bio              TEXT,
      city             TEXT    NOT NULL DEFAULT '',
      care_types       TEXT    NOT NULL DEFAULT '[]',
      shifts           TEXT    NOT NULL DEFAULT '[]',
      experience_years INTEGER DEFAULT 0,
      hourly_rate      INTEGER,
      daily_rate       INTEGER,
      profile_photo_url TEXT,
      is_available     INTEGER NOT NULL DEFAULT 1,
      agency_id        INTEGER REFERENCES users(id),
      approval_status  TEXT    NOT NULL DEFAULT 'pending' CHECK(approval_status IN ('pending','approved','rejected')),
      created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agency_profiles (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id         INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      agency_name     TEXT    NOT NULL,
      bio             TEXT,
      city            TEXT    NOT NULL DEFAULT '',
      logo_url        TEXT,
      approval_status TEXT    NOT NULL DEFAULT 'pending' CHECK(approval_status IN ('pending','approved','rejected')),
      created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id    INTEGER NOT NULL REFERENCES users(id),
      caregiver_id   INTEGER NOT NULL REFERENCES users(id),
      care_type      TEXT    NOT NULL,
      shift          TEXT    NOT NULL,
      city           TEXT    NOT NULL,
      start_date     TEXT    NOT NULL,
      end_date       TEXT    NOT NULL,
      status         TEXT    NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','in_progress','completed','cancelled')),
      total_amount   INTEGER NOT NULL,
      payment_status TEXT    NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending','paid')),
      notes          TEXT,
      created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      created_by  INTEGER NOT NULL REFERENCES users(id),
      subject     TEXT    NOT NULL,
      description TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved')),
      booking_id  INTEGER REFERENCES bookings(id),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ticket_replies (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id  INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id),
      message    TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// ── Seed data ─────────────────────────────────────────────────────────────────
async function seedDatabase() {
  const existing = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (existing.c > 0) return;

  const SALT     = 10;
  const demoHash = await bcrypt.hash('demo1234', SALT);
  const seedHash = await bcrypt.hash('seed1234', SALT);

  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, name, phone, role, status, city)
    VALUES (?, ?, ?, ?, ?, 'active', ?)
  `);

  const customer  = insertUser.run('customer@demo.com',  demoHash, 'Priya Sharma',      '9876543210', 'customer',  'Bangalore');
  const caregiver = insertUser.run('caregiver@demo.com', demoHash, 'Ramesh Kumar',      '9123456780', 'caregiver', 'Bangalore');
  const agency    = insertUser.run('agency@demo.com',    demoHash, 'CarePlus Services', '9988776655', 'agency',    'Bangalore');
  const admin     = insertUser.run('admin@demo.com',     demoHash, 'Admin User',        '9000000000', 'admin',     null);

  const customerId  = customer.lastInsertRowid;
  const caregiverId = caregiver.lastInsertRowid;
  const agencyId    = agency.lastInsertRowid;
  const adminId     = admin.lastInsertRowid;

  // Agency profile
  db.prepare(`
    INSERT INTO agency_profiles (user_id, agency_name, bio, city, approval_status)
    VALUES (?, ?, ?, ?, 'approved')
  `).run(agencyId, 'CarePlus Services', 'A trusted home care agency in Bangalore with 50+ verified caregivers.', 'Bangalore');

  // Demo caregiver profile
  const cgInsert = db.prepare(`
    INSERT INTO caregiver_profiles
      (user_id, bio, city, care_types, shifts, experience_years, hourly_rate, daily_rate, profile_photo_url, is_available, agency_id, approval_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'approved')
  `);

  cgInsert.run(
    caregiverId,
    'Experienced male nurse with 5 years in elderly care and post-surgery recovery.',
    'Bangalore',
    JSON.stringify(['Elderly Care', 'Post-Surgery Care']),
    JSON.stringify(['Morning', 'Afternoon']),
    5, 200, 1500,
    `https://ui-avatars.com/api/?name=Ramesh+Kumar&background=0ea5e9&color=fff&size=128`,
    null
  );

  // Extra seed caregivers
  const extras = [
    { name:'Sunita Reddy',  email:'sunita@seed.com',  phone:'9111222333', city:'Bangalore', bio:'Compassionate nurse specialising in elderly care and physiotherapy assistance.',       careTypes:['Elderly Care','Physiotherapy Assistance'],   shifts:['Morning','Full Day'],          exp:7, hourly:250, daily:1800, color:'10b981', agId:agencyId },
    { name:'Arun Nair',     email:'arun@seed.com',    phone:'9222333444', city:'Bangalore', bio:'Night-shift specialist with ICU step-down and home-based care experience.',            careTypes:['Post-Surgery Care','Night Duty'],             shifts:['Night'],                       exp:4, hourly:300, daily:2000, color:'8b5cf6', agId:null },
    { name:'Meena Pillai',  email:'meena@seed.com',   phone:'9333444555', city:'Bangalore', bio:'Certified house help with elderly care training. Available for full-day duties.',      careTypes:['House Help','Elderly Care'],                  shifts:['Full Day','Morning'],          exp:3, hourly:150, daily:1000, color:'f59e0b', agId:agencyId },
    { name:'Vijay Desai',   email:'vijay@seed.com',   phone:'9444555666', city:'Bangalore', bio:'Trained physiotherapy assistant helping patients with post-operative rehabilitation.', careTypes:['Physiotherapy Assistance','Post-Surgery Care'], shifts:['Morning','Afternoon'],        exp:6, hourly:350, daily:2500, color:'ef4444', agId:null },
    { name:'Geeta Rao',     email:'geeta@seed.com',   phone:'9000111222', city:'Bangalore', bio:'Dedicated female caregiver available for night duties and post-surgery care.',        careTypes:['Night Duty','Post-Surgery Care'],             shifts:['Night','Afternoon'],           exp:4, hourly:280, daily:1800, color:'06b6d4', agId:agencyId },
    { name:'Lakshmi Bai',   email:'lakshmi@seed.com', phone:'9555666777', city:'Delhi',     bio:'Gentle and reliable caregiver with focus on dementia and elderly care.',              careTypes:['Elderly Care'],                               shifts:['Morning','Afternoon','Full Day'], exp:8, hourly:220, daily:1600, color:'0ea5e9', agId:null },
    { name:'Pankaj Gupta',  email:'pankaj@seed.com',  phone:'9666777888', city:'Delhi',     bio:'Male nurse with ICU background. Expert in post-surgery and night-duty home care.',    careTypes:['Post-Surgery Care','Night Duty'],             shifts:['Night','Full Day'],            exp:5, hourly:280, daily:1900, color:'10b981', agId:null },
    { name:'Anjali Singh',  email:'anjali@seed.com',  phone:'9777888999', city:'Delhi',     bio:'Warm and experienced house help with additional elderly care training.',               careTypes:['House Help','Elderly Care'],                  shifts:['Morning','Afternoon'],         exp:2, hourly:140, daily:900,  color:'8b5cf6', agId:null },
    { name:'Ravi Shankar',  email:'ravi@seed.com',    phone:'9888999000', city:'Delhi',     bio:'Physiotherapy assistant certified by AIIMS Delhi. Specialised in ortho recovery.',    careTypes:['Physiotherapy Assistance'],                   shifts:['Morning','Afternoon','Full Day'], exp:9, hourly:400, daily:3000, color:'f59e0b', agId:null },
  ];

  for (const cg of extras) {
    const u = insertUser.run(cg.email, seedHash, cg.name, cg.phone, 'caregiver', cg.city);
    cgInsert.run(
      u.lastInsertRowid, cg.bio, cg.city,
      JSON.stringify(cg.careTypes), JSON.stringify(cg.shifts),
      cg.exp, cg.hourly, cg.daily,
      `https://ui-avatars.com/api/?name=${encodeURIComponent(cg.name)}&background=${cg.color}&color=fff&size=128`,
      cg.agId || null
    );
  }

  // Sample confirmed & paid booking
  const bk = db.prepare(`
    INSERT INTO bookings (customer_id, caregiver_id, care_type, shift, city, start_date, end_date, status, total_amount, payment_status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, 'paid', ?)
  `).run(customerId, caregiverId, 'Elderly Care', 'Morning', 'Bangalore', '2026-06-01', '2026-06-07', 10500, 'My father needs daily morning assistance with medication and exercises.');

  // Sample support ticket with admin reply
  const tk = db.prepare(`
    INSERT INTO support_tickets (created_by, subject, description, status, booking_id)
    VALUES (?, ?, ?, 'open', ?)
  `).run(customerId, 'Caregiver arrived late on first day', 'Ramesh arrived 45 minutes late on June 1st. Please look into this.', bk.lastInsertRowid);

  db.prepare('INSERT INTO ticket_replies (ticket_id, user_id, message) VALUES (?, ?, ?)').run(
    tk.lastInsertRowid, adminId,
    'Thank you for reporting this. We have flagged it to the caregiver and will ensure punctuality going forward.'
  );

  console.log('Database seeded with demo data');
}

module.exports = { db, initDatabase, initSchema, seedDatabase };
