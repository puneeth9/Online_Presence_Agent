const db = require('../db');

const { searchPerson } = require('./search.service');
const { fetchPage } = require('./fetch.service');
const { extractProfile } = require('./extract.service');

async function processJob(job) {
  const { jobId, name } = job || {};
  if (!jobId || typeof jobId !== 'string') {
    throw new Error('Invalid job payload: jobId is required');
  }

  let sourcesCollected = 0;

  try {
    await db.query("UPDATE jobs SET status='processing' WHERE id=$1", [jobId]);

    const jobRow = await db.query(
      'SELECT description FROM jobs WHERE id=$1',
      [jobId]
    );
    const description = jobRow.rows?.[0]?.description || '';

    const results = await searchPerson(name, description);

    for (const r of results) {
      const content = await fetchPage(r.url);

      await db.query(
        'INSERT INTO sources(job_id, url, title, snippet, content) VALUES($1,$2,$3,$4,$5)',
        [jobId, r.url, r.title, r.snippet, content]
      );

      sourcesCollected += 1;
      console.log('Inserted source');
    }

    const sourcesRes = await db.query(
      'SELECT url, title, snippet, content FROM sources WHERE job_id=$1 ORDER BY id ASC',
      [jobId]
    );

    const profile = await extractProfile(
      name,
      description,
      sourcesRes.rows || []
    );

    const result = { ...profile, sourcesCollected };
    await db.query(
      "UPDATE jobs SET status='completed', result=$2 WHERE id=$1",
      [jobId, JSON.stringify(result)]
    );

    console.log('Job completed');
  } catch (err) {
    const errorPayload = {
      error: err && err.message ? err.message : 'Unknown error',
      sourcesCollected,
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
