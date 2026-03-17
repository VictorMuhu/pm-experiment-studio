(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function fmtPct(x, digits = 0) {
    const v = (x * 100);
    return `${v.toFixed(digits)}%`;
  }

  function mmss(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  }

  function nowTs() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  function wordCount(s) {
    const t = String(s || '').trim();
    if (!t) return 0;
    return t.split(/\s+/).length;
  }

  function scoreColor(score) {
    if (score >= 80) return getComputedStyle(document.documentElement).getPropertyValue('--color-positive').trim();
    if (score >= 60) return getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim();
    return getComputedStyle(document.documentElement).getPropertyValue('--color-negative').trim();
  }

  function gradeLabel(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  const seeded = {
    scenarios: [
      {
        id: 'scn-renewals-403',
        title: 'Renewal risk: SSO failures spiking',
        type: 'incident-adjacent',
        severity: 'critical',
        context: 'Mid-market accounts • Security • Q-end',
        narrative: [
          'Sales says two renewals are “blocked” until Okta login is stable. Support sees intermittent 403s since last Friday.',
          'Eng notes auth service deploy was merged with “low risk” refactor. Rollback is possible but may regress audit logging.',
          'Leadership asks for a decision today: rollback now, hotfix tomorrow, or hold and gather more data.'
        ],
        constraints: [
          { id: 'c-reliability', label: 'Reliability first', weight: 5, desc: 'Minimize customer-facing errors; reduce incident risk.', kind: 'reliability' },
          { id: 'c-ship-window', label: 'Must ship within 48h', weight: 4, desc: 'A decision that doesn’t produce a change quickly is not acceptable.', kind: 'time' },
          { id: 'c-low-eng', label: 'Low eng capacity', weight: 4, desc: 'Team is at sprint limit; prefer reversible actions.', kind: 'capacity' },
          { id: 'c-rev-protect', label: 'Protect near-term revenue', weight: 5, desc: 'Renewals and expansion deals take priority.', kind: 'revenue' },
          { id: 'c-compliance', label: 'No compliance regression', weight: 3, desc: 'Audit logging and access trails cannot be compromised.', kind: 'compliance' },
          { id: 'c-cs-load', label: 'Reduce support load', weight: 3, desc: 'Avoid creating more tickets or manual workarounds.', kind: 'support' }
        ],
        signals: [
          {
            id: 'sig-rev-1',
            lane: 'revenue',
            title: 'Renewal at risk (2 accounts)',
            severity: 'high',
            body: 'AEs report “can’t access the app reliably” during exec review. One renewal is $420k ARR. Decision deadline: Wednesday.',
            metrics: [
              { k: 'ARR at risk', v: '$620k' },
              { k: 'Deadline', v: '3 days' },
              { k: 'Stage', v: 'legal/procurement' }
            ]
          },
          {
            id: 'sig-support-1',
            lane: 'support',
            title: 'Ticket spike: intermittent 403 on SSO',
            severity: 'high',
            body: '47 tickets since Friday. Pattern: okta callback → 403 on session exchange. Workaround: retry 2–3 times.',
            metrics: [
              { k: 'Tickets (72h)', v: '47' },
              { k: 'First response', v: '1h 12m' },
              { k: 'Deflection', v: 'low' }
            ]
          },
          {
            id: 'sig-eng-1',
            lane: 'eng',
            title: 'Auth service deploy correlation',
            severity: 'medium',
            body: 'Errors rose after a refactor that touched token parsing. Rollback is safe but removes improved audit event naming.',
            metrics: [
              { k: 'Error rate', v: '1.9% → 6.4%' },
              { k: 'Rollback time', v: '30m' },
              { k: 'Confidence', v: '0.7' }
            ]
          },
          {
            id: 'sig-eng-2',
            lane: 'eng',
            title: 'On-call capacity constrained',
            severity: 'medium',
            body: 'Two engineers are out; the team has an enterprise migration this week. Any high-risk change increases incident likelihood.',
            metrics: [
              { k: 'On-call', v: '1 primary' },
              { k: 'Planned work', v: 'migration' },
              { k: 'Risk tolerance', v: 'low' }
            ]
          }
        ],
        actions: [
          {
            id: 'act-rollback',
            title: 'Rollback auth refactor now',
            desc: 'Immediate error-rate relief; accept losing audit event naming improvement until reintroduced safely.',
            risk: 2,
            tags: ['reliability', 'time', 'reversible'],
            fits: { good: ['c-reliability', 'c-ship-window', 'c-low-eng', 'c-rev-protect', 'c-cs-load'], risk: ['c-compliance'], bad: [] }
          },
          {
            id: 'act-hotfix',
            title: 'Ship a targeted hotfix tomorrow',
            desc: 'Keep audit naming change; patch suspected parsing regression. Higher change risk with limited on-call bandwidth.',
            risk: 4,
            tags: ['reliability', 'engineering-risk', 'time'],
            fits: { good: ['c-reliability', 'c-ship-window', 'c-rev-protect'], risk: ['c-low-eng', 'c-cs-load', 'c-compliance'], bad: [] }
          },
          {
            id: 'act-hold',
            title: 'Hold changes, collect more logs',
            desc: 'Ask for 24–48h of data to confirm root cause; may be perceived as inaction for renewals and support.',
            risk: 3,
            tags: ['analysis', 'lower-change-risk'],
            fits: { good: ['c-compliance', 'c-low-eng'], risk: ['c-reliability'], bad: ['c-ship-window', 'c-rev-protect', 'c-cs-load'] }
          }
        ]
      },
      {
        id: 'scn-pricing-discount',
        title: 'Sales asks for blanket discount rule',
        type: 'roadmap-pressure',
        severity: 'high',
        context: 'PLG → Sales-led transition',
        narrative: [
          'Sales wants a “one-click 20% discount” for renewal saves. Finance worries it will leak into net revenue retention.',
          'Engineering says pricing code is brittle; quick changes risk billing incidents.',
          'CS says discounting without guardrails increases churn later (wrong customers, wrong expectations).'
        ],
        constraints: [
          { id: 'c-rev-quality', label: 'Revenue quality over volume', weight: 5, desc: 'NRR and margin matter more than logo count.', kind: 'revenue' },
          { id: 'c-guardrails', label: 'Guardrails required', weight: 4, desc: 'Any discount capability must have limits + approvals.', kind: 'compliance' },
          { id: 'c-no-billing-risk', label: 'No billing incidents', weight: 5, desc: 'Billing changes must be low-risk / reversible.', kind: 'reliability' },
          { id: 'c-timebox', label: 'Decision in 1 week', weight: 3, desc: 'Leadership wants movement before board prep.', kind: 'time' },
          { id: 'c-cs-trust', label: 'Protect CS trust', weight: 3, desc: 'Avoid operational churn and customer confusion.', kind: 'support' }
        ],
        signals: [
          {
            id: 'sig-rev-2',
            lane: 'revenue',
            title: 'Save playbooks underperforming',
            severity: 'medium',
            body: 'Save offers are inconsistent across AEs. Some deals save at 5%, others at 30% with no approval path.',
            metrics: [
              { k: 'Save rate', v: '18%' },
              { k: 'Variance', v: 'high' },
              { k: 'NRR impact', v: 'unclear' }
            ]
          },
          {
            id: 'sig-eng-3',
            lane: 'eng',
            title: 'Pricing code path is fragile',
            severity: 'high',
            body: 'Recent billing regression took 9 hours to resolve. Team proposes feature-flagged discount logic with audit logs.',
            metrics: [
              { k: 'Last incident', v: '9h' },
              { k: 'Rollback', v: 'hard' },
              { k: 'Test coverage', v: '68%' }
            ]
          },
          {
            id: 'sig-support-2',
            lane: 'support',
            title: 'CS workload risk',
            severity: 'medium',
            body: 'Discount exceptions create contract ambiguity and ticket volume (invoice questions, renewal terms confusion).',
            metrics: [
              { k: 'Billing tickets', v: '+22% QoQ' },
              { k: 'Contract variance', v: 'rising' },
              { k: 'CSAT', v: '4.3 → 4.1' }
            ]
          }
        ],
        actions: [
          {
            id: 'act-guarded',
            title: 'Ship guarded discounts (limits + approvals)',
            desc: 'Add a discount tool with max % caps, approval workflow, and audit trail. Start with renewals only.',
            risk: 3,
            tags: ['guardrails', 'revenue', 'compliance'],
            fits: { good: ['c-guardrails', 'c-rev-quality', 'c-timebox', 'c-cs-trust'], risk: ['c-no-billing-risk'], bad: [] }
          },
          {
            id: 'act-blanket',
            title: 'Blanket 20% discount button',
            desc: 'Fastest to ship, biggest leakage risk. Likely creates billing/contract ambiguity.',
            risk: 5,
            tags: ['speed', 'risk', 'sales'],
            fits: { good: ['c-timebox'], risk: [], bad: ['c-rev-quality', 'c-guardrails', 'c-no-billing-risk', 'c-cs-trust'] }
          },
          {
            id: 'act-process',
            title: 'No product change: discount policy + enablement',
            desc: 'Define discount bands, approvals, and scripts in ops; revisit product after observing policy adherence.',
            risk: 2,
            tags: ['process', 'low-risk'],
            fits: { good: ['c-no-billing-risk', 'c-guardrails', 'c-rev-quality'], risk: ['c-timebox'], bad: [] }
          }
        ]
      },
      {
        id: 'scn-api-rate-limits',
        title: 'API rate limits causing enterprise escalations',
        type: 'platform',
        severity: 'high',
        context: 'Integrations • Top 10 customers',
        narrative: [
          'An enterprise customer is hitting rate limits on a nightly job and threatening escalation. Support says it happens weekly.',
          'Eng says current limiter is global and not tenant-aware. Fixing properly requires deeper work.',
          'Leadership wants a “customer-facing commitment” by EOD.'
        ],
        constraints: [
          { id: 'c-enterprise', label: 'Protect top-10 enterprise', weight: 5, desc: 'Enterprise stability + trust are non-negotiable.', kind: 'revenue' },
          { id: 'c-no-new-incidents', label: 'No new production incidents', weight: 5, desc: 'Avoid changes that could destabilize API.', kind: 'reliability' },
          { id: 'c-fast-commit', label: 'Commit by EOD', weight: 4, desc: 'Need a credible plan to communicate quickly.', kind: 'time' },
          { id: 'c-fairness', label: 'Fairness across tenants', weight: 3, desc: 'Avoid punishing smaller customers; limit abusers.', kind: 'compliance' },
          { id: 'c-eng-bandwidth', label: 'Eng bandwidth tight', weight: 4, desc: 'Infra team is mid-migration; prefer incremental.', kind: 'capacity' }
        ],
        signals: [
          {
            id: 'sig-rev-3',
            lane: 'revenue',
            title: 'Escalation: procurement review risk',
            severity: 'high',
            body: 'Customer’s VP Eng asked for an SLA-like commitment. Procurement is reviewing renewal language next week.',
            metrics: [
              { k: 'ARR', v: '$1.3M' },
              { k: 'Escalation', v: 'executive' },
              { k: 'Renewal', v: '14 days' }
            ]
          },
          {
            id: 'sig-eng-4',
            lane: 'eng',
            title: 'Limiter is global, not tenant-aware',
            severity: 'high',
            body: 'Fix options: quick per-tenant allowlist, or build tenant-aware limiter (2–3 weeks). Both need careful testing.',
            metrics: [
              { k: 'Proper fix', v: '2–3 wks' },
              { k: 'Quick fix', v: '1–2 days' },
              { k: 'Blast radius', v: 'medium' }
            ]
          },
          {
            id: 'sig-support-3',
            lane: 'support',
            title: 'Weekly incident pattern',
            severity: 'medium',
            body: 'Support sees the same integration job pattern each week. They can provide request IDs and timestamps.',
            metrics: [
              { k: 'Frequency', v: 'weekly' },
              { k: 'Time window', v: '01:00–03:00' },
              { k: 'Workaround', v: 'manual rerun' }
            ]
          }
        ],
        actions: [
          {
            id: 'act-allowlist',
            title: 'Temporary allowlist + instrumentation',
            desc: 'Increase limits for the impacted enterprise tenant, add tracing, and commit to a tenant-aware limiter proposal by next sprint.',
            risk: 3,
            tags: ['enterprise', 'time', 'incremental'],
            fits: { good: ['c-enterprise', 'c-fast-commit', 'c-eng-bandwidth'], risk: ['c-fairness', 'c-no-new-incidents'], bad: [] }
          },
          {
            id: 'act-tenant-limiter',
            title: 'Start tenant-aware limiter immediately',
            desc: 'Treat as platform priority: pause other infra work, build tenant-aware limiter with careful staging.',
            risk: 4,
            tags: ['platform', 'reliability', 'bigger-swing'],
            fits: { good: ['c-enterprise', 'c-fairness'], risk: ['c-eng-bandwidth', 'c-fast-commit'], bad: [] }
          },
          {
            id: 'act-policy',
            title: 'No product change: propose job scheduling guidance',
            desc: 'Ask customer to shift job and reduce concurrency. Cheapest, but risks trust and doesn’t remove weekly pattern.',
            risk: 2,
            tags: ['process', 'low-eng'],
            fits: { good: ['c-eng-bandwidth', 'c-no-new-incidents'], risk: ['c-fast-commit'], bad: ['c-enterprise'] }
          }
        ]
      }
    ]
  };

  const rubric = {
    contradictionPenalty: 12,
    riskPenaltyPerPoint: 4,
    missingFieldPenalty: 8,
    stressMultiplier: 1.25
  };

  const appState = {
    mode: 'run',
    stress: false,
    running: false,
    locked: false,
    durationSec: 10 * 60,
    remainingSec: 10 * 60,
    timerId: null,

    scenarioQuery: '',
    scenarioId: seeded.scenarios[0].id,

    signalFilter: 'all',
    selectedSignalId: seeded.scenarios[0].signals[0].id,

    selectedConstraintIds: [],
    selectedActionId: seeded.scenarios[0].actions[0].id,

    memo: {
      call: '',
      rationale: '',
      risks: '',
      nextSteps: '',
      nonGoals: ''
    },

    runLog: []
  };

  function getScenario() {
    return seeded.scenarios.find(s => s.id === appState.scenarioId) || seeded.scenarios[0];
  }

  function getSignals(scn) {
    const all = scn.signals;
    if (appState.signalFilter === 'all') return all;
    return all.filter(x => x.lane === appState.signalFilter);
  }

  function getSelectedSignal(scn) {
    return scn.signals.find(s => s.id === appState.selectedSignalId) || scn.signals[0];
  }

  function getSelectedAction(scn) {
    return scn.actions.find(a => a.id === appState.selectedActionId) || null;
  }

  function getSelectedConstraints(scn) {
    const map = new Map(scn.constraints.map(c => [c.id, c]));
    return appState.selectedConstraintIds.map(id => map.get(id)).filter(Boolean);
  }

  function setMode(mode) {
    appState.mode = mode;
    $('#modeRunBtn').classList.toggle('is-active', mode === 'run');
    $('#modeReviewBtn').classList.toggle('is-active', mode === 'review');

    logEvent('mode', `Switched to <b>${mode.toUpperCase()}</b>`);

    const editable = (mode === 'run') && !appState.locked;
    setMemoEditable(editable);

    if (mode === 'review') {
      stopTimer();
    }
    renderAll();
  }

  function setStress(on) {
    appState.stress = on;
    $('#stressToggleBtn').setAttribute('aria-pressed', String(on));
    $('#stressToggleBtn').classList.toggle('btn--outline', !on);
    $('#stressToggleBtn').classList.toggle('btn--ghost', on);

    const hint = on ? 'stress mode: harsher penalties' : 'normal scoring';
    $('#footerContext').textContent = hint;
    logEvent('stress', on ? 'Stress test <b>ON</b> (penalties amplified)' : 'Stress test <b>OFF</b>');
    renderKpis();
    renderInspectorFit();
    renderFlags();
  }

  function startTimer() {
    if (appState.running) return;
    if (appState.locked) return;

    appState.running = true;
    $('#startPauseLabel').textContent = 'PAUSE';
    $('#lockDecisionBtn').disabled = false;
    logEvent('timer', 'Run started');

    const tick = () => {
      appState.remainingSec = Math.max(0, appState.remainingSec - 1);
      renderTimer();
      if (appState.remainingSec <= 0) {
        stopTimer();
        lockDecision('Time expired');
      }
    };

    appState.timerId = window.setInterval(tick, 1000);
    renderTimer();
  }

  function stopTimer() {
    if (!appState.running) return;
    appState.running = false;
    $('#startPauseLabel').textContent = 'START';
    if (appState.timerId) {
      window.clearInterval(appState.timerId);
      appState.timerId = null;
    }
    logEvent('timer', 'Run paused');
    renderTimer();
  }

  function lockDecision(reason) {
    if (appState.locked) return;
    appState.locked = true;
    appState.running = false;
    if (appState.timerId) {
      window.clearInterval(appState.timerId);
      appState.timerId = null;
    }
    $('#startPauseLabel').textContent = 'START';
    $('#lockDecisionBtn').disabled = true;
    setMemoEditable(false);
    logEvent('lock', `Decision locked (${reason})`);
    renderAll();
    setMode('review');
  }

  function resetRun() {
    const scn = getScenario();
    appState.running = false;
    appState.locked = false;
    appState.remainingSec = appState.durationSec;
    if (appState.timerId) {
      window.clearInterval(appState.timerId);
      appState.timerId = null;
    }

    appState.signalFilter = 'all';
    appState.selectedSignalId = scn.signals[0]?.id || null;
    appState.selectedConstraintIds = [];
    appState.selectedActionId = scn.actions[0]?.id || null;

    // Seed memo with a realistic starting point per scenario, so it doesn't look empty.
    const seed = seededMemoForScenario(scn);
    appState.memo = { ...seed };

    appState.runLog = [];
    $('#startPauseLabel').textContent = 'START';
    $('#lockDecisionBtn').disabled = true;

    setMemoEditable(true);
    logEvent('reset', 'Run reset to seeded state');
    renderAll();
  }

  function seededMemoForScenario(scn) {
    if (scn.id === 'scn-renewals-403') {
      return {
        call: 'Rollback the auth refactor immediately; ship an audit-safe reintroduction behind a flag later this week.',
        rationale: [
          '- Error spike is customer-visible and correlated with a single deploy window.',
          '- Rollback is reversible and reduces risk with limited on-call capacity.',
          '- Revenue at risk has a near-term deadline; “wait for more data” is not credible here.'
        ].join('\n'),
        risks: [
          '- Audit event naming improvement is removed; compliance stakeholders may push back.',
          '- Rollback may uncover a different edge-case; monitor SSO success rate by tenant.',
          '- Sales may over-promise resolution; set expectations around stabilization window.'
        ].join('\n'),
        nextSteps: [
          '- Eng: rollback + verify SSO success rate and 403s within 60 minutes.',
          '- Support: update macro; ask for 3 impacted request IDs for postmortem.',
          '- Sales: notify the 2 renewal accounts of stabilization plan + follow-up ETA.',
          '- PM: schedule root-cause review; propose flagged reintroduction plan.'
        ].join('\n'),
        nonGoals: [
          '- Not redesigning SSO flow this week.',
          '- Not adding new auth features during stabilization.',
          '- Not expanding scope to non-SSO login issues.'
        ].join('\n')
      };
    }
    if (scn.id === 'scn-pricing-discount') {
      return {
        call: 'Ship guarded discounting for renewals only: capped % + approvals + audit trail, behind a feature flag.',
        rationale: [
          '- Sales needs consistency, but blanket discounts risk NRR and margin leakage.',
          '- Guardrails + audit meet finance/compliance needs and reduce CS ambiguity.',
          '- Feature-flagged path limits billing incident blast radius.'
        ].join('\n'),
        risks: [
          '- Approval workflow could slow deals; define escalation path for true saves.',
          '- Engineering risk remains in billing logic; require staging + rollback plan.',
          '- Guardrails may be bypassed via manual concessions; align with RevOps.'
        ].join('\n'),
        nextSteps: [
          '- PM/Finance: define discount bands + max caps and required approvers.',
          '- Eng: implement behind flag; add audit log + test plan; stage rollout to 2 teams.',
          '- RevOps: update playbooks + training; monitor discount variance weekly.'
        ].join('\n'),
        nonGoals: [
          '- Not enabling discounts for new business yet.',
          '- Not rebuilding pricing architecture this quarter.',
          '- Not introducing custom contract terms in-product.'
        ].join('\n')
      };
    }
    return {
      call: 'Temporarily raise limits for the impacted tenant, add instrumentation, and commit to a tenant-aware limiter proposal by next sprint.',
      rationale: [
        '- Protects the enterprise relationship while keeping change scope bounded.',
        '- Instrumentation turns weekly escalations into actionable data for the proper fix.',
        '- A credible EOD commitment is a plan + timeline, not a full platform rebuild.'
      ].join('\n'),
      risks: [
        '- Fairness risk: other tenants may perceive special treatment.',
        '- Increasing limits could mask underlying saturation; monitor latency and error rates.',
        '- Instrumentation changes can add overhead; keep it minimal and reversible.'
      ].join('\n'),
      nextSteps: [
        '- Eng: implement per-tenant allowlist behind config; add request tracing and dashboards.',
        '- Support: capture timestamps + request IDs for the weekly window.',
        '- PM: send a written commitment to customer; set milestone dates for proposal + rollout.'
      ].join('\n'),
      nonGoals: [
        '- Not promising unlimited throughput.',
        '- Not shipping tenant-aware limiter this week.',
        '- Not changing public API behavior without comms.'
      ].join('\n')
    };
  }

  function setMemoEditable(editable) {
    const ids = ['memoCall', 'memoRationale', 'memoRisks', 'memoNextSteps', 'memoNonGoals'];
    ids.forEach(id => {
      const el = $('#' + id);
      el.disabled = !editable;
    });
    $('#memoStatus').textContent = editable ? 'editable' : 'locked';
    $('#memoStatus').classList.toggle('pill--positive', editable);
    $('#memoStatus').classList.toggle('pill--warning', !editable);
  }

  function logEvent(type, message) {
    const entry = { t: nowTs(), type, message };
    appState.runLog.unshift(entry);
    appState.runLog = appState.runLog.slice(0, 12);
    renderRunLog();
  }

  function completionPct() {
    const m = appState.memo;
    const fields = [
      { k: 'call', v: m.call },
      { k: 'rationale', v: m.rationale },
      { k: 'risks', v: m.risks },
      { k: 'nextSteps', v: m.nextSteps },
      { k: 'nonGoals', v: m.nonGoals }
    ];
    const filled = fields.reduce((acc, f) => acc + (String(f.v || '').trim().length > 0 ? 1 : 0), 0);
    return filled / fields.length;
  }

  function evaluate() {
    const scn = getScenario();
    const action = getSelectedAction(scn);
    const selectedConstraints = getSelectedConstraints(scn);

    const constraintIds = new Set(selectedConstraints.map(c => c.id));
    const fit = { good: [], risk: [], bad: [] };

    if (action) {
      const g = action.fits.good || [];
      const r = action.fits.risk || [];
      const b = action.fits.bad || [];

      g.forEach(id => { if (constraintIds.has(id)) fit.good.push(id); });
      r.forEach(id => { if (constraintIds.has(id)) fit.risk.push(id); });
      b.forEach(id => { if (constraintIds.has(id)) fit.bad.push(id); });
    }

    const memoPct = completionPct();
    const missingFields = Math.round((1 - memoPct) * 5);

    const contradictionCount = fit.bad.length;
    const riskCount = fit.risk.length;

    const base = 100;
    const mult = appState.stress ? rubric.stressMultiplier : 1;

    let score = base;
    score -= contradictionCount * rubric.contradictionPenalty * mult;
    score -= (action ? action.risk : 3) * rubric.riskPenaltyPerPoint * mult;
    score -= missingFields * rubric.missingFieldPenalty * mult;

    score = clamp(Math.round(score), 0, 100);

    const selectedWeights = selectedConstraints.reduce((acc, c) => acc + c.weight, 0);
    const actionRisk = action ? action.risk : 0;

    const riskBalance = selectedWeights === 0 ? null : (selectedWeights - actionRisk * 2);
    return {
      score,
      grade: gradeLabel(score),
      contradictionCount,
      riskCount,
      missingFields,
      memoPct,
      fit,
      selectedWeights,
      actionRisk,
      riskBalance
    };
  }

  function renderTimer() {
    $('#timerValue').textContent = mmss(appState.remainingSec);
    const elapsed = appState.durationSec - appState.remainingSec;
    const pct = clamp(elapsed / appState.durationSec, 0, 1);
    $('#timerBarFill').style.width = `${pct * 100}%`;

    const warningThreshold = 90;
    const criticalThreshold = 30;

    let color = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
    if (appState.remainingSec <= criticalThreshold) color = getComputedStyle(document.documentElement).getPropertyValue('--color-negative').trim();
    else if (appState.remainingSec <= warningThreshold) color = getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim();

    $('#timerBarFill').style.background = color;
  }

  function renderScenarioTable() {
    const tbody = $('#scenarioTbody');
    tbody.innerHTML = '';

    const q = appState.scenarioQuery.trim().toLowerCase();
    const list = seeded.scenarios.filter(s => {
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        s.context.toLowerCase().includes(q)
      );
    });

    list.forEach(s => {
      const tr = document.createElement('tr');
      tr.className = (s.id === appState.scenarioId) ? 'is-selected' : '';
      tr.setAttribute('data-scenario-id', s.id);

      const tdTitle = document.createElement('td');
      tdTitle.textContent = s.title;

      const tdType = document.createElement('td');
      tdType.textContent = s.type;

      const tdSev = document.createElement('td');
      const sevPill = document.createElement('span');
      sevPill.className = 'pill mono ' + (s.severity === 'critical' ? 'pill--negative' : (s.severity === 'high' ? 'pill--warning' : 'pill--muted'));
      sevPill.textContent = s.severity;
      tdSev.appendChild(sevPill);

      const tdCtx = document.createElement('td');
      tdCtx.textContent = s.context;

      tr.appendChild(tdTitle);
      tr.appendChild(tdType);
      tr.appendChild(tdSev);
      tr.appendChild(tdCtx);

      tr.addEventListener('click', () => {
        if (appState.scenarioId === s.id) return;
        appState.scenarioId = s.id;

        const scn = getScenario();
        appState.selectedSignalId = scn.signals[0]?.id || null;
        appState.selectedActionId = scn.actions[0]?.id || null;
        appState.selectedConstraintIds = [];
        appState.signalFilter = 'all';
        appState.remainingSec = appState.durationSec;
        appState.running = false;
        appState.locked = false;
        if (appState.timerId) {
          window.clearInterval(appState.timerId);
          appState.timerId = null;
        }
        $('#startPauseLabel').textContent = 'START';
        $('#lockDecisionBtn').disabled = true;

        const seed = seededMemoForScenario(scn);
        appState.memo = { ...seed };
        setMemoEditable(true);

        logEvent('scenario', `Loaded <b>${escapeHtml(s.title)}</b>`);
        renderAll();
      });

      tbody.appendChild(tr);
    });

    $('#footerContext').textContent = appState.stress ? 'stress mode: harsher penalties' : 'normal scoring';
  }

  function renderSignals() {
    const scn = getScenario();
    const signals = getSignals(scn);

    const list = $('#signalsList');
    list.innerHTML = '';

    signals.forEach(sig => {
      const el = document.createElement('div');
      el.className = 'signal reveal ' + (sig.id === appState.selectedSignalId ? 'is-selected is-in' : '');
      el.setAttribute('data-signal-id', sig.id);
      el.setAttribute('role', 'listitem');

      const top = document.createElement('div');
      top.className = 'signal__top';

      const title = document.createElement('div');
      title.className = 'signal__title';
      title.textContent = sig.title;

      const meta = document.createElement('div');
      meta.className = 'signal__meta';

      const laneP = document.createElement('span');
      laneP.className = 'pill pill--muted mono';
      laneP.textContent = sig.lane;

      const sev = document.createElement('span');
      const sevClass =
        sig.severity === 'high' ? 'pill--warning' :
          (sig.severity === 'medium' ? 'pill--muted' : 'pill--positive');
      sev.className = 'pill mono ' + sevClass;
      sev.textContent = sig.severity;

      meta.appendChild(laneP);
      meta.appendChild(sev);

      top.appendChild(title);
      top.appendChild(meta);

      const body = document.createElement('div');
      body.className = 'signal__body';
      body.textContent = sig.body;

      const nums = document.createElement('div');
      nums.className = 'signal__numbers';

      sig.metrics.forEach(m => {
        const box = document.createElement('div');
        box.className = 'metric';

        const k = document.createElement('div');
        k.className = 'metric__k';
        k.textContent = m.k;

        const v = document.createElement('div');
        v.className = 'metric__v mono';
        v.textContent = m.v;

        box.appendChild(k);
        box.appendChild(v);
        nums.appendChild(box);
      });

      el.appendChild(top);
      el.appendChild(body);
      el.appendChild(nums);

      el.addEventListener('click', () => {
        appState.selectedSignalId = sig.id;
        logEvent('signal', `Selected signal: <b>${escapeHtml(sig.title)}</b>`);
        renderSignals();
        renderInspector();
      });

      list.appendChild(el);

      requestAnimationFrame(() => {
        el.classList.add('is-in');
      });
    });

    $('#signalsHint').textContent = `${signals.length} visible`;
  }

  function renderConstraints() {
    const scn = getScenario();
    const wrap = $('#constraintsChips');
    wrap.innerHTML = '';

    const selected = new Set(appState.selectedConstraintIds);
    const maxSelect = 3;

    scn.constraints.forEach(c => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chipBtn';
      btn.textContent = `${c.label} (${c.weight})`;
      btn.setAttribute('data-constraint-id', c.id);

      const isSelected = selected.has(c.id);
      btn.classList.toggle('is-selected', isSelected);

      const canSelect = isSelected || appState.selectedConstraintIds.length < maxSelect;
      btn.classList.toggle('is-disabled', !canSelect);
      btn.disabled = !canSelect;

      btn.addEventListener('click', () => {
        if (appState.locked) return;
        const idx = appState.selectedConstraintIds.indexOf(c.id);
        if (idx >= 0) {
          appState.selectedConstraintIds.splice(idx, 1);
          logEvent('constraint', `Removed <b>${escapeHtml(c.label)}</b>`);
        } else {
          if (appState.selectedConstraintIds.length >= maxSelect) return;
          appState.selectedConstraintIds.push(c.id);
          logEvent('constraint', `Added <b>${escapeHtml(c.label)}</b>`);
        }
        renderConstraints();
        renderInspectorFit();
        renderKpis();
        renderFlags();
      });

      wrap.appendChild(btn);
    });

    $('#constraintsCount').textContent = `${appState.selectedConstraintIds.length} selected`;
    const sum = getSelectedConstraints(scn).reduce((acc, c) => acc + c.weight, 0);
    $('#constraintWeightSum').textContent = `${sum} pts`;
  }

  function renderActions() {
    const scn = getScenario();
    const list = $('#actionsList');
    list.innerHTML = '';

    scn.actions.forEach(a => {
      const card = document.createElement('div');
      card.className = 'actionCard reveal' + (a.id === appState.selectedActionId ? ' is-selected is-in' : '');
      card.setAttribute('data-action-id', a.id);
      card.setAttribute('role', 'listitem');

      const top = document.createElement('div');
      top.className = 'actionCard__top';

      const title = document.createElement('div');
      title.className = 'actionCard__title';
      title.textContent = a.title;

      const risk = document.createElement('span');
      let riskClass = 'pill--muted';
      if (a.risk >= 4) riskClass = 'pill--negative';
      else if (a.risk === 3) riskClass = 'pill--warning';
      else if (a.risk <= 2) riskClass = 'pill--positive';
      risk.className = `pill mono ${riskClass}`;
      risk.textContent = `risk ${a.risk}/5`;

      top.appendChild(title);
      top.appendChild(risk);

      const desc = document.createElement('div');
      desc.className = 'actionCard__desc';
      desc.textContent = a.desc;

      const tags = document.createElement('div');
      tags.className = 'actionCard__tags';
      a.tags.forEach(t => {
        const pill = document.createElement('span');
        const isPrimary = (t === 'reliability' || t === 'enterprise' || t === 'guardrails');
        pill.className = 'pill mono ' + (isPrimary ? 'pill--accent' : 'pill--muted');
        pill.textContent = t;
        tags.appendChild(pill);
      });

      card.appendChild(top);
      card.appendChild(desc);
      card.appendChild(tags);

      card.addEventListener('click', () => {
        if (appState.locked) return;
        appState.selectedActionId = a.id;
        logEvent('action', `Selected action: <b>${escapeHtml(a.title)}</b>`);
        renderActions();
        renderInspector();
        renderKpis();
        renderFlags();
      });

      list.appendChild(card);
      requestAnimationFrame(() => card.classList.add('is-in'));
    });

    $('#actionsCount').textContent = appState.selectedActionId ? '1 selected' : '0 selected';
    const action = getSelectedAction(scn);
    $('#actionRisk').textContent = action ? `risk: ${action.risk}/5` : 'risk: —';
    $('#actionRisk').className = 'pill mono ' + (action ? (action.risk >= 4 ? 'pill--negative' : action.risk === 3 ? 'pill--warning' : 'pill--positive') : 'pill--warning');
  }

  function renderMemo() {
    $('#memoCall').value = appState.memo.call;
    $('#memoRationale').value = appState.memo.rationale;
    $('#memoRisks').value = appState.memo.risks;
    $('#memoNextSteps').value = appState.memo.nextSteps;
    $('#memoNonGoals').value = appState.memo.nonGoals;
    renderMemoMetrics();
  }

  function renderMemoMetrics() {
    const m = appState.memo;
    const wc = wordCount([m.call, m.rationale, m.risks, m.nextSteps, m.nonGoals].join(' '));
    $('#wordCount').textContent = `${wc} words`;

    const pct = completionPct();
    $('#memoCompletion').textContent = fmtPct(pct, 0);

    const evald = evaluate();
    $('#memoCompletion').style.color = scoreColor(Math.round(pct * 100));
    $('#memoCompletion').parentElement?.classList?.remove?.('mono');
    void evald;
  }

  function renderInspector() {
    const scn = getScenario();
    const signal = getSelectedSignal(scn);
    const action = getSelectedAction(scn);

    const focus = (() => {
      const elSig = $(`.signal.is-selected`);
      const elAct = $(`.actionCard.is-selected`);
      const elScn = $(`tr.is-selected`);

      if (elAct && action) return { type: 'action', title: action.title, sub: action.desc };
      if (elSig && signal) return { type: 'signal', title: signal.title, sub: `${signal.lane.toUpperCase()} • ${signal.severity.toUpperCase()}` };
      if (elScn) return { type: 'scenario', title: scn.title, sub: `${scn.type} • ${scn.context}` };
      return { type: 'none', title: '—', sub: 'Select a scenario, signal, or action' };
    })();

    $('#inspectorTitle').textContent = focus.title;
    $('#inspectorSub').textContent = focus.sub;

    $('#inspectorHint').textContent = focus.type.toUpperCase();
    renderInspectorFit();
    renderFlags();
  }

  function renderInspectorFit() {
    const scn = getScenario();
    const selectedConstraints = getSelectedConstraints(scn);
    const action = getSelectedAction(scn);
    const evald = evaluate();

    const byId = new Map(scn.constraints.map(c => [c.id, c]));

    const goodWrap = $('#fitGood');
    const riskWrap = $('#fitRisk');
    const badWrap = $('#fitBad');

    goodWrap.innerHTML = '';
    riskWrap.innerHTML = '';
    badWrap.innerHTML = '';

    const makePill = (id, tone) => {
      const c = byId.get(id);
      const p = document.createElement('span');
      p.className = 'pill mono ' + tone;
      p.textContent = c ? c.label : id;
      return p;
    };

    if (selectedConstraints.length === 0 || !action) {
      $('#fitCaption').textContent = 'Select constraints (up to 3) and an action to see evaluation.';
      return;
    }

    $('#fitCaption').textContent = 'Evaluation compares your claimed constraints against the trade-offs of the selected action.';

    evald.fit.good.forEach(id => goodWrap.appendChild(makePill(id, 'pill--positive')));
    evald.fit.risk.forEach(id => riskWrap.appendChild(makePill(id, 'pill--warning')));
    evald.fit.bad.forEach(id => badWrap.appendChild(makePill(id, 'pill--negative')));

    if (evald.fit.good.length === 0) goodWrap.appendChild(emptyPill('none'));
    if (evald.fit.risk.length === 0) riskWrap.appendChild(emptyPill('none'));
    if (evald.fit.bad.length === 0) badWrap.appendChild(emptyPill('none'));
  }

  function emptyPill(text) {
    const p = document.createElement('span');
    p.className = 'pill pill--muted mono';
    p.textContent = text;
    return p;
  }

  function renderFlags() {
    const scn = getScenario();
    const action = getSelectedAction(scn);
    const selectedConstraints = getSelectedConstraints(scn);
    const evald = evaluate();

    const wrap = $('#flagsList');
    wrap.innerHTML = '';

    const flags = [];

    if (selectedConstraints.length === 0) {
      flags.push({
        tone: 'risk',
        title: 'No constraints selected',
        body: 'Pick 1–3 constraints first. The simulator grades coherence against what you claim you’re optimizing for.'
      });
    } else if (selectedConstraints.length === 3) {
      flags.push({
        tone: 'good',
        title: 'Clear rubric',
        body: 'Three constraints selected. That’s enough to be explicit without covering every base.'
      });
    } else {
      flags.push({
        tone: 'risk',
        title: 'Rubric still broad',
        body: 'With 1–2 constraints, it’s easier to “pass” but harder to defend the decision in leadership review.'
      });
    }

    if (!action) {
      flags.push({
        tone: 'bad',
        title: 'No action selected',
        body: 'Choose one action. Review mode is only meaningful when a call is made.'
      });
    } else {
      if (action.risk >= 4) {
        flags.push({
          tone: 'risk',
          title: 'High-change-risk action',
          body: 'If you choose a risky move, your memo should explicitly name blast radius + rollback checks.'
        });
      } else if (action.risk <= 2) {
        flags.push({
          tone: 'good',
          title: 'Lower-change-risk action',
          body: 'Good fit when capacity is tight — but ensure it still addresses the core problem and urgency.'
        });
      }
    }

    if (evald.contradictionCount > 0) {
      flags.push({
        tone: 'bad',
        title: 'Constraint contradiction detected',
        body: `Your selected action contradicts ${evald.contradictionCount} of your claimed constraints. Either change the call or rewrite constraints.`
      });
    } else if (selectedConstraints.length > 0 && action) {
      flags.push({
        tone: 'good',
        title: 'No direct contradictions',
        body: 'Coherence check: your selected action does not directly violate your stated constraints.'
      });
    }

    if (evald.memoPct < 0.8 && appState.mode === 'run') {
      flags.push({
        tone: 'risk',
        title: 'Memo not yet defensible',
        body: 'Required fields are incomplete. A short, structured memo beats a long, vague one.'
      });
    }

    if (appState.stress) {
      flags.push({
        tone: 'risk',
        title: 'Stress mode amplifies penalties',
        body: 'Contradictions and missing fields cost more. This mimics a leadership readout with higher scrutiny.'
      });
    }

    flags.slice(0, 6).forEach(f => wrap.appendChild(renderFlag(f)));
  }

  function renderFlag(f) {
    const el = document.createElement('div');
    el.className = 'flag ' + (f.tone === 'good' ? 'flag--good' : f.tone === 'bad' ? 'flag--bad' : 'flag--risk');

    const top = document.createElement('div');
    top.className = 'flag__top';

    const title = document.createElement('div');
    title.className = 'flag__title';
    title.textContent = f.title;

    const badge = document.createElement('span');
    badge.className = 'pill mono ' + (f.tone === 'good' ? 'pill--positive' : f.tone === 'bad' ? 'pill--negative' : 'pill--warning');
    badge.textContent = f.tone;

    top.appendChild(title);
    top.appendChild(badge);

    const body = document.createElement('div');
    body.className = 'flag__body';
    body.textContent = f.body;

    el.appendChild(top);
    el.appendChild(body);
    return el;
  }

  function renderRunLog() {
    const wrap = $('#runLog');
    wrap.innerHTML = '';
    appState.runLog.forEach(e => {
      const row = document.createElement('div');
      row.className = 'logItem';

      const t = document.createElement('div');
      t.className = 'logItem__t';
      t.textContent = e.t;

      const m = document.createElement('div');
      m.className = 'logItem__m';
      m.innerHTML = e.message;

      row.appendChild(t);
      row.appendChild(m);
      wrap.appendChild(row);
    });
    if (appState.runLog.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'logItem';
      empty.innerHTML = `<div class="logItem__t">—</div><div class="logItem__m">No events yet. Start the run and make selections.</div>`;
      wrap.appendChild(empty);
    }
  }

  function renderKpis() {
    const evald = evaluate();

    $('#consistencyScore').textContent = String(evald.score);
    $('#gradeLabel').textContent = evald.grade;
    $('#contradictionCount').textContent = `${evald.contradictionCount} contradictions`;

    const ring = $('#consistencyRing');
    const deg = Math.round((evald.score / 100) * 360);
    const col = scoreColor(evald.score);
    ring.style.setProperty('--ring-deg', `${deg}deg`);
    ring.style.setProperty('--ring-color', col);

    const rb = evald.riskBalance;
    if (rb === null) {
      $('#riskBalance').textContent = '—';
      $('#riskBalance').style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim();
    } else {
      $('#riskBalance').textContent = `${rb >= 0 ? '+' : ''}${rb}`;
      const c = rb >= 3 ? getComputedStyle(document.documentElement).getPropertyValue('--color-positive').trim()
        : rb >= 0 ? getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim()
          : getComputedStyle(document.documentElement).getPropertyValue('--color-negative').trim();
      $('#riskBalance').style.color = c;
    }

    $('#memoCompletion').textContent = fmtPct(evald.memoPct, 0);
    $('#memoCompletion').style.color = scoreColor(Math.round(evald.memoPct * 100));

    const action = getSelectedAction(getScenario());
    const lockBtn = $('#lockDecisionBtn');
    lockBtn.disabled = !appState.running || appState.locked || !action;
  }

  function renderAll() {
    renderTimer();
    renderScenarioTable();
    renderSignals();
    renderConstraints();
    renderActions();
    renderMemo();
    renderInspector();
    renderRunLog();
    renderKpis();
    updateWorkspaceHint();
  }

  function updateWorkspaceHint() {
    const scn = getScenario();
    const evald = evaluate();
    const text = appState.locked
      ? `Locked • ${scn.title} • score ${evald.score}/100`
      : appState.running
        ? `Running • ${scn.title} • ${mmss(appState.remainingSec)} left`
        : `Paused • ${scn.title} • click START to begin`;
    $('#workspaceHint').textContent = text;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function bindEvents() {
    $('#scenarioSearch').addEventListener('input', (e) => {
      appState.scenarioQuery = e.target.value;
      renderScenarioTable();
    });

    $$('#signalsList').forEach(() => {});

    $$('.seg__btn[data-signal-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.getAttribute('data-signal-filter');
        appState.signalFilter = f;

        $$('.seg__btn[data-signal-filter]').forEach(b => b.classList.toggle('is-active', b === btn));

        const scn = getScenario();
        const filtered = getSignals(scn);
        if (filtered.length > 0 && !filtered.some(s => s.id === appState.selectedSignalId)) {
          appState.selectedSignalId = filtered[0].id;
        }

        logEvent('filter', `Signals filter: <b>${f.toUpperCase()}</b>`);
        renderSignals();
        renderInspector();
      });
    });

    $('#modeRunBtn').addEventListener('click', () => setMode('run'));
    $('#modeReviewBtn').addEventListener('click', () => setMode('review'));

    $('#stressToggleBtn').addEventListener('click', () => setStress(!appState.stress));

    $('#startPauseBtn').addEventListener('click', () => {
      if (appState.locked) return;
      if (appState.running) stopTimer();
      else startTimer();
      renderKpis();
      updateWorkspaceHint();
    });

    $('#lockDecisionBtn').addEventListener('click', () => {
      if (!appState.running) return;
      lockDecision('User locked');
    });

    $('#resetBtn').addEventListener('click', () => {
      resetRun();
    });

    const memoHandlers = [
      ['memoCall', 'call'],
      ['memoRationale', 'rationale'],
      ['memoRisks', 'risks'],
      ['memoNextSteps', 'nextSteps'],
      ['memoNonGoals', 'nonGoals']
    ];

    memoHandlers.forEach(([id, key]) => {
      const el = $('#' + id);
      el.addEventListener('input', () => {
        appState.memo[key] = el.value;
        renderMemoMetrics();
        renderKpis();
        renderFlags();
      });
      el.addEventListener('focus', () => {
        $('#inspectorTitle').textContent = 'Decision memo';
        $('#inspectorSub').textContent = `Editing ${key.toUpperCase()}`;
        $('#inspectorHint').textContent = 'MEMO';
      });
    });

    $('#copySummaryBtn').addEventListener('click', async () => {
      const scn = getScenario();
      const action = getSelectedAction(scn);
      const evald = evaluate();
      const constraints = getSelectedConstraints(scn);

      const summary = [
        `Scenario: ${scn.title}`,
        `Action: ${action ? action.title : '—'}`,
        `Constraints: ${constraints.length ? constraints.map(c => c.label).join(' | ') : '—'}`,
        `Consistency score: ${evald.score}/100 (Grade ${evald.grade})`,
        `Contradictions: ${evald.contradictionCount}`,
        '',
        'Memo — The call:',
        appState.memo.call || '—',
        '',
        'Rationale:',
        appState.memo.rationale || '—',
        '',
        'Risks:',
        appState.memo.risks || '—',
        '',
        'Next steps:',
        appState.memo.nextSteps || '—',
        '',
        'Non-goals:',
        appState.memo.nonGoals || '—'
      ].join('\n');

      try {
        await navigator.clipboard.writeText(summary);
        logEvent('copy', 'Copied run summary to clipboard');
      } catch {
        logEvent('copy', 'Clipboard blocked by browser; select and copy manually from memo fields');
      }
    });
  }

  function init() {
    // Initial seed
    const scn = getScenario();
    appState.selectedSignalId = scn.signals[0]?.id || null;
    appState.selectedActionId = scn.actions[0]?.id || null;
    appState.memo = { ...seededMemoForScenario(scn) };

    $('#timerBarFill').style.width = '0%';
    $('#timerValue').textContent = mmss(appState.remainingSec);

    setStress(false);
    setMode('run');
    bindEvents();
    renderAll();
    logEvent('ready', `Loaded seeded run: <b>${escapeHtml(scn.title)}</b>`);
  }

  init();
})();