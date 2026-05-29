require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { initDatabase, initSchema, seedDatabase } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/caregivers', require('./routes/caregivers'));
app.use('/api/bookings',   require('./routes/bookings'));
app.use('/api/tickets',    require('./routes/tickets'));
app.use('/api/agency',     require('./routes/agency'));
app.use('/api/admin',      require('./routes/admin'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await initDatabase();
  initSchema();
  await seedDatabase();
  app.listen(PORT, () => console.log(`CareNest API → http://localhost:${PORT}`));
}

start();
