const axios = require('axios');

function buildQuery(name, description) {
  let query = (name || '').trim();
  const desc = (description || '').trim();
  if (desc) query = `${query} ${desc}`;
  return query;
}

async function searchPerson(name, description) {
  const query = buildQuery(name, description);
  if (!query) return [];

  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing BRAVE_API_KEY');
  }

  console.log(`Searching Brave for: ${query}`);

  const response = await axios.get(
    'https://api.search.brave.com/res/v1/web/search',
    {
      params: { q: query },
      headers: {
        'X-Subscription-Token': apiKey,
        Accept: 'application/json',
      },
      timeout: 15000,
    }
  );

  // Brave response schema typically nests results under `web.results`.
  const rawResults =
    response.data?.web?.results ||
    response.data?.results ||
    response.data?.web?.items ||
    [];

  const results = rawResults
    .map((r) => ({
      title: r.title || r.name || null,
      url: r.url || r.link || null,
      snippet: r.snippet || r.description || r.summary || null,
    }))
    .filter((r) => r.url)
    .slice(0, 5);

  console.log(`Found ${results.length} results`);
  return results;
}

module.exports = {
  searchPerson,
};

