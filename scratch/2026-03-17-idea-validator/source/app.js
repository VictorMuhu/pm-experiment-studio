(() => {
  'use strict';

  const STORAGE_KEY = 'pm-experiment-idea-validator:v1';
  const DEMO_ID = 'demo-idea-2026';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const nowISO = () => new Date().toISOString();
  const formatDateTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
    const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${date} · ${time}`;
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const uid = () => {
    const t = Date.now().toString(36);
    const r = Math.random().toString(36).slice(2, 10);
    return `${t}-${r}`;
  };

  const safeText = (s) => (typeof s === 'string' ? s.trim() : '');

  const tokenize = (text) => {
    const t = safeText(text).toLowerCase();
    if (!t) return [];
    return t
      .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean);
  };

  const countSentences = (text) => {
    const t = safeText(text);
    if (!t) return 0;
    const parts = t.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean);
    return parts.length;
  };

  const countNumbers = (text) => {
    const t = safeText(text);
    if (!t) return 0;
    const matches = t.match(/\b\d+(\.\d+)?%?\b/g);
    return matches ? matches.length : 0;
  };

  const hasTimeframe = (text) => {
    const t = safeText(text).toLowerCase();
    if (!t) return false;
    return /\b(days?|weeks?|months?|quarters?|q[1-4]|year|yrs?|sprints?)\b/.test(t) || /\b\d{4}\b/.test(t);
  };

  const hasComparative = (text) => {
    const t = safeText(text).toLowerCase();
    if (!t) return false;
    return /\b(better|faster|cheaper|easier|reduce|increase|improve|cut|save|vs|versus|instead of|replace)\b/.test(t);
  };

  const densityFromCommaList = (text) => {
    const t = safeText(text);
    if (!t) return 0;
    const items = t.split(',').map((x) => x.trim()).filter(Boolean);
    return items.length;
  };

  const stageWeights = (stage) => {
    // weights sum to 1.0
    switch (stage) {
      case 'seed':
        return { problem_clarity: 0.18, user_specificity: 0.12, value_clarity: 0.16, differentiation: 0.10, distribution: 0.10, metric: 0.14, feasibility: 0.10, competition: 0.10 };
      case 'series-a':
        return { problem_clarity: 0.16, user_specificity: 0.12, value_clarity: 0.16, differentiation: 0.12, distribution: 0.12, metric: 0.14, feasibility: 0.10, competition: 0.08 };
      case 'scale-up':
        return { problem_clarity: 0.14, user_specificity: 0.10, value_clarity: 0.14, differentiation: 0.14, distribution: 0.12, metric: 0.14, feasibility: 0.14, competition: 0.08 };
      case 'enterprise':
        return { problem_clarity: 0.12, user_specificity: 0.10, value_clarity: 0.12, differentiation: 0.14, distribution: 0.12, metric: 0.14, feasibility: 0.18, competition: 0.08 };
      default:
        return { problem_clarity: 0.15, user_specificity: 0.12, value_clarity: 0.15, differentiation: 0.12, distribution: 0.12, metric: 0.14, feasibility: 0.12, competition: 0.08 };
    }
  };

  const verdictFromScore = (score) => {
    if (score >= 76) return { label: 'Pursue', reason: 'The idea is clear enough to invest in targeted validation with confidence.' };
    if (score >= 56) return { label: 'Refine', reason: 'Promising, but it has specific missing pieces that will slow execution or learning.' };
    return { label: 'Pass (for now)', reason: 'Too many core assumptions are unspoken; validate cheaply or park it.' };
  };

  const inlineTagsFor = (analysis) => {
    const tags = [];
    if (analysis.flags.metricMissing) tags.push('metric missing');
    if (analysis.flags.channelMissing) tags.push('distribution unclear');
    if (analysis.flags.problemVague) tags.push('problem vague');
    if (analysis.flags.solutionVague) tags.push('solution vague');
    if (analysis.flags.crowded) tags.push('crowded space');
    if (analysis.flags.highConstraints) tags.push('execution risk');
    if (analysis.flags.lowDiff) tags.push('weak differentiation');
    if (analysis.flags.goodSpecificity) tags.push('specificity strong');
    if (analysis.flags.hasNumbers) tags.push('quantified');
    return tags.slice(0, 5);
  };

  function computeQualityIndicators(draft) {
    const indicators = {
      problem: { label: '—', kind: 'muted' },
      target: { label: '—', kind: 'muted' },
      valueProp: { label: '—', kind: 'muted' },
      solution: { label: '—', kind: 'muted' },
      differentiation: { label: '—', kind: 'muted' },
      channels: { label: '—', kind: 'muted' },
      metric: { label: '—', kind: 'muted' }
    };

    const prob = safeText(draft.problem);
    const targ = safeText(draft.target);
    const vp = safeText(draft.valueProp);
    const sol = safeText(draft.solution);
    const diff = safeText(draft.differentiation);
    const ch = safeText(draft.channels);
    const met = safeText(draft.successMetric);

    const probSent = countSentences(prob);
    const probNums = countNumbers(prob);
    const probGood = probSent >= 2 && prob.length >= 140;
    indicators.problem = prob
      ? probGood
        ? { label: 'Reads like a real moment (good).', kind: 'good' }
        : { label: prob.length < 80 ? 'Too short — name the moment + consequence.' : 'Add specificity: when, where, and what breaks.', kind: 'warn' }
      : { label: 'Missing — write the moment and consequence.', kind: 'warn' };

    indicators.target = targ
      ? (targ.split(' ').length >= 4 ? { label: 'Specific enough to recruit for interviews.', kind: 'good' } : { label: 'Add context (role + environment).', kind: 'warn' })
      : { label: 'Missing — who exactly?', kind: 'warn' };

    indicators.valueProp = vp
      ? (hasComparative(vp) || countNumbers(vp) > 0 ? { label: 'Switch reason is present.', kind: 'good' } : { label: 'Add a switch reason: faster/cheaper/less risk.', kind: 'warn' })
      : { label: 'Missing — why would they switch?', kind: 'warn' };

    indicators.solution = sol
      ? (sol.length >= 90 && countSentences(sol) >= 2 ? { label: 'Concrete enough to test in a prototype.', kind: 'good' } : { label: 'Make it tangible: what happens in the product?', kind: 'warn' })
      : { label: 'Missing — what does the user experience?', kind: 'warn' };

    indicators.differentiation = diff
      ? (hasComparative(diff) || diff.toLowerCase().includes('default') || diff.toLowerCase().includes('instead') ? { label: 'Default option is acknowledged.', kind: 'good' } : { label: 'Compare to the default option explicitly.', kind: 'warn' })
      : { label: 'Missing — what’s different from the default?', kind: 'warn' };

    indicators.channels = ch
      ? (ch.length >= 40 ? { label: 'Distribution has a plausible path.', kind: 'good' } : { label: 'Name an actual channel (not “marketing”).', kind: 'warn' })
      : { label: 'Missing — how does it reach users?', kind: 'warn' };

    indicators.metric = met
      ? (countNumbers(met) > 0 && (hasTimeframe(met) || met.toLowerCase().includes('weeks') || met.toLowerCase().includes('months'))
        ? { label: 'Measurable and time-bound.', kind: 'good' }
        : { label: 'Add a number and a timeframe.', kind: 'warn' })
      : { label: 'Missing — what is the first measurable win?', kind: 'warn' };

    // nudge for problem numbers, but not required
    if (prob && probNums > 0 && indicators.problem.kind !== 'warn') {
      indicators.problem = { label: 'Specific and partially quantified.', kind: 'good' };
    }

    return indicators;
  }

  function analyzeDraft(draft) {
    const stage = draft.ideaStage || 'series-a';
    const weights = stageWeights(stage);

    const problem = safeText(draft.problem);
    const target = safeText(draft.target);
    const valueProp = safeText(draft.valueProp);
    const solution = safeText(draft.solution);
    const differentiation = safeText(draft.differentiation);
    const channels = safeText(draft.channels);
    const metric = safeText(draft.successMetric);
    const constraints = safeText(draft.constraints);
    const competitorCount = densityFromCommaList(draft.competitors);

    const numbersPresent = (countNumbers(problem) + countNumbers(valueProp) + countNumbers(metric)) > 0;

    const scoreProblem = clamp(
      (problem.length >= 160 ? 85 : problem.length >= 100 ? 65 : problem.length >= 60 ? 42 : problem.length > 0 ? 25 : 0) +
      (countSentences(problem) >= 2 ? 8 : 0) +
      (countNumbers(problem) > 0 ? 7 : 0),
      0, 100
    );

    const scoreTarget = clamp(
      (target.length >= 45 ? 85 : target.length >= 25 ? 65 : target.length >= 12 ? 45 : target.length > 0 ? 25 : 0) +
      (target.toLowerCase().includes(' at ') || target.toLowerCase().includes(' in ') ? 8 : 0) +
      (target.toLowerCase().includes('manager') || target.toLowerCase().includes('lead') || target.toLowerCase().includes('coordinator') ? 4 : 0),
      0, 100
    );

    const scoreValue = clamp(
      (valueProp.length >= 120 ? 80 : valueProp.length >= 80 ? 62 : valueProp.length >= 40 ? 42 : valueProp.length > 0 ? 24 : 0) +
      (hasComparative(valueProp) ? 10 : 0) +
      (countNumbers(valueProp) > 0 ? 10 : 0),
      0, 100
    );

    const scoreDiff = clamp(
      (differentiation.length >= 110 ? 78 : differentiation.length >= 70 ? 58 : differentiation.length >= 35 ? 38 : differentiation.length > 0 ? 20 : 0) +
      (hasComparative(differentiation) ? 12 : 0) +
      (competitorCount >= 3 ? -8 : competitorCount === 0 ? -4 : 0),
      0, 100
    );

    const scoreDistribution = clamp(
      (channels.length >= 100 ? 75 : channels.length >= 60 ? 55 : channels.length >= 30 ? 38 : channels.length > 0 ? 20 : 0) +
      (channels.toLowerCase().includes('in-product') || channels.toLowerCase().includes('sales') || channels.toLowerCase().includes('partner') ? 10 : 0),
      0, 100
    );

    const scoreMetric = clamp(
      (metric.length >= 70 ? 75 : metric.length >= 40 ? 55 : metric.length >= 18 ? 35 : metric.length > 0 ? 20 : 0) +
      (countNumbers(metric) > 0 ? 15 : 0) +
      (hasTimeframe(metric) ? 10 : 0),
      0, 100
    );

    const feasibilityPenalty = (() => {
      if (!constraints) return 0;
      const t = constraints.toLowerCase();
      let p = 0;
      if (/\b(hipaa|gdpr|sox|pci|phi|pii|regulat|compliance)\b/.test(t)) p += 12;
      if (/\b(integration|legacy|ehr|erp|sso|procurement|security review)\b/.test(t)) p += 10;
      if (/\b(reliability|uptime|latency|offline)\b/.test(t)) p += 6;
      if (/\b(ml|ai|model|llm)\b/.test(t)) p += 5;
      return clamp(p, 0, 22);
    })();

    const scoreFeasibility = clamp(82 - feasibilityPenalty, 0, 100);

    const competitionPenalty = (() => {
      if (competitorCount >= 6) return 18;
      if (competitorCount >= 4) return 12;
      if (competitorCount >= 2) return 6;
      if (competitorCount === 1) return 3;
      return 0;
    })();
    const scoreCompetition = clamp(88 - competitionPenalty, 0, 100);

    const dims = [
      {
        key: 'problem_clarity',
        label: 'Problem clarity',
        score: scoreProblem,
        why: scoreProblem >= 70 ? 'Specific moment + consequence. Easy to imagine the failure mode.' : scoreProblem >= 45 ? 'Some clarity, but missing context or consequence.' : 'Reads like a theme, not a moment.',
        raise: 'Write the “day-in-the-life” moment and what breaks (with one number if possible).'
      },
      {
        key: 'user_specificity',
        label: 'User specificity',
        score: scoreTarget,
        why: scoreTarget >= 70 ? 'Target is recruitable (a role in a context).' : scoreTarget >= 45 ? 'Role is present but context is thin.' : 'Could describe many people; hard to validate.',
        raise: 'Add environment: company type, workflow, constraints, and decision authority.'
      },
      {
        key: 'value_clarity',
        label: 'Value proposition',
        score: scoreValue,
        why: scoreValue >= 70 ? 'Switch reason is evident: speed, risk, cost, or outcomes.' : scoreValue >= 45 ? 'Benefit is implied but not contrasted to the default.' : 'Feels like a feature list.',
        raise: 'Name the default option and why your approach changes the outcome.'
      },
      {
        key: 'differentiation',
        label: 'Differentiation',
        score: scoreDiff,
        why: scoreDiff >= 70 ? 'Clear contrast to substitutes; not just “better UX”.' : scoreDiff >= 45 ? 'Differentiation exists, but it could be copied quickly.' : 'Hard to see why this wins.',
        raise: 'Describe why the default option fails, and what you can do that others can’t.'
      },
      {
        key: 'distribution',
        label: 'Distribution',
        score: scoreDistribution,
        why: scoreDistribution >= 70 ? 'A plausible route to adoption exists.' : scoreDistribution >= 45 ? 'Channel exists, but not the mechanism.' : '“Marketing” without a path.',
        raise: 'Write one concrete acquisition loop (where discovered → why adopted → why retained).'
      },
      {
        key: 'metric',
        label: 'First measurable win',
        score: scoreMetric,
        why: scoreMetric >= 70 ? 'Measurable and time-bound.' : scoreMetric >= 45 ? 'Metric exists but isn’t falsifiable yet.' : 'No success definition; decision will drift.',
        raise: 'Add a number and timeframe; define baseline and expected delta.'
      },
      {
        key: 'feasibility',
        label: 'Feasibility risk',
        score: scoreFeasibility,
        why: scoreFeasibility >= 75 ? 'No major execution landmines named.' : scoreFeasibility >= 55 ? 'Some risks, manageable with early spikes.' : 'High integration/compliance risk.',
        raise: 'Run a technical spike: data availability, integration constraints, and review pathways.'
      },
      {
        key: 'competition',
        label: 'Competition density',
        score: scoreCompetition,
        why: scoreCompetition >= 75 ? 'Few direct substitutes named (or you’re early).' : scoreCompetition >= 55 ? 'Some competition; require sharper wedge.' : 'Crowded: differentiation must be explicit.',
        raise: 'Map substitutes; articulate a wedge niche and why incumbents won’t chase it first.'
      }
    ];

    const weighted = dims.reduce((acc, d) => acc + d.score * (weights[d.key] || 0), 0);
    const baseScore = clamp(Math.round(weighted), 0, 100);

    const flags = {
      metricMissing: !metric,
      channelMissing: !channels,
      problemVague: !problem || scoreProblem < 45,
      solutionVague: !solution || safeText(solution).length < 60,
      crowded: competitorCount >= 4,
      highConstraints: feasibilityPenalty >= 14,
      lowDiff: scoreDiff < 45,
      goodSpecificity: scoreProblem >= 70 && scoreTarget >= 65,
      hasNumbers: numbersPresent
    };

    const { label, reason } = verdictFromScore(baseScore);

    const notesBlurb = (() => {
      const parts = [];
      if (label === 'Pursue') parts.push('This draft is close to decision-ready.');
      if (label === 'Refine') parts.push('This draft has energy, but a few missing specifics could cause late discovery churn.');
      if (label === 'Pass (for now)') parts.push('This draft is not yet structured enough to justify roadmap time.');
      if (flags.metricMissing) parts.push('Without a measurable win, teams will argue about “progress” instead of learning.');
      if (flags.channelMissing) parts.push('A great product without a channel becomes an internal hobby project.');
      if (flags.crowded) parts.push('Crowded spaces can still work, but only with a sharp wedge and distribution advantage.');
      if (flags.highConstraints) parts.push('Execution risk is elevated; validate technical feasibility early.');
      return parts.join(' ');
    })();

    const strongSignals = [];
    const weakSignals = [];

    const addSignal = (arr, text) => arr.push(text);

    if (scoreProblem >= 70) addSignal(strongSignals, 'Problem is specific enough to recruit and run interviews within a week.');
    if (scoreTarget >= 65) addSignal(strongSignals, 'Target user reads recruitable (role + context).');
    if (scoreValue >= 70) addSignal(strongSignals, 'Value proposition includes a switch reason, not just a feature.');
    if (scoreMetric >= 65) addSignal(strongSignals, 'Success metric is measurable; the draft can be falsified.');
    if (scoreDistribution >= 65) addSignal(strongSignals, 'Distribution has a plausible path to adoption.');
    if (scoreFeasibility >= 75) addSignal(strongSignals, 'No major execution landmines are named; likely feasible for a pilot.');

    if (!problem) addSignal(weakSignals, 'The draft does not name the “moment” where the problem happens (who, when, what breaks).');
    else if (scoreProblem < 45) addSignal(weakSignals, 'Problem statement is too general; add context and consequence.');
    if (!metric) addSignal(weakSignals, 'No measurable win; add a target delta and timeframe.');
    else if (scoreMetric < 45) addSignal(weakSignals, 'Metric is present but not falsifiable yet (add numbers + timeframe).');
    if (!channels) addSignal(weakSignals, 'Distribution is missing; pick one credible channel and explain the loop.');
    else if (scoreDistribution < 45) addSignal(weakSignals, 'Channel is named but mechanism is unclear (who sells, where discovered, why adopted).');
    if (!differentiation) addSignal(weakSignals, 'Differentiation is missing; compare to the default option explicitly.');
    else if (scoreDiff < 45) addSignal(weakSignals, 'Differentiation is weak; write why the default fails and what you can do uniquely.');
    if (flags.crowded) addSignal(weakSignals, 'Many substitutes exist; consider a narrower wedge, or distribution advantage.');
    if (flags.highConstraints) addSignal(weakSignals, 'Constraints suggest integration/compliance risk; plan a technical spike early.');

    const tags = inlineTagsFor({ flags });

    return {
      stage,
      weights,
      score: baseScore,
      dims,
      verdict: { label, reason },
      notesBlurb,
      strongSignals: strongSignals.slice(0, 4),
      weakSignals: weakSignals.slice(0, 4),
      flags,
      tags,
      feasibilityPenalty,
      competitorCount
    };
  }

  function buildAssumptionsFromDraft(draft, analysis) {
    const assumptions = [];
    const title = safeText(draft.ideaTitle) || 'Untitled idea';
    const target = safeText(draft.target);
    const problem = safeText(draft.problem);
    const valueProp = safeText(draft.valueProp);
    const channels = safeText(draft.channels);
    const competitors = safeText(draft.competitors);
    const constraints = safeText(draft.constraints);
    const metric = safeText(draft.successMetric);

    const push = (a) => assumptions.push({
      id: uid(),
      statement: a.statement,
      whyFragile: a.whyFragile,
      evidence: a.evidence || '',
      confidence: a.confidence ?? 30,
      testMethod: a.testMethod || 'interviews',
      owner: a.owner || 'PM',
      createdAt: nowISO(),
      updatedAt: nowISO()
    });

    // Always include core product-market assumptions
    push({
      statement: target
        ? `${target} experiences this problem frequently enough that it is a priority.`
        : `A specific recruitable user segment has this problem frequently enough that it is a priority.`,
      whyFragile: problem ? 'Frequency and urgency are rarely captured in a problem paragraph; they must be validated with real users.' : 'The draft does not yet describe the moment; urgency and frequency are unknown.',
      confidence: problem && target ? 35 : 20,
      testMethod: 'interviews',
      owner: 'PM'
    });

    push({
      statement: valueProp
        ? `The proposed value proposition would cause users to switch from their default option.`
        : `A clear switch reason exists (time saved, risk reduced, outcomes improved).`,
      whyFragile: 'Users often agree a problem exists but won’t change behavior unless switching is obvious and low-friction.',
      confidence: valueProp ? 30 : 20,
      testMethod: 'prototype',
      owner: 'Design'
    });

    // Channel assumption if weak
    if (analysis.flags.channelMissing || analysis.dims.find((d) => d.key === 'distribution')?.score < 55) {
      push({
        statement: channels
          ? `The draft’s distribution channel (“${channels.slice(0, 60)}${channels.length > 60 ? '…' : ''}”) can reliably reach the target users at acceptable cost.`
          : 'There is a concrete channel that can reach the target users at acceptable cost.',
        whyFragile: 'Many ideas fail not on product but on access: no credible acquisition loop or sales motion.',
        confidence: channels ? 25 : 15,
        testMethod: 'landing',
        owner: 'Growth'
      });
    }

    // Metric assumption if weak
    if (analysis.flags.metricMissing || analysis.dims.find((d) => d.key === 'metric')?.score < 55) {
      push({
        statement: metric
          ? `The success metric (“${metric.slice(0, 70)}${metric.length > 70 ? '…' : ''}”) reflects user value and is measurable in the first pilot window.`
          : 'There is a measurable first win that can be observed within a pilot window.',
        whyFragile: 'Teams often pick vanity metrics or metrics that require a full rollout to measure.',
        confidence: metric ? 28 : 18,
        testMethod: 'data',
        owner: 'Analytics'
      });
    }

    // Differentiation assumption if competition/crowding
    if (analysis.flags.crowded || analysis.flags.lowDiff) {
      push({
        statement: competitors
          ? `Despite existing substitutes (${competitors.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 3).join(', ')}), this idea has a wedge that incumbents won’t copy quickly.`
          : 'This idea has a wedge that incumbents won’t copy quickly.',
        whyFragile: 'In crowded spaces, “better UX” is not defensible; distribution, data, or workflow lock-in must carry the wedge.',
        confidence: analysis.flags.crowded ? 22 : 30,
        testMethod: 'interviews',
        owner: 'PM'
      });
    }

    // Feasibility assumption if constraints are named
    if (constraints || analysis.flags.highConstraints) {
      push({
        statement: constraints
          ? `The biggest execution risks (“${constraints.slice(0, 70)}${constraints.length > 70 ? '…' : ''}”) can be de-risked with a 1–2 week spike.`
          : 'The technical/compliance risks can be de-risked with a small spike.',
        whyFragile: 'Integration and compliance work can silently expand scope and timeline.',
        confidence: constraints ? 30 : 20,
        testMethod: 'tech',
        owner: 'Eng'
      });
    }

    // Make sure we don't overwhelm; keep it tight and prioritized
    const capped = assumptions.slice(0, 7);

    // Priority sort: lowest confidence first, then earlier created
    capped.sort((a, b) => (a.confidence - b.confidence) || (new Date(a.createdAt) - new Date(b.createdAt)));

    return capped.map((a, idx) => ({ ...a, order: idx + 1, titleRef: title }));
  }

  function buildStepsFromAssumptions(assumptions) {
    const methodToEffort = (m) => {
      switch (m) {
        case 'data': return 'S';
        case 'interviews': return 'M';
        case 'landing': return 'M';
        case 'prototype': return 'M';
        case 'concierge': return 'L';
        case 'pricing': return 'M';
        case 'sales': return 'L';
        case 'tech': return 'M';
        default: return 'M';
      }
    };

    const methodToSignal = (m) => {
      switch (m) {
        case 'data': return 'Baseline + size of opportunity';
        case 'interviews': return 'Urgency + workflow fit';
        case 'landing': return 'Intent + segment clarity';
        case 'prototype': return 'Comprehension + willingness to switch';
        case 'concierge': return 'Retention behavior in a real workflow';
        case 'pricing': return 'WTP and budget owner';
        case 'sales': return 'Procurement friction + buying criteria';
        case 'tech': return 'Data availability + integration constraints';
        default: return 'Learning signal';
      }
    };

    const methodToLabel = (m) => {
      const map = {
        interviews: 'User interviews',
        landing: 'Landing page / waitlist',
        concierge: 'Concierge pilot',
        prototype: 'Clickable prototype test',
        data: 'Data pull / log analysis',
        pricing: 'Pricing / willingness-to-pay',
        sales: 'Sales calls / procurement test',
        tech: 'Technical spike'
      };
      return map[m] || m;
    };

    const makeStep = (a, idx) => ({
      id: uid(),
      order: idx + 1,
      text: stepTextFromAssumption(a),
      method: a.testMethod,
      methodLabel: methodToLabel(a.testMethod),
      effort: methodToEffort(a.testMethod),
      signal: methodToSignal(a.testMethod),
      owner: a.owner || 'PM',
      done: false,
      linkedAssumptionId: a.id,
      createdAt: nowISO(),
      updatedAt: nowISO()
    });

    const stepTextFromAssumption = (a) => {
      const s = safeText(a.statement);
      if (!s) return 'Run a validation step.';
      const lower = s.toLowerCase();
      if (lower.includes('distribution') || lower.includes('channel')) return 'Test the acquisition loop with 10 target users and one realistic CTA.';
      if (lower.includes('metric') || lower.includes('measurable') || lower.includes('success')) return 'Define baseline and measurement plan; confirm metric can be observed in a pilot window.';
      if (lower.includes('wedge') || lower.includes('incumbent') || lower.includes('substitute')) return 'Map substitutes and run 6 interviews to test wedge: “why now, why us, why not.”';
      if (lower.includes('execution') || lower.includes('integration') || lower.includes('compliance')) return 'Run a technical spike: confirm data sources, integration surfaces, and review requirements.';
      if (lower.includes('switch')) return 'Prototype the core flow and test for comprehension + switching intent.';
      if (lower.includes('priority') || lower.includes('frequently')) return 'Run 8 interviews to quantify urgency, frequency, and current workaround cost.';
      return 'Design a smallest test that could disconfirm this assumption.';
    };

    const base = assumptions.slice(0, 6).map(makeStep);

    // Ensure order is contiguous
    base.sort((a, b) => a.order - b.order);
    base.forEach((s, i) => { s.order = i + 1; });

    return base;
  }

  function defaultDemoDraft() {
    // Realistic demo: healthcare ops — cancellation/no-shows are a common pain.
    return {
      id: DEMO_ID,
      ideaTitle: 'Cancel-proof schedule suggestions for outpatient clinics',
      ideaStage: 'series-a',
      problem:
        'Clinic operations managers lose revenue and clinician capacity when patients cancel late or no-show. The schedule breaks in the last 24–48 hours: staff scramble, waitlists are stale, and rebooking requires multiple phone calls. The result is wasted appointment slots, frustrated patients, and lower throughput for high-demand specialties.',
      target:
        'Operations manager at a 5–30 provider outpatient clinic using an EHR and a mix of phone + SMS reminders',
      valueProp:
        'Automatically suggests the best replacement patient (and the best time to contact them) when a slot opens up, using availability, visit type, and historical show-likelihood. Clinics fill more slots without adding headcount, and patients get earlier appointments with less back-and-forth.',
      solution:
        'When an appointment is canceled or a no-show is predicted, the system generates a ranked outreach list with one-click SMS templates and an audit trail. Staff can accept a suggestion, override it, or mark why it failed. Over time, the clinic sees which outreach patterns actually convert and which visit types are most fragile.',
      differentiation:
        'The default option is manual: staff call down a waitlist that is out of date. Unlike generic reminder tools, this focuses on “slot recovery” and pairs each open slot with a concrete next action (who to contact next, with what message) based on clinic-specific history.',
      competitors:
        'Weave, Solutionreach, Klara, in-house call scripts, EHR reminder modules',
      channels:
        'Sell via outbound to clinic ops leaders and EHR-focused implementation partners; expand in-product through front-desk workflow once initial integration is proven',
      successMetric:
        'Reduce unfilled slots caused by late cancellations/no-shows by 10% within 8 weeks for one pilot clinic, measured as recovered appointment minutes',
      constraints:
        'EHR integration (HL7/FHIR), PHI handling (HIPAA), staff trust: suggestions must be explainable and overrideable',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      lastCheckedAt: nowISO()
    };
  }

  function emptyDraft() {
    return {
      id: uid(),
      ideaTitle: '',
      ideaStage: 'series-a',