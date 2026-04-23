const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const STAGE_CONTEXT = {
  seed:       'early-stage startup validating problem-market fit',
  'series-a': 'growth-stage company with initial traction seeking scale',
  'scale-up': 'scaling company optimizing a proven business model',
  enterprise: 'enterprise organization with an established customer base',
};

const cap = (s, n = 500) => (s && s.length > n) ? s.slice(0, n) + '…' : (s || '(none)');

function buildPrompt(draft) {
  return `You are a senior product strategy advisor evaluating a product idea for a ${STAGE_CONTEXT[draft.ideaStage] || 'B2B SaaS company'}.

Evaluate this product idea across 8 dimensions. Score each 0–100. Be rigorous — scores above 80 require genuinely strong evidence in the brief. Scores below 40 indicate a critical gap.

PRODUCT IDEA:
Title: ${cap(draft.ideaTitle, 120)}
Problem: ${cap(draft.problem)}
Target User: ${cap(draft.target)}
Value Proposition: ${cap(draft.valueProp)}
Solution Sketch: ${cap(draft.solution)}
Differentiation: ${cap(draft.differentiation)}
Known Competitors: ${cap(draft.competitors, 200)}
Distribution Channel: ${cap(draft.channels)}
Success Metric: ${cap(draft.successMetric)}
Constraints: ${cap(draft.constraints)}

SCORING DIMENSIONS:
1. problemClarity (0–100): Is the problem specific, real, and tied to a moment? High: concrete trigger event + quantified cost + clear frequency. Low: vague theme.
2. userSpecificity (0–100): Is the target user narrow enough to be recruitable? High: role + company size/context, distinguishable from "everyone". Low: could describe anyone.
3. valueClarity (0–100): Is the value proposition crisp and credible? High: clear outcome + magnitude + not just a feature list. Low: reads like a press release.
4. differentiation (0–100): Is there a defensible angle vs. alternatives? High: specific mechanism of difference. Low: "better" or "faster" with no reason.
5. distribution (0–100): Is there a realistic path to the first 100 customers? High: named channel + why it works for this product. Low: "marketing" with no loop.
6. successMetric (0–100): Is the metric measurable and meaningful? High: a number + timeframe + tied to business value. Low: "improve outcomes".
7. feasibility (0–100): Are constraints acknowledged and manageable? High: constraints named, mitigation hinted. Penalize HIPAA/GDPR/ML complexity if not addressed.
8. competitiveSpace (0–100): Is the landscape navigable? High: competitors named + clear gap. Penalize crowded markets without differentiation.

Verdict logic (based on weighted average of the 8 scores):
- "Pursue" if overall >= 76
- "Refine" if overall 56–75
- "Pass for now" if overall < 56

Respond with ONLY valid JSON matching this exact schema — no markdown, no explanation:
{
  "scores": {
    "problemClarity": <integer 0-100>,
    "userSpecificity": <integer 0-100>,
    "valueClarity": <integer 0-100>,
    "differentiation": <integer 0-100>,
    "distribution": <integer 0-100>,
    "successMetric": <integer 0-100>,
    "feasibility": <integer 0-100>,
    "competitiveSpace": <integer 0-100>
  },
  "verdict": "Pursue" | "Refine" | "Pass for now",
  "verdictReason": "<2-3 sentence explanation of overall verdict, referencing the strongest and weakest area>",
  "dimensionNotes": {
    "problemClarity": "<one sentence: why this score, citing specific evidence or lack of it>",
    "userSpecificity": "<one sentence: why this score>",
    "valueClarity": "<one sentence: why this score>",
    "differentiation": "<one sentence: why this score>",
    "distribution": "<one sentence: why this score>",
    "successMetric": "<one sentence: why this score>",
    "feasibility": "<one sentence: why this score>",
    "competitiveSpace": "<one sentence: why this score>"
  },
  "dimensionImprovements": {
    "problemClarity": "<one sentence: the single most impactful thing that would raise this score>",
    "userSpecificity": "<one sentence: what would raise this score>",
    "valueClarity": "<one sentence: what would raise this score>",
    "differentiation": "<one sentence: what would raise this score>",
    "distribution": "<one sentence: what would raise this score>",
    "successMetric": "<one sentence: what would raise this score>",
    "feasibility": "<one sentence: what would raise this score>",
    "competitiveSpace": "<one sentence: what would raise this score>"
  },
  "tags": ["<tag>"],
  "strongSignals": ["<signal>", "<signal>"],
  "weakAssumptions": ["<assumption>", "<assumption>"]
}

Tags must only be chosen from this list: problem-clear, user-specific, value-crisp, differentiated, channel-named, metric-solid, feasible, competitive-gap, problem-vague, target-vague, value-fuzzy, low-diff, channel-missing, metric-missing, high-constraints, crowded-space`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const draft = req.body;
  if (!draft || !draft.ideaTitle) {
    return res.status(400).json({ error: 'draft data with ideaTitle required' });
  }

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: buildPrompt(draft) }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    if (!analysis.scores || !analysis.verdict) {
      console.error('Malformed OpenAI response:', JSON.stringify(analysis).slice(0, 200));
      return res.status(500).json({ error: 'Analysis failed. Try again.' });
    }
    return res.status(200).json(analysis);
  } catch (err) {
    console.error('OpenAI error:', err.message);
    return res.status(500).json({ error: 'Analysis failed. Try again.' });
  }
};
