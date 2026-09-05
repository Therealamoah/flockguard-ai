const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// OpenRouter proxies many providers (Google, xAI, Anthropic, OpenAI, ...) behind
// one OpenAI-compatible request shape, so switching the underlying model later
// (e.g. once an xAI Grok key is available) is just an OPENROUTER_MODEL env var
// change -- no code changes needed here or anywhere downstream.
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

async function callOpenRouter({ prompt, schemaName, schema }) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('AI detection is not configured on the server yet (OPENROUTER_API_KEY missing)');
  }

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      // Optional but recommended by OpenRouter for attribution in their dashboard.
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
      'X-Title': 'FlockGuard',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      // Small structured JSON replies only -- capped well below the
      // provider's default so a low-credit account isn't rejected upfront
      // for a max_tokens budget this call will never actually use.
      max_tokens: 800,
      response_format: {
        type: 'json_schema',
        json_schema: { name: schemaName, strict: true, schema },
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `OpenRouter request failed (${res.status})`);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenRouter returned no content');
  return JSON.parse(content);
}

// Same call shape as the rule-based detectAnomaly() it replaces for
// Pro/Enterprise farms: (record, flock, priorRecords) -> { flagged, reasons }.
// Everything downstream (Verify, Alerts, the admin panel's
// confirmed/dismissed stats) only ever reads those two fields, so it never
// needs to know whether a rule or a model produced them.
//
// morningRecord is this same flock's morning check-in for today, if one was
// logged (feedKg/waterL there mean "given", not "eaten/taken" like the
// evening record) -- passing both lets the model catch a flock going off
// feed/water before it shows up any other way.
export async function classifyRecord({ record, flock, priorRecords, morningRecord = null }) {
  const history = priorRecords
    .slice(0, 5)
    .map((r) => `- ${r.date}: feed ${r.feedKg}kg, water ${r.waterL}L, mortality ${r.mortality}`)
    .join('\n');

  const prompt = `You are a poultry flock health monitoring assistant. Analyze today's evening check-in for signs of a health or husbandry problem worth a farmer reviewing.

Flock: ${flock.name}, ${flock.type}, ${flock.birds} birds, house ${flock.house}.

${
  morningRecord
    ? `This morning, the farmer gave ${morningRecord.feedKg} kg of feed and ${morningRecord.waterL} L of water.\n\n`
    : ''
}Tonight's evening check-in:
- Feed eaten: ${record.feedKg} kg${morningRecord ? ` (of ${morningRecord.feedKg} kg given this morning)` : ''}
- Water taken: ${record.waterL} L${morningRecord ? ` (of ${morningRecord.waterL} L given this morning)` : ''}
- Mortality: ${record.mortality} birds
- Temperature: ${record.temperature ?? 'not recorded'} °C
- Humidity: ${record.humidity ?? 'not recorded'} %
- Behavior: ${record.behavior}
- Notes: ${record.notes || 'none'}

Recent history (most recent first, evening figures):
${history || 'No prior records for this flock yet.'}

Consider mortality spikes, a meaningful gap between what was given this morning and what was actually eaten/taken by evening, feed/water drops relative to the recent trend, temperature outside ~24-31°C, humidity outside ~50-72%, and abnormal behavior. Flag it only if something is genuinely concerning, not for minor/normal variation. Reasons must be specific and reference the actual numbers -- never generic advice.

Respond with JSON only.`;

  const result = await callOpenRouter({
    prompt,
    schemaName: 'record_classification',
    schema: {
      type: 'object',
      properties: {
        flagged: {
          type: 'boolean',
          description: "Whether this record shows a concerning pattern worth the farmer's review",
        },
        reasons: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific reasons referencing the actual numbers. Empty array if not flagged.',
        },
      },
      required: ['flagged', 'reasons'],
      additionalProperties: false,
    },
  });

  return { flagged: Boolean(result.flagged), reasons: Array.isArray(result.reasons) ? result.reasons : [] };
}

// Fills in the "Guide" step -- runs once an alert is confirmed.
export async function generateRecommendation({ flockName, message }) {
  const prompt = `A poultry flock alert was just confirmed by a farmer:

Flock: ${flockName}
Issue: ${message}

Write a short, practical recommendation: what to check first, and when this warrants calling a vet. Be concrete and specific to this issue, not generic advice. 2-4 sentences for the body.

Respond with JSON only.`;

  return callOpenRouter({
    prompt,
    schemaName: 'recommendation',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short action-oriented title, under 8 words' },
        body: { type: 'string', description: 'The recommendation, 2-4 sentences' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['title', 'body', 'priority'],
      additionalProperties: false,
    },
  });
}
