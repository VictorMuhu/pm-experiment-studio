(() => {
  'use strict';

  const STORAGE_KEY = 'pm-experiment-idea-validator:v1';
  const MAX_TITLE_LEN = 90;

  const DIMENSIONS = [
    { id: 'pain', label: 'Pain Evidence', weight: 16, weaknessThreshold: 6, hint: 'Do we have specific evidence the problem exists and is material?' },
    { id: 'target', label: 'Target Clarity', weight: 8, weaknessThreshold: 6, hint: 'Is the primary user precise and narrow enough to design for?' },
    { id: 'diff', label: 'Differentiation', weight: 12, weaknessThreshold: 6, hint: 'Why us / why now / why this is meaningfully better.' },
    { id: 'reach', label: 'Reach Potential', weight: 10, weaknessThreshold: 5, hint: 'How many users will plausibly use this in the next quarter?' },
    { id: 'metric', label: 'Metric Linkage', weight: 10, weaknessThreshold: 6, hint: 'Does success map to a business metric we already care about?' },
    { id: 'feas', label: 'Feasibility', weight: 12, weaknessThreshold: 6, hint: 'Engineering and data feasibility, dependencies, unknowns.' },
    { id: 'time', label: 'Time-to-Value', weight: 10, weaknessThreshold: 5, hint: 'How fast can we ship V1 and see signal?' },
    { id: 'risk', label: 'Risk Profile', weight: 12, weaknessThreshold: 5, hint: 'Compliance, trust, GTM risk, and blast radius.' },
    { id: 'strategy', label: 'Strategy Fit', weight: 10, weaknessThreshold: 6, hint: 'Does it reinforce the strategy rather than dilute it?' }
  ];

  const WEAKNESS_RULES = {
    pain: (idea) => {
      const p = (idea.brief.problem || '').trim();
      if (p.length < 60) return 'Problem statement is short; add concrete evidence (numbers, quotes, tickets)';
      if (!/\d|%|\b(dropped|lost|churn|blocked|hours|weeks)\b/i.test(p)) return 'Problem statement lacks evidence signal (numbers, % change, or operational consequence)';
      return null;
    },
    diff: (idea) => {
      const s = (idea.brief.solution || '').trim();
      if (s.length < 60) return 'Solution description is short; specify what changes in workflow or system behavior';
      if (!/\b(unlike|instead of|replace|versus|compared to)\b/i.test(s)) return 'Differentiation is implicit; add an explicit “unlike X, we…” comparison';
      return null;
    },
    feas: (idea) => {
      const notes = (idea.brief.notes || '').trim();
      if (!notes) return 'Feasibility unknowns are not recorded; list dependencies and unknowns in NOTES';
      if (!/\b(depends|dependency|api|data|integration|security|legal|latency)\b/i.test(notes)) return 'NOTES does not mention key dependencies (data, integration, security, legal)';
      return null;
    },
    metric: (idea) => {
      const m = (idea.brief.metric || '').trim();
      if (m.length < 6) return 'Primary metric is missing or vague; pick one measurable outcome';
      if (!/\b(conversion|retention|activation|time to|latency|cost|margin|revenue|nps|csat|tickets)\b/i.test(m)) return 'Metric seems non-standard; ensure it maps to a core KPI or operational metric';
      return null;
    },
    target: (idea) => {
      const t = (idea.brief.customer || '').trim();
      if (t.length < 10) return 'Primary user is vague; specify role + context (e.g., “AP clerk at 200–1k employee SaaS”)';
      if (!/\b(at|in|for)\b/i.test(t)) return 'Primary user lacks context; add “in/at/for …” detail';
      return null;
    },
    time: (idea) => {
      const w = Number(idea.brief.timeWeeks || 0);
      if (!w) return 'Time-to-V1 is missing';
      if (w > 16) return 'Time-to-V1 is long; split into a smaller V1 or revise scope';
      return null;
    },
    strategy: (idea) => {
      if (idea.brief.strategyFit === 'distraction') return 'Strategy fit marked as DISTRACTION; requires exceptional rationale';
      return null;
    }
  };

  const DEFAULT_STATE = () => {
    const now = Date.now();
    const demo = buildDemoIdea(now);
    return {
      version: 1,
      selectedIdeaId: demo.id,
      ideas: [demo]
    };
  };

  function buildDemoIdea(now) {
    const id = `idea_${now}`;
    return {
      id,
      createdAt: now - 1000 * 60 * 60 * 6,
      updatedAt: now - 1000 * 60 * 8,
      brief: {
        title: 'Instant Vendor Security Packets',
        stage: 'growth',
        customer: 'Security lead at 200–2,000 employee SaaS buying 10+ tools/year',
        problem:
          'Every procurement cycle stalls on security review. Security teams spend 4–8 hours per vendor answering the same questions, and deals slip 1–3 weeks. In the last quarter we saw 19 “security questionnaire” escalations and 6 stalled renewals.',
        solution:
          'Generate a vendor-specific security packet from existing controls, SOC2 evidence, and product configuration. Unlike a generic PDF, the packet is scoped to the buyer’s questionnaire and includes traceable evidence links and standard answers that legal can approve.',
        metric: 'Reduction in “security questionnaire” deal cycle time (days) and fewer escalations/tickets',
        timeWeeks: 10,
        reach: 'segment',
        strategyFit: 'core',
        notes:
          'Depends on evidence inventory (SOC2, pen test), internal controls mapping, and permissioned links. Integration with Salesforce for deal context is optional for V1; risk: overstating coverage and creating trust issues if evidence is stale.'
      },
      decision: {
        override: 'auto',
        owner: 'Head of Product',
        dateISO: isoDate(now),
        rationale:
          'High leverage on sales cycle time with clear buyer pain. Needs tighter differentiation vs. existing trust-center tools and a crisp V1 scope before committing.'
      },
      scorecard: {
        dimensions: DIMENSIONS.reduce((acc, d) => {
          acc[d.id] = { score: seedScoreForDimension(d.id), weight: d.weight, notes: seedNoteForDimension(d.id) };
          return acc;
        }, {})
      },
      assumptions: seedAssumptions(now),
      risks: seedRisks(now)
    };
  }

  function seedScoreForDimension(id) {
    const map = {
      pain: 8,
      target: 7,
      diff: 6,
      reach: 7,
      metric: 7,
      feas: 6,
      time: 7,
      risk: 5,
      strategy: 8
    };
    return map[id] ?? 6;
  }

  function seedNoteForDimension(id) {
    const map = {
      pain: 'Ticket volume and quantified deal slippage suggest material cost; validate across segments.',
      target: 'Primary user is specific; confirm buyer committee includes legal/procurement paths.',
      diff: 'Needs sharper contrast vs. trust centers + “security automation” vendors; define what is uniquely fast.',
      reach: 'Applies to mid-market and enterprise motions; start with segment where deal cycle is the bottleneck.',
      metric: 'Cycle time and escalation volume are measurable; define baseline and attribution.',
      feas: 'Core is content + evidence mapping; biggest unknown is permissions and freshness of evidence.',
      time: 'A scoped packet generator is feasible in ~10 weeks; avoid SFDC integration initially.',
      risk: 'Trust risk if answers are wrong or stale; mitigation requires approval workflow and audit trail.',
      strategy: 'Directly supports growth OKR on sales velocity and renewal friction.'
    };
    return map[id] ?? '';
  }

  function seedAssumptions(now) {
    return [
      {
        id: `a_${now}_1`,
        createdAt: now - 1000 * 60 * 60 * 5,
        updatedAt: now - 1000 * 60 * 30,
        statement: 'Security teams will accept a packet if every answer is traceable to evidence links they can audit.',
        type: 'value',
        risk: 'high',
        status: 'untested',
        confidence: 'medium',
        nextStep: 'Run 5 buyer-side reviews with security leads using a mocked packet and record acceptance criteria.',
        evidence: ''
      },
      {
        id: `a_${now}_2`,
        createdAt: now - 1000 * 60 * 60 * 4,
        updatedAt: now - 1000 * 60 * 60 * 2,
        statement: 'We can maintain evidence freshness without creating a full-blown GRC system.',
        type: 'feasibility',
        risk: 'high',
        status: 'in-progress',
        confidence: 'low',
        nextStep: 'Define a minimal evidence inventory model (owner, expiry, source) and test maintenance burden with Security.',
        evidence: 'Notes from Security sync — 2026-03-12'
      },
      {
        id: `a_${now}_3`,
        createdAt: now - 1000 * 60 * 60 * 3,
        updatedAt: now - 1000 * 60 * 45,
        statement: 'Reducing security questionnaire time by 30% will measurably improve close rate or shorten deal cycle.',
        type: 'viability',
        risk: 'medium',
        status: 'untested',
        confidence: 'medium',
        nextStep: 'Pull last 2 quarters of deals with security escalation; estimate cycle time deltas and win/loss sensitivity.',
        evidence: ''
      },
      {
        id: `a_${now}_4`,
        createdAt: now - 1000 * 60 * 60 * 2,
        updatedAt: now - 1000 * 60 * 60 * 1,
        statement: 'A V1 that supports 10 common questionnaire templates covers most of the workload.',
        type: 'feasibility',
        risk: 'medium',
        status: 'untested',
        confidence: 'low',
        nextStep: 'Sample 25 questionnaires; cluster by template similarity; measure coverage by top 10.',
        evidence: ''
      }
    ];
  }

  function seedRisks(now) {
    return [
      {
        id: `r_${now}_1`,
        createdAt: now - 1000 * 60 * 60 * 4,
        updatedAt: now - 1000 * 60 * 60 * 1,
        text: 'Packet provides an incorrect control claim, damaging trust and increasing scrutiny.',
        category: 'trust',
        probability: 3,
        impact: 5,
        mitigation: 'Add approval workflow + “evidence freshness” flags; do not auto-assert; require control owner sign-off.',
        owner: 'Security',
        source: 'manual'
      },
      {
        id: `r_${now}_2`,
        createdAt: now - 1000 * 60 * 60 * 3,
        updatedAt: now - 1000 * 60 * 60 * 2,
        text: 'Maintenance burden turns into an internal GRC product.',
        category: 'scope',
        probability: 3,
        impact: 4,
        mitigation: 'Keep inventory minimal; integrate existing sources; define hard V1 boundaries; quarterly refresh cadence.',
        owner: 'Product',
        source: 'manual'
      },
      {
        id: `r_${now}_3`,
        createdAt: now - 1000 * 60 * 60 * 2,
        updatedAt: now - 1000 * 60 * 60 * 1,
        text: 'Differentiation is too close to trust centers; buyers see it as table stakes.',
        category: 'market',
        probability: 4,
        impact: 3,
        mitigation: 'Anchor positioning on speed + questionnaire-specific mapping + audit trail; validate with 6 prospects.',
        owner: 'GTM',
        source: 'manual'
      }
    ];
  }

  // -------------------------
  // DOM helpers
  // -------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function clamp(n, min, max) {
    const x = Number(n);
    if (Number.isNaN(x)) return min;
    return Math.max(min, Math.min(max, x));
  }

  function isoDate(ts) {
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatUpdated(ts) {
    const d = new Date(ts);
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ' —');
  }

  function computeStorageInfo(state) {
    const raw = JSON.stringify(state);
    const bytes = new Blob([raw]).size;
    const kb = Math.round(bytes / 1024);
    return `${kb} KB STORED`;
  }

  // -------------------------
  // State
  // -------------------------
  let state = loadState();
  let selectedAssumptionId = null;

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE();
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return DEFAULT_STATE();
      if (!parsed.ideas || !Array.isArray(parsed.ideas) || parsed.ideas.length === 0) return DEFAULT_STATE();
      return parsed;
    } catch {
      return DEFAULT_STATE();
    }
  }

  function saveState(reason) {
    const now = Date.now();
    const idea = getSelectedIdea();
    if (idea) idea.updatedAt = now;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setAutosave(`SAVED — ${reason}`);
    } catch {
      setAutosave('SAVE FAILED');
    }

    $('#storageInfo').textContent = computeStorageInfo(state);
  }

  let autosaveTimer = null;
  function scheduleSave(reason) {
    if (autosaveTimer) window.clearTimeout(autosaveTimer);
    setAutosave('SAVING…');
    autosaveTimer = window.setTimeout(() => {
      autosaveTimer = null;
      saveState(reason);
    }, 220);
  }

  function setAutosave(text) {
    $('#autosaveStatus').textContent = text;
  }

  function getSelectedIdea() {
    return state.ideas.find(i => i.id === state.selectedIdeaId) || state.ideas[0];
  }

  function setSelectedIdea(id) {
    state.selectedIdeaId = id;
    selectedAssumptionId = null;
    scheduleSave('SELECT');
    renderAll();
  }

  // -------------------------
  // Scoring / verdict
  // -------------------------
  function normalizeWeights(idea) {
    const dims = idea.scorecard.dimensions;
    const total = Object.values(dims).reduce((sum, d) => sum + (Number(d.weight) || 0), 0);
    if (total <= 0) return;

    const targetTotal = 100;
    const factor = targetTotal / total;

    Object.keys(dims).forEach(id => {
      dims[id].weight = Math.round((Number(dims[id].weight) || 0) * factor);
    });

    // Fix rounding drift
    const fixedTotal = Object.values(dims).reduce((sum, d) => sum + (Number(d.weight) || 0), 0);
    const drift = targetTotal - fixedTotal;
    if (drift !== 0) {
      const maxId = Object.keys(dims).sort((a, b) => (dims[b].weight || 0) - (dims[a].weight || 0))[0];
      dims[maxId].weight = (dims[maxId].weight || 0) + drift;
    }
  }

  function computeWeightedScore(idea) {
    const dims = idea.scorecard.dimensions;
    const totalWeight = Object.values(dims).reduce((s, d) => s + (Number(d.weight) || 0), 0) || 100;
    let sum = 0;
    Object.entries(dims).forEach(([id, d]) => {
      const score = clamp(d.score, 0, 10);
      const w = Number(d.weight) || 0;
      sum += (score / 10) * w;
    });
    const score100 = Math.round((sum / totalWeight) * 100);
    return clamp(score100, 0, 100);
  }

  function computeWeaknesses(idea) {
    const dims = idea.scorecard.dimensions;
    const weaknesses = [];
    DIMENSIONS.forEach(def => {
      const d = dims[def.id];
      const score = clamp(d?.score ?? 0, 0, 10);
      let isWeak = score < def.weaknessThreshold;

      const rule = WEAKNESS_RULES[def.id];
      const ruleText = typeof rule === 'function' ? rule(idea) : null;
      if (ruleText) isWeak = true;

      if (isWeak) {
        weaknesses.push({
          id: def.id,
          label: def.label,
          score,
          threshold: def.weaknessThreshold,
          reason: ruleText || (d?.notes || 'Below threshold')
        });
      }
    });

    weaknesses.sort((a, b) => a.score - b.score);
    return weaknesses;
  }

  function computeConfidence(idea) {
    const untestedHighRisk = idea.assumptions.filter(a => a.risk === 'high' && (a.status === 'untested' || a.status === 'in-progress')).length;
    const weakCount = computeWeaknesses(idea).length;
    const score100 = computeWeightedScore(idea);

    if (score100 >= 80 && weakCount <= 1 && untestedHighRisk === 0) return 'HIGH';
    if (score100 < 55 || weakCount >= 4 || untestedHighRisk >= 2) return 'LOW';
    return 'MEDIUM';
  }

  function computeVerdict(idea) {
    const score100 = computeWeightedScore(idea);
    const weakCount = computeWeaknesses(idea).length;
    const untestedHighRisk = idea.assumptions.filter(a => a.risk === 'high' && (a.status === 'untested' || a.status === 'in-progress')).length;

    let verdict = 'REFINE FIRST';
    if (score100 >= 78 && weakCount <= 2 && untestedHighRisk <= 1) verdict = 'GO';
    if (score100 < 58 || weakCount >= 5) verdict = 'NO-GO';

    const override = idea.decision.override || 'auto';
    if (override === 'go') verdict = 'GO';
    if (override === 'refine') verdict = 'REFINE FIRST';
    if (override === 'no-go') verdict = 'NO-GO';
    return verdict;
  }

  // -------------------------
  // Rendering
  // -------------------------
  function renderAll() {
    renderIdeaSelect();
    renderHero();
    renderBriefForm();
    renderScorecard();
    renderAssumptions();
    renderRisks();
    renderMemo();
  }

  function renderIdeaSelect() {
    const sel = $('#ideaSelect');
    sel.innerHTML = '';
    state.ideas
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .forEach(idea => {
        const opt = document.createElement('option');
        opt.value = idea.id;
        opt.textContent = idea.brief.title ? truncate(idea.brief.title, 54) : 'UNTITLED IDEA';
        sel.appendChild(opt);
      });
    sel.value = state.selectedIdeaId;
  }

  function truncate(s, n) {
    const str = String(s || '');
    if (str.length <= n) return str;
    return str.slice(0, n - 1) + '…';
  }

  function renderHero() {
    const idea = getSelectedIdea();
    const verdict = computeVerdict(idea);
    const score = computeWeightedScore(idea);
    const weaknesses = computeWeaknesses(idea);
    const confidence = computeConfidence(idea);

    $('#heroVerdict').textContent = verdict;
    $('#heroScore').textContent = String(score);
    $('#heroWeakCount').textContent = String(weaknesses.length);
    $('#heroConfidence').textContent = confidence;

    $('#ideaMeta').textContent = `UPDATED — ${formatUpdated(idea.updatedAt)}`;
  }

  function renderBriefForm() {
    const idea = getSelectedIdea();
    $('#ideaTitle').value = idea.brief.title || '';
    $('#ideaStage').value = idea.brief.stage || 'seed';
    $('#ideaCustomer').value = idea.brief.customer || '';
    $('#ideaProblem').value = idea.brief.problem || '';
    $('#ideaSolution').value = idea.brief.solution || '';
    $('#ideaMetric').value = idea.brief.metric || '';
    $('#ideaTime').value = idea.brief.timeWeeks || '';
    $('#ideaReach').value = idea.brief.reach || 'segment';
    $('#ideaStrategyFit').value = idea.brief.strategyFit || 'adjacent';
    $('#ideaNotes').value = idea.brief.notes || '';

    // Decision controls
    $('#decisionOverride').value = idea.decision.override || 'auto';
    $('#decisionOwner').value = idea.decision.owner || '';
    $('#decisionDate').value = idea.decision.dateISO || isoDate(Date.now());
    $('#decisionRationale').value = idea.decision.rationale || '';
  }

  function renderScorecard() {
    const idea = getSelectedIdea();
    const tbody = $('#scoreTable tbody');
    tbody.innerHTML = '';

    const dims = idea.scorecard.dimensions;
    const weaknesses = computeWeaknesses(idea);
    const weakSet = new Set(weaknesses.map(w => w.id));

    DIMENSIONS.forEach(def => {
      const row = document.createElement('tr');

      const d = dims[def.id] || { score: 0, weight: def.weight, notes: '' };

      row.innerHTML = `
        <td>
          <div style="font-weight:700;">${escapeHtml(def.label)}</div>
          <div class="muted" style="margin-top:4px;">${escapeHtml(def.hint)}</div>
        </td>
        <td class="cell-weight">
          <input class="input score-input" data-dim="weight" data-id="${escapeHtml(def.id)}" type="number" min="0" max="100" value="${escapeHtml(String(d.weight ?? def.weight))}" />
        </td>
        <td class="cell-score">
          <div class="score-inline">
            <input class="input score-input" data-dim="score" data-id="${escapeHtml(def.id)}" type="number" min="0" max="10" value="${escapeHtml(String(d.score ?? 0))}" />
            <div class="muted">/10</div>
          </div>
        </td>
        <td>
          <input class="input note-input" data-dim="notes" data-id="${escapeHtml(def.id)}" type="text" value="${escapeHtml(String(d.notes ?? ''))}" />
        </td>
        <td class="cell-compact">
          ${weakSet.has(def.id) ? `<div class="badge-weak"><span class="mark">FLAG</span></div>` : `<div class="muted">—</div>`}
        </td>
      `;
      tbody.appendChild(row);
    });

    const top = weaknesses.slice(0, 3).map(w => `${w.label} — ${w.reason}`).join(' • ');
    $('#topWeaknesses').textContent = top || '—';
  }

  function renderAssumptions() {
    const idea = getSelectedIdea();
    const filter = $('#assumptionFilter').value;
    const tbody = $('#assumptionTable tbody');
    tbody.innerHTML = '';

    const items = idea.assumptions
      .slice()
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .filter(a => filter === 'all' ? true : a.status === filter);

    $('#assumptionCount').textContent = String(idea.assumptions.length);

    items.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(a.statement)}</td>
        <td class="cell-compact">${escapeHtml(a.type.toUpperCase())}</td>
        <td class="cell-compact">${escapeHtml(a.risk.toUpperCase())}</td>
        <td class="cell-compact">${escapeHtml(a.status.toUpperCase())}</td>
        <td>${escapeHtml(a.nextStep || '')}</td>
        <td class="cell-actions">
          <div class="row-actions">
            <button class="btn-link" type="button" data-action="edit-assumption" data-id="${escapeHtml(a.id)}">EDIT</button>
            <button class="btn-link" type="button" data-action="delete-assumption" data-id="${escapeHtml(a.id)}">DELETE</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    renderAssumptionEditor();
  }

  function renderAssumptionEditor() {
    const idea = getSelectedIdea();
    const selected = idea.assumptions.find(a => a.id === selectedAssumptionId) || null;

    if (!selected) {
      $('#assumptionEditorMeta').textContent = 'SELECT AN ITEM —';
      $('#aStatement').value = '';
      $('#aType').value = 'value';
      $('#aRisk').value = 'medium';
      $('#aStatus').value = 'untested';
      $('#aConfidence').value = 'medium';
      $('#aNext').value = '';
      $('#aEvidence').value = '';
      return;
    }

    $('#assumptionEditorMeta').textContent = `UPDATED — ${formatUpdated(selected.updatedAt || selected.createdAt)}`;
    $('#aStatement').value = selected.statement || '';
    $('#aType').value = selected.type || 'value';
    $('#aRisk').value = selected.risk || 'medium';
    $('#aStatus').value = selected.status || 'untested';
    $('#aConfidence').value = selected.confidence || 'medium';
    $('#aNext').value = selected.nextStep || '';
    $('#aEvidence').value = selected.evidence || '';
  }

  function renderRisks() {
    const idea = getSelectedIdea();
    const sortMode = $('#riskSort').value;

    const tbody = $('#riskTable tbody');
    tbody.innerHTML = '';

    const items = idea.risks.slice().map(r => ({
      ...r,
      priority: clamp(r.probability, 1, 5) * clamp(r.impact, 1, 5)
    }));

    items.sort((a, b) => {
      if (sortMode === 'priority-desc') return b.priority - a.priority;
      if (sortMode === 'prob-desc') return b.probability - a.probability;
      if (sortMode === 'impact-desc') return b.impact - a.impact;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });

    items.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(r.text)}</td>
        <td class="cell-compact">${escapeHtml(r.category.toUpperCase())}</td>
        <td class="cell-compact">
          <input class="input score-input" data-action="risk-prob" data-id="${escapeHtml(r.id)}" type="number" min="1" max="5" value="${escapeHtml(String(r.probability))}" />
        </td>
        <td class="cell-compact">
          <input class="input score-input" data-action="risk-impact" data-id="${escapeHtml(r.id)}" type="number" min="1" max="5" value="${escapeHtml(String(r.impact))}" />
        </td>
        <td class="cell-compact"><span class="highlight">${escapeHtml(String(r.priority))}</span></td>
        <td>${escapeHtml(r.mitigation || '')}</td>
        <td class="cell-compact">${escapeHtml(r.owner || '')}</td>
        <td class="cell-actions">
          <div class="row-actions">
            <button class="btn-link" type="button" data-action="edit-risk" data-id="${escapeHtml(r.id)}">EDIT</button>
            <button class="btn-link" type="button" data-action="delete-risk" data-id="${escapeHtml(r.id)}">DELETE</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderMemo() {
    const idea = getSelectedIdea();
    const verdict = computeVerdict(idea);
    const score = computeWeightedScore(idea);
    const confidence = computeConfidence(idea);
    const weaknesses = computeWeaknesses(idea).slice(0, 3);

    const takeaway = `${verdict} — ${score}/100 (${confidence})`;
    $('#memoTakeaway').textContent = takeaway;

    const ideaLine = [
      `TITLE: ${idea.brief.title || '—'}`,
      `PRIMARY USER: ${idea.brief.customer || '—'}`,
      `SOLUTION: ${(idea.brief.solution || '—').trim()}`
    ].join('\n');
    $('#memoIdea').textContent = ideaLine;

    const whyNow = buildWhyNow(idea, weaknesses);
    $('#memoWhyNow').textContent = whyNow;

    const dims = idea.scorecard.dimensions;
    const scoreLines = DIMENSIONS.map(def => {
      const d = dims[def.id];
      const s = clamp(d?.score ?? 0, 0, 10);
      const w = Number(d?.weight ?? def.weight) || 0;
      const flag = s < def.weaknessThreshold ? ' — FLAG' : '';
      return `${def.label}: ${s}/10 (W${w})${flag}`;
    }).join('\n');
    $('#memoScores').textContent = scoreLines;

    const topAssumptions = idea.assumptions
      .slice()
      .sort((a, b) => riskRank(b) - riskRank(a))
      .slice(0, 5)
      .map(a => `- [${a.risk.toUpperCase()} / ${a.status.toUpperCase()}] ${a.statement} (NEXT: ${a.nextStep || '—'})`)
      .join('\n');
    $('#memoAssumptions').textContent = topAssumptions || '—';

    const topRisks = idea.risks
      .slice()
      .map(r => ({ ...r, priority: clamp(r.probability, 1, 5) * clamp(r.impact, 1, 5) }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5)
      .map(r => `- [P${r.probability}×I${r.impact}=${r.priority}] ${r.text} (MITIGATION: ${r.mitigation || '—'}; OWNER: ${r.owner || '—'})`)
      .join('\n');
    $('#memoRisks').textContent = topRisks || '—';
  }

  function buildWhyNow(idea, weaknessesTop) {
    const stageMap = {
      seed: 'At SEED, tight scoping matters more than polish; ship a V1 that yields fast signal.',
      'series-a': 'At SERIES A, focus on repeatable motion and foundations that scale.',
      growth: 'At GROWTH, remove friction in the funnel and reduce time-to-close.',
      enterprise: 'In ENTERPRISE, trust, compliance, and workflows dominate buying decisions.'
    };
    const stageLine = stageMap[idea.brief.stage] || '';

    const weakLine = weaknessesTop.length
      ? `Current weaknesses to resolve: ${weaknessesTop.map(w => w.label).join(', ')}.`
      : 'No critical weaknesses flagged by the scorecard.';

    const timeWeeks = Number(idea.brief.timeWeeks || 0);
    const timeLine = timeWeeks ? `Planned time-to-V1: ${timeWeeks} weeks.` : 'Time-to-V1 not set.';

    return [stageLine, timeLine, weakLine].filter(Boolean).join('\n');
  }

  function riskRank(a) {
    const risk = a.risk || 'medium';
    const status = a.status || 'untested';
    const riskScore = risk === 'high' ? 3 : risk === 'medium' ? 2 : 1;
    const statusScore = (status === 'untested' ? 3 : status === 'in-progress' ? 2 : status === 'invalidated' ? 1 : 0);
    return riskScore * 10 + statusScore;
  }

  // -------------------------
  // Actions
  // -------------------------
  function switchView(view) {
    $$('.nav-item').forEach(b => {
      const active = b.dataset.view === view;
      if (active) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });

    $$('.view').forEach(v => {
      const match = v.dataset.view === view;
      v.hidden = !match;
    });

    // Keep hero always visible, but ensure memo reflects latest.
    if (view === 'memo') renderMemo();
  }

  function createNewIdea() {
    const now = Date.now();
    const id = `idea_${now}`;
    const newIdea = {
      id,
      createdAt: now,
      updatedAt: now,
      brief: {
        title: 'New idea — name it clearly',
        stage: 'seed',
        customer: '—',
        problem: '',
        solution: '',
        metric: '',
        timeWeeks: 8,
        reach: 'niche',
        strategyFit: 'adjacent',
        notes: ''
      },
      decision: {
        override: 'auto',
        owner: '',
        dateISO: isoDate(now),
        rationale: ''
      },
      scorecard: {
        dimensions: DIMENSIONS.reduce((acc, d) => {
          acc[d.id] = { score: 5, weight: d.weight, notes: '' };
          return acc;
        }, {})
      },
      assumptions: [],
      risks: []
    };

    state.ideas.unshift(newIdea);
    state.selectedIdeaId = id;
    selectedAssumptionId = null;
    scheduleSave('NEW IDEA');
    renderAll();
    toast('CREATED', 'New idea created. Fill the brief, then score.');
  }

  function duplicateIdea() {
    const now = Date.now();
    const idea = getSelectedIdea();
    const clone = JSON.parse(JSON.stringify(idea));
    clone.id = `idea_${now}`;
    clone.createdAt = now;
    clone.updatedAt = now;
    clone.brief.title = `${truncate(idea.brief.title || 'Idea', MAX_TITLE_LEN - 12)} (COPY)`;

    // New ids for assumptions/risks
    clone.assumptions = (clone.assumptions || []).map((a, idx) => ({
      ...a,
      id: `a_${now}_${idx + 1}`,
      createdAt: now,
      updatedAt: now
    }));
    clone.risks = (clone.risks || []).map((r, idx) => ({
      ...r,
      id: `r_${now}_${idx + 1}`,
      createdAt: now,
      updatedAt: now
    }));

    state.ideas.unshift(clone);
    state.selectedIdeaId = clone.id;
    selectedAssumptionId = null;
    scheduleSave('DUPLICATE');
    renderAll();
    toast('DUPLICATED', 'Copied idea, assumptions, risks, and scores.');
  }

  function exportIdea() {
    const idea = getSelectedIdea();
    const exportObj = buildExportObject(idea);
    const text = JSON.stringify(exportObj, null, 2);

    openModal({
      title: 'EXPORT',
      bodyHtml: `
        <div class="label">JSON</div>
        <textarea class="textarea" id="