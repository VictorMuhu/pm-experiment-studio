// all JavaScript here
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const uid = () => Math.random().toString(16).slice(2) + '-' + Math.random().toString(16).slice(2);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const minutesToLabel = (m) => `${m}m`;

  const nowISODateTime = () => {
    const d = new Date();
    const pad = (x) => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback: temporary textarea
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  };

  const demoSeed = () => {
    const runId = uid();
    return {
      run: {
        id: runId,
        name: 'Activation down: iOS sign-up completion',
        created_at: nowISODateTime(),
        metric: {
          name: 'Activation rate (D0: signup → first value)',
          direction: 'down',
          magnitude_pct: -12.4,
          window: 'Today vs 7-day trailing baseline',
          market: 'US + CA',
          platform: 'iOS',
          notes:
            'CEO pinged at 9:12. Drop started ~07:00 PT. Android stable. Web slightly down but within noise.'
        },
        recent_changes: [
          { at: '07:15', what: 'iOS 5.18.0 phased rollout increased from 10% → 25%' },
          { at: 'Yesterday 16:40', what: 'Experiment “Onboarding v3” ramped to 50% on iOS' },
          { at: 'Yesterday 12:05', what: 'Payments provider status incident (resolved) — may affect downstream funnels' }
        ],
        stakeholders: [
          { role: 'Exec', name: 'Maya (COO)', channel: '#exec-metrics' },
          { role: 'Eng Oncall', name: 'Ravi (iOS oncall)', channel: '#ios-oncall' },
          { role: 'Data', name: 'Elena (Analytics)', channel: '#analytics' },
          { role: 'Support', name: 'Kris (Support lead)', channel: '#support-ops' }
        ]
      },
      mode: 'triage',
      filter: 'open',
      sort: 'priority',
      view: 'run',
      selection: { type: 'task', id: null },
      cutScope: 'recommended',
      selectedCutId: null,
      notes: 'Initial scan: drop seems isolated to iOS and concentrated in “Create Account” step. Need to confirm if it’s eventing vs real user friction.',
      tasks: [
        {
          id: uid(),
          prio: 1,
          title: 'Confirm event integrity for iOS signup completion',
          owner: 'Analytics (Elena)',
          timebox_min: 20,
          state: 'open',
          severity: 'critical',
          rationale: 'A sudden platform-specific drop often turns out to be missing or renamed events after a mobile release.',
          queries: [
            {
              title: 'Event volume sanity',
              body: 'Check raw event counts for signup_completed on iOS vs Android for last 24h; compare to baseline.',
              code:
`-- Sanity: raw event counts by platform & app version
SELECT
  event_date,
  platform,
  app_version,
  COUNT(*) AS events
FROM analytics.events
WHERE event_name = 'signup_completed'
  AND event_date >= CURRENT_DATE - INTERVAL '2 day'
GROUP BY 1,2,3
ORDER BY 1 DESC, 2, 3;`
            },
            {
              title: 'Schema drift check',
              body: 'Verify properties expected by the activation model are still present (e.g., user_id, signup_method).',
              code:
`-- Schema drift: missing critical properties
SELECT
  platform,
  app_version,
  SUM(CASE WHEN user_id IS NULL THEN 1 ELSE 0 END) AS missing_user_id,
  SUM(CASE WHEN signup_method IS NULL THEN 1 ELSE 0 END) AS missing_signup_method,
  COUNT(*) AS total
FROM analytics.events
WHERE event_name = 'signup_completed'
  AND event_date = CURRENT_DATE
GROUP BY 1,2
ORDER BY 1,2;`
            }
          ]
        },
        {
          id: uid(),
          prio: 2,
          title: 'Segment the drop: new vs returning, geo, acquisition channel',
          owner: 'Analytics (Elena)',
          timebox_min: 30,
          state: 'open',
          severity: 'warn',
          rationale: 'If the drop is isolated to a segment (e.g., paid social, a country), the mitigation path is different from a global product bug.',
          queries: [
            {
              title: 'Activation by segment',
              body: 'Break activation by new/returning, country, and channel for today vs baseline.',
              code:
`-- Activation by key segments (today vs baseline)
WITH base AS (
  SELECT
    event_date,
    platform,
    is_new_user,
    country,
    acquisition_channel,
    COUNT(DISTINCT user_id) FILTER (WHERE did_activate = TRUE) AS activated,
    COUNT(DISTINCT user_id) AS signups
  FROM analytics.activation_daily
  WHERE event_date >= CURRENT_DATE - INTERVAL '8 day'
    AND platform = 'iOS'
  GROUP BY 1,2,3,4,5
)
SELECT
  is_new_user,
  country,
  acquisition_channel,
  ROUND(100.0 * SUM(CASE WHEN event_date = CURRENT_DATE THEN activated ELSE 0 END) /
    NULLIF(SUM(CASE WHEN event_date = CURRENT_DATE THEN signups ELSE 0 END),0), 2) AS ar_today,
  ROUND(100.0 * SUM(CASE WHEN event_date BETWEEN CURRENT_DATE - INTERVAL '7 day' AND CURRENT_DATE - INTERVAL '1 day' THEN activated ELSE 0 END) /
    NULLIF(SUM(CASE WHEN event_date BETWEEN CURRENT_DATE - INTERVAL '7 day' AND CURRENT_DATE - INTERVAL '1 day' THEN signups ELSE 0 END),0), 2) AS ar_baseline
FROM base
GROUP BY 1,2,3
ORDER BY (ar_baseline - ar_today) DESC
LIMIT 25;`
            }
          ]
        },
        {
          id: uid(),
          prio: 3,
          title: 'Check recent iOS rollout + experiment ramp for correlation',
          owner: 'iOS Oncall (Ravi)',
          timebox_min: 15,
          state: 'open',
          severity: 'critical',
          rationale: 'Timing aligns with iOS rollout and onboarding experiment ramp. A correlation check can quickly narrow the blast radius.',
          queries: [
            {
              title: 'Activation by iOS app version',
              body: 'Compare activation rate across iOS app versions for today; look for a cliff at 5.18.0.',
              code:
`-- Activation by app version (iOS)
SELECT
  app_version,
  COUNT(DISTINCT user_id) FILTER (WHERE did_activate = TRUE) AS activated,
  COUNT(DISTINCT user_id) AS signups,
  ROUND(100.0 * COUNT(DISTINCT user_id) FILTER (WHERE did_activate = TRUE) / NULLIF(COUNT(DISTINCT user_id),0), 2) AS activation_rate
FROM analytics.activation_userlevel
WHERE signup_date = CURRENT_DATE
  AND platform = 'iOS'
GROUP BY 1
ORDER BY activation_rate ASC;`
            },
            {
              title: 'Experiment impact sanity',
              body: 'Compare activation between onboarding_v3 control vs treatment for iOS today.',
              code:
`-- Experiment sanity check (not a full readout)
SELECT
  variant,
  COUNT(DISTINCT user_id) FILTER (WHERE did_activate = TRUE) AS activated,
  COUNT(DISTINCT user_id) AS exposed,
  ROUND(100.0 * COUNT(DISTINCT user_id) FILTER (WHERE did_activate = TRUE) / NULLIF(COUNT(DISTINCT user_id),0), 2) AS activation_rate
FROM experiments.onboarding_v3_daily
WHERE event_date = CURRENT_DATE
  AND platform = 'iOS'
GROUP BY 1
ORDER BY activation_rate ASC;`
            }
          ]
        },
        {
          id: uid(),
          prio: 4,
          title: 'Spot-check support tickets for signup failures',
          owner: 'Support (Kris)',
          timebox_min: 10,
          state: 'open',
          severity: 'warn',
          rationale: 'Support can confirm real user pain fast (e.g., SMS OTP not arriving, Apple sign-in errors).',
          queries: [
            {
              title: 'Support keyword scan',
              body: 'Scan last 6h tickets for “sign up”, “code”, “OTP”, “Apple”, “stuck” to identify patterns.',
              code:
`-- Support keyword scan (example)
SELECT
  created_at,
  channel,
  subject,
  LEFT(body, 180) AS snippet
FROM support.tickets
WHERE created_at >= NOW() - INTERVAL '6 hour'
  AND (LOWER(body) LIKE '%otp%' OR LOWER(body) LIKE '%sign up%' OR LOWER(body) LIKE '%apple%' OR LOWER(body) LIKE '%code%')
ORDER BY created_at DESC
LIMIT 50;`
            }
          ]
        },
        {
          id: uid(),
          prio: 5,
          title: 'Check external traffic quality shift (paid social iOS)',
          owner: 'Growth (Nia)',
          timebox_min: 20,
          state: 'blocked',
          severity: 'warn',
          rationale: 'If we suddenly changed mix (e.g., creative launch), signup intent can drop without any bug.',
          queries: [
            {
              title: 'Channel mix',
              body: 'Compare signup volume + activation by channel (paid social, search, organic) for iOS today vs baseline.',
              code:
`-- Channel mix comparison (iOS)
SELECT
  acquisition_channel,
  COUNT(DISTINCT user_id) AS signups,
  ROUND(100.0 * COUNT(DISTINCT user_id) FILTER (WHERE did_activate = TRUE) / NULLIF(COUNT(DISTINCT user_id),0), 2) AS activation_rate
FROM analytics.activation_userlevel
WHERE platform = 'iOS'
  AND signup_date = CURRENT_DATE
GROUP BY 1
ORDER BY signups DESC;`
            }
          ]
        },
        {
          id: uid(),
          prio: 6,
          title: 'Verify activation model / metric definition didn’t change',
          owner: 'Data Eng (Sam)',
          timebox_min: 25,
          state: 'open',
          severity: 'critical',
          rationale: 'If the definition changed (e.g., D0 window logic), you can get a drop without any product regression.',
          queries: [
            {
              title: 'Definition checksum',
              body: 'Confirm activation query logic and tables used in the dashboard match last week’s commit/tag.',
              code:
`-- Pseudocode: compare metric definition versions
SELECT
  metric_name,
  definition_version,
  deployed_at,
  deployed_by
FROM metrics_registry.definitions
WHERE metric_name = 'activation_rate_d0'
ORDER BY deployed_at DESC
LIMIT 5;`
            }
          ]
        }
      ],
      hypotheses: [
        {
          id: uid(),
          category: 'instrumentation',
          title: 'signup_completed event not firing for iOS 5.18.0',
          likelihood: 0.72,
          speed_min: 20,
          impact: 'high',
          rationale: 'Platform-specific, abrupt, aligns with phased rollout. If event is missing, the metric drop is mostly an illusion.',
          recommended_tasks: [1, 6],
          tags: ['[CRITICAL]']
        },
        {
          id: uid(),
          category: 'product-regression',
          title: 'Onboarding v3 treatment adds friction in “Create Account” step',
          likelihood: 0.58,
          speed_min: 30,
          impact: 'high',
          rationale: 'Experiment ramped yesterday; activation drop could be from a new screen causing drop-off on some devices/regions.',
          recommended_tasks: [3, 2],
          tags: ['[WARN]']
        },
        {
          id: uid(),
          category: 'segment-shift',
          title: 'Paid social iOS traffic shifted to lower-intent audience',
          likelihood: 0.41,
          speed_min: 20,
          impact: 'medium',
          rationale: 'If signup mix changed, activation rate falls even if product is stable. Confirm channel mix before rolling back changes.',
          recommended_tasks: [5, 2],
          tags: ['[WARN]']
        },
        {
          id: uid(),
          category: 'external-dependency',
          title: 'Apple Sign-In intermittently failing (SSO provider / iOS SDK)',
          likelihood: 0.33,
          speed_min: 15,
          impact: 'high',
          rationale: 'Support ticket scan can surface spikes in Apple login failures quickly; would explain iOS-only drop.',
          recommended_tasks: [4],
          tags: ['[WARN]']
        },
        {
          id: uid(),
          category: 'metric-definition',
          title: 'Activation pipeline lagging or definition changed',
          likelihood: 0.27,
          speed_min: 25,
          impact: 'high',
          rationale: 'If the pipeline is delayed, today’s activation can appear down. Confirm freshness and definition version before escalation.',
          recommended_tasks: [6, 1],
          tags: ['[CRITICAL]']
        }
      ],
      alerts: [
        {
          id: uid(),
          severity: 'critical',
          title: 'Pipeline freshness risk',
          body: 'Activation dashboard depends on activation_userlevel which is historically 45–90 minutes delayed after major deploys. Confirm data lag before declaring recovery.'
        },
        {
          id: uid(),
          severity: 'warn',
          title: 'Time window mismatch',
          body: 'If leadership is comparing “today so far” to a full-day baseline, the drop will look bigger than it is. Standardize: rolling 6h vs rolling 6h.'
        },
        {
          id: uid(),
          severity: 'warn',
          title: 'Sample ratio mismatch possibility',
          body: 'Onboarding v3 ramp to 50% increases SRM risk if exposure logging is broken. Check exposure counts vs allocation.'
        }
      ],
      cuts: [
        {
          id: uid(),
          title: 'Activation by app version',
          scope: 'recommended',
          question: 'Is the activation drop isolated to a specific iOS app version (e.g., 5.18.0)?',
          sql:
`SELECT
  app_version,
  COUNT(DISTINCT user_id) AS signups,
  COUNT(DISTINCT user_id) FILTER (WHERE did_activate) AS activated,
  ROUND(100.0 * COUNT(DISTINCT user_id) FILTER (WHERE did_activate) / NULLIF(COUNT(DISTINCT user_id),0), 2) AS activation_rate
FROM analytics.activation_userlevel
WHERE platform = 'iOS'
  AND signup_date >= CURRENT_DATE - INTERVAL '1 day'
GROUP BY 1
ORDER BY activation_rate ASC;`,
          notes: 'Look for a “cliff” at the rollout version. If yes, coordinate rollback or hotfix; do not average across versions.'
        },
        {
          id: uid(),
          title: 'Signup funnel step drop-off',
          scope: 'recommended',
          question: 'Which step changed: landing → create account → verify → first value?',
          sql:
`SELECT
  step_name,
  COUNT(DISTINCT user_id) AS users,
  ROUND(100.0 * COUNT(DISTINCT user_id) / NULLIF(MAX(COUNT(DISTINCT user_id)) OVER(),0), 2) AS pct_of_start
FROM analytics.signup_funnel_steps
WHERE event_date = CURRENT_DATE
  AND platform = 'iOS'
GROUP BY 1
ORDER BY users DESC;`,
          notes: 'If the loss is concentrated in a single step, route to the owning team immediately with reproduction context.'
        },
        {
          id: uid(),
          title: 'Activation by acquisition channel',
          scope: 'recommended',
          question: 'Did the traffic mix change (paid social surge, low-intent geo) causing a rate drop?',
          sql:
`SELECT
  acquisition_channel,
  COUNT(DISTINCT user_id) AS signups,
  ROUND(100.0 * COUNT(DISTINCT user_id) FILTER (WHERE did_activate) / NULLIF(COUNT(DISTINCT user_id),0), 2) AS activation_rate
FROM analytics.activation_userlevel
WHERE platform = 'iOS'
  AND signup_date = CURRENT_DATE
GROUP BY 1
ORDER BY signups DESC;`,
          notes: 'If mix changed, investigate campaign changes before rolling back product changes.'
        },
        {
          id: uid(),
          title: 'Geo + device model slice',
          scope: 'all',
          question: 'Is the drop concentrated in a country or device model (e.g., iPhone SE) indicating a device-specific regression?',
          sql:
`SELECT
  country,
  device_model,
  COUNT(DISTINCT user_id) AS signups,
  ROUND(100.0 * COUNT(DISTINCT user_id) FILTER (WHERE did_activate) / NULLIF(COUNT(DISTINCT user_id),0), 2) AS activation_rate
FROM analytics.activation_userlevel
WHERE platform = 'iOS'
  AND signup_date = CURRENT_DATE
GROUP BY 1,2
HAVING COUNT(DISTINCT user_id) >= 100
ORDER BY activation_rate ASC
LIMIT 30;`,
          notes: 'Device-specific issues often track to OS version, accessibility settings, or SDK edge cases. Ask iOS to reproduce on top devices in the slice.'
        },
        {
          id: uid(),
          title: 'Payment dependency check',
          scope: 'all',
          question: 'Is first value downstream blocked by payments provider errors (even if signup succeeds)?',
          sql:
`SELECT
  event_hour,
  provider_status,
  COUNT(*) AS attempts,
  SUM(CASE WHEN success = FALSE THEN 1 ELSE 0 END) AS failures
FROM payments.provider_events
WHERE event_time >= NOW() - INTERVAL '12 hour'
GROUP BY 1,2
ORDER BY 1 DESC;`,
          notes: 'Only relevant if activation requires a payment action. If yes, separate “signup completion” from “first value” metric effects.'
        }
      ]
    };
  };

  const State = {
    data: demoSeed()
  };

  const els = {
    runName: $('#runName'),
    confidenceValue: $('#confidenceValue'),
    completedValue: $('#completedValue'),

    metricPill: $('#metricPill'),
    windowPill: $('#windowPill'),
    directionPill: $('#directionPill'),
    magnitudePill: $('#magnitudePill'),
    runSeverityTag: $('#runSeverityTag'),
    runHint: $('#runHint'),

    taskTbody: $('#taskTbody'),
    openCount: $('#openCount'),
    blockedCount: $('#blockedCount'),
    doneCount: $('#doneCount'),

    hypList: $('#hypList'),
    gaugeNum: $('#gaugeNum'),
    gaugeCircle: $('.gauge__value'),

    selectionTag: $('#selectionTag'),
    selectionHint: $('#selectionHint'),
    selTitle: $('#selTitle'),
    selSubtitle: $('#selSubtitle'),
    selRationale: $('#selRationale'),
    selOwner: $('#selOwner'),
    selTimebox: $('#selTimebox'),
    selSeverity: $('#selSeverity'),
    selState: $('#selState'),
    selQueries: $('#selQueries'),
    btnMarkDone: $('#btnMarkDone'),
    btnMarkBlocked: $('#btnMarkBlocked'),
    btnMarkOpen: $('#btnMarkOpen'),
    runNotes: $('#runNotes'),
    actionHint: $('#actionHint'),

    alertTray: $('#alertTray'),

    btnExport: $('#btnExport'),
    btnReset: $('#btnReset'),
    btnAddTask: $('#btnAddTask'),

    briefZone: $('.zone--brief'),
    dataZone: $('.zone--data'),
    briefText: $('#briefText'),
    btnCopyBrief: $('#btnCopyBrief'),
    btnRefreshBrief: $('#btnRefreshBrief'),

    cutList: $('#cutList'),
    cutSelTitle: $('#cutSelTitle'),
    cutQuestion: $('#cutQuestion'),
    cutSQL: $('#cutSQL'),
    cutNotes: $('#cutNotes'),
    btnAddCutAsTask: $('#btnAddCutAsTask'),
    askTemplate: $('#askTemplate'),
    btnCopyAsk: $('#btnCopyAsk'),

    toast: $('#toast'),
    toastText: $('#toastText')
  };

  const getTaskById = (id) => State.data.tasks.find(t => t.id === id) || null;
  const getHypById = (id) => State.data.hypotheses.find(h => h.id === id) || null;
  const getCutById = (id) => State.data.cuts.find(c => c.id === id) || null;

  const computeCompletedCounts = () => {
    const tasks = State.data.tasks;
    const open = tasks.filter(t => t.state === 'open').length;
    const blocked = tasks.filter(t => t.state === 'blocked').length;
    const done = tasks.filter(t => t.state === 'done').length;
    return { open, blocked, done, total: tasks.length };
  };

  const computeConfidence = () => {
    const { done, total } = computeCompletedCounts();
    // Weighted by severity and whether the hypothesis set has a likely instrumentation issue.
    const criticalDone = State.data.tasks.filter(t => t.severity === 'critical' && t.state === 'done').length;
    const criticalTotal = State.data.tasks.filter(t => t.severity === 'critical').length;

    // Confidence baseline and weighting: finishing critical checks moves faster.
    const base = total === 0 ? 0 : (done / total) * 60;
    const crit = criticalTotal === 0 ? 0 : (criticalDone / criticalTotal) * 35;
    const notesBoost = (State.data.notes || '').trim().length >= 120 ? 5 : 0;

    // Clamp to 0..100
    return Math.round(clamp(base + crit + notesBoost, 0, 100));
  };

  const confidenceToSeverity = (conf) => {
    if (conf >= 70) return 'ok';
    if (conf >= 40) return 'warn';
    return 'critical';
  };

  const gaugeStroke = (conf) => {
    // Circle: r=18 => circumference ~ 113.097
    const c = 2 * Math.PI * 18;
    const offset = c - (c * (conf / 100));
    return { c, offset };
  };

  const getRunSeverity = () => {
    const metric = State.data.run.metric;
    const conf = computeConfidence();
    const magnitude = Math.abs(metric.magnitude_pct);

    // Severity is driven by magnitude + confidence; do not rely on color-only.
    if (magnitude >= 10 && conf < 40) return 'critical';
    if (magnitude >= 8 && conf < 70) return 'warn';
    return 'ok';
  };

  const formatMagnitude = (pct) => {
    const sign = pct > 0 ? '+' : '';
    return `${sign}${pct.toFixed(1)}%`;
  };

  const showToast = (text) => {
    els.toastText.textContent = text;
    els.toast.hidden = false;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      els.toast.hidden = true;
    }, 1600);
  };

  const setNavView = (view) => {
    State.data.view = view;

    $$('.navbtn').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
    // zones are not overlayed; swap visibility
    const showRun = view === 'run';
    const showBrief = view === 'brief';
    const showData = view === 'data';

    // Main grid zones: keep in DOM but use hidden to avoid overlap.
    $('.zone--main').hidden = !showRun;
    $('.zone--detail').hidden = !showRun;
    $('.zone--tray').hidden = !showRun;

    els.briefZone.hidden = !showBrief;
    els.dataZone.hidden = !showData;

    if (showBrief) {
      els.briefText.value = buildBriefText();
    }
    if (showData) {
      if (!State.data.selectedCutId) {
        const first = filteredCuts()[0];
        if (first) State.data.selectedCutId = first.id;
      }
      renderCuts();
      renderCutDetail();
      renderAskTemplate();
    }
  };

  const setMode = (mode) => {
    State.data.mode = mode;

    $$('.seg__btn[data-mode]').forEach(b => b.classList.toggle('is-active', b.dataset.mode === mode));

    // Mode affects hypothesis ordering bias and recommended cuts.
    // No animation by spec; transitions are present but state changes are instant.
    renderAll();
  };

  const setFilter = (filter) => {
    State.data.filter = filter;
    $$('.seg__btn[data-filter]').forEach(b => b.classList.toggle('is-active', b.dataset.filter === filter));
    renderTasks();
    renderCountsAndHeader();
    syncSelectionIfHidden();
  };

  const setSort = (sort) => {
    State.data.sort = sort;
    $$('.seg__btn[data-sort]').forEach(b => b.classList.toggle('is-active', b.dataset.sort === sort));
    renderTasks();
    syncSelectionIfHidden();
  };

  const setCutScope = (scope) => {
    State.data.cutScope = scope;
    $$('.seg__btn[data-cutscope]').forEach(b => b.classList.toggle('is-active', b.dataset.cutscope === scope));
    if (State.data.view === 'data') {
      const list = filteredCuts();
      if (list.length && !list.some(c => c.id === State.data.selectedCutId)) {
        State.data.selectedCutId = list[0].id;
      }
      renderCuts();
      renderCutDetail();
      renderAskTemplate();
    }
  };

  const filteredTasks = () => {
    let tasks = [...State.data.tasks];

    if (State.data.filter === 'open') {
      tasks = tasks.filter(t => t.state !== 'done');
    }

    if (State.data.sort === 'priority') {
      tasks.sort((a, b) => a.prio - b.prio);
    } else {
      tasks.sort((a, b) => a.timebox_min - b.timebox_min);
    }

    // Mode influences how "blocked" is treated: in triage, blocked moves down.
    if (State.data.mode === 'triage') {
      tasks.sort((a, b) => {
        const aBlocked = a.state === 'blocked' ? 1 : 0;
        const bBlocked = b.state === 'blocked' ? 1 : 0;
        if (aBlocked !== bBlocked) return aBlocked - bBlocked;
        return 0;
      });
    }

    return tasks;
  };

  const filteredHypotheses = () => {
    let hyps = [...State.data.hypotheses];

    // Mode bias: triage favors speed; deepdive favors likelihood.
    if (State.data.mode === 'triage') {
      hyps.sort((a, b) => (a.speed_min - b.speed_min) || (b.likelihood - a.likelihood));
    } else {
      hyps.sort((a, b) => (b.likelihood - a.likelihood) || (a.speed_min - b.speed_min));
    }

    return hyps;
  };

  const filteredCuts = () => {
    const all = [...State.data.cuts];
    if (State.data.cutScope === 'all') return all;
    return all.filter(c => c.scope === 'recommended');
  };

  const select = (type, id) => {
    State.data.selection = { type, id };

    if (type === 'task') {
      const t = getTaskById(id);
      if (t) {
        renderInspectorForTask(t);
        els.actionHint.textContent = 'Actions apply to the selected checklist item only.';
        enableTaskActions(true);
      } else {
        renderInspectorEmpty();
      }
    } else if (type === 'hypothesis') {
      const h = getHypById(id);
      if (h) {
        renderInspectorForHypothesis(h);
        els.actionHint.textContent = 'Checklist actions are disabled for hypothesis selection.';
        enableTaskActions(false);
      } else {
        renderInspectorEmpty();
      }
    } else {
      renderInspectorEmpty();
    }

    renderTasksSelection();
    renderHypSelection();
  };

  const enableTaskActions = (on) => {
    els.btnMarkDone.disabled = !on;
    els.btnMarkBlocked.disabled = !on;
    els.btnMarkOpen.disabled = !on;
  };

  const renderInspectorEmpty = () => {
    els.selectionTag.className = 'tag tag--warn';
    els.selectionTag.textContent = '[WARN]';
    els.selectionHint.textContent = 'No item selected.';

    els.selTitle.textContent = '—';
    els.selSubtitle.textContent = '—';
    els.selRationale.textContent = 'Select a checklist item or hypothesis.';
    els.selOwner.textContent = '—';
    els.selTimebox.textContent = '—';
    els.selSeverity.textContent = '—';
    els.selState.textContent = '—';
    els.selQueries.innerHTML = '';
    enableTaskActions(false);
  };

  const renderInspectorForTask = (t) => {
    els.selectionTag.className = `tag ${t.severity === 'critical' ? 'tag--critical' : t.severity === 'warn' ? 'tag--warn' : 'tag--ok'}`;
    els.selectionTag.textContent = t.severity === 'critical' ? '[CRITICAL]' : t.severity === 'warn' ? '[WARN]' : '[OK]';
    els.selectionHint.textContent = 'Checklist item';

    els.selTitle.textContent = t.title;
    els.selSubtitle.textContent = `Priority ${t.prio} • ${t.owner}`;
    els.selRationale.textContent = t.rationale;

    els.selOwner.textContent = t.owner;
    els.selTimebox.textContent = minutesToLabel(t.timebox_min);
    els.selSeverity.textContent = t.severity.toUpperCase();
    els.selState.textContent = t.state.toUpperCase();

    renderQueries(t.queries || []);
  };

  const renderInspectorForHypothesis = (h) => {
    // Hypotheses have their own “severity” derived from likelihood and impact
    const sev = (h.impact === 'high' && h.likelihood >= 0.55) ? 'critical' : (h.likelihood >= 0.45 ? 'warn' : 'ok');

    els.selectionTag.className = `tag ${sev === 'critical' ? 'tag--critical' : sev === 'warn' ? 'tag--warn' : 'tag--ok'}`;
    els.selectionTag.textContent = sev === 'critical' ? '[CRITICAL]' : sev === 'warn' ? '[WARN]' : '[OK]';
    els.selectionHint.textContent = 'Hypothesis';

    els.selTitle.textContent = h.title;
    els.selSubtitle.textContent = `${h.category.replace('-', ' ')} • Likelihood ${(h.likelihood * 100).toFixed(0)}% • Speed ${minutesToLabel(h.speed_min)}`;
    els.selRationale.textContent = h.rationale;

    els.selOwner.textContent = '—';
    els.selTimebox.textContent = minutesToLabel(h.speed_min);
    els.selSeverity.textContent = sev.toUpperCase();
    els.selState.textContent = '—';

    // Map recommended tasks into queries to keep inspector useful
    const tasks = h.recommended_tasks
      .map((prio) => State.data.tasks.find(t => t.prio === prio))
      .filter(Boolean);

    const queries = tasks.flatMap(t => (t.queries || []).map(q => ({
      title: `${q.title} (via: P${t.prio})`,
      body: q.body,
      code: q.code
    })));

    renderQueries(queries.length ? queries : [{
      title: 'Suggested next action',
      body: 'No linked queries found. Use Data Cuts tab to add a concrete check to the checklist.',
      code: ''
    }]);
  };

  const renderQueries = (queries) => {
    els.selQueries.innerHTML = '';
    if (!queries.length) {
      const d = document.createElement('div');
      d.className = 'query';
      d.innerHTML = `<div class="query__title">No queries</div><div class="query__body">This item is coordination-only.</div>`;
      els.selQueries.appendChild(d);
      return;
    }

    for (const q of queries) {
      const item = document.createElement('div');
      item.className = 'query';

      const code = (q.code || '').trim();
      item.innerHTML = `
        <div class="query__title"></div>
        <div class="query__body"></div>
        ${code ? `<pre class="query__code" aria-label="Query code"></pre>` : ``}
      `;
      $('.query__title', item).textContent = q.title;
      $('.query__body', item).textContent = q.body;
      const pre = $('.query__code', item);
      if (pre) pre.textContent = code;

      els.selQueries.appendChild(item);
    }
  };

  const renderHeader = () => {
    const run = State.data.run;
    els.runName.textContent = run.name;

    els.metricPill.textContent = run.metric.name;
    els.windowPill.textContent = run.metric.window;
    els.directionPill.textContent = run.metric.direction.toUpperCase();
    els.magnitudePill.textContent = formatMagnitude(run.metric.magnitude_pct);

    // Severity tag (text + border color; not only color-coded)
    const sev = getRunSeverity();
    els.runSeverityTag.className = `tag ${sev === 'critical' ? 'tag--critical' : sev === 'warn' ? 'tag--warn' : 'tag--ok'}`;
    els.runSeverityTag.textContent = sev === 'critical' ? '[CRITICAL]' : sev === 'warn' ? '[WARN]' : '[OK]';

    const conf = computeConfidence();
    els.confidenceValue.textContent = `${conf}/100`;
  };

  const renderCountsAndHeader = () => {
    const { open, blocked, done, total } = computeCompletedCounts();
    els.openCount.textContent = String(open);
    els.blockedCount.textContent = String(blocked);
    els.doneCount.textContent = String(done);
    els.completedValue.textContent = `${done}/${total}`;

    const conf = computeConfidence();
    const sev = confidenceToSeverity(conf);

    // Run hint focuses user on next action based on the most urgent open task
    const next = filteredTasks().find(t => t.state !== 'done');
    if (next) {
      const stateNote = next.state === 'blocked' ? 'blocked' : 'open';
      els.runHint.textContent = `Next: P${next.prio} • ${stateNote.toUpperCase()} • ${next.title}`;
    } else {
      els.runHint.textContent = 'All checklist items completed. Export a brief and update stakeholders.';
    }

    // Gauge visuals
    els.gaugeNum.textContent = String(conf);
    const { c, offset } = gaugeStroke(conf);
    els.gaugeCircle.style.strokeDasharray = `${c.toFixed(1)}`;
    els.gaugeCircle.style.strokeDashoffset = `${offset.toFixed(1)}`;
    els.gaugeCircle.style.stroke = sev === 'ok' ? 'var(--color-positive)' : sev === 'warn' ? 'var(--color-accent)' : 'var(--color-alert)';
  };

  const renderTasks = () => {
    const tasks = filteredTasks();
    els.taskTbody.innerHTML = '';

    for (const t of tasks) {
      const tr = document.createElement('tr');
      tr.dataset.taskId = t.id;

      const tagClass = t.severity === 'critical' ? 'tag--critical' : t.severity === 'warn' ? 'tag--warn' : 'tag--ok';
      const tagText = t.severity === 'critical' ? '[CRITICAL]' : t.severity === 'warn' ? '[WARN]' : '[OK]';
      const stateTag = t.state === 'done' ? '[OK]' : t.state === 'blocked' ? '[CRITICAL]' : '[WARN]';
      const stateTagClass = t.state === 'done' ? 'tag--ok' : t.state === 'blocked' ? 'tag--critical' : 'tag--warn';

      tr.innerHTML = `
        <td class="col--prio col--num value--mono"></td>
        <td>
          <button class="rowbtn" type="button" aria-label="Select checklist item">
            <span class="rowbtn__title"></span>
            <span class="tag ${tagClass}">${tagText}</span>
          </button>
        </td>
        <td></td>
        <td class="col--time col--num value--mono"></td>
        <td><span class="tag ${stateTagClass}">${stateTag}</span></td>
      `;

      tr.children[0].textContent = String(t.prio);
      $('.rowbtn__title', tr).textContent = t.title;
      tr.children[2].textContent = t.owner;
      tr.children[3].textContent = minutesToLabel(t.timebox_min);

      const btn = $('.rowbtn', tr);
      btn.addEventListener('click', () => select('task', t.id));

      els.taskTbody.appendChild(tr);
    }

    renderTasksSelection();
  };

  const renderTasksSelection = () => {
    const sel = State.data.selection;
    $$('#taskTbody tr').forEach(tr => {
      const isSel = sel.type === 'task' && sel.id === tr.dataset.taskId;
      tr.classList.toggle('row--selected', isSel);
    });
  };

  const renderHypotheses = () => {
    const hyps = filteredHypotheses();
    els.hypList.innerHTML = '';

    for (const h of hyps) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'card';
      card.dataset.hypId = h.id;
      card.setAttribute('role', 'listitem');

      const likelihoodPct = Math.round(h.likelihood * 100);
      const speed = minutesToLabel(h.speed_min);

      const sev = (h.impact === 'high' && h.likelihood >= 0.55) ? 'CRITICAL' : (h.likelihood >= 0.45 ? 'WARN' : 'OK');
      const sevTagClass = sev === 'CRITICAL' ? 'tag--critical' : sev === 'WARN' ? 'tag--warn' : 'tag--ok';

      card.innerHTML = `
        <div class="card__top">
          <div>
            <div class="card__title"></div>
            <div class="hint"></div>
          </div>
          <div class="card__meta">
            <span class="tag ${sevTagClass}">[${sev}]</span>
            <span class="badge badge--num value--mono">L ${likelihoodPct}%</span>
            <span class="badge badge--num value--mono">T ${speed}</span>
          </div>
        </div>
        <div class="card__body"></div>
      `;

      $('.card__title', card).textContent = h.title;
      $('.hint', card).textContent = `${h.category.replace('-', ' ')} • impact ${h.impact}`;
      $('.card__body', card).textContent = h.rationale;

      card.addEventListener('click', () => select('hypothesis', h.id));

      els.hypList.appendChild(card);
    }

    renderHypSelection();
  };

  const renderHypSelection = () => {
    const sel = State.data.selection;
    $$('#hypList .card').forEach(card => {
      const isSel = sel.type === 'hypothesis' && sel.id === card.dataset.hypId;
      card.classList.toggle('is-selected', isSel);
    });
  };

  const renderAlerts = () => {
    els.alertTray.innerHTML = '';
    for (const a of State.data.alerts) {
      const box = document.createElement('div');
      box.className = 'alert';
      const sevClass = a.severity === 'critical' ? 'tag--critical' : (a.severity === 'warn' ? 'tag--warn' : 'tag--ok');
      const sevText = a.severity === 'critical' ? '[CRITICAL]' : (a.severity === 'warn' ? '[WARN]' : '[OK]');
      box.innerHTML = `
        <div class="alert__top">
          <div class="alert__title"></div>
          <span class="tag ${sevClass}">${sevText}</span>
        </div>
        <div class="alert__body"></div>
      `;
      $('.alert__title', box).textContent = a.title;
      $('.alert__body', box).innerHTML = a.body.replace(/\n/g, '<br>');
      els.alertTray.appendChild(box);
    }
  };

  const renderCuts = () => {
    const cuts = filteredCuts();
    els.cutList.innerHTML = '';

    for (const c of cuts) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'cut';
      item.dataset.cutId = c.id;
      item.setAttribute('role', 'listitem');
      item.innerHTML = `
        <div class="cut__title"></div>
        <div class="cut__sub"></div>
      `;
      $('.cut__title', item).textContent = c.title;
      $('.cut__sub', item).textContent = c.question;

      item.addEventListener('click', () => {
        State.data.selectedCutId = c.id;
        renderCuts();
        renderCutDetail();
        renderAskTemplate();
      });

      if (State.data.selectedCutId === c.id) item.classList.add('is-selected');

      els.cutList.appendChild(item);
    }
  };

  const renderCutDetail = () => {
    const c = getCutById(State.data.selectedCutId);
    if (!c) {
      els.cutSelTitle.textContent = '—';
      els.cutQuestion.textContent = '—';
      els.cutSQL.textContent = '—';
      els.cutNotes.textContent = '—';
      els.btnAddCutAsTask.disabled = true;
      return;
    }
    els.btnAddCutAsTask.disabled = false;
    els.cutSelTitle.textContent = c.title;
    els.cutQuestion.textContent = c.question;
    els.cutSQL.textContent = c.sql.trim();
    els.cutNotes.textContent = c.notes;
  };

  const renderAskTemplate = () => {
    const run = State.data.run;
    const c = getCutById(State.data.selectedCutId);
    const conf = computeConfidence();
    const { open, blocked, done, total } = computeCompletedCounts();

    const lines = [];
    lines.push(`[ASK] Activation anomaly triage — ${run.name}`);
    lines.push('');
    lines.push(`Context:`);
    lines.push(`- Metric: ${run.metric.name}`);
    lines.push(`- Direction/magnitude: ${run.metric.direction.toUpperCase()} ${formatMagnitude(run.metric.magnitude_pct)}`);
    lines.push(`- Window: ${run.metric.window}`);
    lines.push(`- Platform/market: ${run.metric.platform} • ${run.metric.market}`);
    lines.push(`- Current confidence: ${conf}/100 (done ${done}/${total}, blocked ${blocked})`);
    lines.push('');
    if (c) {
      lines.push(`Request (specific):`);
      lines.push(`- Question: ${c.question}`);
      lines.push(`- Pull:`);
      lines.push(c.sql.trim());
      lines.push('');
      lines.push(`How to interpret: ${c.notes}`);
    } else {
      lines.push(`Request: Please pick one recommended cut from the catalog and share results with any anomalies highlighted.`);
    }
    lines.push('');
    lines.push(`Timing: Please post preliminary read in 30 minutes; we’ll decide rollback/escalation based on the first signal.`);
    lines.push(`Thread: ${run.stakeholders.find(s => s.role === 'Data')?.channel || '#analytics'}`);

    els.askTemplate.value = lines.join('\n');
  };

  const buildBriefText = () => {
    const run = State.data.run;
    const conf = computeConfidence();
    const sev = getRunSeverity();
    const { open, blocked, done, total } = computeCompletedCounts();

    const topOpen = State.data.tasks
      .filter(t => t.state !== 'done')
      .sort((a, b) => a.prio - b.prio)
      .slice(0, 4);

    const complete = State.data.tasks
      .filter(t => t.state === 'done')
      .sort((a, b) => a.prio - b.prio)
      .slice(0, 4);

    const hyps = filteredHypotheses().slice(0, 3);

    const sevLabel = sev === 'critical' ? 'CRITICAL' : sev === 'warn' ? 'WARN' : 'OK';
    const directionLabel = run.metric.direction.toUpperCase();
    const magLabel = formatMagnitude(run.metric.magnitude_pct);

    const lines = [];
    lines.push(`[INCIDENT BRIEF] ${run.name}`);
    lines.push(`Severity: ${sevLabel} • Confidence: ${conf}/100 • Updated: ${nowISODateTime()}`);
    lines.push('');
    lines.push(`What happened`);
    lines.push(`- ${run.metric.name}: ${directionLabel} ${magLabel}`);
    lines.push(`- Window: ${run.metric.window}`);
    lines.push(`- Scope: ${run.metric.platform} • ${run.metric.market}`);
    lines.push(`- Notes: ${run.metric.notes}`);
    lines.push('');
    lines.push(`Recent changes (possible correlates)`);
    for (const c of run.recent_changes) lines.push(`- ${c.at} — ${c.what}`);
    lines.push('');
    lines.push(`Top hypotheses (ranked for ${State.data.mode === 'triage' ? 'speed-to-confirm' : 'likelihood'})`);
    for (const h of hyps) {
      lines.push(`- ${(h.likelihood * 100).toFixed(0)}% • ${h.title} (speed ${minutesToLabel(h.speed_min)}, impact ${h.impact})`);
    }
    lines.push('');
    lines.push(`Run plan status`);
    lines.push(`- Done: ${done}/${total} • Open: ${open} • Blocked: ${blocked}`);
    lines.push('');
    if (topOpen.length) {
      lines.push(`Next actions (delegation-ready)`);
      for (const t of topOpen) {
        const state = t.state.toUpperCase();
        const sevText = t.severity.toUpperCase();
        lines.push(`- [${state}] P${t.prio} (${sevText}, ${minutesToLabel(t.timebox_min)}) — ${t.title} — Owner: ${t.owner}`);
      }
      lines.push('');
    }
    if (complete.length) {
      lines.push(`Completed (latest signal)`);
      for (const t of complete) {
        lines.push(`- P${t.prio} — ${t.title} — Owner: ${t.owner}`);
      }
      lines.push('');
    }
    lines.push(`Alerts / validity risks`);
    for (const a of State.data.alerts.slice(0, 3)) {
      lines.push(`- ${a.severity.toUpperCase()}: ${a.title} — ${a.body}`);
    }
    lines.push('');
    lines.push(`Stakeholders / channels`);
    for (const s of run.stakeholders) lines.push(`- ${s.role}: ${s.name} (${s.channel})`);
    lines.push('');
    const notes = (State.data.notes || '').trim();
    if (notes) {
      lines.push(`Run notes`);
      lines.push(notes);
    }

    return lines.join('\n');
  };

  const syncSelectionIfHidden = () => {
    const sel = State.data.selection;
    if (sel.type !== 'task') return;
    const tasks = filteredTasks();
    const stillVisible = tasks.some(t => t.id === sel.id);
    if (!stillVisible) {
      // Keep selection but avoid acting on hidden row; choose first visible open item for usability.
      const first = tasks[0];
      if (first) select('task', first.id);
      else renderInspectorEmpty();
    }
  };

  const markSelectedTaskState = (state) => {
    const sel = State.data.selection;
    if (sel.type !== 'task' || !sel.id) return;

    const t = getTaskById(sel.id);
    if (!t) return;

    t.state = state;

    // Live updating score/metric
    renderCountsAndHeader();
    renderTasks();
    renderHeader();
    // Keep inspector up to date
    renderInspectorForTask(t);

    // Brief text updates if on brief view
    if (State.data.view === 'brief') {
      els.briefText.value = buildBriefText();
    }
    if (State.data.view === 'data') {
      renderAskTemplate();
    }
  };

  const addQuickTask = () => {
    // Always create with realistic content; no placeholder strings.
    const nextPrio = Math.max(...State.data.tasks.map(t => t.prio)) + 1;
    const t = {
      id: uid(),
      prio: nextPrio,
      title: 'Check login error rate (iOS) for spikes in last 6 hours',
      owner: 'Eng Oncall (Ravi)',
      timebox_min: 15,
      state: 'open',
      severity: 'warn',
      rationale: 'Auth regressions can look like activation drops; error rate spikes narrow root cause quickly.',
      queries: [
        {
          title: 'Auth errors by endpoint',
          body: 'Compare iOS auth endpoint error rate now vs baseline; check status codes and top error messages.',
          code:
`SELECT
  DATE_TRUNC('hour', request_time) AS hour,
  endpoint,
  status_code,
  COUNT(*) AS requests
FROM logs.api_requests
WHERE request_time >= NOW() - INTERVAL '6 hour'
  AND platform = 'iOS'
  AND endpoint IN ('/auth/login','/auth/signup','/auth/verify')
  AND status_code >= 400
GROUP BY 1,2,3
ORDER BY hour DESC, requests DESC;`
        }
      ]
    };

    State.data.tasks.push(t);
    // Auto-select the new item
    select('task', t.id);
    renderAll();
  };

  const addCutAsTask = () => {
    const c = getCutById(State.data.selectedCutId);
    if (!c) return;

    const nextPrio = Math.max(...State.data.tasks.map(t => t.prio)) + 1;
    const owner = 'Analytics (Elena)';
    const sev = State.data.mode === 'triage' ? 'warn' : 'ok';
    const time = State.data.mode === 'triage' ? 20 : 35;

    const t = {
      id: uid(),
      prio: nextPrio,
      title: `Pull cut: ${c.title}`,
      owner,
      timebox_min: time,
      state: 'open',
      severity: sev,
      rationale: `Converted from data cut catalog: ${c.question}`,
      queries: [
        {
          title: c.title,
          body: c.question,
          code: c.sql
        }
      ]
    };

    State.data.tasks.push(t);
    showToast('Added to checklist.');
    // Switch back to run view and select new task
    setNavView('run');
    select('task', t.id);
    renderAll();
  };

  const exportBriefToClipboard = async () => {
    const text = buildBriefText();
    const ok = await copyToClipboard(text);
    if (ok) showToast('Brief copied.');
    else showToast('Copy failed.');
  };

  const renderAll = () => {
    renderHeader();
    renderCountsAndHeader();
    renderTasks();
    renderHypotheses();
    renderAlerts();

    // Notes
    if (els.runNotes.value !== State.data.notes) {
      els.runNotes.value = State.data.notes || '';
    }

    // Keep selection consistent
    const sel = State.data.selection;
    if (!sel.id) {
      // Default select the top-priority open task
      const first = filteredTasks()[0];
      if (first) select('task', first.id);
      else renderInspectorEmpty();
    } else {
      // Re-render inspector for selection
      if (sel.type === 'task') {
        const t = getTaskById(sel.id);
        if (t) renderInspectorForTask(t);
      } else if (sel.type === 'hypothesis') {
        const h = getHypById(sel.id);
        if (h) renderInspectorForHypothesis(h);
      }
    }

    // If not in run view, render relevant sections too
    if (State.data.view === 'brief') {
      els.briefText.value = buildBriefText();
    }
    if (State.data.view === 'data') {
      renderCuts();
      renderCutDetail();
      renderAskTemplate();
    }
  };

  const wireEvents = () => {
    // Nav
    $$('.navbtn').forEach(btn => {
      btn.addEventListener('click', () => setNavView(btn.dataset.view));
    });

    // Mode/filter/sort
    $$('.seg__btn[data-mode]').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
    $$('.seg__btn[data-filter]').forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));
    $$('.seg__btn[data-sort]').forEach(btn => btn.addEventListener('click', () => setSort(btn.dataset.sort)));
    $$('.seg__btn[data-cutscope]').forEach(btn => btn.addEventListener('click', () => setCutScope(btn.dataset.cutscope)));

    // Actions
    els.btnMarkDone.addEventListener('click', () => markSelectedTaskState('done'));
    els.btnMarkBlocked.addEventListener('click', () => markSelectedTaskState('blocked'));
    els.btnMarkOpen.addEventListener('click', () => markSelectedTaskState('open'));

    els.btnExport.addEventListener('click', exportBriefToClipboard);
    els.btnReset.addEventListener('click', () => {
      State.data = demoSeed();
      renderAll();
      setNavView('run');
      showToast('Demo reset.');
    });

    els.btnAddTask.addEventListener('click', addQuickTask);

    // Notes
    els.runNotes.addEventListener('input', () => {
      State.data.notes = els.runNotes.value;
      renderCountsAndHeader(); // notes can add a small confidence boost
      renderHeader();
      if (State.data.view === 'brief') {
        els.briefText.value = buildBriefText();
      }
      if (State.data.view === 'data') {
        renderAskTemplate();
      }
    });

    // Brief tools
    els.btnCopyBrief.addEventListener('click', async () => {
      const ok = await copyToClipboard(els.briefText.value);
      showToast(ok ? 'Brief copied.' : 'Copy failed.');
    });
    els.btnRefreshBrief.addEventListener('click', () => {
      els.briefText.value = buildBriefText();
      showToast('Brief refreshed.');
    });

    // Data tools
    els.btnAddCutAsTask.addEventListener('click', addCutAsTask);
    els.btnCopyAsk.addEventListener('click', async () => {
      const ok = await copyToClipboard(els.askTemplate.value);
      showToast(ok ? 'Ask copied.' : 'Copy failed.');
    });
  };

  // Init
  wireEvents();
  renderAll();
  setNavView('run');
})();