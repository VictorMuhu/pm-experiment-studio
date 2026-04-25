import OpenAI from 'openai';

let _client;
function getClient() {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

const LENS_PERSONAS = {
  skeptic:    "A devil's advocate who hunts for unvalidated assumptions, logical gaps, and claims that sound good but aren't falsifiable. You are not trying to kill the idea — you are trying to surface what must be true for it to work.",
  builder:    "A staff engineer evaluating what it would actually take to ship this. You flag hidden technical complexity, integration risks, data dependencies, and the gap between 'solution sketch' and working software.",
  buyer:      "A skeptical economic buyer who controls the budget. You evaluate whether the ROI story is credible, whether procurement friction is acknowledged, and whether you'd actually sign off on this.",
  competitor: "A product lead at the closest substitute. You evaluate why your users wouldn't switch, where the new product's differentiation is weak, and what the incumbent response would be.",
};


export function buildSystemPrompt(lens) {
  const persona = LENS_PERSONAS[lens] || LENS_PERSONAS.skeptic;
  return `You are ${persona}

Read this product idea carefully. Think aloud — for each claim, assumption, or signal you notice, output one JSON object on its own line. Each object must include:
- "type": "thought"
- "category": "concern" or "strength"
- "text": your observation (1–2 sentences, direct and specific)
- "quote": the exact phrase from the input that triggered this thought

After all thoughts, output one final object:
- "type": "verdict"
- "label": "Pursue", "Refine", or "Pass"
- "score": integer 0–100
- "reason": 2-sentence summary referencing the strongest and weakest signal

Output nothing else. No markdown. No wrapper object. One JSON object per line.`;
}

export function buildUserPrompt(ideaText) {
  return `Product idea:\n${(ideaText || '').slice(0, 2000)}`;
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ideaText, lens } = req.body || {};
  if (!ideaText || !ideaText.trim()) {
    return res.status(400).json({ error: 'ideaText is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let buffer = '';
  let ended = false;

  try {
    const stream = await getClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: buildSystemPrompt(lens) },
        { role: 'user', content: buildUserPrompt(ideaText) },
      ],
      stream: true,
      temperature: 0.4,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      buffer += delta;

      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          JSON.parse(trimmed);
          res.write(`data: ${trimmed}\n\n`);
        } catch {
          // skip malformed line
        }
      }
    }

    if (buffer.trim()) {
      try {
        JSON.parse(buffer.trim());
        res.write(`data: ${buffer.trim()}\n\n`);
      } catch {}
    }
  } catch (err) {
    if (!ended) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream interrupted' })}\n\n`);
    }
  } finally {
    if (!ended) {
      ended = true;
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
}

export default handler;
