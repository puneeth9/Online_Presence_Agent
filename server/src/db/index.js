const { Pool } = require('pg');

/**
 * jobs table schema:
 * - created automatically on server startup by `src/db/migrate.js`
 *
 * (Reference DDL)
 *
 * CREATE TABLE jobs (
 *   id UUID PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   description TEXT,
 *   status TEXT DEFAULT 'pending',
 *   result JSONB,
 *   created_at TIMESTAMP DEFAULT now()
 * );
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function query(text, params) {
  return pool.query(text, params);
}

async function connectDB() {
  await pool.query('SELECT 1');
  console.log('DB connected');
}

async function closeDB() {
  await pool.end();
  console.log('DB pool closed');
}

module.exports = {
  pool,
  query,
  connectDB,
  closeDB,
};
