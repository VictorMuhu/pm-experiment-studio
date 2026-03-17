(() => {
  'use strict';

  const STORAGE_KEY = 'pm-experiment.idea-validator.v1';

  const DIMENSIONS = [
    {
      id: 'pain',
      label: 'Pain & frequency',
      short: 'Pain',
      description: 'How acute and frequent is the user problem today?',
      weight: 0.18,
      riskHint: 'If pain is weak or infrequent, adoption will stall.'
    },
    {
      id: 'audience',
      label: 'Defined audience',
      short: 'Audience',
      description: 'Do we know exactly who this is for, and can we reach them?',
      weight: 0.12,
      riskHint: 'If the audience is vague, success cannot be measured or marketed.'
    },
    {
      id: 'differentiation',
      label: 'Differentiation',
      short: 'Differentiation',
      description: 'Is there a clear reason to choose this over current alternatives?',
      weight: 0.14,
      riskHint: 'If differentiation is unclear, pricing and positioning will fail.'
    },
    {
      id: 'feasibility',
      label: 'Feasibility',
      short: 'Feasibility',
      description: 'Can we ship a credible v1 in ~6–10 weeks with current team constraints?',
      weight: 0.14,
      riskHint: 'If feasibility is low, the idea will consume roadmap oxygen.'
    },
    {
      id: 'distribution',
      label: 'Distribution',
      short: 'Distribution',
      description: 'Is there a realistic path to acquisition (channels, triggers, product surface)?',
      weight: 0.14,
      riskHint: 'If distribution is weak, a good product will still look like a failure.'
    },
    {
      id: 'economics',
      label: 'Unit economics',
      short: 'Economics',
      description: 'Is there a path to meaningful margin (price, cost, support load, risk)?',
      weight: 0.14,
      riskHint: 'If economics are weak, the idea becomes a vanity project.'
    },
    {
      id: 'strategic',
      label: 'Strategic fit',
      short: 'Strategic',
      description: 'Does this reinforce the company’s strategy and reduce future optionality risk?',
      weight: 0.14,
      riskHint: 'If strategic fit is low, the organization will lose interest mid-build.'
    }
  ];

  const ASSUMPTION_SEVERITY = [
    { value: 1, label: 'LOW' },
    { value: 2, label: 'MEDIUM' },
    { value: 3, label: 'HIGH' },
    { value: 4, label: 'CRITICAL' }
  ];

  const EVIDENCE_TYPES = [
    { value: 'user', label: 'USER' },
    { value: 'data', label: 'DATA' },
    { value: 'competitive', label: 'COMPETITIVE' },
    { value: 'technical', label: 'TECHNICAL' },
    { value: 'revenue', label: 'REVENUE' }
  ];

  const EVIDENCE_STRENGTH = [
    { value: 1, label: 'WEAK' },
    { value: 2, label: 'MEDIUM' },
    { value: 3, label: 'STRONG' }
  ];

  const $ = (sel) => document.querySelector(sel);

  const els = {
    navItems: Array.from(document.querySelectorAll('.nav__item')),
    views: Array.from(document.querySelectorAll('.view')),

    heroVerdict: $('#heroVerdict'),
    heroScore: $('#heroScore'),
    heroFragile: $('#heroFragile'),
    heroCoverage: $('#heroCoverage'),
    heroConfidence: $('#heroConfidence'),
    heroNote: $('#heroNote'),

    ideaSelect: $('#ideaSelect'),
    ideaTitle: $('#ideaTitle'),
    ideaPersona: $('#ideaPersona'),
    ideaContext: $('#ideaContext'),
    ideaPitch: $('#ideaPitch'),
    ideaUpdated: $('#ideaUpdated'),

    decisionDate: $('#decisionDate'),
    reviewerName: $('#reviewerName'),
    decisionNotes: $('#decisionNotes'),

    btnNewIdea: $('#btnNewIdea'),
    btnDuplicateIdea: $('#btnDuplicateIdea'),
    btnResetScores: $('#btnResetScores'),
    btnMarkReviewed: $('#btnMarkReviewed'),

    btnExportJson: $('#btnExportJson'),
    importFile: $('#importFile'),
    btnWipeAll: $('#btnWipeAll'),

    scoreGrid: $('#scoreGrid'),
    primaryRisk: $('#primaryRisk'),
    nextSteps: $('#nextSteps'),
    dimensionNotesSelect: $('#dimensionNotesSelect'),
    dimensionNotesText: $('#dimensionNotesText'),

    btnAddAssumption: $('#btnAddAssumption'),
    btnSeedAssumptions: $('#btnSeedAssumptions'),
    assumptionFilter: $('#assumptionFilter'),
    assumptionsTbody: $('#assumptionsTbody'),
    assumptionsFragileCount: $('#assumptionsFragileCount'),

    btnAddEvidence: $('#btnAddEvidence'),
    btnLinkUnlinked: $('#btnLinkUnlinked'),
    evidenceTypeFilter: $('#evidenceTypeFilter'),
    evidenceTbody: $('#evidenceTbody'),
    evidenceCoverage: $('#evidenceCoverage'),
    coverageMap: $('#coverageMap'),

    memoText: $('#memoText'),
    btnRefreshMemo: $('#btnRefreshMemo'),
    btnCopyMemo: $('#btnCopyMemo'),
    copyStatus: $('#copyStatus'),

    storageStatus: $('#storageStatus'),
    dataCounts: $('#dataCounts'),

    toast: $('#toast')
  };

  const uid = () => {
    if (window.crypto && crypto.getRandomValues) {
      const b = new Uint8Array(10);
      crypto.getRandomValues(b);
      return Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('');
    }
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
  };

  const nowISO = () => new Date().toISOString();

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const cleanText = (s) => (s || '').toString().replace(/\s+/g, ' ').trim();

  const safeInt = (v, fallback = 0) => {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const computeWeightedScore = (scores) => {
    const total = DIMENSIONS.reduce((sum, d) => sum + clamp(Number(scores[d.id] ?? 0), 0, 10) * d.weight, 0);
    return Math.round((total / 10) * 100);
  };

  const computeFragileAssumptions = (idea) => {
    const assumptions = idea.assumptions || [];
    const evidenceById = new Map((idea.evidence || []).map((e) => [e.id, e]));
    const fragile = [];

    for (const a of assumptions) {
      const severity = clamp(Number(a.severity ?? 2), 1, 4);
      const linked = (a.evidenceIds || []).filter((id) => evidenceById.has(id));
      const linkedStrength = linked.map((id) => evidenceById.get(id)?.strength ?? 1);
      const strongest = linkedStrength.length ? Math.max(...linkedStrength) : 0;

      const fragilityScore = (severity * 2) - strongest; // 2..8-3 = 5 max-ish
      const isFragile = (severity >= 3 && strongest <= 1) || (severity === 4 && strongest <= 2) || (fragilityScore >= 5);

      fragile.push({
        ...a,
        strongest,
        isFragile
      });
    }
    return fragile;
  };

  const computeCoverage = (idea) => {
    const assumptions = idea.assumptions || [];
    if (!assumptions.length) return 0;
    const evidenceIds = new Set((idea.evidence || []).map((e) => e.id));
    const covered = assumptions.filter((a) => (a.evidenceIds || []).some((id) => evidenceIds.has(id))).length;
    return Math.round((covered / assumptions.length) * 100);
  };

  const computeConfidence = (idea) => {
    const weighted = computeWeightedScore(idea.scores || {});
    const fragile = computeFragileAssumptions(idea).filter((x) => x.isFragile).length;
    const coverage = computeCoverage(idea);

    // Penalize fragile assumptions; reward coverage. Keep it interpretable.
    const conf = clamp(Math.round((weighted * 0.62) + (coverage * 0.45) - (fragile * 6)), 0, 100);
    return { weighted, fragile, coverage, confidence: conf };
  };

  const computeVerdict = (idea) => {
    const { weighted, fragile, coverage, confidence } = computeConfidence(idea);

    let verdict = 'NEEDS EVIDENCE';
    let note = 'The current inputs do not support a defensible go/no-go. Shore up the fragile assumptions first.';
    if (weighted >= 78 && fragile <= 2 && coverage >= 60 && confidence >= 70) {
      verdict = 'PROCEED';
      note = 'Strong score, acceptable fragility, and enough evidence coverage for a committed v1. Document scope and ship a measurable release.';
    } else if (weighted <= 45 || (fragile >= 6 && coverage < 40) || confidence < 35) {
      verdict = 'DO NOT PROCEED';
      note = 'Low score or high fragility with thin evidence. If the idea still matters, reformulate the target user or distribution plan before investing engineering time.';
    } else if (weighted >= 60 && coverage >= 45 && fragile <= 5 && confidence >= 55) {
      verdict = 'PROCEED (CONDITIONAL)';
      note = 'Promising, but not yet safe. Run targeted validation on the weakest dimension and the most severe assumptions, then re-score.';
    }

    return { verdict, note, weighted, fragile, coverage, confidence };
  };

  const derivePrimaryRisk = (idea) => {
    const scores = idea.scores || {};
    const pairs = DIMENSIONS.map((d) => ({ id: d.id, label: d.label, score: clamp(Number(scores[d.id] ?? 0), 0, 10), riskHint: d.riskHint }));
    pairs.sort((a, b) => a.score - b.score);
    const lowest = pairs[0];
    if (!lowest) return '—';
    if (lowest.score >= 7) return 'NONE OBVIOUS — SCORES ARE HEALTHY';
    return `${lowest.label.toUpperCase()} — ${lowest.riskHint}`;
  };

  const buildNextSteps = (idea) => {
    const steps = [];
    const scores = idea.scores || {};
    const ordered = DIMENSIONS
      .map((d) => ({ ...d, score: clamp(Number(scores[d.id] ?? 0), 0, 10) }))
      .sort((a, b) => a.score - b.score);

    const fragile = computeFragileAssumptions(idea).filter((x) => x.isFragile).sort((a, b) => (b.severity ?? 2) - (a.severity ?? 2));

    if (ordered[0] && ordered[0].score <= 6) {
      steps.push(`Raise ${ordered[0].label} from ${ordered[0].score}/10: write a testable hypothesis and a 1-week validation plan (metric + threshold).`);
    }
    if (ordered[1] && ordered[1].score <= 6) {
      steps.push(`Pressure-test ${ordered[1].label}: identify the current alternative and the switch trigger; capture 3 concrete examples from target users.`);
    }
    if (fragile[0]) {
      steps.push(`De-risk the most fragile assumption: “${cleanText(fragile[0].statement)}” — assign an owner, due date, and required evidence strength.`);
    }
    const coverage = computeCoverage(idea);
    if (coverage < 60) {
      steps.push(`Increase evidence coverage to 60%+: link evidence to each assumption (even weak evidence), then upgrade the top 3 to strong evidence.`);
    }

    if (!steps.length) {
      steps.push('Document scope boundaries for v1 (what you will not build) and define success metrics for the first 30 days post-launch.');
      steps.push('Schedule a 30-minute pre-mortem: “Why did this fail?” Capture the top 5 failure modes and mitigation actions.');
      steps.push('Write a one-page decision memo for leadership: user, pain, alternative, wedge, and measurable next step.');
    }

    return steps.slice(0, 5);
  };

  const blankIdea = () => {
    const scores = {};
    const notesByDimension = {};
    for (const d of DIMENSIONS) {
      scores[d.id] = 5;
      notesByDimension[d.id] = '';
    }
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    return {
      id: uid(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
      title: 'Stripe-style payout reconciliation for marketplaces',
      persona: 'Ops manager at a Series B marketplace (Finance & Trust)',
      context: 'High payout volume, weekly reconciliation, constant partner disputes',
      pitch: 'Automatically reconcile payouts across processors and bank statements, flag mismatches, and generate a dispute-ready audit trail.',
      scores,
      dimensionNotes: notesByDimension,
      assumptions: [
        {
          id: uid(),
          statement: 'Ops spends >6 hours/week reconciling payouts and would switch tools if we cut it by 50%',
          why: 'The ROI case depends on time saved; without it, the budget owner won’t prioritize.',
          severity: 4,
          owner: 'Product (you)',
          due: `${yyyy}-${mm}-${dd}`,
          evidenceIds: []
        },
        {
          id: uid(),
          statement: 'We can ingest processor + bank data with minimal integration burden (CSV + 2 APIs)',
          why: 'If integration is heavy, sales cycles will be too long for our GTM motion.',
          severity: 3,
          owner: 'Tech lead',
          due: `${yyyy}-${mm}-${dd}`,
          evidenceIds: []
        },
        {
          id: uid(),
          statement: 'Competitors do not offer dispute-ready audit exports tailored to marketplaces',
          why: 'Differentiation depends on a specific wedge that buyers recognize quickly.',
          severity: 3,
          owner: 'PMM',
          due: `${yyyy}-${mm}-${dd}`,
          evidenceIds: []
        },
        {
          id: uid(),
          statement: 'Mismatch alerts reduce partner disputes by at least 15% within 60 days',
          why: 'Without dispute reduction, the value stays “nice to have” instead of urgent.',
          severity: 4,
          owner: 'Data analyst',
          due: `${yyyy}-${mm}-${dd}`,
          evidenceIds: []
        }
      ],
      evidence: [
        {
          id: uid(),
          title: 'Ops interview notes (3 marketplaces) — reconciliation workflow',
          type: 'user',
          strength: 2,
          date: `${yyyy}-02-12`,
          link: 'https://notion.so/recon-workflow-notes',
          assumptionIds: []
        },
        {
          id: uid(),
          title: 'Support ticket analysis — payout mismatch related (last 90 days)',
          type: 'data',
          strength: 2,
          date: `${yyyy}-02-18`,
          link: 'https://docs.google.com/spreadsheets/d/payout-mismatch',
          assumptionIds: []
        },
        {
          id: uid(),
          title: 'Competitive teardown — audit exports and alerting gaps',
          type: 'competitive',
          strength: 1,
          date: `${yyyy}-02-21`,
          link: 'https://docs.google.com/document/d/competitor-teardown',
          assumptionIds: []
        }
      ],
      decision: {
        reviewer: 'Avery (Head of Product)',
        date: `${yyyy}-${mm}-${dd}`,
        notes: 'Treat as conditional: we need strong evidence on time-saved and integration friction before committing two engineers.',
        reviewed: false,
        reviewedAt: null
      }
    };
  };

  const seedCommonAssumptions = () => ([
    {
      statement: 'Target users experience this problem at least weekly (not quarterly)',
      why: 'Frequency determines urgency and willingness to change behavior.',
      severity: 3,
      owner: '',
      due: '',
      evidenceIds: []
    },
    {
      statement: 'The buyer has a budget line item or clear economic ROI within 90 days',
      why: 'Without a budget owner, “interesting” will not convert to “purchased”.',
      severity: 4,
      owner: '',
      due: '',
      evidenceIds: []
    },
    {
      statement: 'Existing alternatives fail in a specific, provable way (not just “clunky”)',
      why: 'Differentiation must be concrete enough to sell and to build against.',
      severity: 3,
      owner: '',
      due: '',
      evidenceIds: []
    },
    {
      statement: 'We can ship a credible v1 without rebuilding core infrastructure',
      why: 'Ideas that require foundational rebuilds rarely survive prioritization.',
      severity: 3,
      owner: '',
      due: '',
      evidenceIds: []
    },
    {
      statement: 'We have at least one scalable distribution surface (in-product, partner, content, sales motion)',
      why: 'Without a channel, adoption depends on luck and internal enthusiasm.',
      severity: 3,
      owner: '',
      due: '',
      evidenceIds: []
    }
  ]);

  const initialState = () => {
    const idea = blankIdea();
    return {
      version: 1,
      activeIdeaId: idea.id,
      view: 'scorecard',
      ideas: [idea]
    };
  };

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialState();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return initialState();
      if (!Array.isArray(parsed.ideas) || !parsed.ideas.length) return initialState();

      // Basic migrations / guards
      parsed.version = 1;
      if (!parsed.activeIdeaId || !parsed.ideas.some((i) => i.id === parsed.activeIdeaId)) {
        parsed.activeIdeaId = parsed.ideas[0].id;
      }
      parsed.view = parsed.view || 'scorecard';

      for (const idea of parsed.ideas) {
        idea.scores = idea.scores || {};
        idea.dimensionNotes = idea.dimensionNotes || {};
        for (const d of DIMENSIONS) {
          if (typeof idea.scores[d.id] !== 'number') idea.scores[d.id] = clamp(Number(idea.scores[d.id] ?? 5), 0, 10);
          if (typeof idea.dimensionNotes[d.id] !== 'string') idea.dimensionNotes[d.id] = '';
        }
        idea.assumptions = Array.isArray(idea.assumptions) ? idea.assumptions : [];
        idea.evidence = Array.isArray(idea.evidence) ? idea.evidence : [];
        idea.decision = idea.decision || { reviewer: '', date: '', notes: '', reviewed: false, reviewedAt: null };
      }

      return parsed;
    } catch {
      return initialState();
    }
  };

  let state = loadState();

  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    els.storageStatus.textContent = `storage: ok (${STORAGE_KEY})`;
    const totalAssumptions = state.ideas.reduce((n, i) => n + (i.assumptions?.length || 0), 0);
    const totalEvidence = state.ideas.reduce((n, i) => n + (i.evidence?.length || 0), 0);
    els.dataCounts.textContent = `ideas: ${state.ideas.length} — assumptions: ${totalAssumptions} — evidence: ${totalEvidence}`;
  };

  const toast = (msg) => {
    els.toast.textContent = msg;
    els.toast.classList.add('is-on');
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(() => els.toast.classList.remove('is-on'), 1600);
  };

  const activeIdea = () => state.ideas.find((i) => i.id === state.activeIdeaId) || state.ideas[0];

  const updateIdea = (patch) => {
    const idea = activeIdea();
    if (!idea) return;
    Object.assign(idea, patch);
    idea.updatedAt = nowISO();
    persist();
    renderAll();
  };

  const setView = (view) => {
    state.view = view;
    persist();
    els.navItems.forEach((b) => b.classList.toggle('is-active', b.dataset.view === view));
    els.views.forEach((v) => v.classList.toggle('is-active', v.dataset.view === view));
    if (view === 'export') {
      els.memoText.value = buildMemoText(activeIdea());
    }
  };

  const renderIdeaSelect = () => {
    const idea = activeIdea();
    els.ideaSelect.innerHTML = '';
    for (const i of state.ideas) {
      const opt = document.createElement('option');
      opt.value = i.id;
      opt.textContent = cleanText(i.title) || 'UNTITLED IDEA';
      if (i.id === idea.id) opt.selected = true;
      els.ideaSelect.appendChild(opt);
    }
  };

  const renderIdeaFields = () => {
    const idea = activeIdea();
    els.ideaTitle.value = idea.title || '';
    els.ideaPersona.value = idea.persona || '';
    els.ideaContext.value = idea.context || '';
    els.ideaPitch.value = idea.pitch || '';
    els.ideaUpdated.textContent = formatDateTime(idea.updatedAt);

    els.reviewerName.value = idea.decision?.reviewer || '';
    els.decisionDate.value = idea.decision?.date || '';
    els.decisionNotes.value = idea.decision?.notes || '';
  };

  const renderScoreGrid = () => {
    const idea = activeIdea();
    const scores = idea.scores || {};
    els.scoreGrid.innerHTML = '';

    for (const d of DIMENSIONS) {
      const card = document.createElement('div');
      card.className = 'scoreCard';
      card.dataset.dimensionId = d.id;

      const head = document.createElement('div');
      head.className = 'scoreCard__head';

      const left = document.createElement('div');
      const label = document.createElement('div');
      label.className = 'scoreCard__label';
      label.textContent = 'DIMENSION';
      const title = document.createElement('div');
      title.className = 'scoreCard__title';
      title.textContent = d.label;
      left.appendChild(label);
      left.appendChild(title);

      const score = document.createElement('div');
      score.className = 'scoreCard__score';
      score.textContent = String(clamp(Number(scores[d.id] ?? 0), 0, 10));

      head.appendChild(left);
      head.appendChild(score);

      const body = document.createElement('div');
      body.className = 'scoreCard__body';

      const row = document.createElement('div');
      row.className = 'scoreRow';

      const desc = document.createElement('div');
      desc.className = 'scoreCard__desc';
      desc.textContent = d.description;

      const rangeWrap = document.createElement('div');
      rangeWrap.className = 'range';
      const range = document.createElement('input');
      range.type = 'range';
      range.min = '0';
      range.max = '10';
      range.step = '1';
      range.value = String(clamp(Number(scores[d.id] ?? 0), 0, 10));
      range.setAttribute('aria-label', `${d.label} score`);

      range.addEventListener('input', (e) => {
        const val = safeInt(e.target.value, 0);
        idea.scores[d.id] = clamp(val, 0, 10);
        idea.updatedAt = nowISO();
        persist();
        renderHero();
        renderScoreGrid(); // re-render to keep score number in sync
        renderNextStepsAndRisk();
        renderMemoIfVisible();
      });

      rangeWrap.appendChild(range);

      row.appendChild(desc);
      row.appendChild(rangeWrap);

      const tagsLine = document.createElement('div');
      tagsLine.className = 'tagsLine';
      const weightTag = document.createElement('span');
      weightTag.className = 'tag';
      weightTag.textContent = `WEIGHT ${Math.round(d.weight * 100)}%`;
      const scaleTag = document.createElement('span');
      scaleTag.className = 'tag';
      scaleTag.textContent = `SCORE 0–10`;
      tagsLine.appendChild(weightTag);
      tagsLine.appendChild(scaleTag);

      body.appendChild(row);
      body.appendChild(tagsLine);

      card.appendChild(head);
      card.appendChild(body);
      els.scoreGrid.appendChild(card);
    }
  };

  const renderDimensionNotes = () => {
    const idea = activeIdea();
    els.dimensionNotesSelect.innerHTML = '';
    for (const d of DIMENSIONS) {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.label.toUpperCase();
      els.dimensionNotesSelect.appendChild(opt);
    }
    const selected = els.dimensionNotesSelect.value || DIMENSIONS[0].id;
    els.dimensionNotesSelect.value = selected;
    els.dimensionNotesText.value = idea.dimensionNotes?.[selected] || '';
  };

  const renderHero = () => {
    const idea = activeIdea();
    const { verdict, note, weighted, fragile, coverage, confidence } = computeVerdict(idea);

    els.heroVerdict.textContent = verdict;
    els.heroNote.textContent = note;
    els.heroScore.textContent = String(weighted);
    els.heroFragile.textContent = String(fragile);
    els.heroCoverage.textContent = String(coverage);
    els.heroConfidence.textContent = String(confidence);

    els.primaryRisk.textContent = derivePrimaryRisk(idea);
    els.assumptionsFragileCount.textContent = String(fragile);
    els.evidenceCoverage.textContent = String(coverage);
  };

  const renderNextStepsAndRisk = () => {
    const idea = activeIdea();
    const steps = buildNextSteps(idea);
    els.nextSteps.innerHTML = '';
    for (const s of steps) {
      const li = document.createElement('li');
      li.textContent = s;
      els.nextSteps.appendChild(li);
    }
    els.primaryRisk.textContent = derivePrimaryRisk(idea);
  };

  const filteredAssumptions = (idea) => {
    const filter = els.assumptionFilter.value || 'all';
    const fragiles = computeFragileAssumptions(idea);
    const evidenceIds = new Set((idea.evidence || []).map((e) => e.id));

    return fragiles.filter((a) => {
      if (filter === 'fragile') return a.isFragile;
      if (filter === 'evidenceMissing') return !(a.evidenceIds || []).some((id) => evidenceIds.has(id));
      return true;
    });
  };

  const renderAssumptionsTable = () => {
    const idea = activeIdea();
    const assumptions = filteredAssumptions(idea);

    els.assumptionsTbody.innerHTML = '';
    for (const a of assumptions) {
      const tr = document.createElement('tr');

      const tdStmt = document.createElement('td');
      const inpStmt = document.createElement('input');
      inpStmt.className = 'inlineInput';
      inpStmt.value = a.statement || '';
      inpStmt.addEventListener('change', () => {
        const target = idea.assumptions.find((x) => x.id === a.id);
        if (!target) return;
        target.statement = cleanText(inpStmt.value);
        target.updatedAt = nowISO();
        idea.updatedAt = nowISO();
        persist();
        renderAll();
      });
      tdStmt.appendChild(inpStmt);

      const tdWhy = document.createElement('td');
      const inpWhy = document.createElement('input');
      inpWhy.className = 'inlineInput';
      inpWhy.value = a.why || '';
      inpWhy.addEventListener('change', () => {
        const target = idea.assumptions.find((x) => x.id === a.id);
        if (!target) return;
        target.why = cleanText(inpWhy.value);
        target.updatedAt = nowISO();
        idea.updatedAt = nowISO();
        persist();
        renderAll();
      });
      tdWhy.appendChild(inpWhy);

      const tdSev = document.createElement('td');
      const selSev = document.createElement('select');
      selSev.className = 'inlineSelect';
      for (const s of ASSUMPTION_SEVERITY) {
        const opt = document.createElement('option');
        opt.value = String(s.value);
        opt.textContent = s.label;
        if (Number(a.severity) === s.value) opt.selected = true;
        selSev.appendChild(opt);
      }
      selSev.addEventListener('change', () => {
        const target = idea.assumptions.find((x) => x.id === a.id);
        if (!target) return;
        target.severity = clamp(safeInt(selSev.value, 2), 1, 4);
        target.updatedAt = nowISO();
        idea.updatedAt = nowISO();
        persist();
        renderAll();
      });
      tdSev.appendChild(selSev);

      const tdEv = document.createElement('td');
      const evText = document.createElement('div');
      const linkedCount = (a.evidenceIds || []).length;
      const strongest = a.strongest || 0;
      const missing = linkedCount === 0;
      evText.className = 'cellMuted';
      evText.textContent = missing ? 'NONE' : `${linkedCount} LINKED — STRONGEST ${strongest}/3`;
      tdEv.appendChild(evText);

      const tdOwner = document.createElement('td');
      const inpOwner = document.createElement('input');
      inpOwner.className = 'inlineInput';
      inpOwner.value = a.owner || '';
      inpOwner.addEventListener('change', () => {
        const target = idea.assumptions.find((x) => x.id === a.id);
        if (!target) return;
        target.owner = cleanText(inpOwner.value);
        target.updatedAt = nowISO();
        idea.updatedAt = nowISO();
        persist();
        renderAll();
      });
      tdOwner.appendChild(inpOwner);

      const tdDue = document.createElement('td');
      const inpDue = document.createElement('input');
      inpDue.className = 'inlineInput';
      inpDue.type = 'date';
      inpDue.value = a.due || '';
      inpDue.addEventListener('change', () => {
        const target = idea.assumptions.find((x) => x.id === a.id);
        if (!target) return;
        target.due = inpDue.value || '';
        target.updatedAt = nowISO();
        idea.updatedAt = nowISO();
        persist();
        renderAll();
      });
      tdDue.appendChild(inpDue);

      const tdActions = document.createElement('td');
      tdActions.className = 'cellActions';

      const btnLinks = document.createElement('button');
      btnLinks.type = 'button';
      btnLinks.className = 'btn btn--ghost';
      btnLinks.textContent = a.isFragile ? 'FRAGILE' : 'OK';
      btnLinks.addEventListener('click', () => {
        state.view = 'evidence';
        persist();
        setView('evidence');
        toast('Open evidence to link items to assumptions.');
      });

      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'btn btn--danger';
      btnDel.textContent = 'DELETE';
      btnDel.addEventListener('click', () => {
        const idx = idea.assumptions.findIndex((x) => x.id === a.id);
        if (idx === -1) return;

        // Remove links from evidence items too
        for (const e of idea.evidence || []) {
          e.assumptionIds = (e.assumptionIds || []).filter((id) => id !== a.id);
        }

        idea.assumptions.splice(idx, 1);
        idea.updatedAt = nowISO();
        persist();
        renderAll();
        toast('Assumption deleted.');
      });

      tdActions.appendChild(btnLinks);
      tdActions.appendChild(btnDel);

      tr.appendChild(tdStmt);
      tr.appendChild(tdWhy);
      tr.appendChild(tdSev);
      tr.appendChild(tdEv);
      tr.appendChild(tdOwner);
      tr.appendChild(tdDue);
      tr.appendChild(tdActions);

      els.assumptionsTbody.appendChild(tr);
    }

    renderHero();
    renderMemoIfVisible();
  };

  const filteredEvidence = (idea) => {
    const filter = els.evidenceTypeFilter.value || 'all';
    const list = idea.evidence || [];
    if (filter === 'all') return list;
    return list.filter((e) => e.type === filter);
  };

  const renderEvidenceTable = () => {
    const idea = activeIdea();
    const list = filteredEvidence(idea);

    els.evidenceTbody.innerHTML = '';
    for (const e of list) {
      const tr = document.createElement('tr');

      const tdTitle = document.createElement('td');
      const inpTitle = document.createElement('input');
      inpTitle.className = 'inlineInput';
      inpTitle.value = e.title || '';
      inpTitle.addEventListener('change', () => {
        const target = idea.evidence.find((x) => x.id === e.id);
        if (!target) return;
        target.title = cleanText(inpTitle.value);
        target.updatedAt = nowISO();
        idea.updatedAt = nowISO();
        persist();
        renderAll();
      });
      tdTitle.appendChild(inpTitle);

      const tdType = document.createElement('td');
      const selType = document.createElement('select');
      selType.className = 'inlineSelect';
      for (const t of EVIDENCE_TYPES) {
        const opt = document.createElement('option');
        opt.value = t.value;
        opt.textContent = t.label;
        if (e.type === t.value) opt.selected = true;
        selType.appendChild(opt);
      }
      selType.addEventListener('change', () => {
        const target = idea.evidence.find((x) => x.id === e.id);
        if (!target) return;
        target.type = selType.value;
        target.updatedAt = nowISO();
        idea.updatedAt = nowISO();
        persist();
        renderAll();
      });
      tdType.appendChild(selType);

      const tdStrength = document.createElement('td');
      const selStrength = document.createElement('select');
      selStrength.className = 'inlineSelect';
      for (const s of EVIDENCE_STRENGTH) {
        const opt = document.createElement('option');
        opt.value = String(s.value);
        opt.textContent = s.label;
        if (Number(e.strength) === s.value) opt.selected = true;
        selStrength.appendChild(opt);
      }
      selStrength.addEventListener('change', () => {
        const target = idea.evidence.find((x) => x.id === e.id);
        if (!target) return;
        target.strength = clamp(safeInt(selStrength.value, 1), 1, 3);
        target.updatedAt = nowISO();
        idea.updatedAt = nowISO();
        persist();
        renderAll();
      });
      tdStrength.appendChild(selStrength);

      const tdDate = document.createElement('td');
      const inpDate = document.createElement('input');
      inpDate.className = 'inlineInput';
      inpDate.type = 'date';
      inpDate.value = e.date || '';
      inpDate.addEventListener('change', () => {
        const target = idea.evidence.find((x) => x.id === e.id);
        if (!target) return;
        target.date = inpDate.value || '';
        target.updatedAt = nowISO();
        idea.updatedAt = nowISO();
        persist();
        renderAll();
      });
      tdDate.appendChild(inpDate);

      const tdLink = document.createElement('td');
      const inpLink = document.createElement('input');
      inpLink.className = 'inlineInput';
      inpLink.value = e.link || '';
      inpLink.addEventListener('change', () => {
        const target = idea.evidence.find((x) => x.id === e.id);
        if (!target) return;
        target.link = cleanText(inpLink.value);
        target.updatedAt = nowISO();
        idea.updatedAt = nowISO();
        persist();
        renderAll();
      });
      tdLink.appendChild(inpLink);

      const tdAssumptions = document.createElement('td');
      const count = (e.assumptionIds || []).length;
      const tag = document.createElement('div');
      tag.className = 'cellMuted';
      tag.textContent = count ? `${count} LINKED` : 'UNLINKED';
      tdAssumptions.appendChild(tag);

      const tdActions = document.createElement('td');
      tdActions.className = 'cellActions';

      const btnLink = document.createElement('button');
      btnLink.type = 'button';
      btnLink.className = 'btn btn--ghost';
      btnLink.textContent = 'LINK';
      btnLink.addEventListener('click', () => {
        openLinkDialogForEvidence(e.id);
      });

      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'btn btn--danger';
      btnDel.textContent = 'DELETE';
      btnDel.addEventListener('click', () => {
        const idx = idea.evidence.findIndex((x) => x.id === e.id);
        if (idx === -1) return;

        // Remove from assumptions links too
        for (const a of idea.assumptions || []) {
          a.evidenceIds = (a.evidenceIds || []).filter((id) => id !== e.id);
        }

        idea.evidence.splice(idx, 1);
        idea.updatedAt = nowISO();
        persist();
        renderAll();
        toast('Evidence deleted.');
      });

      tdActions.appendChild(btnLink);
      tdActions.appendChild(btnDel);

      tr.appendChild(tdTitle);
      tr.appendChild(tdType);
      tr.appendChild(tdStrength);
      tr.appendChild(tdDate);
      tr.appendChild(tdLink);
      tr.appendChild(tdAssumptions);
      tr.appendChild(tdActions);

      els.evidenceTbody.appendChild(tr);
    }

    renderCoverageMap();
    renderHero();
    renderMemoIfVisible();
  };

  const renderCoverageMap = () => {
    const idea = activeIdea();
    const assumptions = idea.assumptions || [];
    const evidenceById = new Map((idea.evidence || []).map((e) => [e.id, e]));

    els.coverageMap.innerHTML = '';
    for (const a of assumptions) {
      const linkedEvidence = (a.evidenceIds || []).map((id) => evidenceById.get(id)).filter(Boolean);
      const isCovered = linkedEvidence.length > 0;
      const strongest = linkedEvidence.length ? Math.max(...linkedEvidence.map((e) => e.strength || 1)) : 0;

      const item = document.createElement('div');
      item.className = 'coverageItem';

      const top = document.createElement('div');
      top.className = 'coverageItem__top';

      const title = document.createElement('div');
      title.className = 'coverageItem__title';
      title.textContent = cleanText(a.statement) || 'Untitled assumption';

      const stateEl = document.createElement('div');
      stateEl.className = 'coverageItem__state' + (isCovered ? ' is-covered' : '');
      stateEl.textContent = isCovered ? `COVERED (STRONGEST ${strongest}/3)` : 'UNCOVERED';

      top.appendChild(title);
      top.appendChild(stateEl);

      const meta = document.createElement('div');
      meta.className = 'coverageItem__meta';
      const sev = clamp(Number(a.severity ?? 2), 1, 4);
      const sevLabel = ASSUMPTION_SEVERITY.find((s) => s.value === sev)?.label || 'MEDIUM';
      meta.text