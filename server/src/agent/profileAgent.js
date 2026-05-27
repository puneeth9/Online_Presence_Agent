'use strict';

const { callLLMWithTools, callLLM } = require('../worker/llm.service');
const { TOOL_SCHEMAS, executeTool } = require('./tools');

const MAX_ITERATIONS = 20;

// ---------------------------------------------------------------------------
// Main agent entry point
// ---------------------------------------------------------------------------

async function runProfileAgent({ jobId, name, description }) {
  console.log(`[agent] starting profile agent for job ${jobId} — target: ${name}`);

  let fetchCount = 0;
  let done = false;

  const messages = [
    {
      role: 'system',
      content: `You are a research agent. Your goal is to build a structured professional profile of a person from public web data.

You have three tools:
- web_search: search the web with a query string
- fetch_page: fetch and read the content of a specific URL
- assess_completeness: evaluate whether your findings are sufficient; call this periodically

Strategy:
1. Start with a web_search for the person's name and any context given.
2. Fetch only the most promising pages (LinkedIn, company bios, news articles, official sites). Skip low-value pages.
3. After gathering initial data, call assess_completeness with a summary of what you have found so far.
4. If assess_completeness says the profile is incomplete, use suggested_next_query to issue a targeted follow-up search.
5. Repeat until assess_completeness returns complete=true or you have exhausted promising sources.
6. When done, stop calling tools. Your final message should summarize all findings in plain prose for synthesis.

Be efficient. Do not fetch redundant pages. Prefer authoritative sources.`,
    },
    {
      role: 'user',
      content: `Research this person and build a comprehensive profile.
Name: ${name}${description ? `\nAdditional context: ${description}` : ''}`,
    },
  ];

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
    console.log(`[agent] iteration ${iteration}/${MAX_ITERATIONS}`);

    const assistantMessage = await callLLMWithTools({ messages, tools: TOOL_SCHEMAS });
    messages.push(assistantMessage);

    // Stop condition 1: model returned no tool calls — it has finished reasoning.
    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      console.log('[agent] stop: model-no-tool (model finished reasoning)');
      break;
    }

    // Execute each tool call in the response.
    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;

      let args;
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch {
        args = {};
      }

      // Concise one-line log per tool call.
      const argSummary =
        toolName === 'web_search'
          ? `query="${args.query}"`
          : toolName === 'fetch_page'
          ? `url="${args.url}"`
          : `findings_length=${String(args.current_findings || '').length}`;
      console.log(`[agent]   tool_call: ${toolName} — ${argSummary}`);

      let result;
      try {
        result = await executeTool(toolName, args, { jobId });
      } catch (err) {
        console.log(`[agent]   tool_call failed: ${toolName} — ${err.message}`);
        result = { error: err.message };
      }

      if (toolName === 'fetch_page' && !result.error) {
        fetchCount += 1;
      }

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });

      // Stop condition 2: assess_completeness reported the profile is complete.
      if (toolName === 'assess_completeness' && result.complete === true) {
        console.log('[agent] stop: assess-complete (completeness tool signalled done)');
        done = true;
      }
    }

    if (done) break;

    // Stop condition 3 (implicit): loop exits when iteration reaches MAX_ITERATIONS.
    if (iteration === MAX_ITERATIONS) {
      console.log('[agent] stop: max-iterations reached');
    }
  }

  // ---------------------------------------------------------------------------
  // Finalize: synthesize the accumulated findings into the required profile schema.
  // ---------------------------------------------------------------------------
  console.log('[agent] finalizing — synthesizing profile JSON');

  // Build a condensed context from the conversation for the synthesis prompt.
  const findingsSummary = messages
    .filter((m) => m.role === 'tool')
    .map((m) => {
      try {
        const parsed = JSON.parse(m.content);
        if (Array.isArray(parsed)) {
          // web_search result
          return parsed.map((r) => `- ${r.title} (${r.url}): ${r.snippet}`).join('\n');
        }
        if (parsed.text) {
          // fetch_page result
          return `[page: ${parsed.url}]\n${parsed.text.slice(0, 2000)}`;
        }
        return '';
      } catch {
        return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');

  const synthesisPrompt = `Based on the following web research findings, produce a structured JSON profile. Output STRICT JSON ONLY — no markdown, no prose, no code fences.

Target: ${name}${description ? ` (${description})` : ''}

Research findings:
${findingsSummary || '(no findings collected)'}

Required JSON schema:
{
  "summary": "2-3 sentence professional summary",
  "roles": ["list of professional roles/titles"],
  "companies": ["list of companies/organizations the person is or was associated with"],
  "confidence": <0.0 to 1.0 reflecting data quality>,
  "key_links": ["list of key URLs found"]
}`;

  let profile;
  try {
    const raw = await callLLM(synthesisPrompt);
    // Strip markdown fences if the model adds them despite instructions.
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    profile = JSON.parse(cleaned);
  } catch (err) {
    console.log(`[agent] synthesis parse failed: ${err.message} — using empty profile`);
    profile = {
      summary: '',
      roles: [],
      companies: [],
      confidence: 0,
      key_links: [],
    };
  }

  profile.sourcesCollected = fetchCount;

  console.log(
    `[agent] done — sourcesCollected=${fetchCount} confidence=${profile.confidence}`
  );

  return profile;
}

module.exports = {
  runProfileAgent,
};
