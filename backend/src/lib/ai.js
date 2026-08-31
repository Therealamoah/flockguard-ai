import { GoogleGenAI, Type } from '@google/genai';

let client = null;

function getClient() {
  if (client) return client;
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('AI detection is not configured on the server yet (GEMINI_API_KEY missing)');
  }
  client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

const MODEL = 'gemini-3.6-flash';

// Same call shape as the rule-based detectAnomaly() it replaces for
// Pro/Enterprise farms: (record, flock, priorRecords) -> { flagged, reasons }.
// Everything downstream (Verify, Alerts, the admin panel's
// confirmed/dismissed stats) only ever reads those two fields, so it never
// needs to know whether a rule or a model produced them.
export async function classifyRecord({ record, flock, priorRecords }) {
  const history = priorRecords
    .slice(0, 5)
    .map((r) => `- ${r.date}: feed ${r.feedKg}kg, water ${r.waterL}L, mortality ${r.mortality}`)
    .join('\n');

  const prompt = `You are a poultry flock health monitoring assistant. Analyze today's daily record for signs of a health or husbandry problem worth a farmer reviewing.

Flock: ${flock.name}, ${flock.type}, ${flock.birds} birds, house ${flock.house}.

Today's record:
- Feed: ${record.feedKg} kg
- Water: ${record.waterL} L
- Mortality: ${record.mortality} birds
- Temperature: ${record.temperature ?? 'not recorded'} °C
- Humidity: ${record.humidity ?? 'not recorded'} %
- Behavior: ${record.behavior}
- Notes: ${record.notes || 'none'}

Recent history (most recent first):
${history || 'No prior records for this flock yet.'}

Consider mortality spikes, feed/water drops relative to the recent trend, temperature outside ~24-31°C, humidity outside ~50-72%, and abnormal behavior. Flag it only if something is genuinely concerning, not for minor/normal variation. Reasons must be specific and reference the actual numbers -- never generic advice.`;

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          flagged: {
            type: Type.BOOLEAN,
            description: "Whether this record shows a concerning pattern worth the farmer's review",
          },
          reasons: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Specific reasons referencing the actual numbers. Empty array if not flagged.',
          },
        },
        required: ['flagged', 'reasons'],
      },
    },
  });

  const result = JSON.parse(response.text);
  return { flagged: Boolean(result.flagged), reasons: Array.isArray(result.reasons) ? result.reasons : [] };
}

// Fills in the "Guide" step -- runs once an alert is confirmed.
export async function generateRecommendation({ flockName, message }) {
  const prompt = `A poultry flock alert was just confirmed by a farmer:

Flock: ${flockName}
Issue: ${message}

Write a short, practical recommendation: what to check first, and when this warrants calling a vet. Be concrete and specific to this issue, not generic advice. 2-4 sentences for the body.`;

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Short action-oriented title, under 8 words' },
          body: { type: Type.STRING, description: 'The recommendation, 2-4 sentences' },
          priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
        },
        required: ['title', 'body', 'priority'],
      },
    },
  });

  return JSON.parse(response.text);
}
