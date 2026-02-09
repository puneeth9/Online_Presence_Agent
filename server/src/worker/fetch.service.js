const axios = require('axios');

function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';

  // Remove scripts/styles first.
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');

  // Strip remaining tags.
  text = text.replace(/<\/?[^>]+>/g, ' ');

  // Collapse whitespace.
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

async function fetchPage(url) {
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      // Avoid downloading extremely large responses.
      maxContentLength: 1024 * 1024 * 2,
      responseType: 'text',
      headers: {
        'User-Agent': 'online-presence-agent-worker/1.0',
        Accept: 'text/html,application/xhtml+xml',
      },
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const text = stripHtml(res.data);
    if (!text) return null;

    console.log(`Fetched page: ${url}`);
    return text.slice(0, 5000);
  } catch (err) {
    return null;
  }
}

module.exports = {
  fetchPage,
};

