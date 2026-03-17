(() => {
  'use strict';

  const STORAGE_KEY = 'pmx.idea-validator.v1';

  const DIMENSIONS = [
    {
      id: 'problem_clarity',
      name: 'Problem clarity',
      hint: 'Is the user pain specific, frequent, and costly?',
      weight: 0.16,
      defaultAssumption: 'The target user experiences this pain weekly and it causes measurable cost (time, revenue, risk).',
      defaultTest: 'Run 8–10 structured problem interviews with target users; quantify frequency and workaround cost.'
    },
    {
      id: 'target_user',
      name: 'Target user focus',
      hint: 'Is the user segment concrete and reachable?',
      weight: 0.10,
      defaultAssumption: 'We can name the buyer and end user, and we have a channel to reach them in <2 weeks.',
      defaultTest: 'Write ICP and recruit list; confirm 10 qualified contacts and response rate >20%.'
    },
    {
      id: 'market_pull',
      name: 'Demand signal',
      hint: 'Is there evidence of pull beyond a single loud request?',
      weight: 0.14,
      defaultAssumption: 'There is repeatable demand across multiple accounts, not just one stakeholder.',
      defaultTest: 'Review support/sales calls; tag 30 days of requests; confirm ≥8 mentions across ≥4 accounts.'
    },
    {
      id: 'differentiation',
      name: 'Differentiation',
      hint: 'Why will we win vs status quo and alternatives?',
      weight: 0.14,
      defaultAssumption: 'We can articulate a unique advantage that a competitor can’t copy quickly.',
      defaultTest: 'Competitive teardown; map 3 alternatives; identify one wedge with proof points and pricing angle.'
    },
    {
      id: 'business_value',
      name: 'Business value',
      hint: 'Does it move a metric leadership cares about?',
      weight: 0.12,
      defaultAssumption: 'The initiative can impact a top-3 company KPI within one quarter of launch.',
      defaultTest: 'Model KPI impact with realistic adoption; align with Finance on metric definition and baseline.'
    },
    {
      id: 'viability',
      name: 'Viability & constraints',
      hint: 'Any legal, privacy, platform, or policy traps?',
      weight: 0.10,
      defaultAssumption: 'No policy/compliance blocker exists for the required data flows.',
      defaultTest: '30-minute review with Legal/Security; document approved data handling and retention.'
    },
    {
      id: 'feasibility',
      name: 'Feasibility',
      hint: 'Can we build a credible MVP fast with the team we have?',
      weight: 0.12,
      defaultAssumption: 'A thin-slice MVP can ship in 4–6 weeks without platform rewrites.',
      defaultTest: 'Engineering spike: 2-day technical design + prototype; estimate critical path and dependencies.'
    },
    {
      id: 'effort_risk',
      name: 'Effort vs upside',
      hint: 'Is the expected upside worth the likely effort?',
      weight: 0.12,
      defaultAssumption: 'Expected upside is at least 3× the total build + go-to-market cost.',
      defaultTest: 'Back-of-envelope ROI model; stress test with pessimistic adoption and higher engineering effort.'
    }
  ];

  const VERDICT_RULES = {
    drop: {
      label: 'DROP',
      description: 'Too many high-risk unknowns or a validated negative signal'
    },
    refine: {
      label: 'REFINE',
      description: 'Promising, but key assumptions must be validated before committing'
    },
    commit: {
      label: 'COMMIT',
      description: 'Clear value, defensible wedge, and feasible plan with manageable risk'
    }
  };

  const DEFAULT_IDEAS = [
    {
      id: cryptoId(),
      name: 'Instant Renewal Risk Radar',
      pitch: 'Detect accounts likely to churn at renewal by combining usage drops with stakeholder silence signals.',
      targetUser: 'Customer Success Managers at B2B SaaS (mid-market) with quarterly renewals',
      decisionOwner: 'Head of Product',
      timeHorizon: '6 weeks to MVP, 1 quarter to measurable retention impact',
      budgetBand: '$80–120k eng time equivalent',
      execSummary:
        'We will reduce surprise churn by flagging renewal risk earlier than the current “renewal week scramble.” The wedge is combining product usage deltas with CRM engagement gaps to produce a single renewal risk narrative, not just a score. Validation focus: can we reliably identify risk 30+ days earlier with acceptable false positives, and will CSMs change behavior based on the output.',
      dimensions: {
        problem_clarity: { score: 4, evidence: 'CSMs report “renewal surprises” in QBRs; 7/12 churned accounts had clear usage drop 45–60 days earlier.' },
        target_user: { score: 5, evidence: 'Buyer: CS leadership. User: CSM. Access via 3 design partners and 60 CSMs internally.' },
        market_pull: { score: 4, evidence: 'Retention is top KPI; similar request surfaced across 5 enterprise accounts in the last 2 months.' },
        differentiation: { score: 2, evidence: 'Competitors offer risk scores; we believe narrative + action recommendations is the differentiator but haven’t tested it.' },
        business_value: { score: 4, evidence: 'If we prevent 3 churned mid-market accounts/quarter at $45k ARR each, impact is material.' },
        viability: { score: 3, evidence: 'Needs CRM + product data; must avoid surfacing personal data in dashboards. Security review required.' },
        feasibility: { score: 3, evidence: 'Data pipeline exists but engagement data quality is inconsistent; MVP can start with usage-only + manual CRM entry.' },
        effort_risk: { score: 3, evidence: 'Upside is high but model tuning may take longer than expected; start rules-based.' }
      },
      assumptions: [],
      plan: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 36,
      updatedAt: Date.now() - 1000 * 60 * 12
    },
    {
      id: cryptoId(),
      name: 'In-Product Procurement Pack',
      pitch: 'Generate a security + compliance packet automatically so procurement reviews stop blocking expansion deals.',
      targetUser: 'Enterprise Account Executives and Security reviewers at SaaS buying committees',
      decisionOwner: 'Founder/CEO',
      timeHorizon: '4 weeks to pilot with 2 expansion deals',
      budgetBand: '$40–60k eng time equivalent',
      execSummary:
        'Expansion deals stall when procurement asks for the same evidence repeatedly (SOC2, data retention, sub-processors, DPA). We can reduce time-to-sign by generating a consistent “procurement pack” tied to the specific product modules a customer uses. Core risk: this becomes documentation theater without actually accelerating approvals; we need proof that buyers will accept standardized artifacts and that Security can keep them accurate.',
      dimensions: {
        problem_clarity: { score: 3, evidence: 'Sales reports “procurement loop” is painful, but we don’t have baseline cycle-time segmented by cause.' },
        target_user: { score: 4, evidence: 'Buyer: CRO/RevOps. Users: AEs + Security. Reach via internal sales team and 2 existing enterprise buyers.' },
        market_pull: { score: 3, evidence: 'Repeated requests exist, but unclear if this is top-3 blocker vs pricing/legal.' },
        differentiation: { score: 3, evidence: 'Some competitors provide trust centers; wedge is module-specific pack + audit trail.' },
        business_value: { score: 4, evidence: 'If we shorten expansion cycle by 10 days on 6 deals/quarter, revenue pull-in is meaningful.' },
        viability: { score: 4, evidence: 'Documentation is already approved; main risk is keeping it updated and avoiding accidental inconsistency.' },
        feasibility: { score: 4, evidence: 'Mostly templating + admin workflow; no heavy infra.' },
        effort_risk: { score: 3, evidence: 'Moderate build; risk is adoption and internal upkeep costs.' }
      },
      assumptions: [],
      plan: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 18,
      updatedAt: Date.now() - 1000 * 60 * 7
    }
  ];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const els = {
    navItems: $$('.nav__item'),
    views: $$('.view'),
    verdictText: $('#verdictText'),
    verdictReason: $('#verdictReason'),
    confidenceNumber: $('#confidenceNumber'),
    primaryRisk: $('#primaryRisk'),

    ideaSelect: $('#ideaSelect'),
    ideaName: $('#ideaName'),
    ideaPitch: $('#ideaPitch'),
    targetUser: $('#targetUser'),
    decisionOwner: $('#decisionOwner'),
    timeHorizon: $('#timeHorizon'),
    budgetBand: $('#budgetBand'),
    execSummary: $('#execSummary'),

    dimensionsTbody: $('#dimensionsTbody'),
    weakCount: $('#weakCount'),
    nextAction: $('#nextAction'),
    flagsList: $('#flagsList'),

    assumptionsTbody: $('#assumptionsTbody'),
    assumptionsOpenCount: $('#assumptionsOpenCount'),
    assumptionsHighRiskCount: $('#assumptionsHighRiskCount'),
    assumptionFilterStatus: $('#assumptionFilterStatus'),
    assumptionFilterRisk: $('#assumptionFilterRisk'),
    assumptionSearch: $('#assumptionSearch'),
    assumptionSort: $('#assumptionSort'),
    addAssumptionBtn: $('#addAssumptionBtn'),
    bulkValidateBtn: $('#bulkValidateBtn'),

    planTbody: $('#planTbody'),
    planCount: $('#planCount'),
    planDays: $('#planDays'),
    autoPlanBtn: $('#autoPlanBtn'),
    addPlanTaskBtn: $('#addPlanTaskBtn'),

    memoOutput: $('#memoOutput'),
    copyMemoBtn: $('#copyMemoBtn'),
    refreshMemoBtn: $('#refreshMemoBtn'),
    copyToast: $('#copyToast'),

    archiveTbody: $('#archiveTbody'),
    snapshotCount: $('#snapshotCount'),
    archiveSearch: $('#archiveSearch'),
    archiveSort: $('#archiveSort'),
    archiveVerdict: $('#archiveVerdict'),

    newIdeaBtn: $('#newIdeaBtn'),
    duplicateIdeaBtn: $('#duplicateIdeaBtn'),
    exportBtn: $('#exportBtn'),
    resetDemoBtn: $('#resetDemoBtn'),
    saveSnapshotBtn: $('#saveSnapshotBtn'),

    modalOverlay: $('#modalOverlay'),
    modalCloseBtn: $('#modalCloseBtn'),
    modalSecondaryBtn: $('#modalSecondaryBtn'),
    modalPrimaryBtn: $('#modalPrimaryBtn'),
    modalTitle: $('#modalTitle'),
    modalKicker: $('#modalKicker'),
    modalBody: $('#modalBody')
  };

  const state = {
    data: null,
    activeIdeaId: null,
    activeView: 'scorecard',
    modal: {
      open: false,
      kind: null,
      payload: null,
      onPrimary: null,
      onSecondary: null
    }
  };

  function nowIsoShort(ts = Date.now()) {
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function cryptoId() {
    if (window.crypto && crypto.getRandomValues) {
      const a = new Uint8Array(8);
      crypto.getRandomValues(a);
      return Array.from(a).map(x => x.toString(16).padStart(2, '0')).join('');
    }
    return Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
  }

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeJsonParse(raw) : null;
    if (parsed && parsed.version === 1 && parsed.ideas && parsed.snapshots) return parsed;

    const seeded = seedData();
    save(seeded);
    return seeded;
  }

  function save(data = state.data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function seedData() {
    const ideas = DEFAULT_IDEAS.map(idea => hydrateIdea(idea));
    return {
      version: 1,
      ideas,
      snapshots: [],
      lastActiveIdeaId: ideas[0]?.id ?? null
    };
  }

  function hydrateIdea(idea) {
    const hydrated = structuredClonePolyfill(idea);
    if (!hydrated.dimensions) hydrated.dimensions = {};
    for (const dim of DIMENSIONS) {
      if (!hydrated.dimensions[dim.id]) hydrated.dimensions[dim.id] = { score: 3, evidence: '' };
      hydrated.dimensions[dim.id].score = clamp(intOr(hydrated.dimensions[dim.id].score, 3), 0, 5);
      hydrated.dimensions[dim.id].evidence = strOr(hydrated.dimensions[dim.id].evidence, '');
    }
    hydrated.assumptions = Array.isArray(hydrated.assumptions) ? hydrated.assumptions : [];
    hydrated.plan = Array.isArray(hydrated.plan) ? hydrated.plan : [];
    hydrated.createdAt = intOr(hydrated.createdAt, Date.now());
    hydrated.updatedAt = intOr(hydrated.updatedAt, Date.now());

    ensureAssumptionsFromScorecard(hydrated);
    ensurePlanFromAssumptions(hydrated, { onlyIfEmpty: true });

    return hydrated;
  }

  function structuredClonePolyfill(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function intOr(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function strOr(v, fallback) {
    return typeof v === 'string' ? v : fallback;
  }

  function getActiveIdea() {
    return state.data.ideas.find(i => i.id === state.activeIdeaId) || null;
  }

  function setActiveIdea(id) {
    state.activeIdeaId = id;
    state.data.lastActiveIdeaId = id;
    save();
    renderAll();
  }

  function setView(viewId) {
    state.activeView = viewId;
    for (const btn of els.navItems) {
      const active = btn.dataset.view === viewId;
      btn.setAttribute('aria-current', active ? 'page' : 'false');
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    }
    for (const v of els.views) {
      v.classList.toggle('is-hidden', v.dataset.view !== viewId);
    }
    if (viewId === 'plan') renderMemo();
  }

  function computeConfidence(idea) {
    const base = DIMENSIONS.reduce((acc, dim) => {
      const s = idea.dimensions[dim.id]?.score ?? 0;
      return acc + (s / 5) * dim.weight;
    }, 0);

    let bonus = 0;
    let penalty = 0;

    const assumptions = idea.assumptions || [];
    const total = assumptions.length;
    const open = assumptions.filter(a => a.status === 'open').length;
    const invalidated = assumptions.filter(a => a.status === 'invalidated').length;
    const validated = assumptions.filter(a => a.status === 'validated').length;
    const highOpen = assumptions.filter(a => a.status === 'open' && a.risk === 'high').length;

    if (total > 0) {
      const validatedRatio = validated / total;
      bonus += 0.07 * validatedRatio;
      penalty += 0.10 * (open / total);
    }

    penalty += 0.03 * Math.min(3, invalidated);
    penalty += 0.02 * Math.min(4, highOpen);

    const v = clamp(base + bonus - penalty, 0, 1);
    return Math.round(v * 100);
  }

  function computeVerdict(idea) {
    const confidence = computeConfidence(idea);

    const lowDims = DIMENSIONS.filter(d => (idea.dimensions[d.id]?.score ?? 0) <= 2);
    const veryLowDims = DIMENSIONS.filter(d => (idea.dimensions[d.id]?.score ?? 0) <= 1);

    const assumptions = idea.assumptions || [];
    const invalidatedHigh = assumptions.some(a => a.status === 'invalidated' && a.risk === 'high');
    const invalidatedAny = assumptions.some(a => a.status === 'invalidated');

    if (invalidatedHigh) return { verdict: 'drop', confidence, reason: 'A high-risk assumption was invalidated.' };
    if (veryLowDims.length >= 2) return { verdict: 'drop', confidence, reason: 'Multiple critical dimensions scored 0–1.' };
    if (confidence >= 82 && lowDims.length <= 1 && !invalidatedAny) return { verdict: 'commit', confidence, reason: 'High confidence with limited unknowns.' };
    if (confidence <= 45 || lowDims.length >= 4) return { verdict: 'drop', confidence, reason: 'Confidence is low and unknowns are concentrated.' };
    return { verdict: 'refine', confidence, reason: 'Promising, but key unknowns remain.' };
  }

  function primaryRiskFromIdea(idea) {
    const invalidatedHigh = (idea.assumptions || []).find(a => a.status === 'invalidated' && a.risk === 'high');
    if (invalidatedHigh) return `Invalidated: ${invalidatedHigh.text}`;

    const openHigh = (idea.assumptions || []).filter(a => a.status === 'open' && a.risk === 'high');
    if (openHigh.length) return openHigh[0].text;

    const lowDim = DIMENSIONS
      .map(d => ({ d, s: idea.dimensions[d.id]?.score ?? 0 }))
      .sort((a, b) => a.s - b.s)[0];

    if (lowDim && lowDim.s <= 2) return `${lowDim.d.name} is under-evidenced`;

    return 'No dominant risk identified';
  }

  function flagsFromIdea(idea) {
    const flags = [];
    const dims = idea.dimensions || {};
    const lowDims = DIMENSIONS.filter(d => (dims[d.id]?.score ?? 0) <= 2);
    const missingEvidence = DIMENSIONS.filter(d => (dims[d.id]?.evidence ?? '').trim().length < 12);

    const invalidated = (idea.assumptions || []).filter(a => a.status === 'invalidated');
    const openHigh = (idea.assumptions || []).filter(a => a.status === 'open' && a.risk === 'high');

    if (missingEvidence.length >= 3) {
      flags.push(`Evidence is thin in ${missingEvidence.length} dimensions — scores may be wishful.`);
    }
    if (lowDims.some(d => d.id === 'differentiation')) {
      flags.push('Differentiation is weak: you may be building a feature, not a wedge.');
    }
    if (lowDims.some(d => d.id === 'feasibility')) {
      flags.push('Feasibility risk: validate technical path before committing roadmap capacity.');
    }
    if (openHigh.length >= 2) {
      flags.push(`There are ${openHigh.length} high-risk unknowns still open — plan should start there.`);
    }
    if (invalidated.length) {
      flags.push(`At least one assumption is invalidated — decision should be “DROP” unless scope changes.`);
    }
    if (!idea.pitch || idea.pitch.trim().split(' ').length < 8) {
      flags.push('Pitch is too short: if you can’t state the mechanism, you can’t test it.');
    }

    if (flags.length === 0) flags.push('No structural red flags detected. Focus on quick validation to increase confidence.');
    return flags;
  }

  function ensureAssumptionsFromScorecard(idea) {
    const existing = new Set((idea.assumptions || []).map(a => a.sourceKey));
    const derived = [];

    for (const dim of DIMENSIONS) {
      const cell = idea.dimensions[dim.id];
      const score = cell?.score ?? 0;
      const evidence = (cell?.evidence ?? '').trim();

      const shouldCreate = score <= 2 || evidence.length < 12;
      if (!shouldCreate) continue;

      const risk = score <= 1 ? 'high' : (score === 2 ? 'medium' : 'low');
      const sourceKey = `dim:${dim.id}`;

      if (existing.has(sourceKey)) continue;

      derived.push({
        id: cryptoId(),
        text: dim.defaultAssumption,
        dimensionId: dim.id,
        risk,
        test: dim.defaultTest,
        status: 'open',
        notes: evidence ? `Scorecard note: ${evidence}` : '',
        sourceKey,
        updatedAt: Date.now()
      });
    }

    if (!idea.assumptions) idea.assumptions = [];
    if (derived.length) {
      idea.assumptions.unshift(...derived);
      idea.updatedAt = Date.now();
    }
  }

  function ensurePlanFromAssumptions(idea, opts = { onlyIfEmpty: false }) {
    if (!idea.plan) idea.plan = [];
    if (opts.onlyIfEmpty && idea.plan.length) return;

    const openAssumptions = (idea.assumptions || [])
      .filter(a => a.status === 'open')
      .slice()
      .sort((a, b) => riskRank(b.risk) - riskRank(a.risk));

    const tasks = [];
    for (const a of openAssumptions) {
      tasks.push(taskFromAssumption(a));
    }

    idea.plan = tasks;
    idea.updatedAt = Date.now();
  }

  function riskRank(r) {
    if (r === 'high') return 3;
    if (r === 'medium') return 2;
    return 1;
  }

  function methodFromTest(test) {
    const t = test.toLowerCase();
    if (t.includes('interview')) return 'Customer interviews';
    if (t.includes('teardown') || t.includes('competitive')) return 'Competitive analysis';
    if (t.includes('spike') || t.includes('prototype') || t.includes('technical')) return 'Engineering spike';
    if (t.includes('review') || t.includes('legal') || t.includes('security')) return 'Risk review';
    if (t.includes('model') || t.includes('roi')) return 'Modeling';
    if (t.includes('tag') || t.includes('calls') || t.includes('review support')) return 'Data review';
    return 'Experiment';
  }

  function effortFromMethod(method) {
    const m = method.toLowerCase();
    if (m.includes('interview')) return 'M';
    if (m.includes('analysis')) return 'S';
    if (m.includes('spike')) return 'M';
    if (m.includes('review')) return 'S';
    if (m.includes('model')) return 'S';
    if (m.includes('data')) return 'M';
    return 'M';
  }

  function taskFromAssumption(a) {
    const method = methodFromTest(a.test || '');
    const effort = effortFromMethod(method);
    return {
      id: cryptoId(),
      title: a.test || 'Define a test',
      method,
      owner: 'PM',
      effort,
      success: successCriteriaFromRisk(a.risk, a.dimensionId),
      status: 'planned',
      assumptionId: a.id
    };
  }

  function successCriteriaFromRisk(risk, dimId) {
    const dim = DIMENSIONS.find(d => d.id === dimId);
    const label = dim ? dim.name : 'this dimension';

    if (risk === 'high') return `Resolve ${label}: evidence supports proceeding OR forces a scope change`;
    if (risk === 'medium') return `Increase confidence in ${label} with at least one concrete proof point`;
    return `Document credible evidence for ${label}`;
  }

  function estimateDaysFromEffort(effort) {
    if (effort === 'S') return 2;
    if (effort === 'M') return 5;
    if (effort === 'L') return 10;
    return 5;
  }

  function renderIdeaSelect() {
    const idea = getActiveIdea();
    els.ideaSelect.innerHTML = '';
    for (const i of state.data.ideas.slice().sort((a, b) => b.updatedAt - a.updatedAt)) {
      const opt = document.createElement('option');
      opt.value = i.id;
      opt.textContent = `${i.name} — ${nowIsoShort(i.updatedAt)}`;
      if (idea && i.id === idea.id) opt.selected = true;
      els.ideaSelect.appendChild(opt);
    }
  }

  function renderHero() {
    const idea = getActiveIdea();
    if (!idea) return;

    const { verdict, confidence, reason } = computeVerdict(idea);
    const risk = primaryRiskFromIdea(idea);

    els.verdictText.textContent = VERDICT_RULES[verdict].label;
    els.verdictReason.textContent = reason;
    els.confidenceNumber.textContent = String(confidence);
    els.primaryRisk.textContent = risk;

    const highlightMetric = verdict === 'commit' ? 'commit' : verdict === 'drop' ? 'drop' : 'refine';
    els.verdictText.style.background = 'transparent';
    els.verdictText.style.padding = '0';
    els.verdictText.style.display = 'inline-block';
    if (highlightMetric === 'commit') {
      els.confidenceNumber.style.background = 'var(--highlight)';
      els.confidenceNumber.style.padding = '4px 10px';
    } else {
      els.confidenceNumber.style.background = 'transparent';
      els.confidenceNumber.style.padding = '0';
    }
    if (highlightMetric === 'drop') {
      els.verdictText.style.background = 'var(--highlight)';
      els.verdictText.style.padding = '4px 10px';
    }
  }

  function renderTopFields() {
    const idea = getActiveIdea();
    if (!idea) return;

    els.ideaName.value = idea.name || '';
    els.ideaPitch.value = idea.pitch || '';
    els.targetUser.value = idea.targetUser || '';
    els.decisionOwner.value = idea.decisionOwner || '';
    els.timeHorizon.value = idea.timeHorizon || '';
    els.budgetBand.value = idea.budgetBand || '';
    els.execSummary.value = idea.execSummary || '';
  }

  function renderDimensions() {
    const idea = getActiveIdea();
    if (!idea) return;

    const tbody = els.dimensionsTbody;
    tbody.innerHTML = '';

    for (const dim of DIMENSIONS) {
      const row = document.createElement('tr');

      const c1 = document.createElement('td');
      const name = document.createElement('div');
      name.className = 'dimName';
      name.textContent = dim.name;
      const hint = document.createElement('span');
      hint.className = 'dimHint';
      hint.textContent = dim.hint;
      c1.appendChild(name);
      c1.appendChild(hint);

      const c2 = document.createElement('td');
      c2.className = 'weightCell';
      c2.textContent = `${Math.round(dim.weight * 100)}%`;

      const c3 = document.createElement('td');
      const scoreWrap = document.createElement('div');
      scoreWrap.className = 'scoreCell';
      const scoreSel = document.createElement('select');
      scoreSel.className = 'select scoreSelect';
      scoreSel.setAttribute('aria-label', `${dim.name} score`);
      for (let i = 0; i <= 5; i++) {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = String(i);
        if ((idea.dimensions[dim.id]?.score ?? 3) === i) opt.selected = true;
        scoreSel.appendChild(opt);
      }
      scoreSel.addEventListener('change', () => {
        const v = clamp(Number(scoreSel.value), 0, 5);
        idea.dimensions[dim.id].score = v;
        idea.updatedAt = Date.now();
        ensureAssumptionsFromScorecard(idea);
        save();
        renderAll();
      });
      const scoreTag = document.createElement('span');
      scoreTag.className = 'pill';
      const dash = document.createElement('span');
      dash.className = 'pill__dash';
      dash.textContent = '—';
      const val = document.createElement('span');
      val.className = 'pill__value';
      val.textContent = scoreMeaning(vScore(idea, dim.id));
      scoreTag.appendChild(document.createTextNode('RATING'));
      scoreTag.appendChild(dash);
      scoreTag.appendChild(val);
      scoreWrap.appendChild(scoreSel);
      scoreWrap.appendChild(scoreTag);
      c3.appendChild(scoreWrap);

      const c4 = document.createElement('td');
      const evidence = document.createElement('input');
      evidence.className = 'input evidenceInput';
      evidence.type = 'text';
      evidence.value = idea.dimensions[dim.id]?.evidence ?? '';
      evidence.setAttribute('aria-label', `${dim.name} evidence`);
      evidence.addEventListener('input', () => {
        idea.dimensions[dim.id].evidence = evidence.value;
        idea.updatedAt = Date.now();
        save();
        renderFlagsAndMeta();
      });
      evidence.addEventListener('blur', () => {
        ensureAssumptionsFromScorecard(idea);
        save();
        renderAll();
      });
      c4.appendChild(evidence);

      row.appendChild(c1);
      row.appendChild(c2);
      row.appendChild(c3);
      row.appendChild(c4);
      tbody.appendChild(row);
    }
  }

  function vScore(idea, dimId) {
    return clamp(intOr(idea.dimensions[dimId]?.score, 0), 0, 5);
  }

  function scoreMeaning(score) {
    if (score >= 5) return 'PROVEN';
    if (score === 4) return 'STRONG';
    if (score === 3) return 'PLAUSIBLE';
    if (score === 2) return 'WEAK';
    if (score === 1) return 'FRAGILE';
    return 'NONE';
  }

  function renderFlagsAndMeta() {
    const idea = getActiveIdea();
    if (!idea) return;

    const lowDims = DIMENSIONS.filter(d => (idea.dimensions[d.id]?.score ?? 0) <= 2);
    els.weakCount.textContent = String(lowDims.length);

    const next = recommendedNextAction(idea);
    els.nextAction.textContent = next;

    const flags = flagsFromIdea(idea);
    els.flagsList.innerHTML = '';
    for (const f of flags) {
      const li = document.createElement('li');
      li.textContent = f;
      els.flagsList.appendChild(li);
    }

    renderAssumptionsMeta();
    renderPlanMeta();
    renderArchiveMeta();
    renderHero();
  }

  function recommendedNextAction(idea) {
    const openHigh = (idea.assumptions || []).find(a => a.status === 'open' && a.risk === 'high');
    if (openHigh) {
      const dim = DIMENSIONS.find(d => d.id === openHigh.dimensionId);
      return dim ? `Validate ${dim.name} (high risk)` : 'Validate highest-risk assumption';
    }
    const lowDim = DIMENSIONS
      .map(d => ({ d, s: idea.dimensions[d.id]?.score ?? 0 }))
      .sort((a, b) => a.s - b.s)[0];

    if (lowDim && lowDim.s <= 2) return `Strengthen evidence for ${lowDim.d.name}`;
    return 'Capture a snapshot for decision review';
  }

  function renderAssumptionsMeta() {
    const idea = getActiveIdea();
    if (!idea) return;

    const open = (idea.assumptions || []).filter(a => a.status === 'open');
    const high = (idea.assumptions || []).filter(a => a.status === 'open' && a.risk === 'high');
    els.assumptionsOpenCount.textContent = String(open.length);
    els.assumptionsHighRiskCount.textContent = String(high.length);
  }

  function filteredAssumptions(idea) {
    const status = els.assumptionFilterStatus.value;
    const risk = els.assumptionFilterRisk.value;
    const q = els.assumptionSearch.value.trim().toLowerCase();
    const sort = els.assumptionSort.value;

    let items = (idea.assumptions || []).slice();

    if (status !== 'all') items = items.filter(a => a.status === status);
    if (risk !== 'all') items = items.filter(a => a.risk === risk);
    if (q) {
      items = items.filter(a =>
        (a.text || '').toLowerCase().includes(q) ||
        (a.test || '').toLowerCase().includes(q) ||
        (a.notes || '').toLowerCase().includes(q)
      );
    }

    if (sort === 'risk-desc') {
      items.sort((a, b) => riskRank(b.risk) - riskRank(a.risk) || (b.updatedAt - a.updatedAt));
    } else if (sort === 'status-open') {
      items.sort((a, b) => statusRank(a.status) - statusRank(b.status) || riskRank(b.risk) - riskRank(a.risk));
    } else if (sort === 'dimension') {
      items.sort((a, b) => (a.dimensionId || '').localeCompare(b.dimensionId || '') || riskRank(b.risk) - riskRank(a.risk));
    } else if (sort === 'recent') {
      items.sort((a, b) => (b.updatedAt - a.updatedAt));
    }

    return items;
  }

  function statusRank(s) {
    if (s === 'open') return 0;
    if (s === 'validated') return 1;
    return 2;
  }

  function renderAssumptions() {
    const idea = getActiveIdea();
    if (!idea) return;

    const items = filteredAssumptions(idea);
    const tbody = els.assumptionsTbody;
    tbody.innerHTML = '';

    for (const a of items) {
      const tr = document.createElement('tr');

      tr.appendChild(tdText(a.text || ''));

      const dim = DIMENSIONS.find(d => d.id === a.dimensionId);
      tr.appendChild(tdText(dim ? dim.name : (a.dimensionId || '—')));

      const tdRisk = document.createElement('td');
      tdRisk.appendChild(riskPill(a.risk));
      tr.appendChild(tdRisk);

      tr.appendChild(tdText(a.test || ''));

      const tdStatus = document.createElement('td');
      tdStatus.appendChild(statusPill(a.status));
      tr.appendChild(tdStatus);

      tr.appendChild(tdText(a.notes || ''));

      tr.appendChild(tdText(nowIsoShort(a.updatedAt)));

      const tdActions = document.createElement('td');
      tdActions.appendChild(actionButtonsForAssumption(a));
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    }
  }

  function tdText(s) {
    const td = document.createElement('td');
    td.textContent = s;
    return td;
  }

  function riskPill(risk) {
    const wrap = document.createElement('span');
    wrap.className = 'pill' + (risk === 'high' ? ' pill--highlight' : '');
    const dash = document.createElement('span');
    dash.className = 'pill__dash';
    dash.textContent = '—';
    const v = document.createElement('span');
    v.className = 'pill__value';
    v.textContent = String(risk || '—').toUpperCase();
    wrap.appendChild(document.createTextNode('RISK'));
    wrap.appendChild(dash);
    wrap.appendChild(v);
    return wrap;
  }

  function statusPill(status) {
    const wrap = document.createElement('span');
    wrap.className = 'pill' + (status === 'invalidated' ? ' pill--highlight' : '');
    const dash = document.createElement('span');
    dash.className = 'pill__dash';
    dash.textContent = '—';
    const v = document.createElement('span');
    v.className = 'pill__value';
    v.textContent = String(status || '—').toUpperCase();
    wrap.appendChild(document.createTextNode('STATUS'));
    wrap.appendChild(dash);
    wrap.appendChild(v);
    return wrap;
  }

  function actionButtonsForAssumption(a) {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.gap = '8px';
    wrap.style.flexWrap = 'wrap';

    const edit = document.createElement('button');
    edit.className = 'iconBtn';
    edit.type = 'button';
    edit.textContent = 'EDIT';
    edit.addEventListener('click', () => openAssumptionModal(a));
    wrap.appendChild(edit);

    const val = document.createElement('button');
    val.className = 'iconBtn';
    val.type = 'button';
    val.textContent = 'VALIDATE';
    val.addEventListener('click', () => setAssumptionStatus(a.id, 'validated'));
    wrap.appendChild(val);

    const inv = document.createElement('button');
    inv.className = 'iconBtn';
    inv.type = 'button';
    inv.textContent = 'INVALIDATE';
    inv.addEventListener('click', () => setAssumptionStatus(a.id, 'invalidated'));
    wrap.appendChild(inv);

    return wrap;
  }

  function setAssumptionStatus(assumptionId, status) {
    const idea = getActiveIdea();
    if (!idea) return;
    const a = (idea.assumptions || []).find(x => x.id === assumptionId);
    if (!a) return;

    a.status = status;
    a.updatedAt = Date.now();

    if (status === 'validated') {
      const dimCell = idea.dimensions[a.dimensionId];
      if (dimCell && dimCell.score < 4) dimCell.score = clamp(dimCell.score + 1, 0, 5);
      if (dimCell && (dimCell.evidence || '').trim().length < 12) {
        dimCell.evidence = (dimCell.evidence || '').trim()
          ? dimCell.evidence
          : 'Validated via targeted test; evidence captured in assumption notes.';
      }
    }

    if (status === 'invalidated') {
      const dimCell = idea.dimensions[a.dimensionId];
      if (dimCell && dimCell.score > 1) dimCell.score = clamp(dimCell.score - 2, 0, 5);
    }

    idea.updatedAt = Date.now();
    save();
    renderAll();
  }

  function renderPlanMeta() {
    const idea = getActiveIdea();
    if (!idea) return;

    els.planCount.textContent = String((idea.plan || []).length);
    const days = (idea.plan || [])
      .filter(t => t.status !== 'done')
      .reduce((acc, t) => acc + estimateDaysFromEffort(t.effort), 0);
    els.planDays.textContent = String(days);
  }

  function renderPlan() {
    const idea = getActiveIdea();
    if (!idea) return;

    const tbody = els.planTbody;
    tbody.innerHTML = '';

    (idea.plan || []).forEach((t, idx) => {
      const tr = document.createElement('tr');

      tr.appendChild(tdText(String(idx + 1)));
      tr.appendChild(tdText(t.title || ''));
      tr.appendChild(tdText(t.method || ''));

      const ownerTd = document.createElement('td');
      const ownerInput = document.createElement('input');
      ownerInput.className = 'input';
      ownerInput.type = 'text';
      ownerInput.value = t.owner || '';
      ownerInput.addEventListener('input', () => {
        t.owner = ownerInput.value;
        idea.updatedAt = Date.now();
        save();
      });
      ownerTd.appendChild(ownerInput);
      tr.appendChild(ownerTd);

      const effortTd = document.createElement('td');
      const effSel = document.createElement('select');
      effSel.className = 'select';
      for (const e of ['S', 'M', 'L']) {
        const opt = document.createElement('option');
        opt.value = e;
        opt.textContent = e;
        if ((t.effort || 'M') === e) opt.selected = true;
        effSel.appendChild(opt);
      }
      effSel.addEventListener('change', () => {
        t.effort = effSel.value;
        idea.updatedAt = Date.now();
        save();
        renderPlanMeta();
        renderMemo();
      });
      effortTd.appendChild(effSel);
      tr.appendChild(effortTd);

      const successTd = document.createElement('td');
      const successInput = document.createElement('input');
      successInput.className = 'input';
      successInput.type = 'text';
      successInput.value = t.success || '';
      successInput.addEventListener('input', () => {
        t.success = successInput.value;
        idea.updatedAt = Date.now();
        save();
      });
      successTd