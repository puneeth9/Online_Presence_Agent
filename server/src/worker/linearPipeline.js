'use strict';

const db = require('../db');
const { searchPerson } = require('./search.service');
const { fetchPage } = require('./fetch.service');
const { extractProfile } = require('./extract.service');

async function runLinearPipeline({ jobId, name, description }) {
  let sourcesCollected = 0;

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

  const profile = await extractProfile(name, description, sourcesRes.rows || []);

  return { ...profile, sourcesCollected };
}

module.exports = { runLinearPipeline };
