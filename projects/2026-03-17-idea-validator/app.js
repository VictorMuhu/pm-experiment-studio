(() => {
  'use strict';

  /* ─── constants ────────────────────────────────────────────────────── */
  const STORAGE_KEY = 'pm-experiment-idea-validator:v2';
  const DEMO_ID     = 'demo-idea-2026';
  const ROUTES      = ['workspace', 'scorecard', 'assumptions', 'next-steps', 'library'];

  /* ─── tiny helpers ──────────────────────────────────────────────────── */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const nowISO      = () => new Date().toISOString();
  const uid         = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const safeText    = (s) => (typeof s === 'string' ? s.trim() : '');
  const esc         = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const formatDT    = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })} · ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  };
  const clamp       = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  /* ─── text analysis primitives ─────────────────────────────────────── */
  const countSentences   = (t) => safeText(t).split(/[.!?]+/).map(x=>x.trim()).filter(Boolean).length;
  const countNumbers     = (t) => (safeText(t).match(/\b\d+(\.\d+)?%?\b/g) || []).length;
  const hasTimeframe     = (t) => /\b(days?|weeks?|months?|quarters?|q[1-4]|year|yrs?|sprints?)\b/i.test(safeText(t)) || /\b\d{4}\b/.test(safeText(t));
  const hasComparative   = (t) => /\b(better|faster|cheaper|easier|reduce|increase|improve|cut|save|vs\.?|versus|instead of|replace)\b/i.test(safeText(t));
  const commaCount       = (t) => safeText(t).split(',').map(x=>x.trim()).filter(Boolean).length;

  /* ─── scoring weights by stage ──────────────────────────────────────── */
  const stageWeights = (stage) => {
    const map = {
      seed:      { problem_clarity:0.18, user_specificity:0.12, value_clarity:0.16, differentiation:0.10, distribution:0.10, metric:0.14, feasibility:0.10, competition:0.10 },
      'series-a':{ problem_clarity:0.16, user_specificity:0.12, value_clarity:0.16, differentiation:0.12, distribution:0.12, metric:0.14, feasibility:0.10, competition:0.08 },
      'scale-up':{ problem_clarity:0.14, user_specificity:0.10, value_clarity:0.14, differentiation:0.14, distribution:0.12, metric:0.14, feasibility:0.14, competition:0.08 },
      enterprise:{ problem_clarity:0.12, user_specificity:0.10, value_clarity:0.12, differentiation:0.14, distribution:0.12, metric:0.14, feasibility:0.18, competition:0.08 },
    };
    return map[stage] || { problem_clarity:0.15, user_specificity:0.12, value_clarity:0.15, differentiation:0.12, distribution:0.12, metric:0.14, feasibility:0.12, competition:0.08 };
  };

  /* ─── analysis engine ───────────────────────────────────────────────── */
  function analyzeDraft(draft) {
    const stage      = draft.ideaStage || 'series-a';
    const weights    = stageWeights(stage);
    const problem    = safeText(draft.problem);
    const target     = safeText(draft.target);
    const valueProp  = safeText(draft.valueProp);
    const solution   = safeText(draft.solution);
    const diff       = safeText(draft.differentiation);
    const channels   = safeText(draft.channels);
    const metric     = safeText(draft.successMetric);
    const constraints= safeText(draft.constraints);
    const competitorCount = commaCount(draft.competitors);

    const scoreProblem = clamp(
      (problem.length >= 160 ? 85 : problem.length >= 100 ? 65 : problem.length >= 60 ? 42 : problem.length > 0 ? 25 : 0) +
      (countSentences(problem) >= 2 ? 8 : 0) + (countNumbers(problem) > 0 ? 7 : 0), 0, 100);

    const scoreTarget = clamp(
      (target.length >= 45 ? 85 : target.length >= 25 ? 65 : target.length >= 12 ? 45 : target.length > 0 ? 25 : 0) +
      (/ at | in /i.test(target) ? 8 : 0) +
      (/manager|lead|coordinator|director|founder|head of/i.test(target) ? 4 : 0), 0, 100);

    const scoreValue = clamp(
      (valueProp.length >= 120 ? 80 : valueProp.length >= 80 ? 62 : valueProp.length >= 40 ? 42 : valueProp.length > 0 ? 24 : 0) +
      (hasComparative(valueProp) ? 10 : 0) + (countNumbers(valueProp) > 0 ? 10 : 0), 0, 100);

    const scoreDiff = clamp(
      (diff.length >= 110 ? 78 : diff.length >= 70 ? 58 : diff.length >= 35 ? 38 : diff.length > 0 ? 20 : 0) +
      (hasComparative(diff) ? 12 : 0) +
      (competitorCount >= 3 ? -8 : competitorCount === 0 ? -4 : 0), 0, 100);

    const scoreDistribution = clamp(
      (channels.length >= 100 ? 75 : channels.length >= 60 ? 55 : channels.length >= 30 ? 38 : channels.length > 0 ? 20 : 0) +
      (/in-product|sales|partner|outbound|inbound/i.test(channels) ? 10 : 0), 0, 100);

    const scoreMetric = clamp(
      (metric.length >= 70 ? 75 : metric.length >= 40 ? 55 : metric.length >= 18 ? 35 : metric.length > 0 ? 20 : 0) +
      (countNumbers(metric) > 0 ? 15 : 0) + (hasTimeframe(metric) ? 10 : 0), 0, 100);

    const feasPenalty = (() => {
      if (!constraints) return 0;
      let p = 0;
      if (/hipaa|gdpr|sox|pci|phi|pii|regulat|compliance/i.test(constraints)) p += 12;
      if (/integration|legacy|ehr|erp|sso|procurement|security review/i.test(constraints)) p += 10;
      if (/reliability|uptime|latency|offline/i.test(constraints)) p += 6;
      if (/\bml\b|ai\b|model|llm/i.test(constraints)) p += 5;
      return clamp(p, 0, 22);
    })();
    const scoreFeasibility = clamp(82 - feasPenalty, 0, 100);

    const compPenalty = competitorCount >= 6 ? 18 : competitorCount >= 4 ? 12 : competitorCount >= 2 ? 6 : competitorCount === 1 ? 3 : 0;
    const scoreCompetition = clamp(88 - compPenalty, 0, 100);

    const dims = [
      { key:'problem_clarity',  label:'Problem clarity',      score:scoreProblem,
        why: scoreProblem  >= 70 ? 'Specific moment + consequence.' : scoreProblem  >= 45 ? 'Some clarity, missing context.' : 'Reads like a theme, not a moment.',
        raise:'Write the day-in-the-life moment and what breaks (with a number if possible).' },
      { key:'user_specificity', label:'User specificity',     score:scoreTarget,
        why: scoreTarget   >= 70 ? 'Target is recruitable (role + context).' : scoreTarget   >= 45 ? 'Role present, context thin.' : 'Could describe many people.',
        raise:'Add environment: company type, workflow, constraints, decision authority.' },
      { key:'value_clarity',    label:'Value proposition',    score:scoreValue,
        why: scoreValue    >= 70 ? 'Switch reason is evident.' : scoreValue    >= 45 ? 'Benefit implied, not contrasted.' : 'Reads like a feature list.',
        raise:'Name the default option and why your approach changes the outcome.' },
      { key:'differentiation',  label:'Differentiation',      score:scoreDiff,
        why: scoreDiff     >= 70 ? 'Clear contrast to substitutes.' : scoreDiff     >= 45 ? 'Exists, could be copied quickly.' : 'Hard to see why this wins.',
        raise:'Describe why the default fails and what you can do that others can\'t.' },
      { key:'distribution',     label:'Distribution',         score:scoreDistribution,
        why: scoreDistribution >= 70 ? 'Plausible adoption path.' : scoreDistribution >= 45 ? 'Channel named, mechanism unclear.' : '"Marketing" without a path.',
        raise:'Name one channel with a loop: who discovers → who buys → how it spreads.' },
      { key:'metric',           label:'Success metric',       score:scoreMetric,
        why: scoreMetric   >= 70 ? 'Measurable and time-bound.' : scoreMetric   >= 45 ? 'Metric exists, not yet falsifiable.' : 'No success definition.',
        raise:'Add a number and a timeframe. "10% reduction in 8 weeks" beats "improve outcome".' },
      { key:'feasibility',      label:'Feasibility',          score:scoreFeasibility,
        why: scoreFeasibility >= 70 ? 'No major execution landmines.' : scoreFeasibility >= 50 ? 'Some execution risk flagged.' : 'Significant constraints named.',
        raise:'List the top integration or compliance risk and the spike that de-risks it.' },
      { key:'competition',      label:'Competitive space',    score:scoreCompetition,
        why: scoreCompetition >= 70 ? 'Field is navigable.' : scoreCompetition >= 50 ? 'Some crowding; wedge needs sharpening.' : 'Crowded space; wedge must be specific.',
        raise:'Name why the #1 substitute fails your target user in your specific wedge.' },
    ];

    const baseScore = Math.round(
      dims.reduce((acc, d) => acc + d.score * (weights[d.key] || 0.125), 0));

    const flags = {
      problemVague:    scoreProblem < 45,
      targetVague:     scoreTarget  < 45,
      metricMissing:   !metric || scoreMetric < 40,
      channelMissing:  !channels || scoreDistribution < 40,
      lowDiff:         scoreDiff  < 45,
      crowded:         competitorCount >= 4,
      highConstraints: feasPenalty >= 15,
    };

    const verdictFromScore = (s) =>
      s >= 76 ? { label:'Pursue',          reason:'The idea is clear enough to invest in targeted validation.' }
      : s >= 56 ? { label:'Refine',         reason:'Promising, but specific gaps will slow execution or learning.' }
      :           { label:'Pass (for now)', reason:'Too many core assumptions are unspoken; validate cheaply or park it.' };

    const { label, reason } = verdictFromScore(baseScore);

    const tags = [];
    if (flags.metricMissing)  tags.push('metric missing');
    if (flags.channelMissing) tags.push('distribution unclear');
    if (flags.problemVague)   tags.push('problem vague');
    if (flags.lowDiff)        tags.push('weak differentiation');
    if (flags.crowded)        tags.push('crowded space');
    if (flags.highConstraints)tags.push('execution risk');

    const strongSignals = [];
    const weakSignals   = [];
    if (scoreProblem >= 70)      strongSignals.push('Problem is specific enough to recruit and run interviews within a week.');
    if (scoreTarget  >= 65)      strongSignals.push('Target user reads recruitable (role + context).');
    if (scoreValue   >= 70)      strongSignals.push('Value proposition includes a switch reason, not just a feature.');
    if (scoreMetric  >= 65)      strongSignals.push('Success metric is measurable; the draft can be falsified.');
    if (scoreDistribution >= 65) strongSignals.push('Distribution has a plausible path to adoption.');
    if (scoreFeasibility  >= 75) strongSignals.push('No major execution landmines named; likely feasible for a pilot.');

    if (!problem)              weakSignals.push('The draft doesn\'t name the moment where the problem happens (who, when, what breaks).');
    else if (scoreProblem < 45) weakSignals.push('Problem statement too general; add context and consequence.');
    if (!metric)               weakSignals.push('No measurable win; add a target delta and timeframe.');
    else if (scoreMetric < 45)  weakSignals.push('Metric present but not falsifiable yet (add numbers + timeframe).');
    if (!channels)             weakSignals.push('Distribution missing; pick one credible channel and explain the loop.');
    else if (scoreDistribution < 45) weakSignals.push('Channel named but mechanism unclear (who sells, where discovered, why adopted).');
    if (!diff)                 weakSignals.push('Differentiation missing; compare to the default option explicitly.');
    else if (scoreDiff < 45)    weakSignals.push('Differentiation weak; write why the default fails and what you can do uniquely.');
    if (flags.crowded)         weakSignals.push('Many substitutes exist; consider a narrower wedge or distribution advantage.');
    if (flags.highConstraints) weakSignals.push('Constraints suggest integration/compliance risk; plan a technical spike early.');

    return {
      stage, weights, score: baseScore, dims,
      verdict: { label, reason }, tags,
      strongSignals: strongSignals.slice(0, 4),
      weakSignals:   weakSignals.slice(0, 4),
      flags, feasPenalty, competitorCount
    };
  }

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
      tags:          apiResult.tags           || [],
      strongSignals: apiResult.strongSignals  || [],
      weakSignals:   apiResult.weakAssumptions || [],
      flags,
      feasPenalty:     0,
      competitorCount: commaCount(draft.competitors),
    };
  }

  /* ─── assumptions builder ───────────────────────────────────────────── */
  function buildAssumptions(draft, analysis) {
    const out  = [];
    const push = (a) => out.push({ id:uid(), createdAt:nowISO(), updatedAt:nowISO(),
      statement:'', whyFragile:'', evidence:'', confidence:30, testMethod:'interviews', owner:'PM', ...a });

    const target     = safeText(draft.target);
    const problem    = safeText(draft.problem);
    const valueProp  = safeText(draft.valueProp);
    const channels   = safeText(draft.channels);
    const competitors= safeText(draft.competitors);
    const constraints= safeText(draft.constraints);
    const metric     = safeText(draft.successMetric);

    push({
      statement: target ? `${target} experiences this problem frequently enough that it's a priority.`
                        : 'A specific recruitable user segment has this problem frequently enough that it is a priority.',
      whyFragile:'Frequency and urgency are rarely captured in a problem paragraph; they must be validated with real users.',
      confidence: problem && target ? 35 : 20, testMethod:'interviews', owner:'PM'
    });

    push({
      statement: 'The proposed value proposition would cause users to switch from their default option.',
      whyFragile:'Users agree a problem exists but won\'t change behavior unless switching is obvious and low-friction.',
      confidence: valueProp ? 30 : 20, testMethod:'prototype', owner:'Design'
    });

    if (analysis.flags.channelMissing || (analysis.dims.find(d=>d.key==='distribution')?.score||0) < 55) {
      push({
        statement: channels ? `The draft's distribution channel ("${channels.slice(0,60)}${channels.length>60?'…':''}") can reliably reach the target users at acceptable cost.`
                            : 'There is a concrete channel that can reach the target users at acceptable cost.',
        whyFragile:'Many ideas fail not on product but on access: no credible acquisition loop or sales motion.',
        confidence: channels ? 25 : 15, testMethod:'landing', owner:'Growth'
      });
    }

    if (analysis.flags.metricMissing || (analysis.dims.find(d=>d.key==='metric')?.score||0) < 55) {
      push({
        statement: metric ? `The success metric ("${metric.slice(0,70)}${metric.length>70?'…':''}") reflects user value and is measurable in the first pilot window.`
                          : 'There is a measurable first win that can be observed within a pilot window.',
        whyFragile:'Teams often pick vanity metrics or metrics that require a full rollout to measure.',
        confidence: metric ? 28 : 18, testMethod:'data', owner:'Analytics'
      });
    }

    if (analysis.flags.crowded || analysis.flags.lowDiff) {
      const compList = competitors ? competitors.split(',').map(x=>x.trim()).filter(Boolean).slice(0,3).join(', ') : '';
      push({
        statement: compList ? `Despite existing substitutes (${compList}), this idea has a wedge that incumbents won't copy quickly.`
                            : 'This idea has a wedge that incumbents won\'t copy quickly.',
        whyFragile:'"Better UX" is not defensible; distribution, data, or workflow lock-in must carry the wedge.',
        confidence: analysis.flags.crowded ? 22 : 30, testMethod:'interviews', owner:'PM'
      });
    }

    if (constraints || analysis.flags.highConstraints) {
      push({
        statement: constraints ? `The biggest execution risks ("${constraints.slice(0,70)}${constraints.length>70?'…':''}") can be de-risked with a 1–2 week spike.`
                               : 'The technical/compliance risks can be de-risked with a small spike.',
        whyFragile:'Integration and compliance work silently expand scope and timeline.',
        confidence: constraints ? 30 : 20, testMethod:'tech', owner:'Eng'
      });
    }

    out.sort((a,b) => a.confidence - b.confidence);
    return out.slice(0, 7).map((a,i) => ({...a, order:i+1}));
  }

  /* ─── next steps builder ────────────────────────────────────────────── */
  function buildNextSteps(assumptions) {
    const methodLabel = { interviews:'User interviews', landing:'Landing page / waitlist',
      concierge:'Concierge pilot', prototype:'Clickable prototype test',
      data:'Data pull / log analysis', pricing:'Pricing / willingness-to-pay test',
      sales:'Sales calls / procurement test', tech:'Technical spike' };
    const methodEffort  = { data:'S', interviews:'M', landing:'M', prototype:'M', concierge:'L', pricing:'M', sales:'L', tech:'M' };
    const methodSignal  = { data:'Baseline + opportunity size', interviews:'Urgency + workflow fit',
      landing:'Intent + segment clarity', prototype:'Comprehension + willingness to switch',
      concierge:'Retention in a real workflow', pricing:'WTP and budget owner',
      sales:'Procurement friction + buying criteria', tech:'Data availability + integration constraints' };

    const stepText = (a) => {
      const lower = (a.statement||'').toLowerCase();
      if (/distribution|channel/.test(lower))  return 'Test the acquisition loop with 10 target users and one realistic CTA.';
      if (/metric|measurable|success/.test(lower)) return 'Define baseline and measurement plan; confirm metric can be observed in a pilot window.';
      if (/wedge|incumbent|substitute/.test(lower)) return 'Map substitutes and run 6 interviews to test wedge: "why now, why us, why not."';
      if (/execution|integration|compliance/.test(lower)) return 'Run a technical spike: confirm data sources, integration surfaces, and review requirements.';
      if (/switch/.test(lower)) return 'Prototype the core flow and test for comprehension + switching intent.';
      if (/priority|frequently/.test(lower)) return 'Run 8 interviews to quantify urgency, frequency, and current workaround cost.';
      return 'Design the smallest test that could disconfirm this assumption.';
    };

    return assumptions.slice(0,6).map((a,i) => ({
      id: uid(), order: i+1,
      text: stepText(a), method: a.testMethod,
      methodLabel: methodLabel[a.testMethod] || a.testMethod,
      effort: methodEffort[a.testMethod] || 'M',
      signal: methodSignal[a.testMethod] || 'Learning signal',
      owner: a.owner || 'PM', done: false,
      linkedAssumptionId: a.id,
      createdAt: nowISO(), updatedAt: nowISO()
    }));
  }

  /* ─── demo draft ─────────────────────────────────────────────────────── */
  function demoDraft() {
    return {
      id: DEMO_ID,
      ideaTitle:  'Cancel-proof schedule suggestions for outpatient clinics',
      ideaStage:  'series-a',
      problem:    'Clinic operations managers lose revenue and clinician capacity when patients cancel late or no-show. The schedule breaks in the last 24–48 hours: staff scramble, waitlists are stale, and rebooking requires multiple phone calls. The result is wasted appointment slots, frustrated patients, and lower throughput for high-demand specialties.',
      target:     'Operations manager at a 5–30 provider outpatient clinic using an EHR and a mix of phone + SMS reminders',
      valueProp:  'Automatically suggests the best replacement patient (and the best time to contact them) when a slot opens up, using availability, visit type, and historical show-likelihood. Clinics fill more slots without adding headcount, and patients get earlier appointments with less back-and-forth.',
      solution:   'When an appointment is canceled or a no-show is predicted, the system generates a ranked outreach list with one-click SMS templates and an audit trail. Staff can accept a suggestion, override it, or mark why it failed. Over time, the clinic sees which outreach patterns actually convert and which visit types are most fragile.',
      differentiation: 'The default option is manual: staff call down a waitlist that is out of date. Unlike generic reminder tools, this focuses on "slot recovery" and pairs each open slot with a concrete next action (who to contact next, with what message) based on clinic-specific history.',
      competitors: 'Weave, Solutionreach, Klara, in-house call scripts, EHR reminder modules',
      channels:   'Sell via outbound to clinic ops leaders and EHR-focused implementation partners; expand in-product through front-desk workflow once initial integration is proven',
      successMetric: 'Reduce unfilled slots caused by late cancellations/no-shows by 10% within 8 weeks for one pilot clinic, measured as recovered appointment minutes',
      constraints:'EHR integration (HL7/FHIR), PHI handling (HIPAA), staff trust: suggestions must be explainable and overrideable',
      createdAt: nowISO(), updatedAt: nowISO(), lastCheckedAt: null,
      assumptions: [], steps: [], lastAnalysis: null
    };
  }

  function emptyDraft() {
    return {
      id: uid(), ideaTitle:'', ideaStage:'series-a',
      problem:'', target:'', valueProp:'', solution:'',
      differentiation:'', competitors:'', channels:'', successMetric:'', constraints:'',
      createdAt: nowISO(), updatedAt: nowISO(), lastCheckedAt: null,
      assumptions:[], steps:[], lastAnalysis:null
    };
  }

  /* ─── state ─────────────────────────────────────────────────────────── */
  let state = { currentId: DEMO_ID, drafts: {} };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { state = JSON.parse(raw); }
    } catch(_) {}
    if (!Object.keys(state.drafts).length) {
      const d = demoDraft();
      state.drafts[d.id] = d;
      state.currentId = d.id;
    }
    if (!state.drafts[state.currentId]) {
      state.currentId = Object.keys(state.drafts)[0];
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(_) {}
  }

  function currentDraft() { return state.drafts[state.currentId]; }

  /* ─── router ─────────────────────────────────────────────────────────── */
  let activeRoute = 'workspace';

  function navigate(route, scroll = false) {
    if (!ROUTES.includes(route)) route = 'workspace';
    activeRoute = route;
    $$('[data-view]').forEach(el => {
      el.hidden = el.dataset.view !== route;
    });
    $$('[data-route]').forEach(el => {
      el.setAttribute('aria-current', el.dataset.route === route ? 'page' : 'false');
    });
    if (scroll) {
      setTimeout(() => {
        document.querySelector(`[data-view="${route}"]`)?.scrollIntoView({ block: 'start' });
      }, 0);
    }
    if (route !== 'workspace') renderRoute(route);
  }

  function renderRoute(route) {
    if (route === 'scorecard')   renderScorecard();
    if (route === 'assumptions') renderAssumptions();
    if (route === 'next-steps')  renderNextSteps();
    if (route === 'library')     renderLibrary();
  }

  /* ─── form sync ─────────────────────────────────────────────────────── */
  const FIELD_MAP = [
    { id:'ideaTitle', key:'ideaTitle' }, { id:'ideaStage', key:'ideaStage' },
    { id:'problem',   key:'problem'   }, { id:'target',    key:'target'    },
    { id:'valueProp', key:'valueProp' }, { id:'solution',  key:'solution'  },
    { id:'differentiation', key:'differentiation' },
    { id:'competitors', key:'competitors' },
    { id:'channels',  key:'channels'  }, { id:'successMetric', key:'successMetric' },
    { id:'constraints', key:'constraints' },
  ];

  function syncFormFromDraft() {
    const d = currentDraft();
    if (!d) return;
    FIELD_MAP.forEach(({ id, key }) => {
      const el = $(`.form #${id}`) || $(`#${id}`);
      if (el) el.value = d[key] || '';
    });
  }

  function syncDraftFromForm() {
    const d = currentDraft();
    if (!d) return;
    FIELD_MAP.forEach(({ id, key }) => {
      const el = $(`.form #${id}`) || $(`#${id}`);
      if (el) d[key] = el.value;
    });
    d.updatedAt = nowISO();
  }

  /* ─── live analysis ─────────────────────────────────────────────────── */
  const QUALITY_LABELS = {
    problem:   ['helpProblem', 'qualityProblem'],
    target:    ['helpTarget',  'qualityTarget'],
    valueProp: ['helpValueProp','qualityValueProp'],
    solution:  ['helpSolution', 'qualitySolution'],
    differentiation: ['helpDifferentiation','qualityDifferentiation'],
    channels:  ['helpChannels', 'qualityChannels'],
    successMetric:['helpMetric','qualityMetric'],
  };

  function liveUpdate() {
    syncDraftFromForm();
    const d = currentDraft();
    if (!d) return;

    const analysis = analyzeDraft(d);

    // mini verdict
    const mv = $('#miniVerdict');
    if (mv) {
      mv.textContent = analysis.score > 0 ? `${analysis.verdict.label} · ${analysis.score}` : '—';
      mv.dataset.verdict = analysis.verdict.label.toLowerCase().replace(/[^a-z]/g,'');
    }

    // lede meta
    const mt = $('#metaIdeaTitle');
    if (mt) mt.textContent = d.ideaTitle || 'Untitled idea';

    // inline quality hints
    renderInlineHints(analysis, d);

    // strong / weak signals (live)
    renderSignals(analysis);
  }

  function renderInlineHints(analysis, d) {
    const dims = Object.fromEntries(analysis.dims.map(dim => [dim.key, dim]));
    const hintMap = [
      { elId:'qualityProblem',  dim:'problem_clarity',  empty:'Name the moment: who, when, what breaks.' },
      { elId:'qualityTarget',   dim:'user_specificity',  empty:'Who exactly? Role + context, not a segment.' },
      { elId:'qualityValueProp',dim:'value_clarity',     empty:'What changes for the user? Compare to default.' },
      { elId:'qualitySolution', dim:null,                empty:'Describe the user experience — skip the architecture.' },
      { elId:'qualityDifferentiation', dim:'differentiation', empty:'Why does the default option fail your user?' },
      { elId:'qualityChannels', dim:'distribution',      empty:'Name one credible channel and explain the loop.' },
      { elId:'qualityMetric',   dim:'metric',            empty:'Add a number and a timeframe.' },
    ];
    hintMap.forEach(({ elId, dim, empty }) => {
      const el = $(`#${elId}`);
      if (!el) return;
      if (dim && dims[dim]) {
        const { score, why } = dims[dim];
        el.textContent = why;
        el.className = `inline-status inline-status--${score >= 70 ? 'good' : score >= 45 ? 'warn' : 'bad'}`;
      } else {
        el.textContent = empty;
        el.className = 'inline-status inline-status--muted';
      }
    });
  }

  function renderSignals(analysis) {
    const sEl = $('#signalsStrong');
    const wEl = $('#signalsWeak');
    if (sEl) sEl.innerHTML = analysis.strongSignals.length
      ? analysis.strongSignals.map(s => `<li class="list__item list__item--good">${esc(s)}</li>`).join('')
      : '<li class="list__item list__item--empty">Fill in the workspace fields — strengths appear here as you type.</li>';
    if (wEl) wEl.innerHTML = analysis.weakSignals.length
      ? analysis.weakSignals.map(s => `<li class="list__item list__item--bad">${esc(s)}</li>`).join('')
      : '<li class="list__item list__item--empty">No critical gaps detected.</li>';
  }

  /* ─── run check ─────────────────────────────────────────────────────── */
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

  /* ─── scorecard render ──────────────────────────────────────────────── */
  function renderScorecard() {
    const d = currentDraft();
    const analysis = d?.lastAnalysis || (d ? analyzeDraft(d) : null);
    if (!analysis) return;

    const scoreEl = $('#overallScore');
    if (scoreEl) scoreEl.textContent = analysis.score;

    const vlEl = $('#verdictLabel');
    if (vlEl) { vlEl.textContent = analysis.verdict.label; vlEl.dataset.verdict = analysis.verdict.label.toLowerCase().replace(/[^a-z]/g,''); }

    const vrEl = $('#verdictReason');
    if (vrEl) vrEl.textContent = analysis.verdict.reason;

    const tagsEl = $('#verdictTags');
    if (tagsEl) tagsEl.innerHTML = analysis.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('');

    const tbody = $('#dimensionRows');
    if (tbody) {
      const sorted = [...analysis.dims].sort((a,b) => b.score - a.score);
      tbody.innerHTML = sorted.map(dim => `
        <tr>
          <td class="td"><strong>${esc(dim.label)}</strong></td>
          <td class="td">
            <div class="bar-wrap" aria-label="${dim.score} out of 100">
              <div class="bar" style="width:${dim.score}%" data-score="${dim.score}"></div>
            </div>
            <div class="td__score">${dim.score}</div>
          </td>
          <td class="td">${esc(dim.why)}</td>
          <td class="td td--raise">${esc(dim.raise)}</td>
        </tr>`).join('');
    }

    const notesEl = $('#notesBlurb');
    if (notesEl) {
      const sorted2 = [...analysis.dims].sort((a,b) => b.score - a.score);
      const top = sorted2[0];
      const bot = sorted2[sorted2.length - 1];
      notesEl.textContent = `Strongest: ${top.label} (${top.score}/100). Biggest gap: ${bot.label} (${bot.score}/100). ${analysis.verdict.reason}`;
    }
  }

  /* ─── assumptions render & CRUD ─────────────────────────────────────── */
  let editingAssumptionId = null;

  function renderAssumptions() {
    const d = currentDraft();
    if (!d) return;
    const list = $('#assumptionList');
    if (!list) return;

    if (!d.assumptions?.length) {
      list.innerHTML = '<p class="help">No assumptions yet. <button class="text-link" id="btnRunCheckFromAssumptions" type="button">Run check</button> to auto-generate them from your draft, or add one manually.</p>';
      const btn = $('#btnRunCheckFromAssumptions');
      if (btn) btn.addEventListener('click', () => { navigate('workspace'); setTimeout(runCheck, 100); });
      return;
    }

    list.innerHTML = d.assumptions.map((a, i) => `
      <article class="assumption-card ${editingAssumptionId === a.id ? 'assumption-card--editing' : ''}" data-id="${esc(a.id)}">
        <div class="assumption-card__head">
          <div class="assumption-card__meta">
            <span class="kicker assumption-card__order">#${i+1}</span>
            <span class="assumption-card__owner">${esc(a.owner || 'PM')}</span>
            <span class="badge badge--method">${esc(a.testMethod)}</span>
          </div>
          <div class="confidence-pill" title="Confidence: ${a.confidence}%">
            <span class="confidence-pill__bar" style="width:${a.confidence}%"></span>
            <span class="confidence-pill__label">${a.confidence}% confidence</span>
          </div>
        </div>
        <p class="assumption-card__statement">${esc(a.statement)}</p>
        ${a.whyFragile ? `<p class="assumption-card__fragile"><em>Why fragile:</em> ${esc(a.whyFragile)}</p>` : ''}
        ${a.evidence   ? `<p class="assumption-card__evidence"><em>Evidence:</em> ${esc(a.evidence)}</p>`    : ''}
        <div class="assumption-card__actions">
          <button class="text-link" data-action="edit-assumption" data-id="${esc(a.id)}" type="button">Edit</button>
          <button class="text-link text-link--danger" data-action="delete-assumption" data-id="${esc(a.id)}" type="button">Remove</button>
        </div>
      </article>`).join('');

    populateAssumptionForm();
  }

  function populateAssumptionForm() {
    const d = currentDraft();
    const a = editingAssumptionId && d?.assumptions?.find(x => x.id === editingAssumptionId);

    const stmt = $('#assumpStatement');  if (stmt) stmt.value = a?.statement  || '';
    const why  = $('#assumpWhy');        if (why)  why.value  = a?.whyFragile || '';
    const ev   = $('#assumpEvidence');   if (ev)   ev.value   = a?.evidence   || '';
    const conf = $('#assumpConfidence'); if (conf) conf.value  = a?.confidence ?? 30;
    const cVal = $('#assumpConfidenceValue'); if (cVal) cVal.textContent = `${a?.confidence ?? 30}%`;
    const test = $('#assumpTest');       if (test) test.value  = a?.testMethod || 'interviews';
    const own  = $('#assumpOwner');      if (own)  own.value   = a?.owner      || '';
    const help = $('#assumpHelp');       if (help) help.textContent = a ? `Editing assumption #${d.assumptions.indexOf(a)+1}` : 'No assumption selected — click Edit on a card, or fill and Save to create one.';
    const del  = $('#btnDeleteAssumption'); if (del) del.disabled = !a;
  }

  /* ─── next steps render ─────────────────────────────────────────────── */
  function renderNextSteps() {
    const d = currentDraft();
    if (!d) return;
    const tbody = $('#stepRows');
    const helpEl = $('#stepHelp');

    if (!d.steps?.length) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="td td--empty">No steps yet — <button class="text-link" id="btnRunCheckFromSteps" type="button">Run check</button> in the Workspace to generate them.</td></tr>`;
      const btn = $('#btnRunCheckFromSteps');
      if (btn) btn.addEventListener('click', () => { navigate('workspace'); setTimeout(runCheck, 100); });
      return;
    }

    if (tbody) {
      tbody.innerHTML = d.steps.map((s, i) => `
        <tr class="tr ${s.done ? 'tr--done' : ''}" data-id="${esc(s.id)}">
          <td class="td">${i + 1}</td>
          <td class="td">${esc(s.text)}</td>
          <td class="td"><span class="badge badge--method">${esc(s.methodLabel || s.method)}</span></td>
          <td class="td">${esc(s.effort)}</td>
          <td class="td td--signal">${esc(s.signal)}</td>
          <td class="td">${esc(s.owner)}</td>
          <td class="td">
            <button class="btn btn--ghost btn--xs ${s.done ? 'btn--done' : ''}"
              data-action="toggle-step" data-id="${esc(s.id)}" type="button">
              ${s.done ? 'Undo' : 'Done'}
            </button>
          </td>
        </tr>`).join('');
    }

    const done = d.steps.filter(s => s.done).length;
    if (helpEl) helpEl.textContent = `${done} of ${d.steps.length} steps complete.`;
  }

  /* ─── library render ────────────────────────────────────────────────── */
  function renderLibrary() {
    const tbody = $('#libraryRows');
    if (!tbody) return;
    const drafts = Object.values(state.drafts);
    if (!drafts.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="td td--empty">No drafts yet.</td></tr>';
      return;
    }
    tbody.innerHTML = drafts.map(d => {
      const a = d.lastAnalysis || (d.ideaTitle ? analyzeDraft(d) : null);
      const score   = a ? a.score : '—';
      const verdict = a ? a.verdict.label : '—';
      const tags    = a ? a.tags.slice(0,2).map(t=>`<span class="tag">${esc(t)}</span>`).join('') : '';
      const isCurrent = d.id === state.currentId;
      return `
        <tr class="${isCurrent ? 'tr--current' : ''}">
          <td class="td">${esc(d.ideaTitle || 'Untitled')}${isCurrent ? ' <span class="badge">current</span>' : ''}</td>
          <td class="td">${esc(verdict)}</td>
          <td class="td">${score}</td>
          <td class="td">${formatDT(d.updatedAt)}</td>
          <td class="td">${tags}</td>
          <td class="td">
            <button class="text-link" data-action="load-draft" data-id="${esc(d.id)}" type="button">Load</button>
            ${!isCurrent ? `<button class="text-link text-link--danger" data-action="delete-draft" data-id="${esc(d.id)}" type="button">Delete</button>` : ''}
          </td>
        </tr>`;
    }).join('');
  }

  /* ─── export ─────────────────────────────────────────────────────────── */
  function exportMemo() {
    syncDraftFromForm();
    const d = currentDraft();
    if (!d) return;
    const a = d.lastAnalysis || analyzeDraft(d);
    const lines = [
      `IDEA VALIDATOR — DECISION MEMO`,
      `Generated: ${formatDT(nowISO())}`,
      ``,
      `IDEA: ${d.ideaTitle || 'Untitled'}`,
      `STAGE: ${d.ideaStage}`,
      ``,
      `VERDICT: ${a.verdict.label} (Score: ${a.score}/100)`,
      a.verdict.reason,
      ``,
      `PROBLEM`,
      d.problem || '—',
      ``,
      `TARGET USER`,
      d.target || '—',
      ``,
      `VALUE PROPOSITION`,
      d.valueProp || '—',
      ``,
      `SOLUTION SKETCH`,
      d.solution || '—',
      ``,
      `DIFFERENTIATION`,
      d.differentiation || '—',
      ``,
      `STRONGEST SIGNALS`,
      ...a.strongSignals.map(s => `• ${s}`),
      ``,
      `CRITICAL GAPS`,
      ...a.weakSignals.map(s => `• ${s}`),
      ``,
      `DIMENSION SCORES`,
      ...a.dims.map(d => `• ${d.label}: ${d.score}/100 — ${d.why}`),
      ``,
      `TOP ASSUMPTIONS TO TEST`,
      ...(d.assumptions || []).slice(0,5).map((as,i) => `${i+1}. [${as.confidence}% confidence] ${as.statement}`),
      ``,
      `NEXT VALIDATION STEPS`,
      ...(d.steps || []).slice(0,5).map((s,i) => `${i+1}. [${s.methodLabel}] ${s.text}`),
      ``,
      `---`,
      `Local-only. No data was sent to any server.`,
    ];
    const blob = new Blob([lines.join('\n')], { type:'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a2   = document.createElement('a');
    a2.href    = url;
    a2.download = `idea-validator-${(d.ideaTitle||'memo').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40)}.txt`;
    a2.click();
    URL.revokeObjectURL(url);
    showToast('Memo exported.');
  }

  /* ─── toast ──────────────────────────────────────────────────────────── */
  let toastTimer;
  function showToast(msg) {
    const el = $('#toast');
    const msgEl = $('#toastMessage');
    if (!el || !msgEl) return;
    msgEl.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  }

  /* ─── event bindings ─────────────────────────────────────────────────── */
  function bindEvents() {
    // ── nav routing
    $$('[data-route]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(el.dataset.route, true);
      });
    });

    // ── form live update
    const ws = $('#workspace');
    if (ws) {
      ws.addEventListener('input', liveUpdate);
      ws.addEventListener('change', liveUpdate);
    }

    // ── lede buttons
    $('#btnNewDraft')?.addEventListener('click', () => {
      syncDraftFromForm();
      saveState();
      const d = emptyDraft();
      state.drafts[d.id] = d;
      state.currentId = d.id;
      syncFormFromDraft();
      liveUpdate();
      saveState();
      showToast('New draft created.');
    });

    $('#btnDuplicate')?.addEventListener('click', () => {
      syncDraftFromForm();
      const d = currentDraft();
      if (!d) return;
      const copy = JSON.parse(JSON.stringify(d));
      copy.id = uid();
      copy.ideaTitle = `${copy.ideaTitle} (copy)`;
      copy.createdAt = copy.updatedAt = nowISO();
      state.drafts[copy.id] = copy;
      state.currentId = copy.id;
      saveState();
      syncFormFromDraft();
      liveUpdate();
      showToast('Draft duplicated.');
    });

    $('#btnResetDemo')?.addEventListener('click', () => {
      const d = demoDraft();
      state.drafts[d.id] = d;
      state.currentId = d.id;
      saveState();
      syncFormFromDraft();
      liveUpdate();
      showToast('Demo restored.');
    });

    $('#btnDeleteDraft')?.addEventListener('click', () => {
      const d = currentDraft();
      if (!d) return;
      if (Object.keys(state.drafts).length <= 1) {
        const fresh = emptyDraft();
        state.drafts[fresh.id] = fresh;
        delete state.drafts[d.id];
        state.currentId = fresh.id;
      } else {
        const ids = Object.keys(state.drafts).filter(k => k !== d.id);
        delete state.drafts[d.id];
        state.currentId = ids[0];
      }
      saveState();
      syncFormFromDraft();
      liveUpdate();
      showToast('Draft deleted.');
    });

    $('#btnSaveDraft')?.addEventListener('click', () => {
      syncDraftFromForm();
      saveState();
      const d = currentDraft();
      const ms = $('#metaLastSaved');
      if (ms) ms.textContent = `Saved ${formatDT(nowISO())}`;
      showToast('Draft saved.');
    });

    // ── run check
    $('#btnRunCheck')?.addEventListener('click', runCheck);

    // ── export
    $('#btnExport')?.addEventListener('click', exportMemo);

    // ── toast close
    $('#toastClose')?.addEventListener('click', () => {
      const el = $('#toast');
      if (el) el.hidden = true;
    });

    // ── assumption form: confidence slider live
    const confRange = $('#assumpConfidence');
    const confVal   = $('#assumpConfidenceValue');
    if (confRange && confVal) {
      confRange.addEventListener('input', () => { confVal.textContent = `${confRange.value}%`; });
    }

    // ── save assumption
    $('#btnSaveAssumption')?.addEventListener('click', () => {
      const d = currentDraft();
      if (!d) return;
      if (!d.assumptions) d.assumptions = [];

      const stmt = $('#assumpStatement')?.value.trim();
      if (!stmt) { showToast('Please enter an assumption statement.'); return; }

      if (editingAssumptionId) {
        const idx = d.assumptions.findIndex(a => a.id === editingAssumptionId);
        if (idx >= 0) {
          d.assumptions[idx] = {
            ...d.assumptions[idx],
            statement: stmt,
            whyFragile: $('#assumpWhy')?.value.trim() || '',
            evidence:   $('#assumpEvidence')?.value.trim() || '',
            confidence: parseInt($('#assumpConfidence')?.value || '30', 10),
            testMethod: $('#assumpTest')?.value || 'interviews',
            owner:      $('#assumpOwner')?.value.trim() || 'PM',
            updatedAt:  nowISO()
          };
        }
      } else {
        d.assumptions.push({
          id: uid(), createdAt: nowISO(), updatedAt: nowISO(),
          statement: stmt,
          whyFragile: $('#assumpWhy')?.value.trim() || '',
          evidence:   $('#assumpEvidence')?.value.trim() || '',
          confidence: parseInt($('#assumpConfidence')?.value || '30', 10),
          testMethod: $('#assumpTest')?.value || 'interviews',
          owner:      $('#assumpOwner')?.value.trim() || 'PM',
        });
      }
      editingAssumptionId = null;
      d.updatedAt = nowISO();
      saveState();
      renderAssumptions();
      showToast(editingAssumptionId ? 'Assumption updated.' : 'Assumption saved.');
    });

    // ── add assumption button
    $('#btnAddAssumption')?.addEventListener('click', () => {
      editingAssumptionId = null;
      populateAssumptionForm();
      $('#assumpStatement')?.focus();
    });

    // ── delete assumption
    $('#btnDeleteAssumption')?.addEventListener('click', () => {
      const d = currentDraft();
      if (!d || !editingAssumptionId) return;
      d.assumptions = (d.assumptions || []).filter(a => a.id !== editingAssumptionId);
      editingAssumptionId = null;
      d.updatedAt = nowISO();
      saveState();
      renderAssumptions();
      showToast('Assumption removed.');
    });

    // ── delegated: assumption list clicks (edit / delete)
    $('#assumptionList')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      const d = currentDraft();
      if (!d) return;

      if (action === 'edit-assumption') {
        editingAssumptionId = id;
        renderAssumptions();
        $('#assumpStatement')?.focus();
      }
      if (action === 'delete-assumption') {
        d.assumptions = (d.assumptions || []).filter(a => a.id !== id);
        if (editingAssumptionId === id) editingAssumptionId = null;
        d.updatedAt = nowISO();
        saveState();
        renderAssumptions();
        showToast('Assumption removed.');
      }
    });

    // ── delegated: next steps toggle
    const stepsSection = $('#next-steps');
    if (stepsSection) {
      stepsSection.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="toggle-step"]');
        if (!btn) return;
        const d = currentDraft();
        if (!d?.steps) return;
        const step = d.steps.find(s => s.id === btn.dataset.id);
        if (step) {
          step.done = !step.done;
          step.updatedAt = nowISO();
          saveState();
          renderNextSteps();
        }
      });
    }

    // ── delegated: library actions
    $('#libraryRows')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;

      if (action === 'load-draft') {
        syncDraftFromForm();
        saveState();
        state.currentId = id;
        syncFormFromDraft();
        liveUpdate();
        navigate('workspace');
        showToast('Draft loaded.');
      }
      if (action === 'delete-draft') {
        if (id === state.currentId) return;
        delete state.drafts[id];
        saveState();
        renderLibrary();
        showToast('Draft deleted.');
      }
    });

    // ── footer back link
    $$('[data-route="workspace"]').forEach(el => {
      if (el.tagName === 'A') el.addEventListener('click', (e) => {
        e.preventDefault(); navigate('workspace', true);
      });
    });
  }

  /* ─── init ───────────────────────────────────────────────────────────── */
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
