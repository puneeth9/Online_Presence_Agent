'use strict';

const { searchPerson } = require('../worker/search.service');
const { fetchPage } = require('../worker/fetch.service');
const { callLLM } = require('../worker/llm.service');
const db = require('../db');

// ---------------------------------------------------------------------------
// OpenAI function-calling tool schemas
// ---------------------------------------------------------------------------

const TOOL_SCHEMAS = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description:
        'Search the web for information about a person. Returns up to 5 results with title, url, and snippet.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query to execute.',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_page',
      description:
        'Fetch the text content of a web page. Persists the source to the database. Returns the url and extracted text.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL of the page to fetch.',
          },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'assess_completeness',
      description:
        'Assess whether the current findings are sufficient to build a complete profile. Returns whether the profile is complete, any missing fields, and a suggested next search query.',
      parameters: {
        type: 'object',
        properties: {
          current_findings: {
            type: 'string',
            description:
              'A summary of what has been found so far about the person.',
          },
        },
        required: ['current_findings'],
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

async function toolWebSearch({ query }) {
  // Reuse the existing Brave search service. Pass the full query as both
  // name and description so the service's buildQuery concatenates cleanly.
  const results = await searchPerson(query, '');
  return results; // [{ title, url, snippet }]
}

async function toolFetchPage({ url }, { jobId }) {
  const text = await fetchPage(url);

  // Persist the source exactly as the linear flow does, with a null title/
  // snippet since the agent only passes the URL (title+snippet come from
  // the search result that preceded it, not from this tool call).
  await db.query(
    'INSERT INTO sources(job_id, url, title, snippet, content) VALUES($1,$2,$3,$4,$5)',
    [jobId, url, null, null, text]
  );

  return { url, text: text || '' };
}

async function toolAssessCompleteness({ current_findings }) {
  const prompt = `You are evaluating whether enough information has been gathered to build a complete professional profile.

Current findings:
${current_findings}

Respond with STRICT JSON ONLY — no markdown, no prose, no code fences:
{
  "complete": <true|false>,
  "missing_fields": ["list of fields that are still missing or uncertain"],
  "suggested_next_query": "a targeted search query to fill the most important gap, or empty string if complete"
}`;

  let raw;
  try {
    raw = await callLLM(prompt);
  } catch (err) {
    return { complete: false, missing_fields: [], suggested_next_query: '' };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return { complete: false, missing_fields: [], suggested_next_query: '' };
  }
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

async function executeTool(name, args, context) {
  switch (name) {
    case 'web_search':
      return toolWebSearch(args);
    case 'fetch_page':
      return toolFetchPage(args, context);
    case 'assess_completeness':
      return toolAssessCompleteness(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

module.exports = {
  TOOL_SCHEMAS,
  executeTool,
};
