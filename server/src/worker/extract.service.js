const { callLLM } = require('./llm.service');

function buildSourcesText(sources, maxChars) {
  const parts = [];
  for (const s of sources || []) {
    const title = s.title || '';
    const url = s.url || '';
    const snippet = s.snippet || '';
    const content = s.content || '';

    parts.push(
      [
        '--- SOURCE ---',
        title ? `Title: ${title}` : null,
        url ? `URL: ${url}` : null,
        snippet ? `Snippet: ${snippet}` : null,
        content ? `Content: ${content}` : null,
      ]
        .filter(Boolean)
        .join('\n')
    );

    if (parts.join('\n\n').length >= maxChars) break;
  }

  const text = parts.join('\n\n');
  return text.slice(0, maxChars);
}

function extractJsonString(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return trimmed;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    return trimmed.slice(first, last + 1);
  }

  return trimmed;
}

async function extractProfile(name, description, sources) {
  const sourcesText = buildSourcesText(sources, 30000);

  const prompt = [
    'You are extracting a structured profile from web sources.',
    '',
    'Return ONLY valid JSON (no markdown, no code fences, no commentary).',
    'The JSON must match this shape exactly:',
    '{',
    '  "summary": string,',
    '  "roles": string[],',
    '  "companies": string[],',
    '  "confidence": number,',
    '  "key_links": string[]',
    '}',
    '',
    `Name: ${name || ''}`,
    `Description: ${description || ''}`,
    '',
    'Sources:',
    sourcesText || '(no sources)',
  ].join('\n');

  const responseText = await callLLM(prompt);
  const jsonText = extractJsonString(responseText);
  const parsed = JSON.parse(jsonText);

  return parsed;
}

module.exports = {
  extractProfile,
};

