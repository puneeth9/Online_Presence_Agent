const db = require('../db');

async function getHealth(req, res) {
  try {
    await db.query('SELECT 1');
    return res.json({ status: 'ok' });
  } catch (err) {
    return res.status(503).json({ status: 'down' });
  }
}

module.exports = {
  getHealth,
};
