async function callLLM(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid prompt');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // OpenAI SDK is ESM-first; dynamic import keeps this CommonJS-friendly.
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });

  const text = completion?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Empty LLM response');
  }

  return text.trim();
}

module.exports = {
  callLLM,
};

