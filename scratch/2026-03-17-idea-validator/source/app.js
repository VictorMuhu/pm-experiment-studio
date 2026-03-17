(() => {
  'use strict';

  const STORAGE_KEY = 'pm_experiment_idea_validator_v1';

  const uid = () => {
    const a = new Uint32Array(2);
    crypto.getRandomValues(a);
    return `${a[0].toString(16)}${a[1].toString(16)}`.slice(0, 16);
  };

  const nowISO = () => new Date().toISOString();

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const scoreLabel = (n) => {
    const v = clamp(Math.round(n), 0, 10);
    return String(v);
  };

  const confidenceFactor = (c) => {
    if (c === 'high') return 1.0;
    if (c === 'med') return 0.75;
    return 0.55;
  };

  const confidenceLabel = (c) => (c === 'high' ? 'High' : c === 'med' ? 'Medium' : 'Low');

  const stageMultipliers = {
    seed: { desirability: 1.05, viability: 0.9, feasibility: 1.0, compliance: 0.9, growth: 0.95, differentiation: 1.0, distribution: 0.95, retention: 1.0 },
    'series-a': { desirability: 1.0, viability: 1.0, feasibility: 1.0, compliance: 1.0, growth: 1.0, differentiation: 1.0, distribution: 1.05, retention: 1.0 },
    growth: { desirability: 0.95, viability: 1.05, feasibility: 1.0, compliance: 1.0, growth: 1.05, differentiation: 0.95, distribution: 1.05, retention: 1.05 },
    enterprise: { desirability: 0.9, viability: 1.05, feasibility: 0.95, compliance: 1.1, growth: 0.95, differentiation: 1.0, distribution: 1.0, retention: 1.05 }
  };

  const defaultDimensions = () => ([
    { id: 'desirability', name: 'Pain clarity + urgency', weight: 18, score: 8, confidence: 'med', notes: 'The pain is tied to a recurring workflow and a clear cost of delay.' },
    { id: 'differentiation', name: 'Differentiation vs. alternatives', weight: 16, score: 8, confidence: 'med', notes: 'Focus on executive-ready “verdict + plan” rather than generic ideation templates.' },
    { id: 'distribution', name: 'Distribution path', weight: 12, score: 7, confidence: 'med', notes: 'Can be bundled into product discovery cadence; internal champion is Head of Product.' },
    { id: 'retention', name: 'Repeat usage + habit', weight: 12, score: 7, confidence: 'low', notes: 'Repeat depends on cadence (quarterly planning) unless positioned as “idea library”.' },
    { id: 'viability', name: 'Pricing power / willingness to pay', weight: 18, score: 6, confidence: 'low', notes: 'Unclear if teams pay vs. using Notion + spreadsheets.' },
    { id: 'feasibility', name: 'Build feasibility', weight: 14, score: 9, confidence: 'high', notes: 'Can ship as a local-first tool; complex features are additive.' },
    { id: 'compliance', name: 'Risk / compliance constraints', weight: 10, score: 8, confidence: 'high', notes: 'No PII required; safe for early evaluation in most orgs.' }
  ]);

  const demoAssumptions = () => ([
    { id: uid(), text: 'Heads of Product want a repeatable “pressure-test” ritual before green-lighting a roadmap item', type: 'desirability', criticality: 5, confidence: 'med', evidence: 'Two discovery leaders described decision meetings that lack a shared rubric.', status: 'untested', createdAt: nowISO() },
    { id: uid(), text: 'Teams will accept a scored verdict if the underlying assumptions are explicit (not a black box)', type: 'desirability', criticality: 4, confidence: 'low', evidence: 'No direct evidence yet; worry about “this feels subjective”.', status: 'untested', createdAt: nowISO() },
    { id: uid(), text: 'A 10-minute workflow fits into weekly product leadership review', type: 'viability', criticality: 4, confidence: 'med', evidence: 'Existing review agenda has a 15-minute slot for new bets.', status: 'untested', createdAt: nowISO() },
    { id: uid(), text: 'Willingness to pay exists if output is board-ready (copy/paste into memo)', type: 'viability', criticality: 5, confidence: 'low', evidence: 'One founder said they pay for “decision artifacts,” but no pricing tested.', status: 'untested', createdAt: nowISO() },
    { id: uid(), text: 'The product should store multiple versions (iterations) per idea to show evolution', type: 'desirability', criticality: 3, confidence: 'high', evidence: 'Several teams keep separate docs for V1/V2; versioning reduces rework.', status: 'supported', createdAt: nowISO() },
    { id: uid(), text: 'A validation plan should reference specific success signals (not generic “talk to users”)', type: 'feasibility', criticality: 4, confidence: 'high', evidence: 'Internal templates emphasize measurable pass/fail signals.', status: 'supported', createdAt: nowISO() },
    { id: uid(), text: 'Local-first is acceptable for early evaluation (no backend needed for MVP)', type: 'feasibility', criticality: 3, confidence: 'high', evidence: 'Most comparable tools start as spreadsheets or docs.', status: 'supported', createdAt: nowISO() }
  ]);

  const demoIdea = () => ({
    id: uid(),
    name: 'Board-ready “Idea Verdict” workspace',
    stage: 'series-a',
    user: 'Head of Product at a Series A–B B2B SaaS company',
    jtbd: 'Decide whether a new product bet deserves resourcing before it enters roadmap',
    pain: 'In roadmap shaping, leadership gets excited after one stakeholder conversation. A PRD starts, engineers size, and only later do obvious gaps surface (weak pain, “good enough” alternatives, unclear pricing).',
    solution: 'A 10-minute pressure-test: score the idea, list fragile assumptions, and generate a concrete 3–5 step validation plan with success signals.',
    alternative: 'Notion doc + subjective debate + ad-hoc user calls',
    differentiation: 'Score + confidence + explicit assumptions → a decision artifact you can reuse in leadership review.'
  });

  const demoPlanPrefs = () => ({
    horizonDays: 10,
    team: 'pm-design',
    constraint: 'Must be usable in a leadership review with no analytics access'
  });

  const emptyState = () => ({
    activeVersionId: null,
    working: {
      idea: demoIdea(),
      dimensions: defaultDimensions(),
      assumptions: demoAssumptions(),
      planPrefs: demoPlanPrefs()
    },
    versions: []
  });

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return emptyState();
      if (!parsed.working || !parsed.working.idea || !Array.isArray(parsed.working.dimensions)) return emptyState();
      return parsed;
    } catch {
      return emptyState();
    }
  };

  const saveState = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const $ = (sel) => document.querySelector(sel);

  const toastEl = $('#toast');
  const toastInner = $('#toastInner');
  let toastTimer = null;

  const showToast = (msg) => {
    toastInner.textContent = msg;
    toastEl.hidden = false;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.hidden = true;
    }, 1700);
  };

  const state = loadState();

  const computeDimensionAdjusted = (dim, stage) => {
    const base = clamp(Number(dim.score) || 0, 0, 10);
    const conf = confidenceFactor(dim.confidence);
    const mult = (stageMultipliers[stage] && stageMultipliers[stage][dim.id]) ? stageMultipliers[stage][dim.id] : 1.0;
    const adjusted = clamp(base * conf * mult, 0, 10);
    return adjusted;
  };

  const computeWeightedScore = (working) => {
    const stage = working.idea.stage || 'series-a';
    const dims = working.dimensions;
    const totalW = dims.reduce((s, d) => s + (Number(d.weight) || 0), 0) || 1;
    const sum = dims.reduce((s, d) => {
      const w = Number(d.weight) || 0;
      return s + (computeDimensionAdjusted(d, stage) * w);
    }, 0);
    const score10 = sum / totalW;
    const score100 = clamp(Math.round(score10 * 10), 0, 100);
    return score100;
  };

  const computeRisk = (working) => {
    const stage = working.idea.stage || 'series-a';
    const dims = working.dimensions;
    const totalW = dims.reduce((s, d) => s + (Number(d.weight) || 0), 0) || 1;
    const frag = dims.reduce((s, d) => {
      const w = Number(d.weight) || 0;
      const confPenalty = 1 - confidenceFactor(d.confidence);
      const lowScorePenalty = (10 - clamp(Number(d.score) || 0, 0, 10)) / 10;
      const fragility = (0.65 * confPenalty) + (0.35 * lowScorePenalty);
      return s + (fragility * w);
    }, 0) / totalW;

    return clamp(Math.round(frag * 100), 0, 100);
  };

  const verdictFromScore = (score100) => {
    if (score100 >= 78) return 'STRONG CANDIDATE';
    if (score100 >= 58) return 'NEEDS REFINEMENT';
    return 'NOT WORTH PURSUING';
  };

  const rationaleFrom = (working, score100, risk) => {
    const stage = working.idea.stage || 'series-a';
    const dims = working.dimensions.map(d => ({ ...d, adjusted: computeDimensionAdjusted(d, stage) }));
    const sorted = [...dims].sort((a,b) => (b.adjusted * b.weight) - (a.adjusted * a.weight));
    const top = sorted[0];
    const bottom = [...dims].sort((a,b) => (a.adjusted * a.weight) - (b.adjusted * b.weight))[0];

    const strength = `${top.name.toLowerCase()}`;
    const gap = `${bottom.name.toLowerCase()}`;
    if (score100 >= 78) {
      return `Clear strength in ${strength}; biggest risk is ${gap}.`;
    }
    if (score100 >= 58) {
      return `Some signal in ${strength}, but the case breaks down on ${gap}; tighten assumptions before resourcing.`;
    }
    return `Weak fundamentals: ${gap} is not credible yet; do minimal validation or deprioritize.`;
  };

  const topGapText = (working) => {
    const stage = working.idea.stage || 'series-a';
    const dims = working.dimensions.map(d => {
      const adjusted = computeDimensionAdjusted(d, stage);
      const conf = confidenceFactor(d.confidence);
      const confPenalty = 1 - conf;
      const scorePenalty = (10 - clamp(Number(d.score) || 0, 0, 10)) / 10;
      const importance = (Number(d.weight) || 0) * (0.6 * confPenalty + 0.4 * scorePenalty);
      return { ...d, adjusted, importance };
    });
    dims.sort((a,b) => b.importance - a.importance);
    const top = dims[0];
    if (!top) return '—';
    const confLabel = top.confidence === 'low' ? 'confidence low' : top.confidence === 'med' ? 'confidence medium' : 'confidence high';
    return `${top.name} (${confLabel})`;
  };

  const fragileAssumptions = (working) => {
    const items = working.assumptions.map(a => {
      const confPenalty = 1 - confidenceFactor(a.confidence);
      const crit = clamp(Number(a.criticality) || 1, 1, 5);
      const untestedPenalty = a.status === 'supported' ? 0.0 : (a.status === 'invalidated' ? 0.25 : 0.12);
      const score = (crit * 18) + (confPenalty * 40) + (untestedPenalty * 30);
      return { ...a, riskScore: score };
    });
    items.sort((a,b) => b.riskScore - a.riskScore);
    return items.slice(0, 3);
  };

  const renderDimensions = () => {
    const tbody = $('#dimensionsBody');
    tbody.innerHTML = '';
    const stage = state.working.idea.stage || 'series-a';

    state.working.dimensions.forEach((d) => {
      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.textContent = d.name;
      tr.appendChild(tdName);

      const tdW = document.createElement('td');
      tdW.className = 'cellTight';
      tdW.textContent = `${d.weight}%`;
      tr.appendChild(tdW);

      const tdScore = document.createElement('td');
      tdScore.className = 'cellTight';
      const scoreSel = document.createElement('select');
      scoreSel.className = 'input input--compact';
      scoreSel.setAttribute('aria-label', `${d.name} score`);
      for (let i=0;i<=10;i++){
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = String(i);
        if (Number(d.score) === i) opt.selected = true;
        scoreSel.appendChild(opt);
      }
      scoreSel.addEventListener('change', () => {
        d.score = Number(scoreSel.value);
        saveState();
        renderAllDerived();
      });
      tdScore.appendChild(scoreSel);
      tr.appendChild(tdScore);

      const tdConf = document.createElement('td');
      tdConf.className = 'cellTight';
      const confSel = document.createElement('select');
      confSel.className = 'input input--compact';
      confSel.setAttribute('aria-label', `${d.name} confidence`);
      [
        { v:'low', t:'Low' },
        { v:'med', t:'Medium' },
        { v:'high', t:'High' }
      ].forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.v;
        opt.textContent = o.t;
        if (d.confidence === o.v) opt.selected = true;
        confSel.appendChild(opt);
      });
      confSel.addEventListener('change', () => {
        d.confidence = confSel.value;
        saveState();
        renderAllDerived();
      });
      tdConf.appendChild(confSel);
      tr.appendChild(tdConf);

      const tdNotes = document.createElement('td');
      const notes = document.createElement('textarea');
      notes.className = 'input input--area noteInput';
      notes.rows = 2;
      notes.value = d.notes || '';
      notes.setAttribute('aria-label', `${d.name} notes`);
      notes.addEventListener('input', () => {
        d.notes = notes.value;
        saveState();
      });
      tdNotes.appendChild(notes);

      const adjusted = computeDimensionAdjusted(d, stage);
      const meta = document.createElement('div');
      meta.className = 'muted';
      meta.style.marginTop = '8px';
      meta.textContent = `Adj. impact: ${(adjusted * (Number(d.weight)||0)).toFixed(1)} | Adj. score: ${adjusted.toFixed(1)}/10`;
      tdNotes.appendChild(meta);

      tr.appendChild(tdNotes);

      tbody.appendChild(tr);
    });
  };

  const renderIdeaFields = () => {
    $('#ideaName').value = state.working.idea.name || '';
    $('#ideaStage').value = state.working.idea.stage || 'series-a';
    $('#ideaUser').value = state.working.idea.user || '';
    $('#ideaJTBD').value = state.working.idea.jtbd || '';
    $('#ideaPain').value = state.working.idea.pain || '';
    $('#ideaSolution').value = state.working.idea.solution || '';
    $('#ideaAlt').value = state.working.idea.alternative || '';
    $('#ideaDifferentiation').value = state.working.idea.differentiation || '';
  };

  const hookIdeaInputs = () => {
    const map = [
      ['#ideaName', 'name'],
      ['#ideaStage', 'stage'],
      ['#ideaUser', 'user'],
      ['#ideaJTBD', 'jtbd'],
      ['#ideaPain', 'pain'],
      ['#ideaSolution', 'solution'],
      ['#ideaAlt', 'alternative'],
      ['#ideaDifferentiation', 'differentiation']
    ];

    map.forEach(([sel, key]) => {
      const el = $(sel);
      const evt = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evt, () => {
        state.working.idea[key] = el.value;
        saveState();
        renderAllDerived();
      });
    });

    $('#btnSaveIdea').addEventListener('click', () => {
      saveState();
      showToast('Saved');
    });

    $('#btnResetToDemo').addEventListener('click', () => {
      state.working.idea = demoIdea();
      state.working.dimensions = defaultDimensions();
      state.working.assumptions = demoAssumptions();
      state.working.planPrefs = demoPlanPrefs();
      saveState();
      renderAll();
      showToast('Demo loaded');
    });
  };

  const renderAssumptionsHeader = () => {
    const total = state.working.assumptions.length;
    const untested = state.working.assumptions.filter(a => a.status !== 'supported').length;
    $('#assumpCount').textContent = String(total);
    $('#untestedCount').textContent = `UNTESTED: ${untested}`;
  };

  const assumpFilterPredicate = (mode) => {
    if (mode === 'untested') return (a) => a.status !== 'supported';
    if (mode === 'low-confidence') return (a) => a.confidence === 'low';
    if (mode === 'high-criticality') return (a) => Number(a.criticality) >= 4;
    return () => true;
  };

  const renderAssumptionsTable = () => {
    const tbody = $('#assumptionsBody');
    tbody.innerHTML = '';

    const filterMode = $('#assumpFilter').value;
    const pred = assumpFilterPredicate(filterMode);
    const items = state.working.assumptions.filter(pred);

    items.forEach((a) => {
      const tr = document.createElement('tr');

      const tdText = document.createElement('td');
      tdText.textContent = a.text;
      tr.appendChild(tdText);

      const tdType = document.createElement('td');
      tdType.className = 'cellTight';
      tdType.textContent = a.type.toUpperCase();
      tr.appendChild(tdType);

      const tdCrit = document.createElement('td');
      tdCrit.className = 'cellTight';
      tdCrit.textContent = String(a.criticality);
      tr.appendChild(tdCrit);

      const tdConf = document.createElement('td');
      tdConf.className = 'cellTight';
      tdConf.textContent = confidenceLabel(a.confidence);
      tr.appendChild(tdConf);

      const tdE = document.createElement('td');
      tdE.className = 'cellMuted';
      tdE.textContent = a.evidence && a.evidence.trim().length ? a.evidence.trim() : '—';
      tr.appendChild(tdE);

      const tdStatus = document.createElement('td');
      tdStatus.className = 'cellTight';
      tdStatus.textContent = a.status === 'supported' ? 'SUPPORTED' : (a.status === 'invalidated' ? 'INVALIDATED' : 'UNTESTED');
      tr.appendChild(tdStatus);

      const tdAct = document.createElement('td');
      tdAct.className = 'cellTight';
      const actions = document.createElement('div');
      actions.className = 'actionsInline';

      const btnSupport = document.createElement('button');
      btnSupport.type = 'button';
      btnSupport.className = 'actionLink';
      btnSupport.textContent = 'Support';
      btnSupport.addEventListener('click', () => {
        a.status = 'supported';
        saveState();
        renderAllDerived();
        renderAssumptionsTable();
        showToast('Updated');
      });

      const btnInvalidate = document.createElement('button');
      btnInvalidate.type = 'button';
      btnInvalidate.className = 'actionLink';
      btnInvalidate.textContent = 'Invalidate';
      btnInvalidate.addEventListener('click', () => {
        a.status = 'invalidated';
        saveState();
        renderAllDerived();
        renderAssumptionsTable();
        showToast('Updated');
      });

      const btnEdit = document.createElement('button');
      btnEdit.type = 'button';
      btnEdit.className = 'actionLink';
      btnEdit.textContent = 'Edit';
      btnEdit.addEventListener('click', () => {
        const text = window.prompt('Assumption statement', a.text);
        if (text === null) return;
        const trimmed = text.trim();
        if (!trimmed) return;
        a.text = trimmed;

        const evidence = window.prompt('Evidence (optional)', a.evidence || '');
        if (evidence !== null) a.evidence = evidence.trim();

        saveState();
        renderAllDerived();
        renderAssumptionsTable();
        showToast('Edited');
      });

      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'actionLink';
      btnDel.textContent = 'Delete';
      btnDel.addEventListener('click', () => {
        const ok = window.confirm('Delete this assumption?');
        if (!ok) return;
        state.working.assumptions = state.working.assumptions.filter(x => x.id !== a.id);
        saveState();
        renderAllDerived();
        renderAssumptionsTable();
        showToast('Deleted');
      });

      actions.appendChild(btnSupport);
      actions.appendChild(btnInvalidate);
      actions.appendChild(btnEdit);
      actions.appendChild(btnDel);
      tdAct.appendChild(actions);
      tr.appendChild(tdAct);

      tbody.appendChild(tr);
    });
  };

  const hookAssumptions = () => {
    $('#btnAddAssumption').addEventListener('click', () => {
      const text = ($('#assumpText').value || '').trim();
      if (!text) {
        showToast('Add a statement');
        return;
      }

      const a = {
        id: uid(),
        text,
        type: $('#assumpType').value,
        criticality: clamp(Number($('#assumpCriticality').value) || 1, 1, 5),
        confidence: $('#assumpConfidence').value,
        evidence: ($('#assumpEvidence').value || '').trim(),
        status: 'untested',
        createdAt: nowISO()
      };

      state.working.assumptions.unshift(a);
      $('#assumpText').value = '';
      $('#assumpEvidence').value = '';
      $('#assumpConfidence').value = 'low';
      $('#assumpCriticality').value = '4';
      $('#assumpType').value = 'desirability';

      saveState();
      renderAllDerived();
      renderAssumptionsTable();
      showToast('Added');
    });

    $('#assumpFilter').addEventListener('change', () => renderAssumptionsTable());
  };

  const buildPlan = (working) => {
    const prefs = working.planPrefs || demoPlanPrefs();
    const horizon = clamp(Number(prefs.horizonDays) || 10, 7, 21);
    const team = prefs.team || 'pm-design';
    const constraint = (prefs.constraint || '').trim();

    const frag = [...working.assumptions]
      .filter(a => a.status !== 'supported')
      .map(a => {
        const confPenalty = 1 - confidenceFactor(a.confidence);
        const crit = clamp(Number(a.criticality) || 1, 1, 5);
        const score = (crit * 18) + (confPenalty * 40);
        return { ...a, score };
      })
      .sort((a,b) => b.score - a.score);

    const targets = frag.slice(0, 3);
    const idea = working.idea;

    const ownerMap = {
      solo: ['PM', 'PM', 'PM', 'PM', 'PM'],
      'pm-design': ['PM', 'Design', 'PM', 'Design', 'PM'],
      pod: ['PM', 'Design', 'Eng', 'PM', 'Eng']
    };
    const owners = ownerMap[team] || ownerMap.solo;

    const steps = [];

    const priceRisk = targets.find(t => /pay|pricing|price|willingness/i.test(t.text)) || null;
    const desirabilityRisk = targets.find(t => t.type === 'desirability') || targets[0] || null;

    steps.push({
      step: 1,
      action: `Write a one-page “verdict memo” draft for: ${idea.name}`,
      signal: 'Single-sentence decision + top 3 assumptions are unambiguous to a reviewer',
      days: 1,
      owner: owners[0]
    });

    steps.push({
      step: 2,
      action: desirabilityRisk
        ? `Run 5 targeted problem interviews with ${idea.user} proxy; test: “${desirabilityRisk.text}”`
        : `Run 5 targeted problem interviews with ${idea.user}; confirm pain moment + consequence`,
      signal: '≥3/5 describe the pain unprompted and rank it top-3 in their week',
      days: 3,
      owner: owners[1]
    });

    if (priceRisk) {
      steps.push({
        step: 3,
        action: `Pricing probe: present 3 tiers for the outcome (not features) and test willingness to pay`,
        signal: 'At least 2 respondents pick a paid tier and can name the budget owner',
        days: 2,
        owner: owners[2]
      });
    } else {
      steps.push({
        step: 3,
        action: `Competitive teardown: compare against “${idea.alternative}” and 2 adjacent tools; document gaps`,
        signal: 'Differentiation can be stated in one sentence without qualifiers',
        days: 2,
        owner: owners[2]
      });
    }

    steps.push({
      step: 4,
      action: `Prototype the scoring + assumptions workflow (clickable) and run 3 “leadership review” walkthroughs`,
      signal: 'Reviewers reach a decision in <10 minutes and ask fewer than 3 clarification questions',
      days: 2,
      owner: owners[3]
    });

    steps.push({
      step: 5,
      action: constraint
        ? `Decision meeting: run the ritual under constraint: ${constraint}`
        : 'Decision meeting: run the ritual in the normal weekly leadership review',
      signal: 'Decision recorded (invest / refine / drop) and next owner assigned',
      days: Math.max(1, horizon - (1+3+2+2)),
      owner: owners[4]
    });

    const totalDays = steps.reduce((s, x) => s + x.days, 0);
    if (totalDays > horizon) {
      let extra = totalDays - horizon;
      for (let i=steps.length-1;i>=0;i--){
        if (extra <= 0) break;
        const reducible = Math.max(0, steps[i].days - 1);
        const delta = Math.min(reducible, extra);
        steps[i].days -= delta;
        extra -= delta;
      }
    }

    return steps;
  };

  const renderPlanPrefs = () => {
    $('#planHorizon').value = String(state.working.planPrefs?.horizonDays ?? 10);
    $('#planTeam').value = state.working.planPrefs?.team ?? 'pm-design';
    $('#planConstraint').value = state.working.planPrefs?.constraint ?? '';
  };

  const renderPlan = () => {
    const steps = buildPlan(state.working);
    const tbody = $('#planBody');
    tbody.innerHTML = '';

    steps.forEach(s => {
      const tr = document.createElement('tr');

      const tdStep = document.createElement('td');
      tdStep.className = 'cellTight';
      tdStep.textContent = String(s.step);
      tr.appendChild(tdStep);

      const tdAction = document.createElement('td');
      tdAction.textContent = s.action;
      tr.appendChild(tdAction);

      const tdSignal = document.createElement('td');
      tdSignal.className = 'cellMuted';
      tdSignal.textContent = s.signal;
      tr.appendChild(tdSignal);

      const tdDays = document.createElement('td');
      tdDays.className = 'cellTight';
      tdDays.textContent = `${s.days}d`;
      tr.appendChild(tdDays);

      const tdOwner = document.createElement('td');
      tdOwner.className = 'cellTight';
      tdOwner.textContent = s.owner.toUpperCase();
      tr.appendChild(tdOwner);

      tbody.appendChild(tr);
    });

    $('#nextActionsCount').textContent = String(steps.length);
    const eta = steps.reduce((sum, s) => sum + s.days, 0);
    $('#planETA').textContent = `ETA: ${eta} DAYS`;
  };

  const hookPlan = () => {
    $('#planHorizon').addEventListener('change', () => {
      state.working.planPrefs.horizonDays = Number($('#planHorizon').value);
      saveState();
      renderPlan();
      showToast('Updated');
    });
    $('#planTeam').addEventListener('change', () => {
      state.working.planPrefs.team = $('#planTeam').value;
      saveState();
      renderPlan();
      showToast('Updated');
    });
    $('#planConstraint').addEventListener('input', () => {
      state.working.planPrefs.constraint = $('#planConstraint').value;
      saveState();
      renderPlan();
    });

    $('#btnGeneratePlan').addEventListener('click', () => {
      renderPlan();
      showToast('Regenerated');
    });

    $('#btnCopyPlan').addEventListener('click', async () => {
      const steps = buildPlan(state.working);
      const lines = [
        `Validation Plan — ${state.working.idea.name}`,
        `ETA: ${steps.reduce((s, x) => s + x.days, 0)} days`,
        '',
        ...steps.map(s => `${s.step}. ${s.action}\n   Success: ${s.signal}\n   Duration: ${s.days}d | Owner: ${s.owner}`)
      ];
      const txt = lines.join('\n');
      try{
        await navigator.clipboard.writeText(txt);
        showToast('Plan copied');
      }catch{
        window.prompt('Copy plan', txt);
      }
    });
  };

  const snapshotWorking = () => JSON.parse(JSON.stringify(state.working));

  const renderLibraryHeader = () => {
    $('#libraryCount').textContent = String(state.versions.length);
    const active = state.activeVersionId ? state.versions.find(v => v.id === state.activeVersionId) : null;
    $('#libraryActive').textContent = active ? `ACTIVE: ${active.label}` : 'ACTIVE: —';
  };

  const computeVersionLabel = () => {
    const n = state.versions.length + 1;
    return `V${n}`;
  };

  const makeVersionRecord = () => {
    const score = computeWeightedScore(state.working);
    const verdict = verdictFromScore(score);
    const label = computeVersionLabel();
    return {
      id: uid(),
      label,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      score,
      verdict,
      working: snapshotWorking()
    };
  };

  const renderVersionsTable = () => {
    const tbody = $('#versionsBody');
    tbody.innerHTML = '';

    const versions = [...state.versions].sort((a,b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));

    versions.forEach(v => {
      const tr = document.createElement('tr');

      const tdV = document.createElement('td');
      tdV.className = 'cellTight';
      tdV.textContent = v.label;
      tr.appendChild(tdV);

      const tdName = document.createElement('td');
      tdName.textContent = v.working?.idea?.name || '—';
      tr.appendChild(tdName);

      const tdVerdict = document.createElement('td');
      tdVerdict.className = 'cellTight';
      tdVerdict.textContent = v.verdict;
      tr.appendChild(tdVerdict);

      const tdScore = document.createElement('td');
      tdScore.className = 'cellTight';
      tdScore.textContent = String(v.score);
      tr.appendChild(tdScore);

      const tdUpd = document.createElement('td');
      tdUpd.className = 'cellTight';
      const d = new Date(v.updatedAt || v.createdAt);
      tdUpd.textContent = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      tr.appendChild(tdUpd);

      const tdAct = document.createElement('td');
      tdAct.className = 'cellTight';
      const actions = document.createElement('div');
      actions.className = 'actionsInline';

      const btnSet = document.createElement('button');
      btnSet.type = 'button';
      btnSet.className = 'actionLink';
      btnSet.textContent = 'Set active';
      btnSet.addEventListener('click', () => {
        state.activeVersionId = v.id;
        saveState();
        renderLibraryHeader();
        showToast('Active set');
      });

      const btnRestore = document.createElement('button');
      btnRestore.type = 'button';
      btnRestore.className = 'actionLink';
      btnRestore.textContent = 'Restore';
      btnRestore.addEventListener('click', () => {
        const ok = window.confirm(`Restore ${v.label} to the workspace? This replaces current working fields.`);
        if (!ok) return;
        state.working = JSON.parse(JSON.stringify(v.working));
        saveState();
        renderAll();
        showToast('Restored');
      });

      const btnRename = document.createElement('button');
      btnRename.type = 'button';
      btnRename.className = 'actionLink';
      btnRename.textContent = 'Rename';
      btnRename.addEventListener('click', () => {
        const name = window.prompt('Version label', v.label);
        if (name === null) return;
        const trimmed = name.trim().toUpperCase();
        if (!trimmed) return;
        v.label = trimmed;
        v.updatedAt = nowISO();
        saveState();
        renderAllDerived();
        showToast('Renamed');
      });

      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.className = 'actionLink';
      btnDelete.textContent = 'Delete';
      btnDelete.addEventListener('click', () => {
        const ok = window.confirm(`Delete ${v.label}?`);
        if (!ok) return;
        state.versions = state.versions.filter(x => x.id !== v.id);
        if (state.activeVersionId === v.id) state.activeVersionId = null;
        saveState();
        renderAllDerived();
        showToast('Deleted');
      });

      actions.appendChild(btnSet);
      actions.appendChild(btnRestore);
      actions.appendChild(btnRename);
      actions.appendChild(btnDelete);
      tdAct.appendChild(actions);
      tr.appendChild(tdAct);

      tbody.appendChild(tr);
    });

    renderCompareSelects();
  };

  const renderCompareSelects = () => {
    const selA = $('#compareA');
    const selB = $('#compareB');
    const versions = [...state.versions].sort((a,b) => (a.createdAt).localeCompare(b.createdAt));
    const buildOptions = (sel) => {
      sel.innerHTML = '';
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = '—';
      sel.appendChild(empty);

      versions.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = `${v.label} — ${v.working?.idea?.name || 'Idea'}`;
        sel.appendChild(opt);
      });
    };
    buildOptions(selA);
    buildOptions(selB);

    if (versions.length >= 2) {
      selA.value = versions[versions.length - 2].id;
      selB.value = versions[versions.length - 1].id;
    } else {
      selA.value = '';
      selB.value = '';
    }
  };

  const compareVersions = (a, b) => {
    const aScore = a.score ?? computeWeightedScore(a.working);
    const bScore = b.score ?? computeWeightedScore(b.working);
    const delta = bScore - aScore;

    const stageA = a.working.idea.stage || 'series-a';
    const stageB = b.working.idea.stage || 'series-a';

    const dimsA = a.working.dimensions.map(d => ({ id: d.id, name: d.name, impact: computeDimensionAdjusted(d, stageA) * (Number(d.weight)||0) }));
    const dimsB = b.working.dimensions.map(d => ({ id: d.id, name: d.name, impact: computeDimensionAdjusted(d, stageB) * (Number(d.weight)||0) }));

    const mapA = new Map(dimsA.map(d => [d.id, d]));
    const mapB = new Map(dimsB.map(d => [d.id, d]));
    const deltas = [];
    for (const [id, da] of mapA.entries()){
      const db = mapB.get(id);
      if (!db) continue;
      deltas.push({ id, name: da.name, delta: (db.impact - da.impact) });
    }
    deltas.sort((x,y) => Math.abs(y.delta) - Math.abs(x.delta));
    const biggest = deltas[0];

    const fieldKeys = [
      ['Idea name', 'name'],
      ['Primary user', 'user'],
      ['JTBD', 'jtbd'],
      ['Pain', 'pain'],
      ['Solution', 'solution'],
      ['Alternative', 'alternative'],
      ['Differentiation', 'differentiation'],
      ['Company context', 'stage']
    ];

    const changes = fieldKeys
      .map(([label, key]) => {
        const av = (a.working.idea[key] || '').trim();
        const bv = (b.working.idea[key] || '').trim();
        const same = av === bv;
        return { label, same, av: av || '—', bv: bv || '—' };
      })
      .filter(x => !x.same);

    return {
      deltaScore: delta,
      verdictA: a.verdict,
      verdictB: b.verdict,
      biggest,
      changes
    };
  };

  const renderCompare = () => {
    const selA = $('#compareA').value;
    const selB = $('#compareB').value;

    const empty = $('#compareEmpty');
    const