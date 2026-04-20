(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const formatPct = (n) => `${Math.round(n)}%`;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const nowStamp = () => {
    const d = new Date();
    const pad = (x) => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Seeded realistic initiatives (B2B SaaS CX + revenue + retention mix)
  const initiatives = [
    {
      id: 'i-activation-guided-setup',
      title: 'Guided setup with admin checklist',
      segment: 'SMB',
      theme: 'activation',
      effort: 6,
      value: 72,
      risk: 26,
      confidence: 78,
      mustDo: false,
      revenue: false,
      retention: true,
      notes: 'Reduces first-week churn by shortening time-to-first-success. Sales reports “setup confusion” as top onboarding friction.',
      stakeholders: ['Customer Success', 'Sales Enablement'],
      dependencies: ['Design system refresh (minor)'],
    },
    {
      id: 'i-sso-scim',
      title: 'SSO + SCIM provisioning for Enterprise',
      segment: 'Enterprise',
      theme: 'enterprise',
      effort: 10,
      value: 84,
      risk: 35,
      confidence: 64,
      mustDo: true,
      revenue: true,
      retention: true,
      notes: 'Blocks 4 enterprise expansions currently stuck in security review; reduces implementation burden for IT.',
      stakeholders: ['Sales', 'Security'],
      dependencies: ['IdP partner testing'],
    },
    {
      id: 'i-billing-proration',
      title: 'Billing proration + invoice corrections',
      segment: 'Mid-market',
      theme: 'billing',
      effort: 7,
      value: 68,
      risk: 42,
      confidence: 58,
      mustDo: false,
      revenue: true,
      retention: true,
      notes: 'Cuts ticket volume from finance teams and avoids escalations during plan changes; improves trust in billing.',
      stakeholders: ['Finance Ops', 'Support'],
      dependencies: ['Payments provider constraints'],
    },
    {
      id: 'i-audit-log-export',
      title: 'Audit log export + retention controls',
      segment: 'Enterprise',
      theme: 'trust',
      effort: 5,
      value: 55,
      risk: 22,
      confidence: 82,
      mustDo: false,
      revenue: false,
      retention: true,
      notes: 'Prevents churn risk for regulated customers; simplifies security reviews and renewal questionnaires.',
      stakeholders: ['Security', 'Customer Success'],
      dependencies: [],
    },
    {
      id: 'i-inapp-nps-routing',
      title: 'In-app NPS routing to product areas',
      segment: 'All',
      theme: 'feedback',
      effort: 4,
      value: 46,
      risk: 18,
      confidence: 71,
      mustDo: false,
      revenue: false,
      retention: true,
      notes: 'Routes verbatims by module to speed closure; supports quarterly “you said / we did” narrative.',
      stakeholders: ['Product Ops', 'CX'],
      dependencies: [],
    },
    {
      id: 'i-search-performance',
      title: 'Search performance + relevance upgrade',
      segment: 'All',
      theme: 'core',
      effort: 8,
      value: 74,
      risk: 48,
      confidence: 53,
      mustDo: false,
      revenue: false,
      retention: true,
      notes: 'Core workflow speed; frequent complaint from power users. Risk: indexing changes may require migration plan.',
      stakeholders: ['Support', 'Design'],
      dependencies: ['Data pipeline capacity'],
    },
    {
      id: 'i-mobile-approvals',
      title: 'Mobile approvals for managers',
      segment: 'Mid-market',
      theme: 'workflow',
      effort: 6,
      value: 52,
      risk: 40,
      confidence: 60,
      mustDo: false,
      revenue: false,
      retention: true,
      notes: 'Unblocks “on the go” approvals and reduces cycle time for frontline teams; requested by 3 strategic accounts.',
      stakeholders: ['Customer Success'],
      dependencies: ['Push notifications'],
    },
    {
      id: 'i-usage-based-metering',
      title: 'Usage-based metering foundation',
      segment: 'Enterprise',
      theme: 'pricing',
      effort: 9,
      value: 78,
      risk: 55,
      confidence: 49,
      mustDo: false,
      revenue: true,
      retention: false,
      notes: 'Sets up pricing expansion; risk due to data correctness + revenue recognition review.',
      stakeholders: ['Finance', 'Sales', 'Legal'],
      dependencies: ['Event instrumentation'],
    },
    {
      id: 'i-help-center-deflection',
      title: 'Self-serve help center + ticket deflection',
      segment: 'SMB',
      theme: 'support',
      effort: 5,
      value: 50,
      risk: 28,
      confidence: 74,
      mustDo: false,
      revenue: false,
      retention: true,
      notes: 'Reduces L1 tickets; adds product-led support for smaller customers; improves CSAT for common issues.',
      stakeholders: ['Support', 'CX'],
      dependencies: ['Content staffing'],
    },
    {
      id: 'i-data-import-wizard',
      title: 'CSV import wizard with validation',
      segment: 'All',
      theme: 'activation',
      effort: 7,
      value: 69,
      risk: 33,
      confidence: 66,
      mustDo: false,
      revenue: false,
      retention: true,
      notes: 'Cuts implementation time by preventing “silent bad data” and reduces onboarding churn from failed imports.',
      stakeholders: ['Implementation', 'Support'],
      dependencies: ['Schema mapping'],
    },
    {
      id: 'i-sla-visibility',
      title: 'SLA visibility dashboard for Support',
      segment: 'Internal',
      theme: 'ops',
      effort: 4,
      value: 38,
      risk: 16,
      confidence: 80,
      mustDo: false,
      revenue: false,
      retention: true,
      notes: 'Improves on-call quality and escalations management; indirect CX benefit via faster response times.',
      stakeholders: ['Support Ops'],
      dependencies: [],
    },
    {
      id: 'i-role-based-permissions-v2',
      title: 'Role-based permissions v2 (granular)',
      segment: 'Enterprise',
      theme: 'trust',
      effort: 8,
      value: 73,
      risk: 44,
      confidence: 57,
      mustDo: true,
      revenue: true,
      retention: true,
      notes: 'Required by procurement for multiple deals; reduces “shared admin” anti-pattern driving security incidents.',
      stakeholders: ['Security', 'Sales'],
      dependencies: ['Permissions model refactor'],
    },
    {
      id: 'i-status-page-webhooks',
      title: 'Status page + incident webhooks',
      segment: 'Enterprise',
      theme: 'trust',
      effort: 5,
      value: 49,
      risk: 24,
      confidence: 76,
      mustDo: false,
      revenue: false,
      retention: true,
      notes: 'Enterprise expectation; reduces churn risk after incidents by improving proactive comms.',
      stakeholders: ['SRE', 'Customer Success'],
      dependencies: [],
    },
    {
      id: 'i-renewal-risk-model',
      title: 'Renewal risk signals in account health',
      segment: 'Mid-market',
      theme: 'retention',
      effort: 6,
      value: 58,
      risk: 41,
      confidence: 55,
      mustDo: false,
      revenue: true,
      retention: true,
      notes: 'Helps CS prioritize interventions; risk from “false positives” unless tuned with CSM feedback loop.',
      stakeholders: ['Customer Success', 'RevOps'],
      dependencies: ['Data warehouse'],
    }
  ];

  const els = {
    routeLabel: $('#routeLabel'),
    lastRun: $('#lastRun'),

    primaryMetric: $('#primaryMetric'),
    primaryMetricSub: $('#primaryMetricSub'),
    capUsed: $('#capUsed'),
    capTotal: $('#capTotal'),
    capHint: $('#capHint'),
    explainScore: $('#explainScore'),
    displacedValue: $('#displacedValue'),
    displacedHint: $('#displacedHint'),

    initiativeRows: $('#initiativeRows'),
    selectedList: $('#selectedList'),
    excludedList: $('#excludedList'),
    digestCards: $('#digestCards'),

    inspectorTitle: $('#inspectorTitle'),
    inspectorStatusText: $('#inspectorStatusText'),
    insValue: $('#insValue'),
    insEffort: $('#insEffort'),
    insRisk: $('#insRisk'),
    insConfidence: $('#insConfidence'),
    insExplain: $('#insExplain'),
    gaugeRing: $('#gaugeRing'),
    gaugeValue: $('#gaugeValue'),
    effortShareFill: $('#effortShareFill'),
    effortShareText: $('#effortShareText'),

    capRange: $('#capacityRange'),
    riskRange: $('#riskRange'),
    wipRange: $('#wipRange'),
    capInput: $('#capInput'),
    riskInput: $('#riskInput'),
    wipInput: $('#wipInput'),
    applyScenario: $('#applyScenario'),
    resetScenario: $('#resetScenario'),

    viewMode: $('#viewMode'),
    selectionPolicy: $('#selectionPolicy'),
    filterChips: $('#filterChips'),

    changeDigest: $('#changeDigest'),
    navItems: $$('.nav__item'),
  };

  const baselineScenario = {
    capacity: 30,
    riskPosture: 55, // 0..100, higher penalizes risk more
    wipLimit: 8,
    viewMode: 'portfolio',
    selectionPolicy: 'optimize', // optimize | protect
    filter: 'all',
  };

  const state = {
    route: 'board',
    scenario: { ...baselineScenario },
    pendingScenario: { ...baselineScenario },
    selectedId: initiatives[0].id,
    baselineSet: null,
    currentSet: null,
    lastDigest: [],
  };

  const severityFor = (initiative, selection) => {
    if (!selection) return 'excluded';
    if (selection.status === 'selected') return 'selected';
    if (selection.status === 'displaced') return 'displaced';
    return 'excluded';
  };

  const riskAdjustedScore = (initiative, scenario) => {
    // Risk posture: 0 = ignore risk, 100 = heavy penalty.
    // Also apply confidence as a mild stabilizer.
    const posture = clamp(scenario.riskPosture, 0, 100) / 100;
    const riskPenalty = initiative.risk * (0.35 + 0.65 * posture); // 0.35x..1.0x of risk points
    const confidenceBonus = (initiative.confidence - 50) * 0.18; // -9..+9 approx
    const base = initiative.value - riskPenalty + confidenceBonus;
    return Math.round(clamp(base, 0, 100));
  };

  const policyBonus = (initiative, scenario) => {
    if (scenario.selectionPolicy === 'protect') {
      // Protect base: overweight retention + trust work; underweight high-risk pricing foundations.
      const protectLift = (initiative.retention ? 6 : 0) + (initiative.theme === 'trust' ? 4 : 0);
      const pricingPenalty = (initiative.theme === 'pricing' ? 7 : 0);
      return protectLift - pricingPenalty;
    }
    return 0;
  };

  const finalScore = (initiative, scenario) => {
    return clamp(riskAdjustedScore(initiative, scenario) + policyBonus(initiative, scenario), 0, 110);
  };

  const filterPass = (initiative, filter) => {
    if (filter === 'all') return true;
    if (filter === 'must-do') return initiative.mustDo;
    if (filter === 'risk') return initiative.risk >= 45;
    if (filter === 'revenue') return initiative.revenue;
    if (filter === 'retention') return initiative.retention;
    return true;
  };

  const computeSelection = (scenario, filter = 'all') => {
    const candidates = initiatives.filter(i => filterPass(i, filter));

    // Always include must-do if possible; otherwise still include in explanation as "over capacity".
    const musts = candidates.filter(i => i.mustDo);
    const nonMusts = candidates.filter(i => !i.mustDo);

    const cap = scenario.capacity;
    const wipLimit = scenario.wipLimit;

    const scored = nonMusts
      .map(i => ({ id: i.id, score: finalScore(i, scenario) }))
      .sort((a, b) => b.score - a.score);

    const byId = new Map(initiatives.map(i => [i.id, i]));

    const picked = [];
    let used = 0;

    // include musts first in descending score (still matters for explainability)
    const mustScored = musts
      .map(i => ({ id: i.id, score: finalScore(i, scenario) }))
      .sort((a, b) => b.score - a.score);

    for (const m of mustScored) {
      const item = byId.get(m.id);
      if (picked.length < wipLimit && used + item.effort <= cap) {
        picked.push({ ...m, reason: 'Must-do commitment' });
        used += item.effort;
      } else {
        // cannot include, mark as "blocked"
      }
    }

    for (const s of scored) {
      const item = byId.get(s.id);
      if (picked.length >= wipLimit) break;
      if (used + item.effort > cap) continue;
      picked.push({ ...s, reason: 'Best risk-adjusted value fit' });
      used += item.effort;
    }

    // Mark status for all candidates (even those filtered out are excluded from this run's view)
    const selectedIds = new Set(picked.map(p => p.id));
    const result = {
      scenario: { ...scenario },
      filter,
      used,
      cap,
      wipLimit,
      selected: picked.map(p => ({
        id: p.id,
        score: p.score,
        reason: p.reason
      })),
      excluded: candidates
        .filter(i => !selectedIds.has(i.id))
        .map(i => ({
          id: i.id,
          score: finalScore(i, scenario),
          reason: exclusionReason(i, scenario, used, cap, wipLimit, selectedIds, candidates)
        }))
        .sort((a, b) => b.score - a.score),
      candidates: candidates.map(i => i.id)
    };

    return result;
  };

  const exclusionReason = (initiative, scenario, used, cap, wipLimit, selectedIds, candidates) => {
    // deterministic, simple explanations
    const score = finalScore(initiative, scenario);
    const riskAdj = riskAdjustedScore(initiative, scenario);
    const posture = scenario.riskPosture;

    // capacity constraints
    if (initiative.mustDo) {
      return 'Must-do, but blocked by current capacity or WIP limit';
    }
    if (initiative.effort > cap) {
      return 'Too large to fit within total capacity by itself';
    }
    if (selectedIds.size >= wipLimit) {
      return 'WIP limit reached; would require dropping a current selection';
    }

    // risk posture / confidence
    if (posture >= 65 && initiative.risk >= 45) {
      return 'High risk under current posture; penalized vs safer alternatives';
    }
    if (initiative.confidence <= 55 && posture >= 55) {
      return 'Lower confidence under risk-averse posture; deprioritized until evidence improves';
    }

    // score-based displacement
    const topCut = candidates
      .filter(i => !i.mustDo)
      .map(i => ({ id: i.id, s: finalScore(i, scenario) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, scenario.wipLimit)
      .some(x => x.id === initiative.id);

    if (!topCut && score < riskAdj) {
      return 'Penalized by policy adjustments vs the current mix';
    }
    if (!topCut) {
      return 'Outscored by other initiatives under current constraints';
    }

    // fallback
    return 'Not selected under current constraints';
  };

  const compareSetsForDigest = (baselineSet, currentSet) => {
    const b = new Set(baselineSet.selected.map(x => x.id));
    const c = new Set(currentSet.selected.map(x => x.id));

    const displaced = [...b].filter(id => !c.has(id));
    const added = [...c].filter(id => !b.has(id));

    // compute displaced value as sum of baseline scores for displaced items
    const scoreByIdBase = new Map(
      baselineSet.selected.map(x => [x.id, x.score])
        .concat(baselineSet.excluded.map(x => [x.id, x.score]))
    );

    const displacedValue = displaced.reduce((sum, id) => sum + (scoreByIdBase.get(id) || 0), 0);

    return { displaced, added, displacedValue };
  };

  const explainabilityScore = (set) => {
    // Heuristic: score up if must-dos are included; score down if many excluded are close in score to selected.
    const selectedScores = set.selected.map(x => x.score);
    const excludedScores = set.excluded.map(x => x.score);

    const avgSel = selectedScores.length ? selectedScores.reduce((a, b) => a + b, 0) / selectedScores.length : 0;
    const avgEx = excludedScores.length ? excludedScores.reduce((a, b) => a + b, 0) / excludedScores.length : 0;

    const separation = clamp((avgSel - avgEx) * 1.4, 0, 40); // up to 40
    const mustCoverage = (() => {
      const musts = initiatives.filter(i => i.mustDo).map(i => i.id);
      if (!musts.length) return 25;
      const sel = new Set(set.selected.map(x => x.id));
      const included = musts.filter(id => sel.has(id)).length;
      return clamp((included / musts.length) * 35, 0, 35);
    })();

    const tightnessPenalty = (() => {
      // if many excluded are within 5 points of the weakest selected, debate risk increases
      if (!selectedScores.length) return 30;
      const minSel = Math.min(...selectedScores);
      const nearMiss = excludedScores.filter(s => s >= minSel - 5).length;
      return clamp(nearMiss * 6, 0, 30);
    })();

    const total = clamp(Math.round(30 + separation + mustCoverage - tightnessPenalty), 0, 100);
    return total;
  };

  const gaugeColorFor = (v) => {
    // thresholds: >=70 green, 45-69 warning, <45 danger
    if (v >= 70) return getComputedStyle(document.documentElement).getPropertyValue('--color-ok').trim();
    if (v >= 45) return getComputedStyle(document.documentElement).getPropertyValue('--color-warn').trim();
    return getComputedStyle(document.documentElement).getPropertyValue('--color-danger').trim();
  };

  const renderTable = (set) => {
    const selected = new Map(set.selected.map(x => [x.id, x]));
    const excluded = new Map(set.excluded.map(x => [x.id, x]));

    const rows = initiatives
      .filter(i => filterPass(i, state.scenario.filter))
      .map(i => {
        const sel = selected.get(i.id);
        const ex = excluded.get(i.id);
        const status = sel ? 'SELECTED' : 'EXCLUDED';
        const score = sel ? sel.score : (ex ? ex.score : finalScore(i, state.scenario));
        const riskAdj = riskAdjustedScore(i, state.scenario);
        const highRisk = i.risk >= 45;

        // badges: ok/warn/danger chips (pills), with distinct colors
        const badgeClass = sel ? 'badge--ok' : (highRisk ? 'badge--danger' : 'badge--warn');
        const badgeText = sel ? 'SELECTED' : (highRisk ? 'HIGH RISK' : 'EXCLUDED');

        return `
          <tr data-id="${i.id}" class="${i.id === state.selectedId ? 'is-selected' : ''}">
            <td>
              <div class="item-title">${escapeHtml(i.title)}</div>
              <div class="caption">${escapeHtml(i.theme.toUpperCase())} • ${escapeHtml(i.notes)}</div>
            </td>
            <td><span class="tag">${escapeHtml(i.segment)}</span><span class="tag">${escapeHtml(i.theme)}</span></td>
            <td class="mono">${i.effort}</td>
            <td class="mono">${score}</td>
            <td class="mono">${i.risk}</td>
            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
          </tr>
        `;
      });

    els.initiativeRows.innerHTML = rows.join('');

    $$('#initiativeRows tr').forEach(tr => {
      tr.addEventListener('click', () => {
        const id = tr.getAttribute('data-id');
        state.selectedId = id;
        renderAll();
      });
    });
  };

  const renderListsAndDigest = (baselineSet, currentSet) => {
    const byId = new Map(initiatives.map(i => [i.id, i]));

    const { displaced, added, displacedValue } = compareSetsForDigest(baselineSet, currentSet);

    // For list classification, mark displaced as "displaced", current selected as "selected", otherwise excluded.
    const currentSelected = new Set(currentSet.selected.map(x => x.id));
    const displacedSet = new Set(displaced);

    const selectedHtml = currentSet.selected
      .slice()
      .sort((a, b) => b.score - a.score)
      .map(s => {
        const i = byId.get(s.id);
        const klass = 'item-card is-selected';
        return itemCardHtml(i, s.score, 'SELECTED', klass, s.reason);
      }).join('');

    const excludedMerged = [
      ...displaced.map(id => ({
        id,
        score: baselineSet.selected.find(x => x.id === id)?.score ?? finalScore(byId.get(id), currentSet.scenario),
        kind: 'DISPLACED'
      })),
      ...currentSet.excluded
        .filter(x => !displacedSet.has(x.id))
        .map(x => ({ ...x, kind: 'EXCLUDED' }))
    ]
      .sort((a, b) => (b.score - a.score));

    const excludedHtml = excludedMerged.map(x => {
      const i = byId.get(x.id);
      const klass = x.kind === 'DISPLACED'
        ? 'item-card is-displaced'
        : (i.risk >= 45 ? 'item-card is-excluded' : 'item-card is-excluded');
      const reason = x.kind === 'DISPLACED'
        ? 'Was in baseline set; removed after constraint changes'
        : x.reason;
      return itemCardHtml(i, x.score, x.kind, klass, reason);
    }).join('');

    els.selectedList.innerHTML = selectedHtml || `<div class="caption">No items selected under current constraints.</div>`;
    els.excludedList.innerHTML = excludedHtml || `<div class="caption">No items excluded under current constraints.</div>`;

    // Digest cards (3 max) with gold accent used for the one number that matters most: displaced value
    const digest = buildDigest(baselineSet, currentSet);
    state.lastDigest = digest.cards;

    els.displacedValue.textContent = String(displacedValue);
    els.displacedHint.textContent = displaced.length
      ? `${displaced.length} initiatives displaced from baseline`
      : 'No displacement vs baseline';

    els.digestCards.innerHTML = digest.cards.map(card => {
      return `
        <div class="digest">
          <div class="digest__label">${escapeHtml(card.label)}</div>
          <div class="digest__value">${escapeHtml(card.value)}</div>
          <div class="digest__text">${escapeHtml(card.text)}</div>
        </div>
      `;
    }).join('');

    els.changeDigest.textContent = digest.summary;
  };

  const buildDigest = (baselineSet, currentSet) => {
    const byId = new Map(initiatives.map(i => [i.id, i]));
    const { displaced, added, displacedValue } = compareSetsForDigest(baselineSet, currentSet);

    const cards = [];

    cards.push({
      label: 'DISPLACED VALUE',
      value: String(displacedValue),
      text: displaced.length
        ? `Baseline work removed due to new constraints (${displaced.length} displaced)`
        : 'No baseline work displaced under current constraints'
    });

    cards.push({
      label: 'ADDED BETS',
      value: String(added.length),
      text: added.length
        ? `Newly selected: ${added.map(id => byId.get(id).title).slice(0, 2).join(' • ')}${added.length > 2 ? ' • …' : ''}`
        : 'No new initiatives added vs baseline'
    });

    const capDelta = currentSet.cap - baselineSet.cap;
    const riskDelta = currentSet.scenario.riskPosture - baselineSet.scenario.riskPosture;
    const wipDelta = currentSet.wipLimit - baselineSet.wipLimit;

    cards.push({
      label: 'CONSTRAINT SHIFT',
      value: `${capDelta >= 0 ? '+' : ''}${capDelta} CAP`,
      text: `Risk posture ${riskDelta >= 0 ? '↑' : '↓'} ${Math.abs(riskDelta)} • WIP ${wipDelta >= 0 ? '↑' : '↓'} ${Math.abs(wipDelta)}`
    });

    const summary = (displaced.length || added.length || capDelta || riskDelta || wipDelta)
      ? `Scenario applied. ${added.length ? `${added.length} added` : '0 added'}, ${displaced.length ? `${displaced.length} displaced` : '0 displaced'}.`
      : 'No changes yet. Move a constraint to generate a displacement digest.';

    return { cards, summary };
  };

  const itemCardHtml = (i, score, kind, klass, reason) => {
    const badges = (() => {
      if (kind === 'SELECTED') return `<span class="badge badge--ok">SELECTED</span>`;
      if (kind === 'DISPLACED') return `<span class="badge badge--danger">DISPLACED</span>`;
      return `<span class="badge badge--warn">EXCLUDED</span>`;
    })();

    return `
      <div class="${klass}" data-id="${i.id}">
        <div class="item-card__top">
          <div>
            <div class="item-card__title">${escapeHtml(i.title)}</div>
            <div class="item-card__meta">
              <span><strong>SEGMENT</strong> ${escapeHtml(i.segment)}</span>
              <span><strong>EFFORT</strong> ${i.effort}</span>
              <span><strong>SCORE</strong> ${score}</span>
            </div>
          </div>
          <div>${badges}</div>
        </div>
        <div class="caption" style="margin-top:10px;">${escapeHtml(reason)}</div>
      </div>
    `;
  };

  const renderInspector = (set) => {
    const byId = new Map(initiatives.map(i => [i.id, i]));
    const i = byId.get(state.selectedId) || initiatives[0];

    const selectedMap = new Map(set.selected.map(x => [x.id, x]));
    const excludedMap = new Map(set.excluded.map(x => [x.id, x]));
    const baselineSelected = new Set(state.baselineSet.selected.map(x => x.id));

    const isSelected = selectedMap.has(i.id);
    const isDisplaced = baselineSelected.has(i.id) && !isSelected;
    const isExcluded = !isSelected;

    els.inspectorTitle.textContent = i.title;

    const statusText = isSelected
      ? 'In the selected set under current constraints.'
      : (isDisplaced
        ? 'Removed from the baseline set due to constraint changes.'
        : 'Not selected under current constraints.');

    els.inspectorStatusText.textContent = statusText;

    // Show all three badges; visually they exist per spec, but we highlight via opacity for current state.
    const badgeSelected = $('#badgeSelected');
    const badgeExcluded = $('#badgeExcluded');
    const badgeDisplaced = $('#badgeDisplaced');

    [badgeSelected, badgeExcluded, badgeDisplaced].forEach(b => b.style.opacity = '0.35');
    if (isSelected) badgeSelected.style.opacity = '1';
    else if (isDisplaced) badgeDisplaced.style.opacity = '1';
    else badgeExcluded.style.opacity = '1';

    const v = i.value;
    const e = i.effort;
    const r = i.risk;
    const c = i.confidence;

    els.insValue.textContent = String(v);
    els.insEffort.textContent = String(e);
    els.insRisk.textContent = String(r);
    els.insConfidence.textContent = String(c);

    const riskAdj = riskAdjustedScore(i, state.scenario);
    const score = finalScore(i, state.scenario);

    els.gaugeValue.textContent = String(riskAdj);

    const ringColor = gaugeColorFor(riskAdj);
    const pct = clamp(riskAdj, 0, 100);
    els.gaugeRing.style.background = `conic-gradient(${ringColor} 0deg, ${ringColor} ${Math.round(pct * 3.6)}deg, var(--color-border) ${Math.round(pct * 3.6)}deg, var(--color-border) 360deg)`;

    const effortShare = state.scenario.capacity > 0 ? clamp((e / state.scenario.capacity) * 100, 0, 100) : 0;
    els.effortShareFill.style.width = `${effortShare.toFixed(0)}%`;
    els.effortShareText.textContent = `${effortShare.toFixed(0)}% of capacity`;

    // Bar color thresholds on effort share: >=30 red, >=18 yellow, else black
    const fillColor = effortShare >= 30
      ? getComputedStyle(document.documentElement).getPropertyValue('--color-danger').trim()
      : (effortShare >= 18
        ? getComputedStyle(document.documentElement).getPropertyValue('--color-warn').trim()
        : getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim());
    els.effortShareFill.style.background = fillColor;

    const why = buildInspectorExplanation(i, set, score, riskAdj, isSelected, isDisplaced);
    els.insExplain.textContent = why;
  };

  const buildInspectorExplanation = (i, set, score, riskAdj, isSelected, isDisplaced) => {
    const scenario = set.scenario;
    const posture = scenario.riskPosture;

    const policyLine = scenario.selectionPolicy === 'protect'
      ? 'Policy = Protect Base (retention/trust weighted; risky foundations discounted).'
      : 'Policy = Optimize (pure risk-adjusted value fit).';

    const constraintLine = `Constraints: capacity ${scenario.capacity} person-weeks • WIP ${scenario.wipLimit} initiatives • risk posture ${scenario.riskPosture}/100.`;

    if (isSelected) {
      const rank = set.selected
        .slice()
        .sort((a, b) => b.score - a.score)
        .findIndex(x => x.id === i.id) + 1;

      return `${policyLine} ${constraintLine} Selected at rank #${rank} because it fits capacity and scores ${score} (risk-adjusted ${riskAdj}).`;
    }

    if (isDisplaced) {
      return `${policyLine} ${constraintLine} Displaced from the baseline set—its score (${score}) lost to higher-fit alternatives once the constraints shifted.`;
    }

    if (posture >= 65 && i.risk >= 45) {
      return `${policyLine} ${constraintLine} Excluded primarily due to risk penalty (risk ${i.risk}) under the current posture; risk-adjusted score is ${riskAdj}.`;
    }

    if (i.mustDo) {
      return `${policyLine} ${constraintLine} Marked must-do, but cannot fit given current capacity/WIP. If this is truly non-negotiable, increase capacity or reduce WIP pressure elsewhere.`;
    }

    return `${policyLine} ${constraintLine} Excluded because the selected set achieved a better score-per-effort mix; this item scores ${score} (risk-adjusted ${riskAdj}).`;
  };

  const renderHeroMetrics = (set) => {
    els.primaryMetric.textContent = String(set.selected.length);
    els.primaryMetricSub.textContent = `Initiatives selected under current constraints`;

    els.capUsed.textContent = String(set.used);
    els.capTotal.textContent = String(set.cap);
    const utilization = set.cap ? (set.used / set.cap) * 100 : 0;
    els.capHint.textContent = `${formatPct(utilization)} utilization`;

    const exp = explainabilityScore(set);
    els.explainScore.textContent = String(exp);

    els.lastRun.textContent = nowStamp();
  };

  const renderRoute = () => {
    els.routeLabel.textContent = state.route.toUpperCase();
  };

  const renderAll = () => {
    const set = state.currentSet;
    renderRoute();
    renderHeroMetrics(set);
    renderTable(set);
    renderInspector(set);
    renderListsAndDigest(state.baselineSet, state.currentSet);

    // hook up click-to-select from list cards too
    $$('.item-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        if (id) {
          state.selectedId = id;
          renderAll();
        }
      });
    });
  };

  const setActiveSegmented = (rootEl, selector, value) => {
    $$(selector, rootEl).forEach(btn => btn.classList.toggle('is-active', btn.getAttribute('data-mode') === value || btn.getAttribute('data-policy') === value));
  };

  const setActiveChips = (value) => {
    $$('.chip', els.filterChips).forEach(ch => ch.classList.toggle('is-active', ch.getAttribute('data-filter') === value));
  };

  const wireEvents = () => {
    // nav route
    els.navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        els.navItems.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.route = btn.getAttribute('data-route') || 'board';
        renderRoute();
        // routes are informational in this prototype; we keep single canvas to avoid extra pages.
        const label = state.route.toUpperCase();
        els.changeDigest.textContent = `Viewing ${label}. Adjust constraints to update selection and the displacement digest.`;
      });
    });

    // pending scenario sliders update UI
    const syncPending = () => {
      els.capInput.textContent = String(state.pendingScenario.capacity);
      els.riskInput.textContent = String(state.pendingScenario.riskPosture);
      els.wipInput.textContent = String(state.pendingScenario.wipLimit);
    };

    els.capRange.addEventListener('input', (e) => {
      state.pendingScenario.capacity = Number(e.target.value);
      syncPending();
    });
    els.riskRange.addEventListener('input', (e) => {
      state.pendingScenario.riskPosture = Number(e.target.value);
      syncPending();
    });
    els.wipRange.addEventListener('input', (e) => {
      state.pendingScenario.wipLimit = Number(e.target.value);
      syncPending();
    });

    els.applyScenario.addEventListener('click', () => {
      state.scenario = { ...state.scenario, ...state.pendingScenario };
      state.currentSet = computeSelection(state.scenario, state.scenario.filter);
      renderAll();
    });

    els.resetScenario.addEventListener('click', () => {
      state.scenario = { ...baselineScenario };
      state.pendingScenario = { ...baselineScenario };
      els.capRange.value = String(state.pendingScenario.capacity);
      els.riskRange.value = String(state.pendingScenario.riskPosture);
      els.wipRange.value = String(state.pendingScenario.wipLimit);
      syncPending();
      setActiveSegmented(els.viewMode, '.segmented__btn', state.scenario.viewMode);
      setActiveSegmented(els.selectionPolicy, '.segmented__btn', state.scenario.selectionPolicy);
      setActiveChips(state.scenario.filter);
      state.currentSet = computeSelection(state.scenario, state.scenario.filter);
      renderAll();
    });

    // view mode toggle (changes table note + segment emphasis)
    $$('.segmented__btn', els.viewMode).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.segmented__btn', els.viewMode).forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.scenario.viewMode = btn.getAttribute('data-mode');
        state.pendingScenario.viewMode = state.scenario.viewMode;

        const note = state.scenario.viewMode === 'by-segment'
          ? 'Mode: By Segment. Use this to sanity-check that one segment is not overrepresented.'
          : 'Mode: Portfolio. Use this to maximize total impact under constraints.';
        $('#tableFootnote').textContent = note;

        // no re-run needed, but we do to keep “last run” honest with view changes
        state.currentSet = computeSelection(state.scenario, state.scenario.filter);
        renderAll();
      });
    });

    // selection policy toggle
    $$('.segmented__btn', els.selectionPolicy).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.segmented__btn', els.selectionPolicy).forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.scenario.selectionPolicy = btn.getAttribute('data-policy');
        state.pendingScenario.selectionPolicy = state.scenario.selectionPolicy;

        state.currentSet = computeSelection(state.scenario, state.scenario.filter);
        renderAll();
      });
    });

    // filter chips
    $$('.chip', els.filterChips).forEach(ch => {
      ch.addEventListener('click', () => {
        const f = ch.getAttribute('data-filter');
        state.scenario.filter = f;
        state.pendingScenario.filter = f;
        setActiveChips(f);

        state.currentSet = computeSelection(state.scenario, state.scenario.filter);
        // ensure selectedId remains visible; otherwise select first candidate
        const visibleIds = new Set(initiatives.filter(i => filterPass(i, f)).map(i => i.id));
        if (!visibleIds.has(state.selectedId)) {
          state.selectedId = initiatives.find(i => visibleIds.has(i.id))?.id || initiatives[0].id;
        }
        renderAll();
      });
    });
  };

  const escapeHtml = (str) => {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  const init = () => {
    // baseline set is fixed for displacement comparisons
    state.baselineSet = computeSelection({ ...baselineScenario }, baselineScenario.filter);
    state.currentSet = computeSelection({ ...baselineScenario }, baselineScenario.filter);
    state.pendingScenario = { ...baselineScenario };

    els.capRange.value = String(state.pendingScenario.capacity);
    els.riskRange.value = String(state.pendingScenario.riskPosture);
    els.wipRange.value = String(state.pendingScenario.wipLimit);

    els.capInput.textContent = String(state.pendingScenario.capacity);
    els.riskInput.textContent = String(state.pendingScenario.riskPosture);
    els.wipInput.textContent = String(state.pendingScenario.wipLimit);

    renderAll();
    wireEvents();
  };

  init();
})();