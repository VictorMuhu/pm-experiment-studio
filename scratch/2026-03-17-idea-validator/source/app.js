(() => {
  'use strict';

  const STORAGE_KEY = 'pm-experiment-idea-validator:v1';
  const VIEWS = ['scoreboard', 'inputs', 'assumptions', 'actions'];

  const DIMENSIONS = [
    {
      id: 'problem',
      name: 'Problem clarity',
      description: 'Is the problem a specific moment with a measurable consequence?',
      weightDefault: 0.18,
      evidenceLevels: [
        { label: 'Anecdotal', points: 25, hint: 'One story; no pattern.' },
        { label: 'Patterned', points: 55, hint: 'Multiple customers describe the same moment.' },
        { label: 'Quantified', points: 85, hint: 'You can quantify frequency / cost / impact.' },
        { label: 'Proven', points: 95, hint: 'You have a baseline metric and a target.' }
      ]
    },
    {
      id: 'market',
      name: 'Market pull',
      description: 'Do customers try to solve it without you? Is there urgency?',
      weightDefault: 0.16,
      evidenceLevels: [
        { label: 'Nice-to-have', points: 25, hint: 'No trigger; postponed.' },
        { label: 'Triggered', points: 55, hint: 'A clear “why now” exists.' },
        { label: 'Budgeted', points: 80, hint: 'Money or headcount allocated.' },
        { label: 'Competing', points: 95, hint: 'Customers actively compare options now.' }
      ]
    },
    {
      id: 'willingness',
      name: 'Willingness to pay',
      description: 'Do you have evidence of paid intent at your target price?',
      weightDefault: 0.20,
      evidenceLevels: [
        { label: 'Assumed', points: 20, hint: 'Based on competitors or gut.' },
        { label: 'Stated', points: 50, hint: 'Customers say they would pay.' },
        { label: 'Committed', points: 80, hint: 'LOIs, pilots, or budget approved.' },
        { label: 'Paid', points: 95, hint: 'Deposits, contracts, or active revenue.' }
      ]
    },
    {
      id: 'differentiation',
      name: 'Differentiation',
      description: 'Is your win condition specific and defensible?',
      weightDefault: 0.14,
      evidenceLevels: [
        { label: 'Generic', points: 25, hint: 'Feature parity.' },
        { label: 'Specific', points: 55, hint: 'Clear wedge + segment.' },
        { label: 'Defensible', points: 80, hint: 'Data, distribution, or workflow lock-in.' },
        { label: 'Proven win', points: 95, hint: 'You’ve beaten alternatives in head-to-head.' }
      ]
    },
    {
      id: 'feasibility',
      name: 'Feasibility',
      description: 'Can you build + ship with known dependencies and risk?',
      weightDefault: 0.16,
      evidenceLevels: [
        { label: 'Unknown', points: 30, hint: 'Major unknowns, unclear integrations.' },
        { label: 'Scoped', points: 55, hint: 'Rough architecture + dependencies listed.' },
        { label: 'De-risked', points: 80, hint: 'Prototype proves the hard part.' },
        { label: 'Routine', points: 95, hint: 'It’s execution, not discovery.' }
      ]
    },
    {
      id: 'distribution',
      name: 'Distribution',
      description: 'How will you reach and convert the ICP with repeatability?',
      weightDefault: 0.16,
      evidenceLevels: [
        { label: 'Hope', points: 25, hint: 'No clear channel or buyer.' },
        { label: 'Hypothesis', points: 55, hint: 'Channel identified + pitch drafted.' },
        { label: 'Tested', points: 80, hint: 'Channel has early conversion signal.' },
        { label: 'Repeatable', points: 95, hint: 'Known CAC model and process.' }
      ]
    }
  ];

  const DEFAULT_STATE = () => {
    const weights = {};
    const evidence = {};
    DIMENSIONS.forEach(d => {
      weights[d.id] = d.weightDefault;
      evidence[d.id] = 1;
    });

    return {
      meta: {
        title: 'SOC 2 Evidence Autopilot',
        stage: 'shaped',
        updatedAt: Date.now()
      },
      inputs: {
        icp: '20–200 employee B2B SaaS with 1 security lead, fast-growing sales pipeline, and no dedicated GRC function',
        problem: 'Security questionnaires stall late-stage deals for 2–6 weeks. Founders pull engineers into one-off evidence hunts, miss quarter-end targets, and lose credibility with enterprise buyers.',
        currentAlt: 'Spreadsheets + shared drive folders; ad-hoc consultants; “we’ll buy Vanta later”',
        solution: 'A SOC 2 evidence autopilot that continuously collects artifacts, answers common questionnaires, and prepares audit-ready reports with minimal engineering time.',
        differentiator: 'Evidence capture via integrations plus sales-ready narrative templates tuned for security reviews',
        whyNow: 'Security reviews are moving earlier in procurement; AI governance adds new evidence requirements; startups need enterprise deals to survive',
        pricing: '$499–$1,499 / month depending on integrations and questionnaire volume',
        budgetOwner: 'Head of Security or CTO; sometimes Finance at seed-stage',
        roi: 'Shorten deal cycles, reduce engineering interruptions, and improve win rate for security-gated buyers',
        dependencies: 'Integrations (Google Workspace/Okta/Jira); audit framework mappings; secure evidence storage; role-based access',
        risks: 'Procurement friction; long sales cycles; trust barrier; crowded space with incumbents',
        notes: 'Initial wedge: “questionnaire autopilot” for teams already feeling enterprise pressure but not ready for a full GRC platform.'
      },
      scoring: {
        weights,
        evidenceIndex: evidence
      },
      assumptions: [
        {
          id: cryptoRandomId(),
          text: 'Security leads at 20–200 employee SaaS teams will pay $1k/month to reduce questionnaire effort even without a full GRC platform',
          type: 'pricing',
          impact: 5,
          uncertainty: 4,
          evidence: 'Competitor pricing suggests budget exists, but we have no paid-intent proof at this segment',
          owner: 'PM',
          due: addDaysISO(7),
          updatedAt: Date.now() - 1000 * 60 * 60 * 7
        },
        {
          id: cryptoRandomId(),
          text: 'Integrations (Okta/Google Workspace/Jira) can collect 70% of required SOC 2 evidence automatically with acceptable security posture',
          type: 'feasibility',
          impact: 4,
          uncertainty: 3,
          evidence: 'Some APIs are straightforward; evidence mapping and permissions are unknown',
          owner: 'Eng Lead',
          due: addDaysISO(10),
          updatedAt: Date.now() - 1000 * 60 * 60 * 30
        },
        {
          id: cryptoRandomId(),
          text: 'Questionnaire autopilot (answer library + evidence links) is a compelling wedge that beats buying a general-purpose GRC tool early',
          type: 'market',
          impact: 4,
          uncertainty: 4,
          evidence: 'Multiple founders complain about questionnaires, but tool choice criteria are unclear',
          owner: 'Founder',
          due: addDaysISO(5),
          updatedAt: Date.now() - 1000 * 60 * 60 * 52
        },
        {
          id: cryptoRandomId(),
          text: 'Distribution via security consultants and fractional CISOs can deliver repeatable inbound introductions to ICP',
          type: 'distribution',
          impact: 3,
          uncertainty: 4,
          evidence: 'We have 2 warm intros; no proof of repeatability',
          owner: 'BD',
          due: addDaysISO(14),
          updatedAt: Date.now() - 1000 * 60 * 60 * 12
        },
        {
          id: cryptoRandomId(),
          text: 'A “sales-ready” evidence narrative template is a defensible differentiator versus incumbents focused on audit workflows',
          type: 'differentiation',
          impact: 3,
          uncertainty: 3,
          evidence: 'Hypothesis based on sales friction; needs customer validation',
          owner: 'PMM',
          due: addDaysISO(9),
          updatedAt: Date.now() - 1000 * 60 * 60 * 18
        }
      ],
      actions: [
        {
          id: cryptoRandomId(),
          text: 'Run 8 paid-intent conversations with security leads; test $999/month anchor and request a pilot commitment',
          type: 'customer-calls',
          owner: 'PM',
          due: addDaysISO(6),
          effort: 'S',
          expected: 'At least 3 explicit “yes, we would pay” with a timeline + success criteria',
          updatedAt: Date.now() - 1000 * 60 * 60 * 3
        },
        {
          id: cryptoRandomId(),
          text: 'Prototype evidence-collection integration for Google Workspace and document the permission model + data retention approach',
          type: 'prototype',
          owner: 'Eng Lead',
          due: addDaysISO(9),
          effort: 'M',
          expected: 'Prove feasibility and identify security concerns early',
          updatedAt: Date.now() - 1000 * 60 * 60 * 8
        },
        {
          id: cryptoRandomId(),
          text: 'Draft a one-page positioning test and run 5 consultant/fractional CISO interviews to validate referral channel potential',
          type: 'channel-test',
          owner: 'BD',
          due: addDaysISO(12),
          effort: 'S',
          expected: '2 partners willing to introduce to 3 clients each in the next 30 days',
          updatedAt: Date.now() - 1000 * 60 * 60 * 20
        }
      ]
    };
  };

  function cryptoRandomId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Math.random().toString(16).slice(2) + '-' + Date.now().toString(16);
  }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function round1(n) { return Math.round(n * 10) / 10; }

  function addDaysISO(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_STATE();
      const parsed = JSON.parse(raw);
      return migrateState(parsed);
    } catch (e) {
      return DEFAULT_STATE();
    }
  }

  function migrateState(s) {
    const state = s && typeof s === 'object' ? s : DEFAULT_STATE();
    if (!state.scoring || !state.scoring.weights || !state.scoring.evidenceIndex) return DEFAULT_STATE();

    DIMENSIONS.forEach(d => {
      if (typeof state.scoring.weights[d.id] !== 'number') state.scoring.weights[d.id] = d.weightDefault;
      if (typeof state.scoring.evidenceIndex[d.id] !== 'number') state.scoring.evidenceIndex[d.id] = 1;
      state.scoring.weights[d.id] = clamp(state.scoring.weights[d.id], 0, 1);
      state.scoring.evidenceIndex[d.id] = clamp(state.scoring.evidenceIndex[d.id], 0, d.evidenceLevels.length - 1);
    });

    if (!state.assumptions) state.assumptions = [];
    if (!state.actions) state.actions = [];
    if (!state.meta) state.meta = { title: 'Untitled', stage: 'new', updatedAt: Date.now() };
    if (!state.inputs) state.inputs = {};

    return state;
  }

  function saveState() {
    state.meta.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSaveStatus('Saved just now');
    setDataBadge();
  }

  function setSaveStatus(text) {
    const el = document.getElementById('saveStatus');
    el.textContent = text;
    toast(text);
  }

  function setDataBadge() {
    const el = document.getElementById('dataBadge');
    el.textContent = '1 workspace';
  }

  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('is-on');
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(() => el.classList.remove('is-on'), 1400);
  }

  function computeScores() {
    let totalWeight = 0;
    let weightedSum = 0;

    const rows = DIMENSIONS.map(d => {
      const weight = clamp(state.scoring.weights[d.id], 0, 1);
      const idx = clamp(state.scoring.evidenceIndex[d.id], 0, d.evidenceLevels.length - 1);
      const points = d.evidenceLevels[idx].points;
      totalWeight += weight;
      weightedSum += points * weight;

      return {
        id: d.id,
        name: d.name,
        description: d.description,
        points,
        weight,
        weighted: points * weight
      };
    });

    const score = totalWeight > 0 ? (weightedSum / totalWeight) : 0;

    return {
      score: Math.round(score),
      totalWeight,
      weightedSum,
      rows
    };
  }

  function verdictFor(score, minDimensionScore) {
    if (score >= 80 && minDimensionScore >= 55) {
      return { verdict: 'PURSUE', rationale: 'Proceed to a time-boxed build with explicit success metrics' };
    }
    if (score >= 55) {
      return { verdict: 'REFINE', rationale: 'Tighten weak dimensions; validate before committing build capacity' };
    }
    return { verdict: 'DROP', rationale: 'Do not invest further until the core risk changes materially' };
  }

  function signalFor(points) {
    if (points >= 85) return { label: 'STRONG', kind: 'strong' };
    if (points >= 55) return { label: 'MIXED', kind: 'mixed' };
    return { label: 'WEAK', kind: 'weak' };
  }

  function topPrimaryRisk(scoreRows) {
    const sorted = [...scoreRows].sort((a, b) => a.points - b.points);
    const weakest = sorted[0];
    const second = sorted[1];

    const mapping = {
      willingness: {
        title: 'Willingness to pay unproven',
        body: 'Your pricing story is inferred rather than evidenced. Prove paid intent or a hard commitment before building.'
      },
      distribution: {
        title: 'Distribution not credible yet',
        body: 'A good product without a repeatable channel becomes a long, expensive experiment. Validate a channel with real conversion signal.'
      },
      market: {
        title: 'Urgency unclear',
        body: 'If there is no trigger, adoption will be slow and churn will be high. Prove the “why now” with customer behavior.'
      },
      differentiation: {
        title: 'Win condition vague',
        body: 'If customers can’t explain why you beat alternatives, you’ll lose in procurement and pricing negotiations. Make the wedge explicit.'
      },
      feasibility: {
        title: 'Delivery risk high',
        body: 'Hidden integration and security complexity can destroy timelines. De-risk the hardest dependency with a prototype and clear scope.'
      },
      problem: {
        title: 'Problem not sharply defined',
        body: 'If the problem is fuzzy, you’ll ship features instead of impact. Quantify the baseline and define a clear target outcome.'
      }
    };

    const m = mapping[weakest.id] || { title: 'Primary risk unclear', body: 'Review inputs and assumptions to identify the weakest link.' };

    const tieNote = second && second.points === weakest.points ? ' Two dimensions are tied for weakest.' : '';
    return { title: m.title, body: m.body + tieNote, weakestId: weakest.id };
  }

  function next72FromWeakest(weakestId) {
    const candidates = state.actions.slice().sort((a, b) => {
      const ad = daysUntil(a.due);
      const bd = daysUntil(b.due);
      return ad - bd;
    });

    const focused = candidates.filter(a => actionMatchesDimension(a, weakestId));
    const chosen = (focused.length ? focused : candidates).slice(0, 3);

    if (!chosen.length) {
      return {
        title: 'No actions yet',
        body: 'Generate actions from assumptions or add 3 delegable tasks with owners and due dates.'
      };
    }

    const bullets = chosen.map(a => `• ${a.text} — ${a.owner || 'Owner'} — due ${a.due || 'date'}`).join('\n');
    return {
      title: 'Validation sprint plan',
      body: bullets
    };
  }

  function actionMatchesDimension(action, dimId) {
    const t = (action.text || '').toLowerCase();
    const type = (action.type || '').toLowerCase();

    const map = {
      willingness: ['price', 'paid', 'pilot', 'contract', 'commit', 'deposit', 'pricing', 'willing'],
      distribution: ['channel', 'partner', 'referral', 'outbound', 'inbound', 'distribution', 'ciso', 'consultant'],
      market: ['urgency', 'trigger', 'timing', 'why now', 'procurement', 'demand'],
      differentiation: ['position', 'positioning', 'win', 'compete', 'competitor', 'wedge', 'different'],
      feasibility: ['prototype', 'integration', 'api', 'security', 'permission', 'architecture', 'feasible'],
      problem: ['baseline', 'quantify', 'metric', 'measure', 'problem', 'pain']
    };

    const keys = map[dimId] || [];
    return keys.some(k => t.includes(k) || type.includes(k));
  }

  function daysUntil(iso) {
    if (!iso) return 9999;
    const now = new Date();
    const d = new Date(iso + 'T00:00:00');
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(diff);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function setActiveView(view) {
    const v = VIEWS.includes(view) ? view : 'scoreboard';

    document.querySelectorAll('.view').forEach(el => {
      el.classList.toggle('is-active', el.dataset.view === v);
    });
    document.querySelectorAll('.nav__item').forEach(btn => {
      const active = btn.dataset.view === v;
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    state.ui = state.ui || {};
    state.ui.view = v;
    saveStateSilent();
    renderAll();
  }

  function saveStateSilent() {
    state.meta.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function normalizeWeights() {
    const weights = state.scoring.weights;
    let sum = 0;
    DIMENSIONS.forEach(d => { sum += clamp(weights[d.id], 0, 1); });
    if (sum <= 0) {
      DIMENSIONS.forEach(d => { weights[d.id] = d.weightDefault; });
      return;
    }
    DIMENSIONS.forEach(d => { weights[d.id] = weights[d.id] / sum; });
  }

  function renderScoreboard() {
    const computed = computeScores();
    const minDimensionScore = Math.min(...computed.rows.map(r => r.points));
    const v = verdictFor(computed.score, minDimensionScore);

    document.getElementById('confidenceScore').textContent = String(computed.score);
    document.getElementById('verdict').textContent = v.verdict;
    document.getElementById('verdictRationale').textContent = v.rationale;

    const tbody = document.getElementById('scoreRows');
    tbody.innerHTML = computed.rows.map(r => {
      const sig = signalFor(r.points);
      return `
        <tr>
          <td>
            <div style="font-weight:700">${escapeHtml(r.name)}</div>
            <div class="smallMuted">${escapeHtml(r.description)}</div>
          </td>
          <td><span class="pill">${escapeHtml(String(r.points))}</span></td>
          <td>${escapeHtml(String(round1(r.weight * 100)))}%</td>
          <td>${escapeHtml(String(Math.round(r.weighted)))}</td>
          <td>${escapeHtml(sig.label)}</td>
        </tr>
      `;
    }).join('');

    const tags = document.getElementById('scoreTags');
    const weakest = [...computed.rows].sort((a, b) => a.points - b.points)[0];
    const strongest = [...computed.rows].sort((a, b) => b.points - a.points)[0];
    tags.innerHTML = [
      tag('Weakest', weakest.name),
      tag('Strongest', strongest.name),
      tag('Weights', `${round1(computed.totalWeight * 100)}% total (normalized)`),
      tag('Stage', stageLabel(state.meta.stage))
    ].join('');

    const risk = topPrimaryRisk(computed.rows);
    document.getElementById('primaryRiskTitle').textContent = risk.title;
    document.getElementById('primaryRiskBody').textContent = risk.body;

    const plan = next72FromWeakest(risk.weakestId);
    document.getElementById('next72Title').textContent = plan.title;
    document.getElementById('next72Body').textContent = plan.body;
  }

  function stageLabel(stage) {
    const map = {
      new: 'New',
      shaped: 'Shaped',
      ready: 'Ready'
    };
    return map[stage] || 'New';
  }

  function tag(left, right) {
    return `<span class="tag">${escapeHtml(left)}<span class="dash">—</span>${escapeHtml(right)}</span>`;
  }

  function renderInputs() {
    const metaTitle = document.getElementById('ideaTitle');
    const metaStage = document.getElementById('ideaStage');

    metaTitle.value = state.meta.title || '';
    metaStage.value = state.meta.stage || 'new';

    const bind = (id, key) => {
      const el = document.getElementById(id);
      el.value = state.inputs[key] || '';
    };

    bind('icp', 'icp');
    bind('problem', 'problem');
    bind('currentAlt', 'currentAlt');
    bind('solution', 'solution');
    bind('differentiator', 'differentiator');
    bind('whyNow', 'whyNow');
    bind('pricing', 'pricing');
    bind('budgetOwner', 'budgetOwner');
    bind('roi', 'roi');
    bind('dependencies', 'dependencies');
    bind('risks', 'risks');
    bind('notes', 'notes');

    const host = document.getElementById('scoringInputs');
    host.innerHTML = DIMENSIONS.map(d => {
      const idx = clamp(state.scoring.evidenceIndex[d.id], 0, d.evidenceLevels.length - 1);
      const weightPct = Math.round(clamp(state.scoring.weights[d.id], 0, 1) * 100);
      const options = d.evidenceLevels.map((lvl, i) => {
        const sel = i === idx ? 'selected' : '';
        return `<option value="${i}" ${sel}>${escapeHtml(lvl.label)} (${lvl.points})</option>`;
      }).join('');

      return `
        <div class="scoreCard" data-dim="${escapeHtml(d.id)}">
          <div class="scoreCard__row">
            <div>
              <div class="kicker">Dimension</div>
              <div class="scoreCard__title">${escapeHtml(d.name)}</div>
              <div class="scoreCard__desc">${escapeHtml(d.description)}</div>
            </div>
            <div style="text-align:right">
              <div class="kicker">Points</div>
              <div class="pill" style="margin-top:6px">${escapeHtml(String(d.evidenceLevels[idx].points))}</div>
            </div>
          </div>

          <div class="miniRow">
            <div class="field">
              <label class="label" for="evidence-${escapeHtml(d.id)}">Evidence</label>
              <select class="select" id="evidence-${escapeHtml(d.id)}" data-evidence="${escapeHtml(d.id)}">
                ${options}
              </select>
              <div class="smallMuted" style="margin-top:6px">${escapeHtml(d.evidenceLevels[idx].hint)}</div>
            </div>

            <div class="field">
              <label class="label" for="weight-${escapeHtml(d.id)}">Weight (%)</label>
              <input class="input" id="weight-${escapeHtml(d.id)}" data-weight="${escapeHtml(d.id)}" type="number" min="0" max="100" step="1" value="${escapeHtml(String(weightPct))}" />
              <div class="smallMuted" style="margin-top:6px">Weights are normalized to sum to 100.</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderAssumptions() {
    const sort = document.getElementById('assumptionSort').value;
    const rows = state.assumptions.slice();

    rows.sort((a, b) => {
      if (sort === 'impactDesc') return (b.impact || 0) - (a.impact || 0);
      if (sort === 'uncertaintyDesc') return (b.uncertainty || 0) - (a.uncertainty || 0);
      if (sort === 'recent') return (b.updatedAt || 0) - (a.updatedAt || 0);
      // riskDesc
      return ((b.impact || 0) * (b.uncertainty || 0)) - ((a.impact || 0) * (a.uncertainty || 0));
    });

    const tbody = document.getElementById('assumptionRows');
    tbody.innerHTML = rows.map(a => {
      const risk = (a.impact || 0) * (a.uncertainty || 0);
      return `
        <tr data-id="${escapeHtml(a.id)}">
          <td>
            <input class="input" data-a-field="text" value="${escapeHtml(a.text || '')}" />
          </td>
          <td>
            <select class="select" data-a-field="type">
              ${assumptionTypeOptions(a.type)}
            </select>
          </td>
          <td><input class="input" data-a-field="impact" type="number" min="1" max="5" step="1" value="${escapeHtml(String(a.impact || 3))}" /></td>
          <td><input class="input" data-a-field="uncertainty" type="number" min="1" max="5" step="1" value="${escapeHtml(String(a.uncertainty || 3))}" /></td>
          <td><span class="pill">${escapeHtml(String(risk))}</span></td>
          <td><input class="input" data-a-field="evidence" value="${escapeHtml(a.evidence || '')}" /></td>
          <td><input class="input" data-a-field="owner" value="${escapeHtml(a.owner || '')}" /></td>
          <td><input class="input" data-a-field="due" type="date" value="${escapeHtml(a.due || '')}" /></td>
          <td>
            <div class="rowActions">
              <button class="linkBtn" data-a-action="dup" type="button">Duplicate</button>
              <button class="linkBtn" data-a-action="del" type="button">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    const tags = document.getElementById('assumptionTags');
    const top = topAssumptionsByRisk(3);
    tags.innerHTML = [
      tag('Count', String(state.assumptions.length)),
      tag('Top risk', top[0] ? `${typeLabel(top[0].type)} (${top[0].impact * top[0].uncertainty})` : '—'),
      tag('Owner coverage', ownerCoverage())
    ].join('');
  }

  function ownerCoverage() {
    const set = new Set();
    state.assumptions.forEach(a => {
      const o = (a.owner || '').trim();
      if (o) set.add(o);
    });
    return set.size ? `${set.size} owners` : 'No owners set';
  }

  function typeLabel(t) {
    const map = {
      market: 'Market',
      pricing: 'Pricing',
      feasibility: 'Feasibility',
      distribution: 'Distribution',
      differentiation: 'Differentiation',
      legal: 'Legal/Compliance',
      trust: 'Trust/Security'
    };
    return map[t] || 'Other';
  }

  function assumptionTypeOptions(current) {
    const types = [
      { id: 'market', label: 'Market' },
      { id: 'pricing', label: 'Pricing' },
      { id: 'feasibility', label: 'Feasibility' },
      { id: 'distribution', label: 'Distribution' },
      { id: 'differentiation', label: 'Differentiation' },
      { id: 'trust', label: 'Trust/Security' },
      { id: 'legal', label: 'Legal/Compliance' }
    ];
    return types.map(t => `<option value="${t.id}" ${t.id === (current || 'market') ? 'selected' : ''}>${t.label}</option>`).join('');
  }

  function topAssumptionsByRisk(n) {
    return state.assumptions
      .slice()
      .sort((a, b) => ((b.impact || 0) * (b.uncertainty || 0)) - ((a.impact || 0) * (a.uncertainty || 0)))
      .slice(0, n);
  }

  function renderActions() {
    const tbody = document.getElementById('actionRows');
    const rows = state.actions.slice().sort((a, b) => (daysUntil(a.due) - daysUntil(b.due)));

    tbody.innerHTML = rows.map(a => {
      return `
        <tr data-id="${escapeHtml(a.id)}">
          <td><input class="input" data-act-field="text" value="${escapeHtml(a.text || '')}" /></td>
          <td>
            <select class="select" data-act-field="type">
              ${actionTypeOptions(a.type)}
            </select>
          </td>
          <td><input class="input" data-act-field="owner" value="${escapeHtml(a.owner || '')}" /></td>
          <td><input class="input" data-act-field="due" type="date" value="${escapeHtml(a.due || '')}" /></td>
          <td>
            <select class="select" data-act-field="effort">
              ${effortOptions(a.effort)}
            </select>
          </td>
          <td><input class="input" data-act-field="expected" value="${escapeHtml(a.expected || '')}" /></td>
          <td>
            <div class="rowActions">
              <button class="linkBtn" data-act-action="dup" type="button">Duplicate</button>
              <button class="linkBtn" data-act-action="del" type="button">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    renderMemoPreview();
  }

  function actionTypeOptions(current) {
    const types = [
      { id: 'customer-calls', label: 'Customer calls' },
      { id: 'prototype', label: 'Prototype' },
      { id: 'pricing-test', label: 'Pricing test' },
      { id: 'channel-test', label: 'Channel test' },
      { id: 'landing-page', label: 'Landing page' },
      { id: 'concierge', label: 'Concierge' },
      { id: 'data-review', label: 'Data review' }
    ];
    const cur = current || 'customer-calls';
    return types.map(t => `<option value="${t.id}" ${t.id === cur ? 'selected' : ''}>${t.label}</option>`).join('');
  }

  function effortOptions(current) {
    const opts = ['XS', 'S', 'M', 'L'];
    const cur = current || 'S';
    return opts.map(o => `<option value="${o}" ${o === cur ? 'selected' : ''}>${o}</option>`).join('');
  }

  function renderMemoPreview() {
    const computed = computeScores();
    const minDimensionScore = Math.min(...computed.rows.map(r => r.points));
    const v = verdictFor(computed.score, minDimensionScore);

    document.getElementById('memoTitle').textContent = state.meta.title || '—';
    document.getElementById('memoVerdict').textContent = v.verdict;
    document.getElementById('memoConfidence').textContent = `${computed.score}/100`;

    document.getElementById('memoICP').textContent = state.inputs.icp || '—';
    document.getElementById('memoProblem').textContent = state.inputs.problem || '—';
    document.getElementById('memoSolution').textContent = state.inputs.solution || '—';

    const risk = topPrimaryRisk(computed.rows);
    document.getElementById('memoRisk').textContent = risk.title;

    const chosen = state.actions
      .slice()
      .sort((a, b) => (daysUntil(a.due) - daysUntil(b.due)))
      .slice(0, 4);

    document.getElementById('memoActions').textContent = chosen.length
      ? chosen.map(a => `• ${a.text} — ${a.owner || 'Owner'} — due ${a.due || 'date'}`).join('\n')
      : '—';
  }

  function exportMemoText() {
    const computed = computeScores();
    const minDimensionScore = Math.min(...computed.rows.map(r => r.points));
    const v = verdictFor(computed.score, minDimensionScore);
    const risk = topPrimaryRisk(computed.rows);

    const topActions = state.actions
      .slice()
      .sort((a, b) => (daysUntil(a.due) - daysUntil(b.due)))
      .slice(0, 5);

    const breakdown = computed.rows
      .slice()
      .sort((a, b) => b.weight - a.weight)
      .map(r => `- ${r.name}: ${r.points} (weight ${round1(r.weight * 100)}%)`)
      .join('\n');

    const assumptions = topAssumptionsByRisk(5)
      .map(a => `- (${typeLabel(a.type)}) [${a.impact}×${a.uncertainty}=${a.impact * a.uncertainty}] ${a.text}`)
      .join('\n');

    const actions = topActions
      .map(a => `- ${a.text} — Owner: ${a.owner || 'TBD'} — Due: ${a.due || 'TBD'} — Effort: ${a.effort || 'S'} — Signal: ${a.expected || '—'}`)
      .join('\n');

    const lines = [
      `IDEA VALIDATION MEMO`,
      ``,
      `Title: ${state.meta.title || '—'}`,
      `Stage: ${stageLabel(state.meta.stage)}`,
      ``,
      `Verdict: ${v.verdict}`,
      `Confidence: ${computed.score}/100`,
      `Primary risk: ${risk.title}`,
      ``,
      `ICP`,
      `${state.inputs.icp || '—'}`,
      ``,
      `Problem`,
      `${state.inputs.problem || '—'}`,
      ``,
      `Solution`,
      `${state.inputs.solution || '—'}`,
      ``,
      `Score breakdown`,
      breakdown || '—',
      ``,
      `Top assumptions (by risk)`,
      assumptions || '—',
      ``,
      `Next actions (72h–2w)`,
      actions || '—',
      ``,
      `Exported: ${new Date().toISOString()}`
    ];

    return lines.join('\n');
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', 'true');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function addAssumption(prefill) {
    const a = Object.assign({
      id: cryptoRandomId(),
      text: 'Customers will … (falsifiable)',
      type: 'market',
      impact: 3,
      uncertainty: 3,
      evidence: '',
      owner: '',
      due: addDaysISO(7),
      updatedAt: Date.now()
    }, prefill || {});
    state.assumptions.unshift(a);
    saveState();
    renderAll();
  }

  function addAction(prefill) {
    const a = Object.assign({
      id: cryptoRandomId(),
      text: 'Do the smallest test that changes your decision',
      type: 'customer-calls',
      owner: '',
      due: addDaysISO(7),
      effort: 'S',
      expected: '',
      updatedAt: Date.now()
    }, prefill || {});
    state.actions.unshift(a);
    saveState();
    renderAll();
  }

  function generateActionsFromAssumptions() {
    const top = topAssumptionsByRisk(4);
    if (!top.length) {
      toast('No assumptions to generate from');
      return;
    }

    const generated = top.map(a => actionFromAssumption(a));
    const existingTexts = new Set(state.actions.map(x => (x.text || '').trim().toLowerCase()).filter(Boolean));

    let added = 0;
    generated.forEach(g => {
      const key = (g.text || '').trim().toLowerCase();
      if (!key) return;
      if (existingTexts.has(key)) return;
      state.actions.unshift(g);
      added += 1;
    });

    saveState();
    renderAll();
    toast(added ? `Generated ${added} actions` : 'No new actions (already present)');
  }

  function actionFromAssumption(a) {
    const base = {
      id: cryptoRandomId(),
      owner: a.owner || '',
      due: a.due || addDaysISO(10),
      effort: 'S',
      expected: 'A clear yes/no signal that changes the verdict',
      updatedAt: Date.now()
    };

    const type = a.type || 'market';
    const txt = (a.text || '').toLowerCase();

    if (type === 'pricing' || txt.includes('pay') || txt.includes('$') || txt.includes('pricing')) {
      return Object.assign(base, {
        type: 'pricing-test',
        text: `Test price with 6–10 ICP conversations; ask for a pilot commitment tied to ${state.meta.title || 'the idea'}`,
        expected: 'At least 2 concrete commitments (pilot/LOI) or a consistent budget threshold'
      });
    }

    if (type === 'feasibility' || txt.includes('integration') || txt.includes('api') || txt.includes('security')) {
      return Object.assign(base