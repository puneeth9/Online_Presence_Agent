const db = require('../db');
const { runProfileAgent } = require('../agent/profileAgent');
const { runLinearPipeline } = require('./linearPipeline')

async function processJob(job) {
  const { jobId, name } = job || {};
  if (!jobId || typeof jobId !== 'string') {
    throw new Error('Invalid job payload: jobId is required');
  }

  try {
    await db.query("UPDATE jobs SET status='processing' WHERE id=$1", [jobId]);

    const jobRow = await db.query(
      'SELECT description FROM jobs WHERE id=$1',
      [jobId]
    );
    const description = jobRow.rows?.[0]?.description || '';

    const result = await runLinearPipeline({ jobId, name, description });

    await db.query(
      "UPDATE jobs SET status='completed', result=$2 WHERE id=$1",
      [jobId, JSON.stringify(result)]
    );

    console.log('Job completed');
  } catch (err) {
    const errorPayload = {
      error: err && err.message ? err.message : 'Unknown error',
    };

    try {
      await db.query("UPDATE jobs SET status='failed', result=$2 WHERE id=$1", [
        jobId,
        JSON.stringify(errorPayload),
      ]);
    } catch (innerErr) {
      // If we can't update DB, surface the original error.
    }

    throw err;
  }
}

module.exports = {
  processJob,
};
