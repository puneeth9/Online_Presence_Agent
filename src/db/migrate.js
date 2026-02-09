const { pool } = require('./index');

async function runMigrations() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        result JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sources (
        id SERIAL PRIMARY KEY,
        job_id UUID REFERENCES jobs(id),
        url TEXT,
        title TEXT,
        snippet TEXT,
        content TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Migrations completed');
  } catch (err) {
    console.error('Migration failed', err);
    throw err;
  }
}

module.exports = {
  runMigrations,
};
