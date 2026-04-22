# Idea Validator Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real GPT-4o scoring, Supabase persistence, and shareable evaluation links to the existing Idea Validator — without rewriting the frontend.

**Architecture:** Vercel serverless functions in `api/` proxy all external calls (OpenAI + Supabase) so API keys never reach the browser. The existing vanilla JS frontend's `runCheck()` becomes async and calls `/api/analyze`. A `transformApiResponse()` bridge maps the AI response to the exact shape existing render functions already expect — zero changes to scorecard, assumptions, or next-steps rendering. A URL check on page load enables a read-only share view at `/eval/:id`. Live hints while typing continue to use the existing heuristic `analyzeDraft()`.

**Tech Stack:** Node.js 18 (Vercel serverless, CommonJS), `openai` npm package (GPT-4o), `@supabase/supabase-js` npm package, vanilla HTML/CSS/JS (existing, minimal changes)

**Spec:** `docs/superpowers/specs/2026-04-22-idea-validator-upgrade-design.md`
**Wireframes:** `docs/design/idea-validator-upgrade/`

---

## File Map

| Status | Path | Responsibility |
|--------|------|----------------|
| CREATE | `projects/2026-03-17-idea-validator/package.json` | npm deps for Vercel functions |
| CREATE | `projects/2026-03-17-idea-validator/vercel.json` | SPA rewrite + function config |
| CREATE | `projects/2026-03-17-idea-validator/.env.local` | Local dev secrets (gitignored) |
| MODIFY | `projects/2026-03-17-idea-validator/.gitignore` | Add .env entries |
| CREATE | `projects/2026-03-17-idea-validator/api/analyze.js` | POST /api/analyze → GPT-4o |
| CREATE | `projects/2026-03-17-idea-validator/api/save.js` | POST /api/save → Supabase insert |
| CREATE | `projects/2026-03-17-idea-validator/api/eval/[id].js` | GET /api/eval/:id → Supabase read |
| MODIFY | `projects/2026-03-17-idea-validator/styles.css` | Spinner animation + section-head layout + readonly banner |
| MODIFY | `projects/2026-03-17-idea-validator/index.html` | Save & Share button in scorecard header |
| MODIFY | `projects/2026-03-17-idea-validator/app.js` | Async runCheck, transformApiResponse, saveAndShare, bootShareView |

---

## Task 1: Project Scaffold

**Files:**
- Create: `projects/2026-03-17-idea-validator/package.json`
- Create: `projects/2026-03-17-idea-validator/vercel.json`
- Create: `projects/2026-03-17-idea-validator/.env.local`
- Modify: `projects/2026-03-17-idea-validator/.gitignore`

- [ ] **Step 1: Install Vercel CLI globally (if not already installed)**

```bash
npm install -g vercel
vercel --version
```

Expected: prints a version like `34.x.x`

- [ ] **Step 2: Create `package.json`**

Create `projects/2026-03-17-idea-validator/package.json`:

```json
{
  "name": "idea-validator",
  "version": "2.0.0",
  "dependencies": {
    "openai": "^4.47.0",
    "@supabase/supabase-js": "^2.43.0"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
cd projects/2026-03-17-idea-validator
npm install
```

Expected: `node_modules/` created, `package-lock.json` generated.

- [ ] **Step 4: Create `vercel.json`**

Create `projects/2026-03-17-idea-validator/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/eval/:id", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 5: Add `.env.local` template**

Create `projects/2026-03-17-idea-validator/.env.local`:

```
OPENAI_API_KEY=sk-...your-key-here...
SUPABASE_URL=https://...your-project-id....supabase.co
SUPABASE_SERVICE_KEY=eyJ...your-service-role-key...
```

Do NOT fill in real values yet — that comes after Supabase is set up in Task 2.

- [ ] **Step 6: Update `.gitignore`**

If `projects/2026-03-17-idea-validator/.gitignore` does not exist, create it. If it does exist, append these lines:

```
.env
.env.local
.env*.local
node_modules/
```

- [ ] **Step 7: Verify `.env.local` is gitignored**

```bash
cd projects/2026-03-17-idea-validator
git check-ignore -v .env.local
```

Expected output: `.gitignore:.env.local` (confirms it's ignored). If nothing prints, the gitignore entry isn't matching — fix before proceeding.

- [ ] **Step 8: Commit scaffold**

```bash
cd projects/2026-03-17-idea-validator
git add package.json package-lock.json vercel.json .gitignore
git commit -m "feat(idea-validator): add Vercel project scaffold and dependencies"
```

---

## Task 2: Supabase Table

**Files:** None — this step is done in the Supabase dashboard.

- [ ] **Step 1: Create a Supabase project**

Go to [supabase.com](https://supabase.com), sign in, create a new project. Choose any region. Save the database password somewhere safe (you won't need it for this project, but Supabase requires it).

- [ ] **Step 2: Open the SQL editor**

In the Supabase dashboard → left sidebar → **SQL Editor** → **New query**.

- [ ] **Step 3: Create the `evaluations` table**

Paste and run this SQL:

```sql
create table evaluations (
  id uuid primary key default gen_random_uuid(),
  idea_title text not null,
  draft_data jsonb not null,
  analysis jsonb not null,
  assumptions jsonb default '[]',
  steps jsonb default '[]',
  created_at timestamptz default now()
);

alter table evaluations enable row level security;

create policy "Public read by id"
  on evaluations for select
  using (true);

create policy "Public insert"
  on evaluations for insert
  with check (true);
```

Expected: "Success. No rows returned."

- [ ] **Step 4: Verify the table**

In SQL Editor, run:

```sql
select * from evaluations limit 1;
```

Expected: "0 rows" with the column headers visible. If you get an error, re-run the create statement.

- [ ] **Step 5: Copy Supabase credentials**

In Supabase dashboard → **Project Settings** → **API**:

- Copy **Project URL** (looks like `https://abcxyz.supabase.co`)
- Copy **service_role** key (under "Project API keys" — use service_role, NOT anon)

Fill in `projects/2026-03-17-idea-validator/.env.local` with these values now.

Also fill in your `OPENAI_API_KEY` from your OpenAI account.

- [ ] **Step 6: Verify `.env.local` is complete**

Open the file — all three lines should have real values, not placeholder text.

---

## Task 3: `/api/analyze.js` — GPT-4o Scoring

**Files:**
- Create: `projects/2026-03-17-idea-validator/api/analyze.js`

- [ ] **Step 1: Verify `vercel dev` starts**

```bash
cd projects/2026-03-17-idea-validator
vercel dev
```

Expected: Vercel dev server starts on `http://localhost:3000`. Keep this terminal running throughout Tasks 3–7. Open a second terminal for the remaining steps.

- [ ] **Step 2: Create the function**

Create `projects/2026-03-17-idea-validator/api/analyze.js`:

```javascript
const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const STAGE_CONTEXT = {
  seed:       'early-stage startup validating problem-market fit',
  'series-a': 'growth-stage company with initial traction seeking scale',
  'scale-up': 'scaling company optimizing a proven business model',
  enterprise: 'enterprise organization with an established customer base',
};

function buildPrompt(draft) {
  return `You are a senior product strategy advisor evaluating a product idea for a ${STAGE_CONTEXT[draft.ideaStage] || 'B2B SaaS company'}.

Evaluate this product idea across 8 dimensions. Score each 0–100. Be rigorous — scores above 80 require genuinely strong evidence in the brief. Scores below 40 indicate a critical gap.

PRODUCT IDEA:
Title: ${draft.ideaTitle || '(untitled)'}
Problem: ${draft.problem || '(none)'}
Target User: ${draft.target || '(none)'}
Value Proposition: ${draft.valueProp || '(none)'}
Solution Sketch: ${draft.solution || '(none)'}
Differentiation: ${draft.differentiation || '(none)'}
Known Competitors: ${draft.competitors || '(none)'}
Distribution Channel: ${draft.channels || '(none)'}
Success Metric: ${draft.successMetric || '(none)'}
Constraints: ${draft.constraints || '(none)'}

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
    return res.status(200).json(analysis);
  } catch (err) {
    console.error('OpenAI error:', err.message);
    return res.status(500).json({ error: 'Analysis failed. Try again.' });
  }
};
```

- [ ] **Step 3: Test with curl (verify it works before wiring the frontend)**

In a second terminal:

```bash
curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "ideaTitle": "Cancel-proof scheduling for clinics",
    "ideaStage": "series-a",
    "problem": "Outpatient clinics lose 15-20% of appointment revenue to same-day cancellations. Staff spend 2-3 hours per day manually calling waitlists. No automated system fills gaps reliably.",
    "target": "Office managers at 5-30 provider outpatient clinics",
    "valueProp": "Recover 10-15% of cancelled slot revenue automatically within the first month",
    "solution": "AI monitors cancellations and instantly matches waitlisted patients by urgency, distance, and insurance",
    "differentiation": "Unlike generic scheduling tools, we integrate with EHR waitlists and prioritize by clinical urgency not just availability",
    "competitors": "Zocdoc, Kyruus, manual phone calls",
    "channels": "EHR marketplace integrations, direct sales to clinic groups",
    "successMetric": "15% reduction in unfilled slots within 60 days of deployment",
    "constraints": "HIPAA compliance required, EHR integration complexity"
  }' | head -c 500
```

Expected: JSON response with `scores`, `verdict`, `verdictReason`, `dimensionNotes`, etc. If you get `{"error":"Analysis failed"}`, check that `OPENAI_API_KEY` is set in `.env.local` and `vercel dev` picked it up (restart `vercel dev` after editing `.env.local`).

- [ ] **Step 4: Verify 400 on bad input**

```bash
curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{}' | cat
```

Expected: `{"error":"draft data with ideaTitle required"}`

- [ ] **Step 5: Commit**

```bash
git add api/analyze.js
git commit -m "feat(idea-validator): add /api/analyze GPT-4o scoring endpoint"
```

---

## Task 4: Wire Frontend Async Scoring + Loading State

**Files:**
- Modify: `projects/2026-03-17-idea-validator/styles.css`
- Modify: `projects/2026-03-17-idea-validator/app.js`

- [ ] **Step 1: Add spinner CSS and section-head layout to `styles.css`**

Append to the end of `styles.css`:

```css
/* ── spinner (loading state for Run Check) ────────────────────────── */
.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── scorecard header with action button ─────────────────────────── */
.section-head--with-action {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.section-head--with-action .btn {
  flex-shrink: 0;
  margin-top: 4px;
}
```

- [ ] **Step 2: Add `transformApiResponse` function to `app.js`**

In `app.js`, find the line:

```javascript
  /* ─── assumptions builder ───────────────────────────────────────────── */
```

Insert this new function block IMMEDIATELY BEFORE that line:

```javascript
  /* ─── AI response transformer ────────────────────────────────────────── */
  function transformApiResponse(apiResult, draft) {
    const dimMap = [
      { key: 'problem_clarity',  label: 'Problem clarity',   apiKey: 'problemClarity'  },
      { key: 'user_specificity', label: 'User specificity',  apiKey: 'userSpecificity' },
      { key: 'value_clarity',    label: 'Value proposition', apiKey: 'valueClarity'    },
      { key: 'differentiation',  label: 'Differentiation',   apiKey: 'differentiation' },
      { key: 'distribution',     label: 'Distribution',      apiKey: 'distribution'    },
      { key: 'metric',           label: 'Success metric',    apiKey: 'successMetric'   },
      { key: 'feasibility',      label: 'Feasibility',       apiKey: 'feasibility'     },
      { key: 'competition',      label: 'Competitive space', apiKey: 'competitiveSpace'},
    ];

    const dims = dimMap.map(({ key, label, apiKey }) => ({
      key,
      label,
      score: apiResult.scores?.[apiKey] ?? 0,
      why:   apiResult.dimensionNotes?.[apiKey]       || '',
      raise: apiResult.dimensionImprovements?.[apiKey] || '',
    }));

    const s = apiResult.scores || {};
    const flags = {
      problemVague:    (s.problemClarity   ?? 0) < 45,
      targetVague:     (s.userSpecificity  ?? 0) < 45,
      metricMissing:   (s.successMetric    ?? 0) < 40,
      channelMissing:  (s.distribution     ?? 0) < 40,
      lowDiff:         (s.differentiation  ?? 0) < 45,
      crowded:         (s.competitiveSpace ?? 0) < 50,
      highConstraints: (s.feasibility      ?? 0) < 60,
    };

    const stage   = draft.ideaStage || 'series-a';
    const weights = stageWeights(stage);
    const baseScore = Math.round(
      dims.reduce((acc, d) => acc + d.score * (weights[d.key] || 0.125), 0)
    );

    return {
      stage, weights, score: baseScore, dims,
      verdict: { label: apiResult.verdict || 'Refine', reason: apiResult.verdictReason || '' },
      tags:         apiResult.tags          || [],
      strongSignals: apiResult.strongSignals || [],
      weakSignals:   apiResult.weakAssumptions || [],
      flags,
      feasPenalty:      0,
      competitorCount:  commaCount(draft.competitors),
    };
  }

```

- [ ] **Step 3: Replace `runCheck()` with async version**

Find and replace the entire `runCheck` function in `app.js`. The current function (lines ~466–480) is:

```javascript
  function runCheck() {
    syncDraftFromForm();
    const d = currentDraft();
    if (!d) return;

    const analysis = analyzeDraft(d);
    d.lastAnalysis  = analysis;
    d.assumptions   = buildAssumptions(d, analysis);
    d.steps         = buildNextSteps(d.assumptions);
    d.lastCheckedAt = nowISO();
    saveState();

    showToast('Analysis complete — check the Scorecard tab.');
    navigate('scorecard');
  }
```

Replace it with:

```javascript
  function setRunCheckLoading(isLoading) {
    const btn = $('#btnRunCheck');
    if (!btn) return;
    if (isLoading) {
      btn.dataset.originalText = btn.textContent;
      btn.innerHTML = '<span class="spinner"></span>Analyzing…';
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset.originalText || 'Run check';
      btn.disabled = false;
    }
  }

  async function runCheck() {
    syncDraftFromForm();
    const d = currentDraft();
    if (!d) return;

    setRunCheckLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      });
      if (!res.ok) throw new Error(res.statusText);

      const apiResult = await res.json();
      const analysis  = transformApiResponse(apiResult, d);

      d.lastAnalysis  = analysis;
      d.lastApiResult = apiResult;
      d.assumptions   = buildAssumptions(d, analysis);
      d.steps         = buildNextSteps(d.assumptions);
      d.lastCheckedAt = nowISO();
      saveState();

      showToast('Analysis complete — check the Scorecard tab.');
      navigate('scorecard');
    } catch (err) {
      console.error('runCheck error:', err);
      showToast('Analysis failed — check your connection and try again.');
    } finally {
      setRunCheckLoading(false);
    }
  }
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:3000` in your browser. Fill in all fields with something substantive (at least 2–3 sentences in Problem and Value Proposition). Click **Run Check**.

Expected:
- Button shows "Analyzing…" with a spinner for ~2–3 seconds
- Toast appears: "Analysis complete — check the Scorecard tab."
- Scorecard tab shows real scores with GPT-generated reasoning in the "Why it's this score" and "What would raise it" columns
- Scores reflect the actual content, not just length

If the scorecard shows `—` for all scores, open DevTools → Console for errors.

- [ ] **Step 5: Commit**

```bash
git add styles.css app.js
git commit -m "feat(idea-validator): async runCheck with GPT-4o scoring and loading state"
```

---

## Task 5: `/api/save.js` + `/api/eval/[id].js`

**Files:**
- Create: `projects/2026-03-17-idea-validator/api/save.js`
- Create: `projects/2026-03-17-idea-validator/api/eval/[id].js`

- [ ] **Step 1: Create `api/save.js`**

Create `projects/2026-03-17-idea-validator/api/save.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { draft_data, analysis, assumptions, steps } = req.body || {};
  if (!draft_data || !analysis) {
    return res.status(400).json({ error: 'draft_data and analysis are required' });
  }

  const { data, error } = await supabase
    .from('evaluations')
    .insert({
      idea_title:  draft_data.ideaTitle || 'Untitled idea',
      draft_data,
      analysis,
      assumptions: assumptions || [],
      steps:       steps       || [],
    })
    .select('id')
    .single();

  if (error) {
    console.error('Supabase save error:', error.message);
    return res.status(500).json({ error: 'Save failed. Try again.' });
  }

  return res.status(200).json({ id: data.id });
};
```

- [ ] **Step 2: Create `api/eval/[id].js`**

Create the directory and file:

```bash
mkdir -p api/eval
```

Create `projects/2026-03-17-idea-validator/api/eval/[id].js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }

  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Evaluation not found' });
  }

  return res.status(200).json(data);
};
```

- [ ] **Step 3: Test `/api/save` with curl**

First run an analysis to get a realistic payload. Use the curl command from Task 3 Step 3, save the output to a file:

```bash
curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "ideaTitle": "Test idea",
    "ideaStage": "series-a",
    "problem": "Outpatient clinics lose 15% of appointment revenue to same-day cancellations.",
    "target": "Office managers at 5-30 provider outpatient clinics",
    "valueProp": "Recover 10% of cancelled slot revenue automatically within 30 days",
    "solution": "AI matches waitlisted patients to cancellations in real time",
    "differentiation": "EHR integration + clinical urgency scoring",
    "competitors": "Zocdoc, manual calls",
    "channels": "EHR marketplace",
    "successMetric": "15% reduction in unfilled slots in 60 days",
    "constraints": "HIPAA compliance"
  }' > /tmp/analysis.json

curl -s -X POST http://localhost:3000/api/save \
  -H "Content-Type: application/json" \
  -d "{
    \"draft_data\": {\"ideaTitle\": \"Test idea\", \"ideaStage\": \"series-a\"},
    \"analysis\": $(cat /tmp/analysis.json),
    \"assumptions\": [],
    \"steps\": []
  }" | cat
```

Expected: `{"id":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}` (a UUID)

- [ ] **Step 4: Test `/api/eval/:id` with the returned UUID**

Take the UUID from the previous step and replace `YOUR-UUID-HERE`:

```bash
curl -s http://localhost:3000/api/eval/YOUR-UUID-HERE | head -c 200
```

Expected: JSON with `id`, `idea_title`, `draft_data`, `analysis`, `assumptions`, `steps`, `created_at`.

- [ ] **Step 5: Test 404 on bad ID**

```bash
curl -s http://localhost:3000/api/eval/00000000-0000-0000-0000-000000000000 | cat
```

Expected: `{"error":"Evaluation not found"}`

- [ ] **Step 6: Commit**

```bash
git add api/save.js api/eval/\[id\].js
git commit -m "feat(idea-validator): add /api/save and /api/eval/:id Supabase endpoints"
```

---

## Task 6: Save & Share Button

**Files:**
- Modify: `projects/2026-03-17-idea-validator/index.html`
- Modify: `projects/2026-03-17-idea-validator/app.js`

- [ ] **Step 1: Add Save & Share button to scorecard header in `index.html`**

Find this exact line in `index.html`:

```html
    <section class="content" id="scorecard" data-view="scorecard" aria-labelledby="scorecardTitle" hidden>
      <header class="section-head">
```

Replace the opening header tag only:

```html
    <section class="content" id="scorecard" data-view="scorecard" aria-labelledby="scorecardTitle" hidden>
      <header class="section-head section-head--with-action">
```

Then find the closing `</header>` tag that ends this scorecard header (it's the `</header>` right before `<div class="scorecard">`). Add the button just before the `</header>`:

```html
        <button class="btn btn--ghost" id="btnSaveShare" type="button" hidden>Save &amp; Share</button>
      </header>
```

- [ ] **Step 2: Add `saveAndShare()` function to `app.js`**

Find the line:

```javascript
  /* ─── toast ──────────────────────────────────────────────────────────── */
```

Insert this block IMMEDIATELY BEFORE that line:

```javascript
  /* ─── save & share ──────────────────────────────────────────────────── */
  async function saveAndShare() {
    const d = currentDraft();
    if (!d || !d.lastApiResult) return;

    const btn = $('#btnSaveShare');
    if (btn) { btn.textContent = 'Saving…'; btn.disabled = true; }

    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_data:  d,
          analysis:    d.lastApiResult,
          assumptions: d.assumptions || [],
          steps:       d.steps       || [],
        }),
      });
      if (!res.ok) throw new Error(res.statusText);

      const { id } = await res.json();
      const shareUrl = `${window.location.origin}/eval/${id}`;
      await navigator.clipboard.writeText(shareUrl);
      showToast('Link copied — share it with anyone');
    } catch (err) {
      console.error('saveAndShare error:', err);
      showToast('Save failed — try again');
    } finally {
      if (btn) { btn.textContent = 'Save & Share'; btn.disabled = false; }
    }
  }

```

- [ ] **Step 3: Show/hide Save & Share button in `renderScorecard()`**

Find in `renderScorecard()` the line:

```javascript
    const notesEl = $('#notesBlurb');
```

Add these lines immediately BEFORE it:

```javascript
    const saveShareBtn = $('#btnSaveShare');
    if (saveShareBtn) saveShareBtn.hidden = !currentDraft()?.lastApiResult;

```

- [ ] **Step 4: Wire the Save & Share button in `bindEvents()`**

Find in `bindEvents()` the line:

```javascript
    $('#btnRunCheck')?.addEventListener('click', runCheck);
```

If that exact line doesn't exist, find the nearest reference to `btnRunCheck` and add this line after it:

```javascript
    $('#btnSaveShare')?.addEventListener('click', saveAndShare);
```

- [ ] **Step 5: Verify in browser**

1. Open `http://localhost:3000`
2. Fill in all fields and click **Run Check**
3. Navigate to the **Scorecard** tab
4. Confirm the **Save & Share** button is now visible (it was hidden before analysis)
5. Click **Save & Share**
6. Expected: toast "Link copied — share it with anyone"
7. Open a new tab, paste the clipboard URL — it should load (the share view is built in Task 7)

If clipboard paste fails in dev, check DevTools → Console for a clipboard permission error. Vercel dev on localhost should work, but if blocked, temporarily log the URL to console for testing.

- [ ] **Step 6: Commit**

```bash
git add index.html app.js
git commit -m "feat(idea-validator): add Save & Share button to scorecard"
```

---

## Task 7: Read-Only Share View

**Files:**
- Modify: `projects/2026-03-17-idea-validator/styles.css`
- Modify: `projects/2026-03-17-idea-validator/app.js`

- [ ] **Step 1: Add readonly banner CSS to `styles.css`**

Append to the end of `styles.css`:

```css
/* ── read-only share banner ──────────────────────────────────────── */
.readonly-banner {
  background: #1A1A1A;
  color: #FAFAF8;
  padding: 10px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  letter-spacing: 0.03em;
  position: sticky;
  top: 0;
  z-index: 100;
}
.readonly-banner__inner {
  display: flex;
  align-items: center;
  gap: 12px;
}
.readonly-chip {
  background: #C8102E;
  color: #fff;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 2px 8px;
  font-weight: 700;
}
.readonly-banner__cta {
  color: #FAFAF8;
  font-size: 12px;
  opacity: 0.7;
  text-decoration: underline;
  cursor: pointer;
}
.readonly-banner__cta:hover { opacity: 1; }
```

- [ ] **Step 2: Add `bootShareView()` function to `app.js`**

Find the line:

```javascript
  /* ─── init ───────────────────────────────────────────────────────────── */
```

Insert this block IMMEDIATELY BEFORE that line:

```javascript
  /* ─── share view ─────────────────────────────────────────────────────── */
  async function bootShareView(evalId) {
    // Hide workspace and library tabs from nav
    $$('[data-route="workspace"], [data-route="library"]').forEach(el => {
      el.style.display = 'none';
    });

    // Insert readonly banner at top of body
    const banner = document.createElement('div');
    banner.className = 'readonly-banner';
    banner.innerHTML = `
      <div class="readonly-banner__inner">
        <span class="readonly-chip">Shared evaluation</span>
        <span>View only</span>
      </div>
      <a class="readonly-banner__cta" href="/">Evaluate your own idea &rarr;</a>`;
    document.body.insertBefore(banner, document.body.firstChild);

    try {
      const res = await fetch(`/api/eval/${evalId}`);
      if (!res.ok) throw new Error('Not found');
      const evalData = await res.json();

      // Reconstruct analysis in the shape render functions expect
      const analysis = transformApiResponse(evalData.analysis, evalData.draft_data || {});

      // Point state at a synthetic read-only draft
      state = {
        currentId: 'shared',
        drafts: {
          shared: {
            ...(evalData.draft_data || {}),
            id:           'shared',
            lastAnalysis: analysis,
            lastApiResult: evalData.analysis,
            assumptions:  evalData.assumptions || [],
            steps:        evalData.steps       || [],
          },
        },
      };

      // Update page title
      const titleEl = document.querySelector('title');
      if (titleEl && evalData.idea_title) titleEl.textContent = `${evalData.idea_title} — Idea Validator`;

      navigate('scorecard');
      renderScorecard();
      renderAssumptions();
      renderNextSteps();
    } catch (_) {
      document.body.innerHTML = `
        <div style="padding:3rem;font-family:sans-serif;text-align:center;max-width:480px;margin:0 auto">
          <h2 style="font-size:1.5rem;margin-bottom:1rem">Evaluation not found</h2>
          <p style="color:#6B6B6B;margin-bottom:2rem">This link may have expired or the ID is incorrect.</p>
          <a href="/" style="color:#C8102E">Try the Idea Validator &rarr;</a>
        </div>`;
    }
  }

```

- [ ] **Step 3: Add URL check to `init()`**

Find the existing `init()` function:

```javascript
  function init() {
    loadState();
    syncFormFromDraft();
    liveUpdate();
    bindEvents();
    navigate('workspace');

    // update lede meta
    const ms = $('#metaLastSaved');
    const d  = currentDraft();
    if (ms && d?.updatedAt) ms.textContent = `Last saved ${formatDT(d.updatedAt)}`;
  }
```

Replace it with:

```javascript
  function init() {
    const shareMatch = window.location.pathname.match(/^\/eval\/([a-f0-9-]{36})$/);
    if (shareMatch) {
      bootShareView(shareMatch[1]);
      return;
    }

    loadState();
    syncFormFromDraft();
    liveUpdate();
    bindEvents();
    navigate('workspace');

    const ms = $('#metaLastSaved');
    const d  = currentDraft();
    if (ms && d?.updatedAt) ms.textContent = `Last saved ${formatDT(d.updatedAt)}`;
  }
```

- [ ] **Step 4: Verify share view in browser**

1. Run an analysis and click **Save & Share** to generate a share URL (e.g. `http://localhost:3000/eval/some-uuid`)
2. Open that URL in a new browser tab
3. Expected:
   - Black "Shared evaluation / View only" banner at the top
   - Workspace and Library tabs are hidden from the nav
   - Scorecard tab shows the same scores and reasoning from the saved evaluation
   - Clicking "Evaluate your own idea →" navigates to `/` (the main app)
4. Test the 404 case: open `http://localhost:3000/eval/00000000-0000-0000-0000-000000000000`
   - Expected: "Evaluation not found" message with link back to app

- [ ] **Step 5: Commit**

```bash
git add styles.css app.js
git commit -m "feat(idea-validator): add read-only share view at /eval/:id"
```

---

## Task 8: Deploy to Vercel + Smoke Test

**Files:** None — this task is deployment and verification.

- [ ] **Step 1: Stop `vercel dev` and link the project**

Stop the `vercel dev` process (`Ctrl+C`), then from the project root:

```bash
cd projects/2026-03-17-idea-validator
vercel link
```

When prompted:
- Set up and deploy: **Y**
- Which scope: select your account
- Link to existing project: **N** (create new)
- Project name: `idea-validator` (or any name you prefer)
- Root directory: press Enter (current directory is correct, since we're already in `projects/2026-03-17-idea-validator/`)

- [ ] **Step 2: Set environment variables in Vercel dashboard**

In your browser, go to [vercel.com](https://vercel.com) → your `idea-validator` project → **Settings** → **Environment Variables**.

Add three variables (for all environments: Production, Preview, Development):

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | your OpenAI key |
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | your Supabase service_role key |

- [ ] **Step 3: Deploy**

```bash
vercel --prod
```

Expected: build succeeds, outputs a live URL like `https://idea-validator-xxx.vercel.app`

- [ ] **Step 4: End-to-end smoke test on the live URL**

Open the live URL in your browser and run through this checklist:

1. **Load:** App loads with the demo draft pre-filled
2. **Analyze:** Fill in all fields with a real idea, click **Run Check**. Spinner appears, then Scorecard shows GPT-generated scores (not all zeros or identical scores)
3. **Scorecard columns:** "Why it's this score" and "What would raise it" columns have GPT-written reasoning — not heuristic fallback text
4. **Save & Share:** Click **Save & Share**. Toast says "Link copied". Paste the URL in a new tab
5. **Share view:** New tab shows: readonly banner, Scorecard with same scores, Workspace/Library tabs hidden
6. **404:** Navigate to `[your-url]/eval/00000000-0000-0000-0000-000000000000` — shows "Evaluation not found"
7. **Assumptions tab:** After analysis, Assumptions tab shows generated assumptions
8. **Next Steps tab:** Next Steps tab shows validation plan

If any step fails, check Vercel → **Deployments** → click the latest deployment → **Functions** logs for error details.

- [ ] **Step 5: Final commit with live URL**

```bash
git add .
git commit -m "feat(idea-validator): deploy v2 with GPT-4o scoring, Supabase persistence, and shareable links"
```

Update `manifest.json` in the idea validator folder — change `demo_url` to the live Vercel URL:

```bash
# edit manifest.json to update demo_url to your vercel URL
git add manifest.json
git commit -m "chore(idea-validator): update manifest demo_url to Vercel deployment"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task that covers it |
|-----------------|---------------------|
| POST /api/analyze → GPT-4o | Task 3 |
| POST /api/save → Supabase | Task 5 |
| GET /api/eval/:id → Supabase | Task 5 |
| Async runCheck with loading state | Task 4 |
| Save & Share button in Scorecard | Task 6 |
| Read-only share view at /eval/:id | Task 7 |
| vercel.json SPA rewrite | Task 1 |
| API keys in env vars only | Task 1 (gitignore) + Task 8 (Vercel env vars) |
| Supabase table with correct schema | Task 2 |
| Existing UX unchanged | Tasks 4, 6, 7 (only additive changes) |

**All spec requirements covered. No gaps.**

**Type consistency check:** `transformApiResponse` in Task 4 defines the output shape. `bootShareView` in Task 7 calls `transformApiResponse(evalData.analysis, evalData.draft_data)` — matching the function signature. `saveAndShare` in Task 6 sends `d.lastApiResult` (set in Task 4's `runCheck`) — matching what `api/save.js` expects as `analysis`. Consistent throughout.

**Placeholder check:** No TBD, TODO, or vague steps. All curl commands include exact JSON payloads. All code blocks are complete and runnable.
