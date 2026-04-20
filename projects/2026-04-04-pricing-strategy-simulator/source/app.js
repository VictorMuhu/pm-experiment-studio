(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);

  const formatMoney = (n) => {
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(n);
    return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const formatPct = (n, digits = 1) => {
    const sign = n > 0 ? '+' : '';
    return `${sign}${n.toFixed(digits)}%`;
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  const seededDemo = () => ({
    baseline: {
      plans: ['starter', 'pro', 'team'],
      currentPrices: { starter: 29, pro: 59, team: 119 }
    },
    strategies: {
      a: {
        id: 'a',
        name: 'Bundle for Teams',
        tag: '🔥 Strategy A',
        theme: 'accent',
        prices: { starter: 29, pro: 69, team: 129 },
        freeUpliftPct: 2
      },
      b: {
        id: 'b',
        name: 'Raise Pro, Keep Entry',
        tag: '🧠 Strategy B',
        theme: 'accent2',
        prices: { starter: 25, pro: 79, team: 139 },
        freeUpliftPct: -1
      }
    },
    segments: [
      {
        id: 'solo-makers',
        emoji: '🧑‍💻',
        name: 'Solo makers',
        desc: 'Indie builders who upgrade to stop hitting limits',
        monthlySignups: 1200,
        baseConvPct: 2.4,
        typicalPlan: 'starter',
        sensitivityPer10: -3.0,
        valueBumpPts: 0.5,
        preferences: { starter: 0.72, pro: 0.24, team: 0.04 },
        notes: [
          'They churn fast if onboarding feels “salesy.”',
          'Expect sharp conversion drops above $39.'
        ]
      },
      {
        id: 'agency-delivery',
        emoji: '🧩',
        name: 'Agency delivery',
        desc: 'Client work; needs exports + permissions for handoff',
        monthlySignups: 420,
        baseConvPct: 4.1,
        typicalPlan: 'pro',
        sensitivityPer10: -2.0,
        valueBumpPts: 1.0,
        preferences: { starter: 0.38, pro: 0.50, team: 0.12 },
        notes: [
          'Packaging matters more than price if handoff is smooth.',
          'Team plan appeal rises with per-seat clarity.'
        ]
      },
      {
        id: 'midmarket-ops',
        emoji: '📊',
        name: 'Mid-market ops',
        desc: 'Teams buying for reporting + audit readiness',
        monthlySignups: 180,
        baseConvPct: 6.2,
        typicalPlan: 'team',
        sensitivityPer10: -1.2,
        valueBumpPts: 1.5,
        preferences: { starter: 0.14, pro: 0.34, team: 0.52 },
        notes: [
          'They hate surprise limits more than higher sticker price.',
          'Discount requests spike if “Team” feels like a seat tax.'
        ]
      },
      {
        id: 'product-led-startups',
        emoji: '🚀',
        name: 'Product-led startups',
        desc: 'High intent; wants SSO later but buys now',
        monthlySignups: 260,
        baseConvPct: 5.4,
        typicalPlan: 'pro',
        sensitivityPer10: -1.6,
        valueBumpPts: 1.0,
        preferences: { starter: 0.22, pro: 0.58, team: 0.20 },
        notes: [
          'They’ll pay for velocity, not bells and whistles.',
          'A mid-tier can reduce time-to-value confusion.'
        ]
      },
      {
        id: 'compliance-enterprise',
        emoji: '🛡️',
        name: 'Compliance-first',
        desc: 'Slow but sticky; demands controls + audit logs',
        monthlySignups: 55,
        baseConvPct: 10.5,
        typicalPlan: 'team',
        sensitivityPer10: -0.6,
        valueBumpPts: 2.0,
        preferences: { starter: 0.06, pro: 0.22, team: 0.72 },
        notes: [
          'Conversion is less elastic; deal size drives growth.',
          'They need a clear path from Pro → Team.'
        ]
      }
    ],
    ui: {
      mode: 'compare',
      selectedSegmentId: 'midmarket-ops',
      stressCompetitorUndercut: false,
      notes: {
        meetingGoal: 'Leave with one strategy and a “why” that fits Finance + Sales + PLG.',
        guardrails: 'Avoid a self-serve adoption collapse (> -10% customers/mo) and avoid a mix skew to low-LTV (> 60% Starter among paid).',
        openQuestions: 'Do we expect seasonality in Q2 signup volume? Are we changing onboarding flows at the same time as pricing?'
      }
    }
  });

  const state = {
    initial: seededDemo(),
    model: null
  };

  function resetState() {
    state.model = deepClone(state.initial);
  }

  function computeSegmentAllocation(segment, prices, stressOn) {
    // Competitor undercut affects Starter attractiveness (more price-sensitive segments react more)
    const stressPenalty = stressOn ? Math.max(0, (-segment.sensitivityPer10)) * 0.35 : 0;

    const p = { ...segment.preferences };

    // Higher Starter price shifts share upward; lower shifts to Starter
    const starterDelta10 = (prices.starter - state.model.baseline.currentPrices.starter) / 10;
    const proDelta10 = (prices.pro - state.model.baseline.currentPrices.pro) / 10;
    const teamDelta10 = (prices.team - state.model.baseline.currentPrices.team) / 10;

    // Simple heuristic: price increases push down that plan's share a bit,
    // pushing towards adjacent plan(s). Keep it stable and predictable.
    const starterAdj = clamp(-0.04 * starterDelta10 - stressPenalty * 0.02, -0.18, 0.18);
    const proAdj = clamp(-0.03 * proDelta10, -0.14, 0.14);
    const teamAdj = clamp(-0.02 * teamDelta10, -0.10, 0.10);

    // Apply adjustments, then renormalize.
    let starter = clamp(p.starter + starterAdj, 0.03, 0.92);
    let pro = clamp(p.pro + proAdj + (starterAdj < 0 ? 0.02 : -0.01), 0.03, 0.92);
    let team = clamp(p.team + teamAdj + (proAdj < 0 ? 0.02 : -0.01), 0.03, 0.92);

    const sum = starter + pro + team;
    starter /= sum;
    pro /= sum;
    team /= sum;

    return { starter, pro, team };
  }

  function computeConversionPct(segment, prices, freeUpliftPct, stressOn) {
    const baselinePrices = state.model.baseline.currentPrices;
    const base = segment.baseConvPct;

    // Determine which plan price is most relevant for this segment.
    const plan = segment.typicalPlan;
    const delta = (prices[plan] - baselinePrices[plan]);

    // Sensitivity is conversion percentage points per $10.
    const sensitivity = segment.sensitivityPer10;
    const priceEffectPts = (delta / 10) * sensitivity;

    // Packaging/value bump is conversion points (0..6).
    const valueEffectPts = segment.valueBumpPts;

    // Free-to-paid uplift is % of base conversion (global).
    const upliftPts = (base * (freeUpliftPct / 100));

    // Stress test: competitor undercuts starter → base conversion falls a bit for segments that start at Starter.
    let stressPts = 0;
    if (stressOn) {
      const starterBias = segment.preferences.starter; // proxy for "starts at low tier"
      const elastic = Math.max(0, -segment.sensitivityPer10) / 3.0; // normalize
      stressPts = -1.2 * starterBias * elastic; // up to ~ -1.2 pts
    }

    const conv = clamp(base + priceEffectPts + valueEffectPts + upliftPts + stressPts, 0.2, 18.0);
    return conv;
  }

  function simulateStrategy(strategy) {
    const segs = state.model.segments;
    const stressOn = state.model.ui.stressCompetitorUndercut;

    let totalCustomers = 0;
    let totalRevenue = 0;

    const bySegment = {};

    for (const s of segs) {
      const mix = computeSegmentAllocation(s, strategy.prices, stressOn);
      const convPct = computeConversionPct(s, strategy.prices, strategy.freeUpliftPct, stressOn);

      const customers = s.monthlySignups * (convPct / 100);
      const revenue =
        customers *
        (mix.starter * strategy.prices.starter +
          mix.pro * strategy.prices.pro +
          mix.team * strategy.prices.team);

      totalCustomers += customers;
      totalRevenue += revenue;

      bySegment[s.id] = {
        convPct,
        customers,
        mix,
        revenue
      };
    }

    const arpa = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    return {
      totals: { customers: totalCustomers, revenue: totalRevenue, arpa },
      bySegment
    };
  }

  function computeBaseline() {
    // Baseline: current prices, no uplift
    const baselineStrategy = {
      prices: { ...state.model.baseline.currentPrices },
      freeUpliftPct: 0
    };
    return simulateStrategy(baselineStrategy);
  }

  function computeConfidence(simA, simB, baseline) {
    // Confidence: reward balanced growth (not too low adoption), reward revenue, penalize volatility across segments.
    const baseRev = baseline.totals.revenue;
    const baseCust = baseline.totals.customers;

    const best = (simA.totals.revenue + simB.totals.revenue) / 2; // proxy for "we're still debating"
    const bestCust = (simA.totals.customers + simB.totals.customers) / 2;

    const revDeltaPct = baseRev > 0 ? ((best - baseRev) / baseRev) * 100 : 0;
    const custDeltaPct = baseCust > 0 ? ((bestCust - baseCust) / baseCust) * 100 : 0;

    // Volatility: average absolute difference in segment conversion between A and B.
    let vol = 0;
    for (const s of state.model.segments) {
      const a = simA.bySegment[s.id].convPct;
      const b = simB.bySegment[s.id].convPct;
      vol += Math.abs(a - b);
    }
    vol = vol / state.model.segments.length; // in pts

    // Compute score 0..100
    const revScore = clamp(50 + revDeltaPct * 1.6, 0, 100);
    const adoptScore = clamp(50 + custDeltaPct * 2.2, 0, 100);
    const volPenalty = clamp(vol * 6.5, 0, 35);

    const score = clamp(Math.round((revScore * 0.46 + adoptScore * 0.54) - volPenalty), 0, 100);

    const riskLabel = (custDeltaPct < -10 || revDeltaPct < -6) ? 'High' : (custDeltaPct < -5 || revDeltaPct < -3) ? 'Medium' : 'Low';
    const volLabel = vol > 2.2 ? 'High' : (vol > 1.3 ? 'Medium' : 'Low');

    return { score, riskLabel, volLabel, revDeltaPct, custDeltaPct, volPts: vol };
  }

  function pickStatusBadgeForStrategy(sim, baseline) {
    const baseRev = baseline.totals.revenue;
    const baseCust = baseline.totals.customers;

    const revDeltaPct = baseRev > 0 ? ((sim.totals.revenue - baseRev) / baseRev) * 100 : 0;
    const custDeltaPct = baseCust > 0 ? ((sim.totals.customers - baseCust) / baseCust) * 100 : 0;

    // Severe if adoption collapses or revenue drops.
    if (custDeltaPct < -10 || revDeltaPct < -6) return { cls: 'badge--critical', text: '⛔ Fragile' };
    if (custDeltaPct < -5 || revDeltaPct < -3) return { cls: 'badge--warn', text: '⚠️ Risky' };
    return { cls: 'badge--ok', text: '✅ Balanced' };
  }

  function setRing(score) {
    const ring = $('#confidenceRing');
    const circle = ring.querySelector('.ring__progress');
    const circumference = 2 * Math.PI * 18;
    const offset = circumference * (1 - score / 100);

    circle.style.strokeDasharray = `${circumference.toFixed(1)}`;
    circle.style.strokeDashoffset = `${offset.toFixed(1)}`;

    let stroke = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-3').trim();
    if (score < 45) stroke = getComputedStyle(document.documentElement).getPropertyValue('--color-critical').trim();
    else if (score < 70) stroke = getComputedStyle(document.documentElement).getPropertyValue('--color-warn').trim();
    circle.style.stroke = stroke;
  }

  function toast(text, icon = '✨') {
    const wrap = $('#toastWrap');
    wrap.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<div aria-hidden="true">${icon}</div><div class="toast__text">${escapeHtml(text)}</div>`;
    wrap.appendChild(el);
    // force reflow for transition
    void el.offsetHeight;
    el.classList.add('toast--show');
    window.setTimeout(() => {
      el.classList.remove('toast--show');
    }, 1800);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function renderSegments(simA, simB, baseline) {
    const list = $('#segmentList');
    list.innerHTML = '';

    const mode = state.model.ui.mode;
    for (const s of state.model.segments) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'segmentCard';
      card.setAttribute('role', 'option');
      card.dataset.id = s.id;

      if (s.id === state.model.ui.selectedSegmentId) card.classList.add('segmentCard--selected');

      const a = simA.bySegment[s.id];
      const b = simB.bySegment[s.id];
      const base = baseline.bySegment[s.id];

      let chip1 = '';
      let chip2 = '';
      let chip3 = '';

      const custDeltaA = base.customers > 0 ? ((a.customers - base.customers) / base.customers) * 100 : 0;
      const custDeltaB = base.customers > 0 ? ((b.customers - base.customers) / base.customers) * 100 : 0;

      const revDeltaA = base.revenue > 0 ? ((a.revenue - base.revenue) / base.revenue) * 100 : 0;
      const revDeltaB = base.revenue > 0 ? ((b.revenue - base.revenue) / base.revenue) * 100 : 0;

      const bestRevenue = revDeltaA >= revDeltaB ? 'A' : 'B';
      const bestAdoption = custDeltaA >= custDeltaB ? 'A' : 'B';

      if (mode === 'compare') {
        chip1 = `<span class="metaChip metaChip--accent">🔥 A rev ${formatPct(revDeltaA, 0)}</span>`;
        chip2 = `<span class="metaChip metaChip--accent2">🧠 B rev ${formatPct(revDeltaB, 0)}</span>`;
        chip3 = `<span class="metaChip">🏁 best: ${bestRevenue === 'A' ? 'A' : 'B'} rev · ${bestAdoption === 'A' ? 'A' : 'B'} adoption</span>`;
      } else if (mode === 'revenue') {
        chip1 = `<span class="metaChip metaChip--accent">🔥 A ${formatPct(revDeltaA, 0)}</span>`;
        chip2 = `<span class="metaChip metaChip--accent2">🧠 B ${formatPct(revDeltaB, 0)}</span>`;
        chip3 = `<span class="metaChip">💡 baseline ${formatMoney(Math.round(base.revenue))}</span>`;
      } else {
        chip1 = `<span class="metaChip metaChip--accent">🔥 A ${formatPct(custDeltaA, 0)}</span>`;
        chip2 = `<span class="metaChip metaChip--accent2">🧠 B ${formatPct(custDeltaB, 0)}</span>`;
        chip3 = `<span class="metaChip">💡 baseline ${Math.round(base.customers)}/mo</span>`;
      }

      card.innerHTML = `
        <div class="segmentCard__emoji" aria-hidden="true">${escapeHtml(s.emoji)}</div>
        <div>
          <div class="segmentCard__name">${escapeHtml(s.name)}</div>
          <div class="segmentCard__desc">${escapeHtml(s.desc)}</div>
          <div class="segmentCard__metaRow">
            ${chip1}
            ${chip2}
            ${chip3}
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        state.model.ui.selectedSegmentId = s.id;
        renderAll();
      });

      list.appendChild(card);
    }
  }

  function selectedSegment() {
    return state.model.segments.find(s => s.id === state.model.ui.selectedSegmentId) || state.model.segments[0];
  }

  function renderInspector(simA, simB, baseline) {
    const s = selectedSegment();
    const a = simA.bySegment[s.id];
    const b = simB.bySegment[s.id];
    const base = baseline.bySegment[s.id];

    $('#inspectorEmoji').textContent = s.emoji;
    $('#inspectorName').textContent = s.name;
    $('#inspectorDesc').textContent = s.desc;

    $('#inspectorSignups').textContent = s.monthlySignups.toLocaleString();
    $('#inspectorBaseConv').textContent = `${s.baseConvPct.toFixed(1)}%`;
    $('#inspectorPlan').textContent = s.typicalPlan[0].toUpperCase() + s.typicalPlan.slice(1);
    $('#inspectorSensitivity').textContent = `${s.sensitivityPer10.toFixed(1)} pts`;

    // Badges: segment health based on baseline conversion and sensitivity
    const health = (s.baseConvPct >= 6) ? { cls: 'badge--ok', text: '✅ High-intent' }
      : (s.baseConvPct >= 3.5) ? { cls: 'badge--warn', text: '⚠️ Needs nurture' }
      : { cls: 'badge--critical', text: '⛔ Price fragile' };

    const elastic = Math.abs(s.sensitivityPer10) >= 2.6 ? { cls: 'badge--critical', text: '⛔ Very elastic' }
      : (Math.abs(s.sensitivityPer10) >= 1.6) ? { cls: 'badge--warn', text: '⚠️ Elastic' }
      : { cls: 'badge--ok', text: '✅ Stable' };

    const size = s.monthlySignups >= 600 ? { cls: 'badge--ok', text: '✅ Big funnel' }
      : (s.monthlySignups >= 200) ? { cls: 'badge--warn', text: '⚠️ Mid funnel' }
      : { cls: 'badge--critical', text: '⛔ Small funnel' };

    const badges = $('#inspectorBadges');
    badges.innerHTML = `
      <span class="badge ${health.cls}">${health.text}</span>
      <span class="badge ${elastic.cls}">${elastic.text}</span>
      <span class="badge ${size.cls}">${size.text}</span>
    `;

    const sensitivity = $('#sensitivity');
    const valueBump = $('#valueBump');

    sensitivity.value = String(s.sensitivityPer10);
    valueBump.value = String(s.valueBumpPts);

    $('#sensitivityVal').textContent = `${Number(sensitivity.value).toFixed(1)} pts`;
    $('#valueBumpVal').textContent = `${Number(valueBump.value).toFixed(1)} pts`;

    // Inspector health badge: if assumptions create large swings between A and B for this segment, warn.
    const vol = Math.abs(a.convPct - b.convPct);
    const hb = $('#inspectorHealthBadge');
    if (vol > 2.2) {
      hb.className = 'badge badge--critical';
      hb.textContent = '⛔ Assumption sensitive';
    } else if (vol > 1.2) {
      hb.className = 'badge badge--warn';
      hb.textContent = '⚠️ Assumption sensitive';
    } else {
      hb.className = 'badge badge--ok';
      hb.textContent = '✅ Healthy';
    }

    // Mix bars based on baseline → show how each strategy shifts paid mix for selected segment
    const mixBars = $('#mixBars');
    const mixA = a.mix;
    const mixB = b.mix;

    const mkRow = (label, key, cls) => {
      const pctA = Math.round(mixA[key] * 100);
      const pctB = Math.round(mixB[key] * 100);
      const pctBase = Math.round(base.mix[key] * 100);

      // show average of A & B as bar width for stability, but annotate both
      const width = Math.round(((mixA[key] + mixB[key]) / 2) * 100);

      return `
        <div class="mixRow">
          <div class="mixRow__head">
            <div class="mixRow__label">${escapeHtml(label)}</div>
            <div class="mixRow__pct">A ${pctA}% · B ${pctB}% · base ${pctBase}%</div>
          </div>
          <div class="bar" role="img" aria-label="${escapeHtml(label)} mix bar">
            <div class="bar__fill ${cls}" style="width:${width}%"></div>
          </div>
        </div>
      `;
    };

    mixBars.innerHTML = `
      ${mkRow('Starter mix', 'starter', '')}
      ${mkRow('Pro mix', 'pro', 'bar__fill--accent2')}
      ${mkRow('Team mix', 'team', 'bar__fill--accent3')}
    `;

    // Mix badge: warn if Starter dominates among paid for either strategy
    const mixBadge = $('#mixBadge');
    const starterDom = (mixA.starter > 0.6) || (mixB.starter > 0.6);
    if (starterDom) {
      mixBadge.className = 'badge badge--critical';
      mixBadge.textContent = '⛔ Mix skew risk';
    } else if ((mixA.starter > 0.5) || (mixB.starter > 0.5)) {
      mixBadge.className = 'badge badge--warn';
      mixBadge.textContent = '⚠️ Mix shift';
    } else {
      mixBadge.className = 'badge badge--ok';
      mixBadge.textContent = '✅ Mix healthy';
    }

    const watchList = $('#watchList');
    const items = [];

    const baseCustomers = base.customers;
    const aCustDelta = baseCustomers > 0 ? ((a.customers - baseCustomers) / baseCustomers) * 100 : 0;
    const bCustDelta = baseCustomers > 0 ? ((b.customers - baseCustomers) / baseCustomers) * 100 : 0;

    if (Math.min(aCustDelta, bCustDelta) < -8) items.push('Watch for adoption collapse in this segment (top-of-funnel is big).');
    if (Math.max(aCustDelta, bCustDelta) > 8) items.push('This segment could mask churn with new logo volume — sanity check retention.');
    if (starterDom) items.push('If Starter dominates paid mix, LTV may underperform even if signups rise.');
    if (Math.abs(a.convPct - b.convPct) > 2.2) items.push('Small assumption tweaks swing results — align on sensitivity before deciding.');
    items.push(...s.notes.slice(0, 2));

    watchList.innerHTML = items.map(t => `<li>${escapeHtml(t)}</li>`).join('');
  }

  function renderStrategies(simA, simB, baseline) {
    const a = state.model.strategies.a;
    const b = state.model.strategies.b;

    $('#nameA').textContent = a.name;
    $('#tagA').textContent = a.tag;
    $('#nameB').textContent = b.name;
    $('#tagB').textContent = b.tag;

    // Inputs
    $('#aStarterPrice').value = String(a.prices.starter);
    $('#aProPrice').value = String(a.prices.pro);
    $('#aTeamPrice').value = String(a.prices.team);
    $('#aFreeUplift').value = String(a.freeUpliftPct);

    $('#bStarterPrice').value = String(b.prices.starter);
    $('#bProPrice').value = String(b.prices.pro);
    $('#bTeamPrice').value = String(b.prices.team);
    $('#bFreeUplift').value = String(b.freeUpliftPct);

    // Stats
    $('#aRevenue').textContent = formatMoney(Math.round(simA.totals.revenue));
    $('#aCustomers').textContent = `${Math.round(simA.totals.customers).toLocaleString()}`;
    $('#aArpa').textContent = formatMoney(Math.round(simA.totals.arpa));

    $('#bRevenue').textContent = formatMoney(Math.round(simB.totals.revenue));
    $('#bCustomers').textContent = `${Math.round(simB.totals.customers).toLocaleString()}`;
    $('#bArpa').textContent = formatMoney(Math.round(simB.totals.arpa));

    // Badges based on baseline
    const ba = pickStatusBadgeForStrategy(simA, baseline);
    const bb = pickStatusBadgeForStrategy(simB, baseline);

    const badgeA = $('#badgeA');
    badgeA.className = `badge ${ba.cls}`;
    badgeA.textContent = ba.text;

    const badgeB = $('#badgeB');
    badgeB.className = `badge ${bb.cls}`;
    badgeB.textContent = bb.text;
  }

  function renderKpis(simA, simB, baseline) {
    // KPI deltas: show (winner vs baseline) by current mode, but headline stays compare.
    const baseRev = baseline.totals.revenue;
    const baseCust = baseline.totals.customers;

    const win = (simA.totals.revenue >= simB.totals.revenue) ? simA : simB;
    const winName = (win === simA) ? 'A' : 'B';

    const revenueDelta = win.totals.revenue - baseRev;
    const adoptionDeltaPct = baseCust > 0 ? ((win.totals.customers - baseCust) / baseCust) * 100 : 0;

    $('#kpiRevenueDelta').textContent = `${revenueDelta >= 0 ? '+' : '-'}${formatMoney(Math.round(Math.abs(revenueDelta)))}`;
    $('#kpiRevenueDeltaSub').textContent = `best: Strategy ${winName} vs current`;

    $('#kpiAdoptionDelta').textContent = formatPct(adoptionDeltaPct, 0);
    $('#kpiAdoptionDeltaSub').textContent = `best: Strategy ${winName} new customers / month`;

    const conf = computeConfidence(simA, simB, baseline);
    $('#confidenceScore').textContent = String(conf.score);
    setRing(conf.score);

    const riskBadge = $('#badgeRisk');
    const volBadge = $('#badgeVolatility');
    const sub = $('#kpiConfidenceSub');

    const riskCls = conf.riskLabel === 'High' ? 'badge--critical' : conf.riskLabel === 'Medium' ? 'badge--warn' : 'badge--ok';
    const volCls = conf.volLabel === 'High' ? 'badge--critical' : conf.volLabel === 'Medium' ? 'badge--warn' : 'badge--ok';

    riskBadge.className = `badge ${riskCls}`;
    riskBadge.textContent = `${conf.riskLabel === 'High' ? '⛔' : conf.riskLabel === 'Medium' ? '⚠️' : '✅'} Risk: ${conf.riskLabel}`;

    volBadge.className = `badge ${volCls}`;
    volBadge.textContent = `${conf.volLabel === 'High' ? '⛔' : conf.volLabel === 'Medium' ? '⚠️' : '✅'} Volatility: ${conf.volLabel}`;

    if (conf.score >= 80) sub.textContent = 'clear winner + stable segment behavior';
    else if (conf.score >= 65) sub.textContent = 'balanced tradeoffs with manageable risk';
    else if (conf.score >= 45) sub.textContent = 'heated debate zone: expect second-order effects';
    else sub.textContent = 'likely to surprise you after launch';
  }

  function bindControls() {
    const wirePriceInput = (id, getter, setter) => {
      const el = $(id);
      el.addEventListener('input', () => {
        const val = clamp(Number(el.value || 0), 0, 9999);
        setter(val);
        renderAll();
      });
    };

    wirePriceInput('#aStarterPrice', () => state.model.strategies.a.prices.starter, (v) => (state.model.strategies.a.prices.starter = v));
    wirePriceInput('#aProPrice', () => state.model.strategies.a.prices.pro, (v) => (state.model.strategies.a.prices.pro = v));
    wirePriceInput('#aTeamPrice', () => state.model.strategies.a.prices.team, (v) => (state.model.strategies.a.prices.team = v));
    wirePriceInput('#aFreeUplift', () => state.model.strategies.a.freeUpliftPct, (v) => (state.model.strategies.a.freeUpliftPct = clamp(v, -50, 50)));

    wirePriceInput('#bStarterPrice', () => state.model.strategies.b.prices.starter, (v) => (state.model.strategies.b.prices.starter = v));
    wirePriceInput('#bProPrice', () => state.model.strategies.b.prices.pro, (v) => (state.model.strategies.b.prices.pro = v));
    wirePriceInput('#bTeamPrice', () => state.model.strategies.b.prices.team, (v) => (state.model.strategies.b.prices.team = v));
    wirePriceInput('#bFreeUplift', () => state.model.strategies.b.freeUpliftPct, (v) => (state.model.strategies.b.freeUpliftPct = clamp(v, -50, 50)));

    const sensitivity = $('#sensitivity');
    const valueBump = $('#valueBump');

    sensitivity.addEventListener('input', () => {
      const s = selectedSegment();
      s.sensitivityPer10 = Number(sensitivity.value);
      $('#sensitivityVal').textContent = `${s.sensitivityPer10.toFixed(1)} pts`;
      renderAll();
    });

    valueBump.addEventListener('input', () => {
      const s = selectedSegment();
      s.valueBumpPts = Number(valueBump.value);
      $('#valueBumpVal').textContent = `${s.valueBumpPts.toFixed(1)} pts`;
      renderAll();
    });

    const toggleStress = $('#toggleStress');
    toggleStress.addEventListener('change', () => {
      state.model.ui.stressCompetitorUndercut = toggleStress.checked;
      toast(toggleStress.checked ? 'Stress test ON: competitor undercuts Starter' : 'Stress test OFF', toggleStress.checked ? '⚡' : '🧊');
      renderAll();
    });

    const setMode = (mode) => {
      state.model.ui.mode = mode;
      $('#modeCompare').setAttribute('aria-selected', String(mode === 'compare'));
      $('#modeRevenue').setAttribute('aria-selected', String(mode === 'revenue'));
      $('#modeAdoption').setAttribute('aria-selected', String(mode === 'adoption'));
      renderAll();
    };

    $('#modeCompare').addEventListener('click', () => setMode('compare'));
    $('#modeRevenue').addEventListener('click', () => setMode('revenue'));
    $('#modeAdoption').addEventListener('click', () => setMode('adoption'));

    $('#btnReset').addEventListener('click', () => {
      resetState();
      // Preserve UI mode to feel intentional
      state.model.ui.mode = 'compare';
      toast('Back to the seeded demo scenario', '↺');
      syncStressToggle();
      renderAll();
    });

    $('#btnShuffle').addEventListener('click', () => {
      // Slightly mutate to feel like a new meeting: tweak volumes and a couple sensitivities + prices
      const m = state.model;

      for (const seg of m.segments) {
        const vol = seg.monthlySignups;
        const jitter = (Math.random() * 0.16) - 0.08;
        seg.monthlySignups = Math.round(clamp(vol * (1 + jitter), 30, 3000));
        seg.sensitivityPer10 = clamp(seg.sensitivityPer10 + (Math.random() * 0.8 - 0.4), -8, 2);
        seg.valueBumpPts = clamp(seg.valueBumpPts + (Math.random() * 0.7 - 0.35), 0, 6);
      }

      const j = () => Math.round(Math.random() * 6 - 3);
      m.strategies.a.prices.pro = clamp(m.strategies.a.prices.pro + j(), 10, 499);
      m.strategies.b.prices.pro = clamp(m.strategies.b.prices.pro + j(), 10, 499);
      m.strategies.a.freeUpliftPct = clamp(m.strategies.a.freeUpliftPct + Math.round(Math.random() * 2 - 1), -50, 50);
      m.strategies.b.freeUpliftPct = clamp(m.strategies.b.freeUpliftPct + Math.round(Math.random() * 2 - 1), -50, 50);

      toast('New scenario: numbers nudged like a real pricing review', '🎲');
      renderAll();
    });

    $('#btnApplySuggestion').addEventListener('click', () => {
      // "Safe tweak": if B is fragile, reduce Pro price slightly or increase uplift modestly
      const baseline = computeBaseline();
      const simA = simulateStrategy(state.model.strategies.a);
      const simB = simulateStrategy(state.model.strategies.b);

      const bb = pickStatusBadgeForStrategy(simB, baseline);
      const before = { ...state.model.strategies.b.prices, uplift: state.model.strategies.b.freeUpliftPct };

      if (bb.cls === 'badge--critical') {
        state.model.strategies.b.prices.pro = clamp(state.model.strategies.b.prices.pro - 5, 10, 499);
        state.model.strategies.b.freeUpliftPct = clamp(state.model.strategies.b.freeUpliftPct + 2, -50, 50);
        toast('Applied a safer tweak: softer Pro + a small packaging lift', '✨');
      } else if (bb.cls === 'badge--warn') {
        state.model.strategies.b.prices.pro = clamp(state.model.strategies.b.prices.pro - 3, 10, 499);
        toast('Applied a small safety tweak: slightly softer Pro', '✨');
      } else {
        // Still make a subtle change so the button does something meaningful.
        state.model.strategies.b.freeUpliftPct = clamp(state.model.strategies.b.freeUpliftPct + 1, -50, 50);
        toast('Tiny tweak: +1% uplift to reflect clearer packaging', '✨');
      }

      const after = { ...state.model.strategies.b.prices, uplift: state.model.strategies.b.freeUpliftPct };
      if (JSON.stringify(before) === JSON.stringify(after)) {
        toast('No change needed — Strategy B already looks safe', '✅');
      }
      renderAll();
    });

    // Bottom nav
    $('#navSim').addEventListener('click', () => {
      toast('You are in Sim', '🧪');
    });

    $('#navSegments').addEventListener('click', () => openSheet('Segments', renderSegmentsSheet));
    $('#navStrategies').addEventListener('click', () => openSheet('Strategies', renderStrategiesSheet));
    $('#navNotes').addEventListener('click', () => openSheet('Notes', renderNotesSheet));
    $('#navExport').addEventListener('click', () => openSheet('Export', renderExportSheet));

    $('#btnCloseSheet').addEventListener('click', closeSheet);

    const sheet = $('#sheet');
    sheet.addEventListener('click', (e) => {
      const rect = sheet.getBoundingClientRect();
      const inDialog = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      if (!inDialog) closeSheet();
    });

    sheet.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeSheet();
    });
  }

  function syncStressToggle() {
    $('#toggleStress').checked = state.model.ui.stressCompetitorUndercut;
  }

  function renderAll() {
    const baseline = computeBaseline();
    const simA = simulateStrategy(state.model.strategies.a);
    const simB = simulateStrategy(state.model.strategies.b);

    renderKpis(simA, simB, baseline);
    renderStrategies(simA, simB, baseline);
    renderSegments(simA, simB, baseline);
    renderInspector(simA, simB, baseline);
  }

  function renderSegmentsSheet() {
    const s = selectedSegment();
    const container = document.createElement('div');
    container.className = 'sheetGrid';

    for (const seg of state.model.segments) {
      const card = document.createElement('div');
      card.className = 'sheetCard';
      card.innerHTML = `
        <div style="display:flex; gap:12px; align-items:center;">
          <div class="inspector__emoji" aria-hidden="true" style="width:44px;height:44px;border-radius:18px;font-size:18px;">${escapeHtml(seg.emoji)}</div>
          <div>
            <div style="font-weight:800;font-size:16px;">${escapeHtml(seg.name)}</div>
            <div style="color:var(--color-text-secondary);font-size:13px;margin-top:2px;">${escapeHtml(seg.desc)}</div>
          </div>
        </div>
        <div style="margin-top:12px; display:flex; flex-wrap:wrap; gap:10px;">
          <span class="badge badge--ok">✅ ${seg.monthlySignups.toLocaleString()} signups/mo</span>
          <span class="badge badge--warn">⚠️ ${seg.baseConvPct.toFixed(1)}% base conv</span>
          <span class="badge badge--ok">✅ ${seg.typicalPlan[0].toUpperCase() + seg.typicalPlan.slice(1)}-leaning</span>
        </div>
        <div style="margin-top:12px; display:flex; gap:10px;">
          <button class="btn btn--primary" type="button" data-pick="${escapeHtml(seg.id)}">
            <span class="btn__icon" aria-hidden="true">🎯</span><span class="btn__label">Select</span>
          </button>
        </div>
      `;
      container.appendChild(card);
    }

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-pick]');
      if (!btn) return;
      state.model.ui.selectedSegmentId = btn.getAttribute('data-pick');
      closeSheet();
      toast(`Selected segment: ${selectedSegment().name}`, '🎯');
      renderAll();
    });

    return container;
  }

  function renderStrategiesSheet() {
    const a = state.model.strategies.a;
    const b = state.model.strategies.b;

    const wrap = document.createElement('div');
    wrap.className = 'sheetGrid';

    const card = (title, tag, theme, strat) => {
      const el = document.createElement('div');
      el.className = 'sheetCard';
      el.style.background = theme === 'accent2'
        ? 'linear-gradient(180deg, rgba(108,99,255,.12), rgba(255,255,255,1) 55%)'
        : 'linear-gradient(180deg, rgba(255,87,51,.12), rgba(255,255,255,1) 55%)';

      el.innerHTML = `
        <div class="tag ${theme === 'accent2' ? 'tag--accent2' : 'tag--accent'}">${escapeHtml(tag)}</div>
        <div style="margin-top:10px; font-weight:800; font-size:18px;">${escapeHtml(title)}</div>
        <div style="margin-top:10px; display:grid; grid-template-columns: 1fr; gap:10px;">
          <div class="pill">
            <div class="pill__label">Starter</div>
            <div class="pill__value">${formatMoney(strat.prices.starter)}/mo</div>
          </div>
          <div class="pill">
            <div class="pill__label">Pro</div>
            <div class="pill__value">${formatMoney(strat.prices.pro)}/mo</div>
          </div>
          <div class="pill">
            <div class="pill__label">Team</div>
            <div class="pill__value">${formatMoney(strat.prices.team)}/mo</div>
          </div>
          <div class="pill">
            <div class="pill__label">Free-to-paid uplift</div>
            <div class="pill__value">${strat.freeUpliftPct > 0 ? '+' : ''}${strat.freeUpliftPct}%</div>
          </div>
        </div>
      `;
      return el;
    };

    wrap.appendChild(card(a.name, a.tag, 'accent', a));
    wrap.appendChild(card(b.name, b.tag, 'accent2', b));

    const footer = document.createElement('div');
    footer.className = 'sheetCard';
    footer.style.background = 'linear-gradient(180deg, rgba(0,196,159,.12), rgba(255,255,255,1) 55%)';
    footer.innerHTML = `
      <div style="font-weight:800; font-size:16px;">Quick take</div>
      <div style="color:var(--color-text-secondary); font-size:13px; margin-top:6px;">
        Pricing reviews often get stuck on a single number. This simulator keeps the “shape” of pricing visible: mix, adoption, and revenue.
      </div>
    `;
    wrap.appendChild(footer);

    return wrap;
  }

  function renderNotesSheet() {
    const n = state.model.ui.notes;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="sheetCard">
        <div style="font-weight:800; font-size:16px;">Meeting notes</div>
        <div style="color:var(--color-text-secondary); font-size:13px; margin-top:6px;">
          These are saved only in-memory (prototype). Keep them short and tactical.
        </div>

        <div style="margin-top:14px; display:flex; flex-direction:column; gap:12px;">
          <label class="field">
            <span class="field__label">Goal</span>
            <textarea class="textarea" id="notesGoal"></textarea>
          </label>
          <label class="field">
            <span class="field__label">Guardrails</span>
            <textarea class="textarea" id="notesGuardrails"></textarea>
          </label>
          <label class="field">
            <span class="field__label">Open questions</span>
            <textarea class="textarea" id="notesQuestions"></textarea>
          </label>
        </div>

        <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn--primary" id="btnSaveNotes" type="button">
            <span class="btn__icon" aria-hidden="true">📝</span>
            <span class="btn__label">Save</span>
          </button>
          <button class="btn btn--ghost" id="btnClearNotes" type="button">
            <span class="btn__icon" aria-hidden="true">🧽</span>
            <span class="btn__label">Clear</span>
          </button>
        </div>
      </div>
    `;

    const fill = () => {
      $('#notesGoal', wrap).value = n.meetingGoal;
      $('#notesGuardrails', wrap).value = n.guardrails;
      $('#notesQuestions', wrap).value = n.openQuestions;
    };
    fill();

    $('#btnSaveNotes', wrap).addEventListener('click', () => {
      state.model.ui.notes.meetingGoal = $('#notesGoal', wrap).value.trim();
      state.model.ui.notes.guardrails = $('#notesGuardrails', wrap).value.trim();
      state.model.ui.notes.openQuestions = $('#notesQuestions', wrap).value.trim();
      toast('Notes saved (in this session)', '📝');
    });

    $('#btnClearNotes', wrap).addEventListener('click', () => {
      state.model.ui.notes.meetingGoal = '';
      state.model.ui.notes.guardrails = '';
      state.model.ui.notes.openQuestions = '';
      fill();
      toast('Notes cleared', '🧽');
    });

    return wrap;
  }

  function renderExportSheet() {
    const baseline = computeBaseline();
    const simA = simulateStrategy(state.model.strategies.a);
    const simB = simulateStrategy(state.model.strategies.b);
    const conf = computeConfidence(simA, simB, baseline);

    const winner = simA.totals.revenue >= simB.totals.revenue ? 'A' : 'B';
    const winSim = winner === 'A' ? simA : simB;
    const baseRev = baseline.totals.revenue;
    const baseCust = baseline.totals.customers;

    const revDeltaPct = baseRev > 0 ? ((winSim.totals.revenue - baseRev) / baseRev) * 100 : 0;
    const custDeltaPct = baseCust > 0 ? ((winSim.totals.customers - baseCust) / baseCust) * 100 : 0;

    const lines = [];
    lines.push(`Pricing Strategy Simulator — export summary`);
    lines.push(``);
    lines.push(`Winner by revenue: Strategy ${winner}`);
    lines.push(`Confidence score: ${conf.score}/100 (risk: ${conf.riskLabel}, volatility: ${conf.volLabel})`);
    lines.push(`Revenue delta vs current: ${formatPct(revDeltaPct, 1)} (${formatMoney(Math.round(winSim.totals.revenue - baseRev))})`);
    lines.push(`Adoption delta vs current: ${formatPct(custDeltaPct, 1)} (${Math.round(winSim.totals.customers - baseCust)} customers/mo)`);
    lines.push(``);
    lines.push(`Assumptions:`);
    lines.push(`- Stress test: ${state.model.ui.stressCompetitorUndercut ? 'ON (competitor undercuts Starter by 20%)' : 'OFF'}`);
    lines.push(`- Segments: ${state.model.segments.length}`);
    lines.push(``);
    lines.push(`Top segment deltas (winner vs baseline):`);

    const deltas = state.model.segments.map(s => {
      const w = (winner === 'A') ? simA.bySegment[s.id] : simB.bySegment[s.id];
      const base = baseline.bySegment[s.id];
      const dCust = base.customers > 0 ? ((w.customers - base.customers) / base.customers) * 100 : 0;
      const dRev = base.revenue > 0 ? ((w.revenue - base.revenue) / base.revenue) * 100 : 0;
      return { id: s.id, name: s.name, dCust, dRev };
    }).sort((x, y) => Math.abs(y.dRev) - Math.abs(x.dRev)).slice(0, 5);

    for (const d of deltas) {
      lines.push(`- ${d.name}: rev ${formatPct(d.dRev, 0)}, adoption ${formatPct(d.dCust, 0)}`);
    }

    lines.push(``);
    lines.push(`Notes:`);
    const n = state.model.ui.notes;
    lines.push(`- Goal: ${n.meetingGoal || '(empty)'}`);
    lines.push(`- Guardrails: ${n.guardrails || '(empty)'}`);
    lines.push(`- Open questions: ${n.openQuestions || '(empty)'}`);

    const text = lines.join('\n');

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="sheetCard">
        <div style="font-weight:800; font-size:16px;">Export for a pricing review doc</div>
        <div style="color:var(--color-text-secondary); font-size:13px; margin-top:6px;">
          Copy/paste into a doc or Slack. This includes the current scenario, winner, and top segment impacts.
        </div>
        <div style="margin-top:12px;">
          <textarea class="textarea" id="exportText" readonly></textarea>
        </div>
        <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn--primary" id="btnCopy" type="button">
            <span class="btn__icon" aria-hidden="true">📋</span>
            <span class="btn__label">Copy</span>
          </button>
          <button class="btn btn--ghost" id="btnClose" type="button">
            <span class="btn__icon" aria-hidden="true">✕</span>
            <span class="btn__label">Close</span>
          </button>
        </div>
      </div>
    `;

    $('#exportText', wrap).value = text;

    $('#btnCopy', wrap).addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        toast('Copied export summary', '📋');
      } catch {
        toast('Copy failed — select text manually', '⚠️');
      }
    });

    $('#btnClose', wrap).addEventListener('click', closeSheet);

    return wrap;
  }

  function openSheet(title, renderer) {
    const sheet = $('#sheet');
    $('#sheetTitle').textContent = title;

    const content = $('#sheetContent');
    content.innerHTML = '';
    const node = renderer();
    content.appendChild(node);

    if (!sheet.open) sheet.showModal();
    // small delight: immediate toast
    toast(`${title} opened`, '🪄');
  }

  function closeSheet() {
    const sheet = $('#sheet');
    if (sheet.open) sheet.close();
  }

  function init() {
    resetState();
    bindControls();
    syncStressToggle();
    renderAll();
    toast('Seeded demo loaded — click a segment to begin', '💸');
  }

  init();
})();