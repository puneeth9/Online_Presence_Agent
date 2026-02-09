const { v4: uuidv4 } = require('uuid');

const db = require('../db');
const { sendJobToQueue } = require('../services/sqs.service');

async function createJob(req, res) {
  try {
    const { name, description = '' } = req.body || {};
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Invalid request: name is required' });
    }
    if (description && typeof description !== 'string') {
      return res.status(400).json({ error: 'Invalid request: description must be a string' });
    }

    const jobId = uuidv4();
    const status = 'pending';

    await db.query(
      'INSERT INTO jobs (id, name, description, status) VALUES ($1, $2, $3, $4)',
      [jobId, name, description, status]
    );

    await sendJobToQueue({ jobId, name });

    return res.status(201).json({ jobId, status });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create job' });
  }
}

async function getJobStatus(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query('SELECT id, status FROM jobs WHERE id = $1', [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const row = result.rows[0];
    return res.json({ jobId: row.id, status: row.status });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch job status' });
  }
}

async function getResult(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query('SELECT id, result FROM jobs WHERE id = $1', [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const row = result.rows[0];
    return res.json({ jobId: row.id, result: row.result });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch job result' });
  }
}

module.exports = {
  createJob,
  getJobStatus,
  getResult,
};
