(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const fmtPct = (v) => `${Math.round(v * 1000) / 10}%`;
  const fmtDays = (d) => {
    if (d < 1) return `${Math.round(d * 24)}h`;
    if (d < 2) return `${Math.round(d * 10) / 10}d`;
    return `${Math.round(d)}d`;
  };

  function computeSeverityByConversion(conv, healthy, warning) {
    if (conv >= healthy) return "ok";
    if (conv >= warning) return "warning";
    return "critical";
  }

  function severityBadgeText(sev) {
    if (sev === "critical") return "critical";
    if (sev === "warning") return "warning";
    if (sev === "ok") return "healthy";
    return "—";
  }

  function scoreColor(sev) {
    if (sev === "ok") return getCssVar("--color-ok");
    if (sev === "warning") return getCssVar("--color-warning");
    return getCssVar("--color-critical");
  }

  function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function toId(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  // Demo loops (realistic, not placeholder-y)
  const LOOPS = [
    {
      id: "loop-collab-whiteboard",
      name: "Collaborative whiteboard: “weekly team ritual” loop",
      product: "FlowBoard (remote collaboration)",
      cohort: "New teams (10–200 seats) in first 21 days",
      baselineD7: 0.184,
      baselineDAU: 0.112,
      description:
        "Teams discover a recurring use (weekly planning), create a board, get a clear outcome, then come back when the next ritual hits.",
      steps: [
        {
          key: "trigger",
          title: "Trigger",
          label: "Calendar + teammate pull",
          definition:
            "A meeting invite, a teammate sharing a board link, or Slack reminder prompts someone to open FlowBoard.",
          kpis: [
            { label: "Trigger reach", value: "62% of teams see ≥1 trigger/week" },
            { label: "Primary channels", value: "[calendar] [slack] [shared-link]" }
          ],
          signals: [
            "Slack reminders have highest open rate but lowest downstream completion",
            "Boards opened from shared links are 2× more likely to be edited",
            "Teams with a named template have lower setup time"
          ]
        },
        {
          key: "action",
          title: "Action",
          label: "Start + contribute",
          definition:
            "At least 2 people add content to the board within the first 10 minutes.",
          kpis: [
            { label: "Median time to first edit", value: "3.1 min" },
            { label: "Collab depth", value: "1.8 editors/session median" }
          ],
          signals: [
            "Mobile viewers rarely become editors",
            "First-time editors often stop at permission prompt confusion",
            "Suggested templates increase early edits but can feel irrelevant for sales teams"
          ]
        },
        {
          key: "reward",
          title: "Reward",
          label: "Outcome clarity",
          definition:
            "The board produces an outcome: decisions captured, tasks assigned, or a plan that reduces follow-up work.",
          kpis: [
            { label: "Outcome marker", value: "38% add ≥1 task or decision block" },
            { label: "Export/share", value: "22% share summary within 24h" }
          ],
          signals: [
            "Teams using decision blocks have higher week-2 retention",
            "Task export is underused due to Jira setup friction",
            "Users report “board felt messy” when >30 sticky notes"
          ]
        },
        {
          key: "return",
          title: "Return",
          label: "Next ritual pull",
          definition:
            "Team returns to the same board (or template) in the next ritual window.",
          kpis: [
            { label: "Repeat board usage", value: "28% revisit same board within 7 days" },
            { label: "Habit signal", value: "14% create a second board from a template" }
          ],
          signals: [
            "Return is strongly tied to calendar integrations being enabled",
            "Teams with a ‘board owner’ role return more consistently",
            "Notifications are too noisy; power users mute and miss ritual reminders"
          ]
        }
      ],
      transitions: [
        {
          id: "t-trigger-action",
          from: "trigger",
          to: "action",
          conversion: 0.54,
          medianDays: 0.08,
          volume: 18400,
          notes:
            "Friction shows up at permissions and “what should I do here?” ambiguity.",
          signals: [
            "Permission prompt drop-off spikes for external guests",
            "Template picker is skipped by 64% of first sessions",
            "Sessions starting from shared link convert better than from Slack reminder"
          ]
        },
        {
          id: "t-action-reward",
          from: "action",
          to: "reward",
          conversion: 0.41,
          medianDays: 0.4,
          volume: 9900,
          notes:
            "Users edit, but fewer reach an outcome marker (task/decision).",
          signals: [
            "Outcome blocks are buried below the fold on smaller screens",
            "Jira integration connect step has 3 screens and loses momentum",
            "Teams with >3 editors have higher reward conversion (coordination effect)"
          ]
        },
        {
          id: "t-reward-return",
          from: "reward",
          to: "return",
          conversion: 0.29,
          medianDays: 6.3,
          volume: 4050,
          notes:
            "Reward exists, but return is weak unless the ritual is anchored to calendar.",
          signals: [
            "Calendar integration enabled rate is only 18% in week 1",
            "Reminder notifications are perceived as spam by admins",
            "Board ownership is unclear; no one feels responsible to bring team back"
          ]
        },
        {
          id: "t-return-trigger",
          from: "return",
          to: "trigger",
          conversion: 0.63,
          medianDays: 7.0,
          volume: 1170,
          notes:
            "Once teams return, the loop restarts fairly well (habit formation underway).",
          signals: [
            "Teams that revisit the same board show higher trigger reach the next week",
            "Slack-based reminders work better after week 2 than week 1",
            "Users who set a weekly cadence are stable"
          ]
        }
      ],
      benchmarks: {
        "t-trigger-action": { healthy: 0.62, warning: 0.52 },
        "t-action-reward": { healthy: 0.48, warning: 0.38 },
        "t-reward-return": { healthy: 0.36, warning: 0.28 },
        "t-return-trigger": { healthy: 0.66, warning: 0.56 }
      }
    },
    {
      id: "loop-budgeting-family",
      name: "Personal finance: “monthly close” loop",
      product: "PennyMap (budgeting + insights)",
      cohort: "Users who connected ≥1 bank account in first 7 days",
      baselineD7: 0.127,
      baselineDAU: 0.083,
      description:
        "Users get a money moment (payday, bill, overspend), categorize/adjust, feel control, then come back for next close / next paycheck.",
      steps: [
        {
          key: "trigger",
          title: "Trigger",
          label: "Payday / bill / alert",
          definition:
            "A push alert or email summary highlights a money event: paycheck landed, bill due, or spending category overrun.",
          kpis: [
            { label: "Alert opt-in", value: "44% opt into at least one alert" },
            { label: "Email engagement", value: "28% open weekly summary" }
          ],
          signals: [
            "Bill reminders convert better than “you spent more” alerts",
            "Too-frequent alerts cause opt-out in first 72 hours",
            "Users with variable income ignore weekly cadence"
          ]
        },
        {
          key: "action",
          title: "Action",
          label: "Categorize + adjust",
          definition:
            "User categorizes a transaction or adjusts a budget category to respond to the trigger.",
          kpis: [
            { label: "Median time to action", value: "9.4 min" },
            { label: "Action depth", value: "2.6 edits/session" }
          ],
          signals: [
            "Auto-categorization is good but the correction flow is slow",
            "Users get stuck when merchants map to multiple categories",
            "Manual split transactions are a retention positive but hard to discover"
          ]
        },
        {
          key: "reward",
          title: "Reward",
          label: "Control + insight",
          definition:
            "User sees an insight (trend, forecast) and feels back in control of plan.",
          kpis: [
            { label: "Insight view rate", value: "31% view an insight panel after edits" },
            { label: "Forecast trust", value: "3.8/5 in survey for ‘accuracy’" }
          ],
          signals: [
            "A single clear forecast increases confidence; too many charts overwhelm",
            "Users want ‘what should I do next’ recommendations",
            "Reward is higher when a saved goal is present"
          ]
        },
        {
          key: "return",
          title: "Return",
          label: "Next close moment",
          definition:
            "User returns on next paycheck/bill cycle or performs a weekly/monthly close session.",
          kpis: [
            { label: "Weekly return", value: "19% return within 7 days" },
            { label: "Monthly close", value: "11% do a close session in 30 days" }
          ],
          signals: [
            "Return is higher when user set at least one bill",
            "People want a “close checklist” but not a heavy onboarding",
            "Push notifications help, but only if they’re sparse and timely"
          ]
        }
      ],
      transitions: [
        { id: "t-trigger-action", from: "trigger", to: "action", conversion: 0.46, medianDays: 0.3, volume: 12200,
          notes: "Users see alert but don’t immediately take action; urgency depends on alert type.",
          signals: ["Bill due alerts convert; overspend alerts are ignored", "Opt-outs cluster after 3 alerts in 24h", "Weekends show lower action conversion"]
        },
        { id: "t-action-reward", from: "action", to: "reward", conversion: 0.37, medianDays: 0.2, volume: 5600,
          notes: "Edits happen but fewer users view insight/forecast that creates reward.",
          signals: ["Insight panel is below transaction list and gets missed", "Forecast chart is hard to read on small screens", "Goal-setting increases reward conversion"]
        },
        { id: "t-reward-return", from: "reward", to: "return", conversion: 0.25, medianDays: 5.9, volume: 2070,
          notes: "Reward exists but doesn’t consistently anchor a routine; close ritual is missing.",
          signals: ["Users ask for a ‘close checklist’", "Sparse alerts outperform frequent ones", "Bills feature adoption strongly correlates with return"]
        },
        { id: "t-return-trigger", from: "return", to: "trigger", conversion: 0.58, medianDays: 7.0, volume: 520,
          notes: "Users who return are receptive to triggers again, but cadence varies.",
          signals: ["Payday triggers work for W2; not for gig workers", "Monthly close users show stable triggers", "Some users disable push after returning once"]
        }
      ],
      benchmarks: {
        "t-trigger-action": { healthy: 0.55, warning: 0.45 },
        "t-action-reward": { healthy: 0.44, warning: 0.34 },
        "t-reward-return": { healthy: 0.32, warning: 0.24 },
        "t-return-trigger": { healthy: 0.62, warning: 0.52 }
      }
    }
  ];

  const INTERVENTIONS = [
    {
      id: "int-permission-simplify",
      title: "Remove permission ambiguity with ‘edit in one click’",
      type: "reduce-friction",
      targets: ["action"],
      effect: { friction: +10, reward: 0, speed: 0 },
      owner: "PM + Eng",
      description:
        "Replace the multi-step permission prompt with a single explicit choice: View only / Edit. Default to Edit for invited teammates."
    },
    {
      id: "int-template-first",
      title: "Make templates the default first action (not optional)",
      type: "reduce-friction",
      targets: ["action"],
      effect: { friction: +8, reward: +2, speed: 0 },
      owner: "Design",
      description:
        "Start users inside a minimal template with pre-labeled sections so the first edit is obvious and fast."
    },
    {
      id: "int-outcome-blocks",
      title: "Surface outcome blocks (decision/task) at the moment of use",
      type: "increase-reward",
      targets: ["reward"],
      effect: { friction: 0, reward: +12, speed: 0 },
      owner: "PM",
      description:
        "Prompt users to capture a decision or assign a task after 6+ edits or when meeting time is near end."
    },
    {
      id: "int-calendar-nudge",
      title: "Calendar integration nudge after first successful session",
      type: "accelerate-return",
      targets: ["return"],
      effect: { friction: 0, reward: +2, speed: +14 },
      owner: "Growth",
      description:
        "Ask to connect calendar only after the team created an outcome marker, framing it as ‘lock in the ritual’."
    },
    {
      id: "int-owner-role",
      title: "Introduce a lightweight ‘board owner’ role",
      type: "quality-guardrails",
      targets: ["return"],
      effect: { friction: -2, reward: +6, speed: +8 },
      owner: "PM + Eng",
      description:
        "Assign responsibility to one person to bring the team back; reduces coordination drop and improves reminder relevance."
    },
    {
      id: "int-alert-throttle",
      title: "Throttle alerts to avoid early opt-out",
      type: "quality-guardrails",
      targets: ["trigger"],
      effect: { friction: 0, reward: 0, speed: +6 },
      owner: "Lifecycle",
      description:
        "Limit to 1 alert/day in week 1; prioritize bill-due and paycheck triggers; reduces notification fatigue and improves downstream action."
    },
    {
      id: "int-close-checklist",
      title: "Add a ‘weekly close’ checklist",
      type: "accelerate-return",
      targets: ["return", "reward"],
      effect: { friction: 0, reward: +8, speed: +10 },
      owner: "PM",
      description:
        "A short checklist that turns a vague ‘check finances’ intention into a ritual with completion satisfaction."
    },
    {
      id: "int-insight-pin",
      title: "Pin the single most relevant insight after edits",
      type: "increase-reward",
      targets: ["reward"],
      effect: { friction: 0, reward: +10, speed: 0 },
      owner: "Data",
      description:
        "After budget edits, show one actionable insight (forecast, category trend) instead of a dashboard of charts."
    }
  ];

  const dom = {
    navLinks: $$(".nav__link"),
    loopSelect: $("#loopSelect"),
    loopContext: $("#loopContext"),

    modeObserved: $("#modeObserved"),
    modeSimulated: $("#modeSimulated"),
    metricSelect: $("#metricSelect"),
    riskSelect: $("#riskSelect"),
    showBenchmarks: $("#showBenchmarks"),
    lockSelection: $("#lockSelection"),

    knobFriction: $("#knobFriction"),
    knobReward: $("#knobReward"),
    knobSpeed: $("#knobSpeed"),
    knobFrictionValue: $("#knobFrictionValue"),
    knobRewardValue: $("#knobRewardValue"),
    knobSpeedValue: $("#knobSpeedValue"),
    applyScenario: $("#applyScenario"),
    resetScenario: $("#resetScenario"),

    loopCanvas: $("#loopCanvas"),
    benchmarksBox: $("#benchmarksBox"),
    benchmarksTableBody: $("#benchmarksTableBody"),

    loopScoreValue: $("#loopScoreValue"),
    loopScoreBadge: $("#loopScoreBadge"),
    loopScoreHint: $("#loopScoreHint"),
    gaugeFill: $("#gaugeFill"),
    weakestTransition: $("#weakestTransition"),
    weakestBadge: $("#weakestBadge"),
    weakestDropoff: $("#weakestDropoff"),
    projectedD7: $("#projectedD7"),
    projectionBadge: $("#projectionBadge"),
    projectionDelta: $("#projectionDelta"),

    autoFocusWeakest: $("#autoFocusWeakest"),
    clearSelection: $("#clearSelection"),

    sortSelect: $("#sortSelect"),
    filterSelect: $("#filterSelect"),
    transitionsTbody: $("#transitionsTbody"),

    interventionTarget: $("#interventionTarget"),
    interventionType: $("#interventionType"),
    interventionList: $("#interventionList"),

    scenarioTbody: $("#scenarioTbody"),
    useScenarioInSim: $("#useScenarioInSim"),
    clearScenario: $("#clearScenario"),
    impactScore: $("#impactScore"),
    impactD7: $("#impactD7"),
    impactDriver: $("#impactDriver"),
    assumptionsList: $("#assumptionsList"),

    notesBox: $("#notesBox"),
    markdownPreview: $("#markdownPreview"),
    copyMarkdown: $("#copyMarkdown"),
    downloadMarkdown: $("#downloadMarkdown"),

    inspectorBody: $("#inspectorBody"),
    inspectorSubtitle: $("#inspectorSubtitle"),
    pinSelection: $("#pinSelection"),

    quickAddBest: $("#quickAddBest"),
    quickAddAlt: $("#quickAddAlt"),
    quickAddHint: $("#quickAddHint"),

    toast: $("#toast")
  };

  const STORAGE_KEY = "retention-loop-analyzer:v1";

  const state = {
    view: "map",
    loopId: LOOPS[0].id,
    mode: "observed", // observed | simulated
    metric: "conversion",
    riskLens: "balanced",
    showBenchmarks: false,
    lockSelection: false,
    pinned: false,

    selection: { type: null, key: null }, // {type: 'step'|'transition', key: stepKey|transitionId}
    knobs: { friction: 0, reward: 0, speed: 0 },

    scenario: [], // array of intervention IDs (ordered)
    scenarioEnabled: false,

    notes: ""
  };

  function loadPersisted() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        if (typeof parsed.loopId === "string") state.loopId = parsed.loopId;
        if (typeof parsed.mode === "string") state.mode = parsed.mode;
        if (typeof parsed.metric === "string") state.metric = parsed.metric;
        if (typeof parsed.riskLens === "string") state.riskLens = parsed.riskLens;
        if (typeof parsed.showBenchmarks === "boolean") state.showBenchmarks = parsed.showBenchmarks;
        if (typeof parsed.lockSelection === "boolean") state.lockSelection = parsed.lockSelection;
        if (Array.isArray(parsed.scenario)) state.scenario = parsed.scenario.filter((id) => typeof id === "string");
        if (typeof parsed.scenarioEnabled === "boolean") state.scenarioEnabled = parsed.scenarioEnabled;
        if (parsed.knobs && typeof parsed.knobs === "object") {
          state.knobs.friction = clamp(Number(parsed.knobs.friction || 0), -30, 30);
          state.knobs.reward = clamp(Number(parsed.knobs.reward || 0), -30, 30);
          state.knobs.speed = clamp(Number(parsed.knobs.speed || 0), -30, 30);
        }
        if (typeof parsed.notes === "string") state.notes = parsed.notes;
      }
    } catch {
      // ignore corrupted storage
    }
  }

  function persist() {
    const payload = {
      loopId: state.loopId,
      mode: state.mode,
      metric: state.metric,
      riskLens: state.riskLens,
      showBenchmarks: state.showBenchmarks,
      lockSelection: state.lockSelection,
      scenario: state.scenario,
      scenarioEnabled: state.scenarioEnabled,
      knobs: state.knobs,
      notes: state.notes
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function getLoop() {
    return LOOPS.find((l) => l.id === state.loopId) || LOOPS[0];
  }

  function getStep(loop, key) {
    return loop.steps.find((s) => s.key === key);
  }

  function getTransition(loop, id) {
    return loop.transitions.find((t) => t.id === id);
  }

  function stepOrderIndex(key) {
    const order = ["trigger", "action", "reward", "return"];
    return order.indexOf(key);
  }

  function transitionLabel(loop, t) {
    const from = getStep(loop, t.from).title;
    const to = getStep(loop, t.to).title;
    return `${from} → ${to}`;
  }

  function computeScenarioAggregateEffect() {
    const chosen = state.scenario.map((id) => INTERVENTIONS.find((x) => x.id === id)).filter(Boolean);
    const agg = { friction: 0, reward: 0, speed: 0 };
    for (const it of chosen) {
      agg.friction += (it.effect.friction || 0);
      agg.reward += (it.effect.reward || 0);
      agg.speed += (it.effect.speed || 0);
    }
    // Gently cap combined effect so it doesn't explode
    agg.friction = clamp(agg.friction, -25, 25);
    agg.reward = clamp(agg.reward, -25, 25);
    agg.speed = clamp(agg.speed, -25, 25);
    return { agg, chosen };
  }

  function applyDeltasToTransitions(loop, baseTransitions) {
    // knobs + (optional) scenario aggregate
    const knobs = { ...state.knobs };
    let scenarioAgg = { friction: 0, reward: 0, speed: 0 };
    if (state.scenarioEnabled) {
      scenarioAgg = computeScenarioAggregateEffect().agg;
    }

    const frictionPct = knobs.friction + scenarioAgg.friction;
    const rewardPct = knobs.reward + scenarioAgg.reward;
    const speedPct = knobs.speed + scenarioAgg.speed;

    return baseTransitions.map((t) => {
      let conv = t.conversion;
      let medianDays = t.medianDays;

      // Apply deltas to specific steps:
      // - friction affects trigger→action (action step)
      // - reward affects action→reward
      // - speed affects reward→return (return trigger speed)
      // Slight spillover to return→trigger via habit reinforcement (small)
      if (t.id === "t-trigger-action") conv = conv * (1 + frictionPct / 100);
      if (t.id === "t-action-reward") conv = conv * (1 + rewardPct / 100);
      if (t.id === "t-reward-return") {
        conv = conv * (1 + speedPct / 100);
        medianDays = medianDays * (1 - (speedPct / 200)); // +10% speed reduces time by 5%
      }
      if (t.id === "t-return-trigger") conv = conv * (1 + (rewardPct / 400)); // small
      conv = clamp(conv, 0.03, 0.98);
      medianDays = clamp(medianDays, 0.02, 30);

      // Risk lens tweaks: interpret risk differently (score weighting), not conv
      return { ...t, _simConversion: conv, _simMedianDays: medianDays };
    });
  }

  function getActiveTransitions(loop) {
    const base = loop.transitions;
    if (state.mode === "observed") {
      return base.map((t) => ({ ...t, _activeConversion: t.conversion, _activeMedianDays: t.medianDays }));
    }
    const sim = applyDeltasToTransitions(loop, base);
    return sim.map((t) => ({ ...t, _activeConversion: t._simConversion, _activeMedianDays: t._simMedianDays }));
  }

  function computeLoopScore(loop, transitionsActive) {
    // Weighted score:
    // - Conversion health vs benchmarks (0..70)
    // - Cadence (time to next) (0..20)
    // - Balance (avoid one transition dominating) (0..10)
    const b = loop.benchmarks;

    let convPoints = 0;
    let cadencePoints = 0;

    for (const t of transitionsActive) {
      const bm = b[t.id];
      const conv = t._activeConversion;

      // conversion scoring: healthy -> full points for that edge
      const edgeMax = 17.5; // 4 edges => 70
      let edgeScore = 0;
      if (conv >= bm.healthy) edgeScore = edgeMax;
      else if (conv <= bm.warning) edgeScore = edgeMax * 0.45;
      else {
        const p = (conv - bm.warning) / (bm.healthy - bm.warning);
        edgeScore = edgeMax * (0.45 + 0.55 * clamp(p, 0, 1));
      }
      convPoints += edgeScore;

      // cadence: only matters for reward->return & return->trigger (habit cadence)
      if (t.id === "t-reward-return" || t.id === "t-return-trigger") {
        const days = t._activeMedianDays;
        // ideal: <= 7 days. Penalize slower
        const edgeCadMax = 10; // 2 edges => 20
        const cad = clamp(1 - (days - 3) / 10, 0, 1); // 3d=1, 13d=0
        cadencePoints += edgeCadMax * cad;
      }
    }

    // balance: penalize extreme weakest edge
    const convs = transitionsActive.map((t) => t._activeConversion);
    const min = Math.min(...convs);
    const max = Math.max(...convs);
    const spread = clamp((max - min) / 0.7, 0, 1); // normalize
    const balancePoints = 10 * (1 - spread);

    // Risk lens weights adjust emphasis
    let score = convPoints + cadencePoints + balancePoints;
    if (state.riskLens === "speed") score = convPoints * 0.85 + cadencePoints * 1.25 + balancePoints;
    if (state.riskLens === "quality") score = convPoints * 1.1 + cadencePoints * 0.9 + balancePoints;

    score = clamp(Math.round(score), 0, 100);
    return score;
  }

  function computeProjectedD7(loop, transitionsActive) {
    // Simple directional model:
    // Baseline D7 is provided; scale by improvement in weakest and average conversion.
    const baseline = loop.baselineD7;

    const avgConv = transitionsActive.reduce((a, t) => a + t._activeConversion, 0) / transitionsActive.length;
    const weakest = transitionsActive.reduce((min, t) => (t._activeConversion < min._activeConversion ? t : min), transitionsActive[0]);

    const baseAvg = loop.transitions.reduce((a, t) => a + t.conversion, 0) / loop.transitions.length;
    const baseWeakest = loop.transitions.reduce((min, t) => (t.conversion < min.conversion ? t : min), loop.transitions[0]);

    const avgLift = clamp((avgConv - baseAvg) / Math.max(0.01, baseAvg), -0.3, 0.5);
    const weakLift = clamp((weakest._activeConversion - baseWeakest.conversion) / Math.max(0.01, baseWeakest.conversion), -0.3, 0.8);

    const projected = baseline * (1 + 0.45 * avgLift + 0.35 * weakLift);
    return clamp(projected, 0.02, 0.75);
  }

  function computeEdgeRisk(loop, tActive) {
    const bm = loop.benchmarks[tActive.id];
    const conv = tActive._activeConversion;
    const sev = computeSeverityByConversion(conv, bm.healthy, bm.warning);

    // risk score (0..100): distance from healthy + volume weighting
    const gap = clamp((bm.healthy - conv) / Math.max(0.0001, bm.healthy - 0.05), 0, 1);
    const volume = clamp(Math.log10((tActive.volume || 1)) / 6, 0, 1); // rough
    const timePenalty = (tActive.id === "t-reward-return" || tActive.id === "t-return-trigger")
      ? clamp((tActive._activeMedianDays - 5) / 10, 0, 1)
      : 0;

    let risk = 100 * (0.55 * gap + 0.35 * volume + 0.10 * timePenalty);
    if (state.riskLens === "speed") risk = 100 * (0.48 * gap + 0.30 * volume + 0.22 * timePenalty);
    if (state.riskLens === "quality") risk = 100 * (0.65 * gap + 0.30 * volume + 0.05 * timePenalty);

    return { severity: sev, riskScore: clamp(Math.round(risk), 0, 100) };
  }

  function updateKPIs(loop, transitionsActive) {
    const score = computeLoopScore(loop, transitionsActive);
    dom.loopScoreValue.textContent = String(score);

    const scoreSev = score >= 72 ? "ok" : score >= 55 ? "warning" : "critical";
    dom.loopScoreBadge.className = `badge badge--${scoreSev}`;
    dom.loopScoreBadge.textContent = severityBadgeText(scoreSev);

    dom.loopScoreHint.textContent = state.mode === "observed"
      ? "Observed data"
      : (state.scenarioEnabled ? "Simulated (scenario + knobs)" : "Simulated (knobs)");

    dom.gaugeFill.style.width = `${score}%`;
    dom.gaugeFill.style.background = scoreColor(scoreSev);

    const weakest = transitionsActive.reduce((min, t) => (t._activeConversion < min._activeConversion ? t : min), transitionsActive[0]);
    dom.weakestTransition.textContent = transitionLabel(loop, weakest);
    const weakestRisk = computeEdgeRisk(loop, weakest);
    dom.weakestBadge.className = `badge badge--${weakestRisk.severity}`;
    dom.weakestBadge.textContent = severityBadgeText(weakestRisk.severity);

    const drop = 1 - weakest._activeConversion;
    dom.weakestDropoff.textContent = `${fmtPct(drop)} drop-off`;

    const projected = computeProjectedD7(loop, transitionsActive);
    dom.projectedD7.textContent = String(Math.round(projected * 1000) / 10);

    const delta = projected - loop.baselineD7;
    const deltaPct = delta >= 0 ? `+${Math.round(delta * 1000) / 10}` : `${Math.round(delta * 1000) / 10}`;
    dom.projectionDelta.textContent = `Δ ${deltaPct} pts vs baseline`;

    dom.projectionBadge.className = `badge badge--${delta >= 0.01 ? "ok" : delta <= -0.01 ? "critical" : "neutral"}`;
    dom.projectionBadge.textContent = state.mode === "observed" ? "baseline" : "projected";
  }

  function renderBenchmarks(loop) {
    const rows = loop.transitions.map((t) => {
      const bm = loop.benchmarks[t.id];
      return `
        <tr>
          <td>${escapeHtml(transitionLabel(loop, t))}</td>
          <td>${fmtPct(bm.healthy)}</td>
          <td>${fmtPct(bm.warning)}</td>
          <td>${fmtPct(Math.max(0, bm.warning - 0.08))}</td>
        </tr>
      `;
    }).join("");
    dom.benchmarksTableBody.innerHTML = rows;
  }

  function renderLoopCanvas(loop, transitionsActive) {
    dom.loopCanvas.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "loop-grid";

    const steps = ["trigger", "action", "reward", "return"];
    const stepMap = new Map(loop.steps.map((s) => [s.key, s]));

    // Position: trigger and action on first row, reward and return on second row; edges between.
    const node1 = renderNode(stepMap.get("trigger"));
    const edge1 = renderEdge(transitionsActive.find((t) => t.id === "t-trigger-action"), loop);
    const node2 = renderNode(stepMap.get("action"));
    const edge2 = renderEdge(transitionsActive.find((t) => t.id === "t-action-reward"), loop);
    const node3 = renderNode(stepMap.get("reward"));
    const edge3 = renderEdge(transitionsActive.find((t) => t.id === "t-reward-return"), loop);
    const node4 = renderNode(stepMap.get("return"));
    const edge4 = renderEdge(transitionsActive.find((t) => t.id === "t-return-trigger"), loop);

    // Build grid:
    // row1: trigger | edge1 | action
    // row2: reward  | edge3 | return
    // and place edge2 below action (full width) and edge4 below return (full width)
    grid.appendChild(node1);
    grid.appendChild(edge1);
    grid.appendChild(node2);

    grid.appendChild(node3);
    grid.appendChild(edge3);
    grid.appendChild(node4);

    dom.loopCanvas.appendChild(grid);

    const below = document.createElement("div");
    below.style.marginTop = "16px";
    below.innerHTML = `
      <div class="section-title">Cross-edges</div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div id="edge2Slot"></div>
        <div id="edge4Slot"></div>
      </div>
    `;
    dom.loopCanvas.appendChild(below);
    $("#edge2Slot", dom.loopCanvas).appendChild(edge2);
    $("#edge4Slot", dom.loopCanvas).appendChild(edge4);

    // Apply selection highlight after render
    applySelectionStyles(loop);
  }

  function renderNode(step) {
    const el = document.createElement("div");
    el.className = "node";
    el.dataset.selectType = "step";
    el.dataset.selectKey = step.key;

    el.innerHTML = `
      <div class="node__title">${escapeHtml(step.title)}: ${escapeHtml(step.label)}</div>
      <div class="node__meta">
        <span class="tag">${escapeHtml(step.key)}</span>
        <a href="#inspect" data-action="inspect" class="node__inspect">inspect</a>
      </div>
      <div class="muted" style="margin-top:8px; font-size: 14px;">
        ${escapeHtml(step.definition)}
      </div>
    `;

    el.addEventListener("click", (e) => {
      const action = e.target && e.target.getAttribute && e.target.getAttribute("data-action");
      if (action === "inspect") e.preventDefault();
      select({ type: "step", key: step.key }, { source: "canvas" });
    });

    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select({ type: "step", key: step.key }, { source: "canvas" });
      }
    });
    el.tabIndex = 0;
    return el;
  }

  function renderEdge(tActive, loop) {
    const { severity, riskScore } = computeEdgeRisk(loop, tActive);
    const conv = tActive._activeConversion;
    const drop = 1 - conv;

    const metric = state.metric;
    let metricLine = "";
    if (metric === "conversion") metricLine = `${fmtPct(conv)} conversion`;
    if (metric === "dropoff") metricLine = `${fmtPct(drop)} drop-off`;
    if (metric === "timeToNext") metricLine = `${fmtDays(tActive._activeMedianDays)} median`;

    const el = document.createElement("div");
    el.className = "edge";
    el.dataset.selectType = "transition";
    el.dataset.selectKey = tActive.id;

    el.innerHTML = `
      <div class="edge__title">${escapeHtml(transitionLabel(loop, tActive))}</div>
      <div style="display:flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <span class="badge badge--${severity}">${escapeHtml(severityBadgeText(severity))}</span>
        <span class="muted">${escapeHtml(metricLine)}</span>
        <span class="muted">risk ${riskScore}/100</span>
      </div>
      <div style="margin-top:8px;" aria-hidden="true">
        <div class="edge__bar"><div class="edge__bar-fill" style="width:${Math.round(conv * 100)}%"></div></div>
      </div>
    `;

    el.addEventListener("click", () => select({ type: "transition", key: tActive.id }, { source: "canvas" }));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select({ type: "transition", key: tActive.id }, { source: "canvas" });
      }
    });
    el.tabIndex = 0;

    return el;
  }

  function renderTransitionsTable(loop, transitionsActive) {
    const rows = transitionsActive.map((t) => {
      const from = getStep(loop, t.from).title;
      const to = getStep(loop, t.to).title;
      const conv = t._activeConversion;
      const drop = 1 - conv;

      const { severity, riskScore } = computeEdgeRisk(loop, t);
      const signals = t.signals.slice(0, 2).map((s) => `• ${s}`).join("<br/>");

      return {
        id: t.id,
        from,
        to,
        conv,
        drop,
        days: t._activeMedianDays,
        severity,
        riskScore,
        signalsHtml: signals
      };
    });

    // Sort
    const sorted = rows.slice();
    const sort = dom.sortSelect.value;
    sorted.sort((a, b) => {
      if (sort === "riskDesc") return b.riskScore - a.riskScore;
      if (sort === "dropoffDesc") return b.drop - a.drop;
      if (sort === "conversionAsc") return a.conv - b.conv;
      if (sort === "timeDesc") return b.days - a.days;
      return 0;
    });

    // Filter
    const filter = dom.filterSelect.value;
    const filtered = sorted.filter((r) => {
      if (filter === "critical") return r.severity === "critical";
      if (filter === "warning") return r.severity === "critical" || r.severity === "warning";
      return true;
    });

    dom.transitionsTbody.innerHTML = filtered.map((r) => {
      const isSelected = state.selection.type === "transition" && state.selection.key === r.id;
      return `
        <tr data-transition-id="${escapeAttr(r.id)}" class="${isSelected ? "is-selected" : ""}">
          <td>${escapeHtml(r.from)}</td>
          <td>${escapeHtml(r.to)}</td>
          <td>${fmtPct(r.conv)}</td>
          <td>${fmtPct(r.drop)}</td>
          <td>${fmtDays(r.days)}</td>
          <td><span class="badge badge--${escapeAttr(r.severity)}">${escapeHtml(severityBadgeText(r.severity))}</span> <span class="muted">(${r.riskScore})</span></td>
          <td class="muted" style="font-size: 14px;">${r.signalsHtml}</td>
        </tr>
      `;
    }).join("");

    $$("#transitionsTbody tr").forEach((tr) => {
      tr.addEventListener("click", () => {
        const id = tr.getAttribute("data-transition-id");
        select({ type: "transition", key: id }, { source: "table" });
      });
    });
  }

  function renderInterventions(loop, transitionsActive) {
    // Determine target based on selection
    let targetStep = dom.interventionTarget.value;
    if (targetStep === "auto") {
      if (state.selection.type === "transition") {
        const t = transitionsActive.find((x) => x.id === state.selection.key);
        targetStep = t ? t.to : "action";
      } else if (state.selection.type === "step") {
        targetStep = state.selection.key;
      } else {
        // Default to weakest transition's "to" step
        const weakest = transitionsActive.reduce((min, t) => (t._activeConversion < min._activeConversion ? t : min), transitionsActive[0]);
        targetStep = weakest.to;
      }
    }

    const type = dom.interventionType.value;

    const list = INTERVENTIONS
      .filter((it) => type === "all" ? true : it.type === type)
      .filter((it) => it.targets.includes(targetStep))
      .map((it) => {
        const isAdded = state.scenario.includes(it.id);
        const effectText = effectToText(it.effect);

        return `
          <div class="library-item" data-int-id="${escapeAttr(it.id)}">
            <div class="library-item__title">${escapeHtml(it.title)}</div>
            <div class="library-item__meta">
              <span class="tag">${escapeHtml(it.type)}</span>
              ${it.targets.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
              <span class="muted">Owner: ${escapeHtml(it.owner)}</span>
            </div>
            <div class="library-item__body">${escapeHtml(it.description)}</div>
            <div class="library-item__meta">
              <span class="badge badge--neutral">${escapeHtml(effectText)}</span>
            </div>
            <div class="library-item__actions">
              <button type="button" class="btn btn--primary" data-action="add" ${isAdded ? "disabled" : ""}>Add to scenario</button>
              <button type="button" class="btn" data-action="inspect">Inspect</button>
            </div>
          </div>
        `;
      });

    dom.interventionList.innerHTML = list.join("") || `
      <div class="empty">
        <div class="empty__title">No interventions match this filter</div>
        <div class="empty__body">Try a different target step or intervention type.</div>
      </div>
    `;

    $$(".library-item", dom.interventionList).forEach((card) => {
      const id = card.getAttribute("data-int-id");
      card.addEventListener("click", (e) => {
        const action = e.target && e.target.getAttribute && e.target.getAttribute("data-action");
        if (!action) return;
        if (action === "add") {
          e.preventDefault();
          addToScenario(id);
        }
        if (action === "inspect") {
          e.preventDefault();
          renderInspectorIntervention(id, { focus: true });
        }
      });
    });
  }

  function renderScenario(loop, transitionsActive) {
    const chosen = state.scenario.map((id) => INTERVENTIONS.find((x) => x.id === id)).filter(Boolean);

    dom.scenarioTbody.innerHTML = chosen.map((it) => {
      const targets = it.targets.map((t) => `[${t}]`).join(" ");
      return `
        <tr data-int-id="${escapeAttr(it.id)}">
          <td>${escapeHtml(it.title)}</td>
          <td class="muted">${escapeHtml(targets)}</td>
          <td>${escapeHtml(effectToText(it.effect))}</td>
          <td class="muted">${escapeHtml(it.owner)}</td>
          <td><button type="button" class="btn" data-action="remove">Remove</button></td>
        </tr>
      `;
    }).join("") || `
      <tr>
        <td colspan="5">
          <div class="empty">
            <div class="empty__title">No scenario items yet</div>
            <div class="empty__body">Add 1–3 interventions from the library or use Quick add in the inspector.</div>
          </div>
        </td>
      </tr>
    `;

    $$("#scenarioTbody tr").forEach((tr) => {
      const id = tr.getAttribute("data-int-id");
      const btn = $("button[data-action='remove']", tr);
      if (btn) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          removeFromScenario(id);
        });
      }
    });

    // Impact panel uses scenarioEnabled regardless of current mode
    const priorMode = state.mode;
    const priorScenario = state.scenarioEnabled;
    state.mode = "simulated";
    state.scenarioEnabled = true;

    const simTransitions = getActiveTransitions(loop);
    const impactScore = computeLoopScore(loop, simTransitions);
    const impactD7 = computeProjectedD7(loop, simTransitions);

    dom.impactScore.textContent = String(impactScore);
    dom.impactD7.textContent = String(Math.round(impactD7 * 1000) / 10);

    const { agg } = computeScenarioAggregateEffect();
    const driver = Math.abs(agg.friction) >= Math.abs(agg.reward) && Math.abs(agg.friction) >= Math.abs(agg.speed)
      ? "Action friction"
      : (Math.abs(agg.reward) >= Math.abs(agg.speed) ? "Reward strength" : "Return speed");
    dom.impactDriver.textContent = driver;

    dom.assumptionsList.innerHTML = [
      `Effects are applied as percentage multipliers to specific transitions (see knobs).`,
      `Scenario effects are capped to avoid unrealistic outcomes.`,
      `D7 projection is directional: based on average conversion and weakest-link lift.`
    ].map((x) => `<li>${escapeHtml(x)}</li>`).join("");

    state.mode = priorMode;
    state.scenarioEnabled = priorScenario;
  }

  function renderInspector(loop, transitionsActive) {
    if (!state.selection.type) {
      dom.inspectorSubtitle.textContent = "Click a step or transition";
      dom.inspectorBody.innerHTML = `
        <div class="empty">
          <div class="empty__title">Nothing selected</div>
          <div class="empty__body">Use the loop map or transitions table to select a step or transition.</div>
        </div>
      `;
      dom.quickAddHint.textContent = "Tip: pick a transition first to get better suggestions.";
      return;
    }

    if (state.selection.type === "step") {
      const step = getStep(loop, state.selection.key);
      dom.inspectorSubtitle.textContent = `${step.title}: ${step.label}`;

      dom.inspectorBody.innerHTML = `
        <div class="kv">
          <div class="kv__row"><div class="kv__key">Step</div><div class="kv__val">${escapeHtml(step.key)}</div></div>
          <div class="kv__row"><div class="kv__key">Definition</div><div class="kv__val muted">${escapeHtml(step.definition)}</div></div>
          <div class="kv__row"><div class="kv__key">Key KPIs</div><div class="kv__val">${step.kpis.map((k) => `<div><span class="muted">${escapeHtml(k.label)}:</span> ${escapeHtml(k.value)}</div>`).join("")}</div></div>
        </div>

        <div class="signal-list">
          <div class="section-title">Signals</div>
          <ul>
            ${step.signals.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
          </ul>
        </div>
      `;
      dom.quickAddHint.textContent = "Quick add uses the weakest transition by default. Select a transition for better fit.";
      return;
    }

    if (state.selection.type === "transition") {
      const t = transitionsActive.find((x) => x.id === state.selection.key) || transitionsActive[0];
      const base = getTransition(loop, t.id);
      const bm = loop.benchmarks[t.id];
      const conv = t._activeConversion;
      const drop = 1 - conv;
      const { severity, riskScore } = computeEdgeRisk(loop, t);

      dom.inspectorSubtitle.textContent = transitionLabel(loop, t);

      const simNote = state.mode === "observed"
        ? "Observed values."
        : (state.scenarioEnabled ? "Simulated using knobs + scenario." : "Simulated using knobs.");

      const gaps = {
        toHealthy: bm.healthy - conv,
        toWarning: bm.warning - conv
      };

      dom.inspectorBody.innerHTML = `
        <div class="kv">
          <div class="kv__row"><div class="kv__key">Status</div><div class="kv__val">
            <span class="badge badge--${escapeAttr(severity)}">${escapeHtml(severityBadgeText(severity))}</span>
            <span class="muted">risk ${riskScore}/100</span>
          </div></div>

          <div class="kv__row"><div class="kv__key">Conversion</div><div class="kv__val">${fmtPct(conv)} <span class="muted">(drop-off ${fmtPct(drop)})</span></div></div>
          <div class="kv__row"><div class="kv__key">Median time</div><div class="kv__val">${fmtDays(t._activeMedianDays)}</div></div>
          <div class="kv__row"><div class="kv__key">Volume</div><div class="kv__val">${escapeHtml(String(base.volume).replace(/\B(?=(\d{3})+(?!\d))/g, ","))} per week</div></div>

          <div class="kv__row"><div class="kv__key">Benchmark</div><div class="kv__val">
            <div><span class="muted">Healthy:</span> ${fmtPct(bm.healthy)}</div>
            <div><span class="muted">Warning:</span> ${fmtPct(bm.warning)}</div>
          </div></div>

          <div class="kv__row"><div class="kv__key">Gap</div><div class="kv__val">
            <div><span class="muted">To healthy:</span> ${gaps.toHealthy > 0 ? fmtPct(gaps.toHealthy) : "—"}</div>
            <div><span class="muted">To warning:</span> ${gaps.toWarning > 0 ? fmtPct(gaps.toWarning) : "—"}</div>
          </div></div>

          <div class="kv__row"><div class="kv__key">Mode</div><div class="kv__val muted">${escapeHtml(simNote)}</div></div>
        </div>

        <div class="signal-list">
          <div class="section-title">Evidence signals</div>
          <ul>
            ${base.signals.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
          </ul>
        </div>

        <hr />

        <div class="signal-list">
          <div class="section-title">Notes</div>
          <div class="muted" style="font-size: 14px;">${escapeHtml(base.notes)}</div>
        </div>
      `;

      dom.quickAddHint.textContent = "Quick add picks interventions that target this transition’s destination step.";
      return;
    }
  }

  function renderInspectorIntervention(interventionId, opts = {}) {
    const it = INTERVENTIONS.find((x) => x.id === interventionId);
    if (!it) return;

    dom.inspectorSubtitle.textContent = "Intervention";

    dom.inspectorBody.innerHTML = `
      <div class="kv">
        <div class="kv__row"><div class="kv__key">Title</div><div class="kv__val">${escapeHtml(it.title)}</div></div>
        <div class="kv__row"><div class="kv__key">Type</div><div class="kv__val">${escapeHtml(it.type)}</div></div>
        <div class="kv__row"><div class="kv__key">Targets</div><div class="kv__val">${it.targets.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join(" ")}</div></div>
        <div class="kv__row"><div class="kv__key">Effect</div><div class="kv__val"><span class="badge badge--neutral">${escapeHtml(effectToText(it.effect))}</span></div></div>
        <div class="kv__row"><div class="kv__key">Owner</div><div class="kv__val">${escapeHtml(it.owner)}</div></div>
        <div class="kv__row"><div class="kv__key">Description</div><div class="kv__val muted">${escapeHtml(it.description)}</div></div>
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn--primary" id="inspectorAddToScenario" ${state.scenario.includes(it.id) ? "disabled" : ""}>Add to scenario</button>
        <button type="button" class="btn" id="inspectorGoScenario">Go to simulator</button>
      </div>
    `;

    const addBtn = $("#inspectorAddToScenario");
    if (addBtn) addBtn.addEventListener("click", () => addToScenario(it.id));
    const goBtn = $("#inspectorGoScenario");
    if (goBtn) goBtn.addEventListener("click", () => setView("scenario"));

    if (opts.focus) {
      setView(state.view); // keep view
      dom.inspectorBody.scrollIntoView({ block: "start" });
    }
  }

  function applySelectionStyles(loop) {
    // canvas
    $$(".node, .edge", dom.loopCanvas).forEach((el) => {
      const type = el.dataset.selectType;
      const key = el.dataset.selectKey;
      const selected = state.selection.type === type && state.selection.key === key;
      el.classList.toggle("is-selected", selected);
    });

    // table rows
    $$("#transitionsTbody tr").forEach((tr) => {
      const id = tr.getAttribute("data-transition-id");
      const selected = state.selection.type === "transition" && state.selection.key === id;
      tr.classList.toggle("is-selected", selected);
    });
  }

  function select(sel, opts = {}) {
    if (state.pinned && opts.source !== "force") return;

    const prev = `${state.selection.type || ""}:${state.selection.key || ""}`;
    const next = `${sel.type || ""}:${sel.key || ""}`;
    if (prev === next) return;

    state.selection = sel;
    if (!state.lockSelection) {
      // If selecting transition, keep intervention library target aligned
      // (renderInterventions will compute auto anyway)
    }
    rerender();
  }

  function clearSelection() {
    state.selection = { type: null, key: null };
    state.pinned = false;
    dom.pinSelection.textContent = "Pin";
    rerender();
  }

  function setView(view) {
    state.view = view;

    dom.navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.view === view));
    $$(".view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === view));

    persist();
    rerender({ partial: true });
  }

  function updateModeButtons() {
    dom.modeObserved.classList.toggle("is-active", state.mode === "observed");
    dom.modeSimulated.classList.toggle("is-active", state.mode === "simulated");
  }

  function effectToText(effect) {
    const parts = [];
    if (effect.friction) parts.push(`action +${effect.friction}%`); // naming matches UI knob
    if (effect.reward) parts.push(`reward +${effect.reward}%`);
    if (effect.speed) parts.push(`return +${effect.speed}%`);
    return parts.length ? parts.join(", ") : "no effect";
  }

  function addToScenario(interventionId) {
    if (state.scenario.includes(interventionId)) return;
    state.scenario.push(interventionId);
    persist();
    toast("Added to scenario");
    rerender();
  }

  function removeFromScenario(interventionId) {
    state.scenario = state.scenario.filter((id) => id !== interventionId);
    persist();
    toast("Removed from scenario");
    rerender();
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function escapeAttr(s) {
    return escapeHtml(s).replaceAll("`", "&#096;");
  }

  function toast(message) {
    dom.toast.textContent = message;
    dom.toast.style.display = "block";
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(() => {
      dom.toast.style.display = "none";
      dom.toast.textContent = "";
    }, 1800);
  }

  function updateKnobLabels() {
    dom.knobFrictionValue.textContent = String(state.knobs.friction);
    dom.knobRewardValue.textContent = String(state.knobs.reward);
    dom.knobSpeedValue.textContent = String(state.knobs.speed);
  }

  function autoSelectWeakest(loop, transitionsActive) {
    const weakest = transitionsActive.reduce((min, t) => (t._activeConversion < min._activeConversion ? t : min), transitionsActive[0]);
    select({ type: "transition", key: weakest.id }, { source: "force" });
  }

  function quickAdd(kind) {
    const loop = getLoop();
    const transitionsActive = getActiveTransitions(loop);

    let targetStep = null;
    if (state.selection.type === "transition") {
      const t = transitionsActive.find((x) => x.id === state.selection.key);
      targetStep = t ? t.to : null;
    }
    if (state.selection.type === "step") targetStep = state.selection.key;

    if (!targetStep) {
      const weakest = transitionsActive.reduce((min, t) => (t._activeConversion < min._activeConversion ? t : min), transitionsActive[0]);
      targetStep = weakest.to;
    }

    const candidates = INTERVENTIONS.filter((it) => it.targets.includes(targetStep))
      .filter((it) => !state.scenario.includes(it.id));

    if (!candidates.length) {
      toast("No matching interventions available");
      return;
    }

    // "best" = highest absolute positive effect relevant to target step
    const scored = candidates.map((it) => {
      const score = Math.max(0, it.effect.friction || 0) + Math.max(0, it.effect.reward || 0) + Math.max(0, it.effect.speed || 0);
      return { it, score };
    }).sort((a, b) => b.score - a.score);

    const pick = kind === "alt" ? (scored[1] ? scored[1].it : scored[0].it) : scored[0].it;
    addToScenario(pick.id);
    renderInspectorIntervention(pick.id);
  }

  function buildMarkdown(loop, transitionsActive) {
    const score = computeLoopScore(loop, transitionsActive);
    const projected = computeProjectedD7(loop, transitionsActive);
    const weakest = transitionsActive.reduce((min, t) => (t._activeConversion < min._activeConversion ? t : min), transitionsActive[0]);
    const weakestRisk = computeEdgeRisk(loop, weakest);

    const scenarioItems = state.scenario.map((id) => INTERVENTIONS.find((x) => x.id === id)).filter(Boolean);

    const modeLine = state.mode === "observed"
      ? "Observed data"
      : (state.scenarioEnabled ? "Simulated (scenario + knobs)" : "Simulated (knobs)");

    const knobLine = `Knobs: action ${state.knobs.friction}% | reward ${state.knobs.reward}% | return ${state.knobs.speed}%`;

    const scenarioLine = scenarioItems.length
      ? scenarioItems.map((it) => `- ${it.title} (${effectToText(it.effect)})`).join("\n")
      : "- (none)";

    return [
      `# Retention Loop Analyzer — Summary`,
      ``,
      `**Loop:** ${loop.name}`,
      `**Product:** ${loop.product}`,
      `**Cohort:** ${loop.cohort}`,
      `**Mode:** ${modeLine}`,
      ``,
      `## Health`,
      `- Loop strength: **${score}/100**`,
      `- Projected D7: **${Math.round(projected * 1000) / 10}%** (baseline ${Math.round(loop.baselineD7 * 1000) / 10}%)`,
      `- Weakest transition: **${transitionLabel(loop, weakest)}** (${severityBadgeText(weakestRisk.severity)}, ${fmtPct(1 - weakest._activeConversion)} drop-off)`,
      ``,
      `## Scenario`,
      `${knobLine}`,
      ``,
      scenarioLine,
      ``,
      `## Notes`,
      state.notes ? state.notes : "_(none)_"
    ].join("\n");
  }

  function rerender(opts = {}) {
    const loop = getLoop();
    const transitionsActive = getActiveTransitions(loop);

    // Sidebar
    dom.loopContext.textContent = `${loop.product} — ${loop.cohort}. ${loop.description}`;
    updateModeButtons();

    dom.benchmarksBox.classList.toggle("is-hidden", !state.showBenchmarks);
    if (state.showBenchmarks) renderBenchmarks(loop);

    // KPIs
    updateKPIs(loop, transitionsActive);

    // Views
    if (!opts.partial || state.view === "map") renderLoopCanvas(loop, transitionsActive);
    if (!opts.partial || state.view === "transitions") renderTransitionsTable(loop, transitionsActive);
    if (!opts.partial || state.view === "interventions") renderInterventions(loop, transitionsActive);
    if (!opts.partial || state.view === "scenario") renderScenario(loop, transitionsActive);
    if (!opts.partial || state.view === "notes") {
      const md = buildMarkdown(loop, transitionsActive);
      dom.markdownPreview.textContent = md;
    }

    // Inspector always updates (selection affects any view)
    renderInspector(loop, transitionsActive);
    applySelectionStyles(loop);

    // Notes
    dom.notesBox.value = state.notes;

    persist();
  }

  function init() {
    loadPersisted();

    // Populate loop select
    dom.loopSelect.innerHTML = LOOPS.map((l) => `<option value="${escapeAttr(l.id)}">${escapeHtml(l.name)}</option>`).join("");
    dom.loopSelect.value = state.loopId;

    // Init controls
    dom.metricSelect.value = state.metric;
    dom.riskSelect.value = state.riskLens;
    dom.showBenchmarks.checked = state.showBenchmarks;
    dom.lockSelection.checked = state.lockSelection;

    dom.knobFriction.value = String(state.knobs.friction);
    dom.knobReward.value = String(state.knobs.reward);
    dom.knobSpeed.value = String(state.knobs.speed);
    updateKnobLabels();

    dom.notesBox.value = state.notes;

    // View from hash
    const hash = window.location.hash || "";
    const viewMatch = hash.match(/view=([a-z]+)/);
    if (viewMatch) state.view = viewMatch[1];

    // Ensure view visible
    setView(["map", "transitions", "interventions", "scenario", "notes"].includes(state.view) ? state.view : "map");

    // Default selection: weakest on load (unless locked/persisted selection not stored)
    const loop = getLoop();
    const transitionsActive = getActiveTransitions(loop);
    if (!state.selection.type) {
      autoSelectWeakest(loop, transitionsActive);
    }

    // Event listeners
    dom.navLinks.forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        setView(a.dataset.view);
        history.replaceState(null, "", `#view=${a.dataset.view}`);
      });
    });

    dom.loopSelect.addEventListener("change", () => {
      state.loopId = dom.loopSelect.value;
      if (!state.lockSelection) state.selection = { type: null, key: null };
      state.pinned = false;
      dom.pinSelection.textContent = "Pin";
      persist();
      const nextLoop = getLoop();
      const transitionsActive2 = getActiveTransitions(nextLoop);
      if (!state.lockSelection) autoSelectWeakest(nextLoop, transitionsActive2);
      rerender();
    });

    dom.modeObserved.addEventListener("click", () => {
      state.mode = "observed";
      persist();
      rerender();
    });
    dom.modeSimulated.addEventListener("click", () => {
      state.mode = "simulated";
      persist();
      rerender();
    });

    dom.metricSelect.addEventListener("change", () => {
      state.metric = dom.metricSelect.value;
      persist();
      rerender();
    });

    dom.riskSelect.addEventListener("change", () => {
      state.riskLens = dom.riskSelect.value;
      persist();
      rerender();
    });

    dom.showBenchmarks.addEventListener("change", () => {
      state.showBenchmarks = dom.showBenchmarks.checked;
      persist();
      rerender();
    });

    dom.lockSelection.addEventListener("change", () => {
      state.lockSelection = dom.lockSelection.checked;
      persist();
    });

    dom.pinSelection.addEventListener("click", () => {
      state.pinned = !state.pinned;
      dom.pinSelection.textContent = state.pinned ? "Pinned" : "Pin";
      toast(state.pinned ? "Selection pinned" : "Selection unpinned");
    });

    dom.autoFocusWeakest.addEventListener("click", () => {
      const l = getLoop();
      const ta = getActiveTransitions(l);
      autoSelectWeakest(l, ta);
      toast("Focused weakest transition");
    });

    dom.clearSelection.addEventListener("click", () => {
      clearSelection();
      toast("Selection cleared");
    });

    dom.sortSelect.addEventListener("change", () => rerender());
    dom.filterSelect.addEventListener("change", () => rerender());

    dom.interventionTarget.addEventListener("change", () => rerender());
    dom.interventionType.addEventListener("change", () => rerender());

    dom.knobFriction.addEventListener("input", () => {
      state.knobs.friction = clamp(Number(dom.knobFriction.value), -30, 30);
      updateKnobLabels();
    });
    dom.knobReward.addEventListener("input", () => {
      state.knobs.reward = clamp(Number(dom.knobReward.value), -30, 30);
      updateKnobLabels();
    });
    dom.knobSpeed.addEventListener("input", () => {
      state.knobs.speed = clamp(Number(dom.knobSpeed.value), -30, 30);
      updateKnobLabels();
    });

    dom.applyScenario.addEventListener("click", () => {
      persist();
      // keep knobs applied; in simulated mode, they take effect immediately
      state.mode = "simulated";
      updateModeButtons();
      toast("Applied to simulation");
      rerender();
    });

    dom.resetScenario.addEventListener("click", () => {
      state.knobs = { friction: 0, reward: 0, speed: 0 };
      dom.knobFriction.value = "0";
      dom.knobReward.value = "0";
      dom.knobSpeed.value = "0";
      updateKnobLabels();
      persist();
      toast("Knobs reset");
      rerender();
    });

    dom.useScenarioInSim.addEventListener("click", () => {
      state.scenarioEnabled = true;
      state.mode = "simulated";
      toast("Scenario enabled in simulated mode");
      persist();
      rerender();
    });

    dom.clearScenario.addEventListener("click", () => {
      state.scenario = [];
      state.scenarioEnabled = false;
      toast("Scenario cleared");
      persist();
      rerender();
    });

    dom.quickAddBest.addEventListener("click", () => quickAdd("best"));
    dom.quickAddAlt.addEventListener("click", () => quickAdd("alt"));

    dom.notesBox.addEventListener("input", () => {
      state.notes = dom.notesBox.value;
      persist();
      if (state.view === "notes") rerender({ partial: true });
    });

    dom.copyMarkdown.addEventListener("click", async () => {
      const loop2 = getLoop();
      const ta2 = getActiveTransitions(loop2);
      const md = buildMarkdown(loop2, ta2);
      try {
        await navigator.clipboard.writeText(md);
        toast("Copied markdown");
      } catch {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = md;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        toast("Copied markdown");
      }
    });

    dom.downloadMarkdown.addEventListener("click", () => {
      const loop2 = getLoop();
      const ta2 = getActiveTransitions(loop2);
      const md = buildMarkdown(loop2, ta2);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `retention-loop-analyzer-${toId(loop2.product)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast("Downloaded");
    });

    // Final render
    rerender();
  }

  init();
})();