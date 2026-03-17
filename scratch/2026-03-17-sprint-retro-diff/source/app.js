(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const uid = () => {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `id_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  };

  const state = {
    step: 1,
    sprintA: { name: '', velocity: 0, planned: 0, daysLost: 0, incidents: 0, quality: '' },
    sprintB: { name: '', velocity: 0, planned: 0, daysLost: 0, incidents: 0, quality: '' },
    scopeA: [],
    scopeB: [],
    blockersA: [],
    blockersB: [],
    lastCopiedText: ''
  };

  const els = {
    // top
    btnLoadDemo: $('#btnLoadDemo'),
    btnReset: $('#btnReset'),

    // hero
    progressLabel: $('#progressLabel'),
    btnPrimaryCta: $('#btnPrimaryCta'),
    btnJumpOutput: $('#btnJumpOutput'),
    previewVelocity: $('#previewVelocity'),
    previewChurn: $('#previewChurn'),
    previewBlockers: $('#previewBlockers'),
    previewSignal: $('#previewSignal'),

    // stepper / nav
    stepTabs: $$('.stepper__tab'),
    panels: [$('#panel-step-1'), $('#panel-step-2'), $('#panel-step-3')],
    bottomNavItems: $$('.bottom-nav__item'),
    navDemo: $('#navDemo'),

    // step 1 inputs
    aName: $('#aName'),
    aVelocity: $('#aVelocity'),
    aPlanned: $('#aPlanned'),
    aDaysLost: $('#aDaysLost'),
    aIncidents: $('#aIncidents'),
    aQuality: $('#aQuality'),

    bName: $('#bName'),
    bVelocity: $('#bVelocity'),
    bPlanned: $('#bPlanned'),
    bDaysLost: $('#bDaysLost'),
    bIncidents: $('#bIncidents'),
    bQuality: $('#bQuality'),

    btnNextFrom1: $('#btnNextFrom1'),

    // step 2 forms + lists
    formScopeA: $('#formScopeA'),
    scopeAType: $('#scopeAType'),
    scopeAPoints: $('#scopeAPoints'),
    scopeANote: $('#scopeANote'),
    scopeAList: $('#scopeAList'),

    formScopeB: $('#formScopeB'),
    scopeBType: $('#scopeBType'),
    scopeBPoints: $('#scopeBPoints'),
    scopeBNote: $('#scopeBNote'),
    scopeBList: $('#scopeBList'),

    formBlockerA: $('#formBlockerA'),
    blockerASeverity: $('#blockerASeverity'),
    blockerADays: $('#blockerADays'),
    blockerANote: $('#blockerANote'),
    blockerAList: $('#blockerAList'),

    formBlockerB: $('#formBlockerB'),
    blockerBSeverity: $('#blockerBSeverity'),
    blockerBDays: $('#blockerBDays'),
    blockerBNote: $('#blockerBNote'),
    blockerBList: $('#blockerBList'),

    btnBackFrom2: $('#btnBackFrom2'),
    btnNextFrom2: $('#btnNextFrom2'),

    // step 3 output
    insightsList: $('#insightsList'),
    kstList: $('#kstList'),
    copyText: $('#copyText'),
    btnCopy: $('#btnCopy'),
    btnRegen: $('#btnRegen'),
    copyNote: $('#copyNote'),
    celebrateTag: $('#celebrateTag'),
    btnBackFrom3: $('#btnBackFrom3')
  };

  function setStep(nextStep, opts = {}) {
    state.step = clamp(nextStep, 1, 3);

    els.panels.forEach((p, idx) => {
      const isActive = idx === (state.step - 1);
      p.hidden = !isActive;
    });

    els.stepTabs.forEach((t) => {
      const isActive = Number(t.dataset.step) === state.step;
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    els.bottomNavItems.forEach((btn) => {
      const step = btn.dataset.step ? Number(btn.dataset.step) : null;
      if (!step) return;
      btn.classList.toggle('is-active', step === state.step);
    });

    els.progressLabel.textContent = `Step ${state.step} of 3`;

    const ctaLabel = state.step === 1 ? 'Start' : state.step === 2 ? 'Keep going' : 'Summary ready';
    els.btnPrimaryCta.querySelector('.btn__label').textContent = ctaLabel;

    if (opts.scrollToPanel !== false) {
      const activePanel = els.panels[state.step - 1];
      activePanel.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }

    renderAll();
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function normalizeText(s) {
    return String(s || '').trim().replace(/\s+/g, ' ');
  }

  function computeSummary() {
    const a = state.sprintA;
    const b = state.sprintB;

    const velA = toNum(a.velocity);
    const velB = toNum(b.velocity);
    const deltaVel = velB - velA;

    const plannedA = toNum(a.planned);
    const plannedB = toNum(b.planned);

    const daysLostA = toNum(a.daysLost);
    const daysLostB = toNum(b.daysLost);
    const deltaDaysLost = daysLostB - daysLostA;

    const incidentsA = toNum(a.incidents);
    const incidentsB = toNum(b.incidents);
    const deltaInc = incidentsB - incidentsA;

    const scope = (items) => {
      const added = items.filter(x => x.type === 'added').reduce((s, x) => s + toNum(x.points), 0);
      const removed = items.filter(x => x.type === 'removed').reduce((s, x) => s + toNum(x.points), 0);
      const changed = items.filter(x => x.type === 'changed').reduce((s, x) => s + toNum(x.points), 0);
      const total = added + removed + changed;
      return { added, removed, changed, total };
    };

    const scopeA = scope(state.scopeA);
    const scopeB = scope(state.scopeB);

    const blockerDays = (items) => items.reduce((s, x) => s + toNum(x.days), 0);
    const blockerCount = (items) => items.length;
    const blockerHigh = (items) => items.filter(x => x.severity === 'high').length;

    const blockDaysA = blockerDays(state.blockersA);
    const blockDaysB = blockerDays(state.blockersB);
    const deltaBlockDays = blockDaysB - blockDaysA;

    const blockCountA = blockerCount(state.blockersA);
    const blockCountB = blockerCount(state.blockersB);
    const deltaBlockCount = blockCountB - blockCountA;

    const scopeChurnDelta = scopeB.total - scopeA.total;

    const plannedRatioA = plannedA > 0 ? velA / plannedA : 0;
    const plannedRatioB = plannedB > 0 ? velB / plannedB : 0;
    const ratioDelta = plannedRatioB - plannedRatioA;

    const qualityA = normalizeText(a.quality);
    const qualityB = normalizeText(b.quality);

    const signals = [];
    const evidence = [];

    const addSignal = (key, score, title, body, tags) => {
      signals.push({ key, score, title, body, tags });
    };

    const sign = (n) => (n > 0 ? '+' : n < 0 ? '−' : '±');

    // Velocity headline
    if (velA === 0 && velB === 0) {
      addSignal(
        'velocity_missing',
        0,
        'Velocity: add points to get a meaningful delta',
        'Without velocity for both sprints, the summary will focus on events only.',
        [{ kind: 'accent2', text: '📈 numbers' }]
      );
    } else {
      const pct = velA > 0 ? Math.round((deltaVel / velA) * 100) : null;
      const pctText = pct === null ? '' : ` (${sign(pct)}${Math.abs(pct)}%)`;
      const label = deltaVel === 0 ? 'flat' : deltaVel > 0 ? 'up' : 'down';
      addSignal(
        'velocity_delta',
        9,
        `Velocity ${label}: ${velA} → ${velB} (${sign(deltaVel)}${Math.abs(deltaVel)} pts)${pctText}`,
        `Start here: agree on whether the delta is “more capacity,” “less interruption,” or “different scope.”`,
        [
          { kind: 'accent2', text: '📈 numbers' },
          { kind: deltaVel >= 0 ? 'accent3' : 'accent', text: deltaVel >= 0 ? '✅ lift' : '🪫 dip' }
        ]
      );
      evidence.push({ label: 'Velocity', value: `${velA} → ${velB} (${deltaVel >= 0 ? '+' : ''}${deltaVel})` });
    }

    // Days lost
    if (daysLostA || daysLostB) {
      const label = deltaDaysLost === 0 ? 'unchanged' : deltaDaysLost < 0 ? 'improved' : 'worse';
      const score = Math.abs(deltaDaysLost) >= 1 ? 8 : 5;
      addSignal(
        'days_lost',
        score,
        `Capacity drag ${label}: team days lost ${daysLostA} → ${daysLostB} (${deltaDaysLost >= 0 ? '+' : ''}${deltaDaysLost})`,
        deltaDaysLost < 0
          ? 'If velocity went up, fewer lost days is a strong candidate cause. Protect the patterns that reduced interruptions.'
          : 'If velocity went down, days lost is a likely contributor. Identify the top drivers and decide what’s preventable.',
        [{ kind: 'accent', text: '🧯 interruption' }]
      );
      evidence.push({ label: 'Days lost', value: `${daysLostA} → ${daysLostB}` });
    }

    // Incidents
    if (incidentsA || incidentsB) {
      const label = deltaInc === 0 ? 'flat' : deltaInc < 0 ? 'down' : 'up';
      addSignal(
        'incidents',
        6,
        `On-call load ${label}: incidents ${incidentsA} → ${incidentsB} (${deltaInc >= 0 ? '+' : ''}${deltaInc})`,
        'If this moved, sanity-check whether the same people were paged and whether interrupts hit the critical path.',
        [{ kind: 'accent', text: '🚨 ops' }]
      );
      evidence.push({ label: 'Incidents', value: `${incidentsA} → ${incidentsB}` });
    }

    // Scope churn
    const churnScore = Math.min(8, 3 + Math.round((scopeA.total + scopeB.total) / 8));
    if ((scopeA.total + scopeB.total) > 0) {
      const direction = scopeChurnDelta === 0 ? 'similar' : scopeChurnDelta < 0 ? 'lower' : 'higher';
      addSignal(
        'scope_churn',
        churnScore,
        `Scope churn ${direction}: ${scopeA.total} → ${scopeB.total} pts of change`,
        `Churn counts added + removed + changed. If churn dropped and velocity rose, “stability” is a plausible explanation.`,
        [
          { kind: 'accent3', text: '🧩 scope' },
          { kind: 'accent2', text: '📌 planning' }
        ]
      );
      evidence.push({ label: 'Scope churn', value: `${scopeA.total} → ${scopeB.total}` });
    } else {
      addSignal(
        'scope_none',
        2,
        'Scope churn: add at least 1 scope-change event if it mattered',
        'If scope changed mid-sprint, capture it as Added/Removed/Changed with rough points.',
        [{ kind: 'accent3', text: '🧩 scope' }]
      );
    }

    // Blockers
    if ((blockCountA + blockCountB) > 0) {
      const direction = deltaBlockDays === 0 ? 'similar' : deltaBlockDays < 0 ? 'lower' : 'higher';
      addSignal(
        'blockers',
        7,
        `Blocker drag ${direction}: blocker days ${blockDaysA} → ${blockDaysB}`,
        `If blocker days changed, call out the top 1–2 root causes (dependency, unclear acceptance, flaky CI, etc.).`,
        [{ kind: 'accent', text: '🧯 blockers' }]
      );

      if (blockerHigh(state.blockersB) > blockerHigh(state.blockersA)) {
        addSignal(
          'blockers_severity',
          5,
          'More high-severity blockers in Sprint B',
          'High blockers are usually “systemic.” Treat them as process/system fixes, not individual performance.',
          [{ kind: 'accent', text: '🔥 severity' }]
        );
      }
      evidence.push({ label: 'Blocker days', value: `${blockDaysA} → ${blockDaysB}` });
    } else {
      addSignal(
        'blockers_none',
        2,
        'Blockers: add at least 1 if flow was interrupted',
        'Even if you don’t know the exact duration, “0.5 days” is better than leaving it blank.',
        [{ kind: 'accent', text: '🧯 blockers' }]
      );
    }

    // Planned vs done (commitment)
    if (plannedA > 0 || plannedB > 0) {
      const pctA = plannedA > 0 ? Math.round(plannedRatioA * 100) : null;
      const pctB = plannedB > 0 ? Math.round(plannedRatioB * 100) : null;
      const msg = (pctA === null || pctB === null)
        ? 'Add planned points for both sprints to compare commitment accuracy.'
        : `Completion rate ${pctA}% → ${pctB}% (${ratioDelta >= 0 ? '+' : ''}${Math.round(ratioDelta * 100)} pts)`;
      addSignal(
        'completion_rate',
        6,
        pctA === null || pctB === null ? 'Completion rate: missing planned points' : 'Completion rate moved',
        msg,
        [{ kind: 'accent2', text: '🎯 commitment' }]
      );
      if (pctA !== null && pctB !== null) {
        evidence.push({ label: 'Completion', value: `${pctA}% → ${pctB}%` });
      }
    }

    // Quality notes
    if (qualityA || qualityB) {
      addSignal(
        'quality_notes',
        4,
        'Quality notes are present—mention them explicitly',
        'If “less hotfixing” or “less flaky CI” is part of the story, call it out. It makes the narrative more actionable.',
        [{ kind: 'accent3', text: '🧼 quality' }]
      );
    }

    // Overall "signal" rating: weighted by key data presence
    const dataCompleteness = [
      velA || velB ? 1 : 0,
      (plannedA && plannedB) ? 1 : 0,
      (scopeA.total + scopeB.total) > 0 ? 1 : 0,
      (blockCountA + blockCountB) > 0 ? 1 : 0,
      (daysLostA || daysLostB) ? 1 : 0
    ].reduce((s, x) => s + x, 0);

    const avgScore = signals.length ? signals.reduce((s, x) => s + x.score, 0) / signals.length : 0;
    const overall = clamp(Math.round((avgScore / 10) * 5 + dataCompleteness), 1, 10);

    const signalLabel = overall >= 8 ? 'High' : overall >= 5 ? 'Medium' : 'Low';

    const kst = computeKeepStopTry({
      deltaVel,
      scopeA,
      scopeB,
      deltaDaysLost,
      deltaInc,
      blockDaysA,
      blockDaysB,
      deltaBlockDays,
      blockerHighA: blockerHigh(state.blockersA),
      blockerHighB: blockerHigh(state.blockersB)
    });

    const names = {
      a: normalizeText(a.name) || 'Sprint A',
      b: normalizeText(b.name) || 'Sprint B'
    };

    const copy = buildCopyBlock({ names, a, b, deltaVel, scopeA, scopeB, blockDaysA, blockDaysB, overall, signalLabel, kst, evidence });

    return { names, deltaVel, scopeA, scopeB, blockDaysA, blockDaysB, overall, signalLabel, signals, kst, copy };
  }

  function computeKeepStopTry(ctx) {
    const items = [];

    // Keep
    if (ctx.deltaDaysLost < 0) {
      items.push({
        bucket: 'keep',
        title: 'Protect the interruption shields that reduced “days lost”',
        body: 'Whatever reduced lost days (triage rotation, clearer escalation, batching reviews) likely helped velocity. Make it explicit.',
        emoji: '🛡️'
      });
    }
    if (ctx.scopeB.total < ctx.scopeA.total) {
      items.push({
        bucket: 'keep',
        title: 'Keep scope steady once Sprint B started',
        body: 'Lower churn makes throughput easier to interpret and improves morale. Keep the same “mid-sprint change” threshold.',
        emoji: '🧩'
      });
    }
    if (ctx.deltaVel > 0 && ctx.deltaBlockDays <= 0) {
      items.push({
        bucket: 'keep',
        title: 'Keep the flow improvements that reduced blockers',
        body: 'If blockers didn’t rise while velocity did, you probably improved handoffs or reduced rework. Preserve the habit (definition of ready, earlier reviews).',
        emoji: '🚦'
      });
    }

    // Stop
    if (ctx.deltaInc > 0) {
      items.push({
        bucket: 'stop',
        title: 'Stop letting on-call interrupts land on the critical path',
        body: 'If incidents increased, velocity deltas can be “ops noise.” Consider shielding a sprint-critical dev or tightening alerting.',
        emoji: '🚨'
      });
    }
    if (ctx.scopeB.changed > ctx.scopeA.changed && ctx.scopeB.changed >= 3) {
      items.push({
        bucket: 'stop',
        title: 'Stop “changed” work from silently becoming rework',
        body: 'A lot of “Changed” events usually means unclear acceptance or late discovery. Force a re-estimate when the shape changes.',
        emoji: '🧱'
      });
    }
    if (ctx.blockerHighB > ctx.blockerHighA && ctx.blockerHighB >= 2) {
      items.push({
        bucket: 'stop',
        title: 'Stop treating high-severity blockers as one-offs',
        body: 'Two or more high blockers in a sprint is a system signal. Track root causes and fix the top one.',
        emoji: '🔥'
      });
    }

    // Try
    if (ctx.deltaVel < 0 && ctx.scopeB.total > ctx.scopeA.total) {
      items.push({
        bucket: 'try',
        title: 'Try a “scope-change budget” for next sprint',
        body: 'Agree on a cap (e.g., 6 points of churn). Anything above needs a quick trade-off review.',
        emoji: '💳'
      });
    }
    if (ctx.deltaVel < 0 && ctx.deltaDaysLost > 0) {
      items.push({
        bucket: 'try',
        title: 'Try a lightweight “interrupt log” with owner + avoidability',
        body: 'You already tracked days lost. Next step is labeling avoidable vs unavoidable to choose the right fix.',
        emoji: '🗒️'
      });
    }
    if (ctx.deltaVel !== 0 && ctx.blockDaysB === 0 && ctx.blockDaysA === 0) {
      items.push({
        bucket: 'try',
        title: 'Try adding blockers with rough durations next sprint',
        body: 'Even 0.5-day estimates help connect the story to process improvements.',
        emoji: '🧯'
      });
    }

    // Ensure minimum coverage
    const byBucket = (b) => items.filter(x => x.bucket === b);
    if (byBucket('keep').length === 0) {
      items.push({
        bucket: 'keep',
        title: 'Keep one thing: pick the strongest “worked well” behavior',
        body: 'Choose a single habit (planning clarity, pairing, review discipline) and keep it for another sprint to confirm it’s causal.',
        emoji: '✅'
      });
    }
    if (byBucket('stop').length === 0) {
      items.push({
        bucket: 'stop',
        title: 'Stop one friction: pick the most repeated interruption',
        body: 'If nothing obvious shows up, ask: “What interrupted flow the most?” Then pick one fix.',
        emoji: '🛑'
      });
    }
    if (byBucket('try').length === 0) {
      items.push({
        bucket: 'try',
        title: 'Try one experiment: small, time-boxed, measurable',
        body: 'Keep it small enough to run next sprint—e.g., “definition of ready checklist for stories >3 points.”',
        emoji: '🧪'
      });
    }

    return items.slice(0, 9);
  }

  function buildCopyBlock({ names, a, b, deltaVel, scopeA, scopeB, blockDaysA, blockDaysB, overall, signalLabel, kst, evidence }) {
    const lines = [];
    const velA = toNum(a.velocity), velB = toNum(b.velocity);

    lines.push(`## Sprint Retro Diff — ${names.a} vs ${names.b}`);
    lines.push('');
    lines.push(`**Headline:** Velocity ${velA} → ${velB} (${deltaVel >= 0 ? '+' : ''}${deltaVel} pts). Signal confidence: **${signalLabel}** (${overall}/10).`);
    lines.push('');
    lines.push('### What likely moved the needle (hypotheses)');
    lines.push(`- **Scope churn:** ${scopeA.total} → ${scopeB.total} pts (added+removed+changed).`);
    lines.push(`- **Blocker days:** ${blockDaysA} → ${blockDaysB}.`);
    const daysLostA = toNum(a.daysLost), daysLostB = toNum(b.daysLost);
    if (daysLostA || daysLostB) lines.push(`- **Team days lost:** ${daysLostA} → ${daysLostB}.`);
    const incA = toNum(a.incidents), incB = toNum(b.incidents);
    if (incA || incB) lines.push(`- **On-call/incidents:** ${incA} → ${incB}.`);

    const qA = normalizeText(a.quality);
    const qB = normalizeText(b.quality);
    if (qA || qB) {
      lines.push('');
      lines.push('### Quality notes (verbatim-ish)');
      if (qA) lines.push(`- ${names.a}: ${qA}`);
      if (qB) lines.push(`- ${names.b}: ${qB}`);
    }

    lines.push('');
    lines.push('### Keep / Stop / Try');
    const keep = kst.filter(x => x.bucket === 'keep').slice(0, 2);
    const stop = kst.filter(x => x.bucket === 'stop').slice(0, 2);
    const tri = kst.filter(x => x.bucket === 'try').slice(0, 2);

    keep.forEach(x => lines.push(`- **Keep:** ${x.title}`));
    stop.forEach(x => lines.push(`- **Stop:** ${x.title}`));
    tri.forEach(x => lines.push(`- **Try:** ${x.title}`));

    lines.push('');
    lines.push('### Evidence I used (sanity-check)');
    evidence.slice(0, 6).forEach(e => lines.push(`- ${e.label}: ${e.value}`));

    return lines.join('\n');
  }

  function renderAll() {
    const summary = computeSummary();
    renderPreview(summary);
    renderLists();
    renderSummary(summary);
    renderProgressCelebration();
  }

  function renderPreview(summary) {
    const { deltaVel, scopeA, scopeB, blockDaysA, blockDaysB, signalLabel, overall } = summary;

    const velText = (toNum(state.sprintA.velocity) || toNum(state.sprintB.velocity))
      ? `${deltaVel >= 0 ? '+' : ''}${deltaVel} pts`
      : '—';

    const churnText = (scopeA.total + scopeB.total) > 0
      ? `${scopeA.total}→${scopeB.total}`
      : '—';

    const blockerText = (state.blockersA.length + state.blockersB.length)