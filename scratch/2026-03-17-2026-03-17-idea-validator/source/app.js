(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const round = (n) => Math.round(n);
  const nowStamp = () => {
    const d = new Date();
    const pad = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const state = {
    ledMode: false,
    brief: {
      ideaName: "",
      targetUser: "",
      problemStatement: "",
      solutionStatement: "",
      differentiator: ""
    },
    dials: {
      pain: 0,
      reach: 0,
      differentiation: 0,
      speed: 0,
      complexity: 0,
      evidence: 0
    }
  };

  const DEMO_A = {
    brief: {
      ideaName: "Release Notes Radar",
      targetUser: "B2B PM at a 50–300 person SaaS company shipping weekly",
      problemStatement:
        "PMs miss competitor and platform changes because updates are scattered across blogs, changelogs, and docs, so positioning and roadmap reactions are late.",
      solutionStatement:
        "A weekly “change digest” that monitors selected vendors, extracts the meaningful product impact, and outputs a 1-page brief: what changed, who it affects, and what you should do.",
      differentiator:
        "Opinionated impact scoring + a consistent brief format that’s shareable in exec/marketing channels (not a noisy RSS feed)."
    },
    dials: { pain: 4, reach: 3, differentiation: 3, speed: 4, complexity: 2, evidence: 2 }
  };

  const DEMO_B = {
    brief: {
      ideaName: "SOC2 Evidence Sprint",
      targetUser: "Ops lead at a seed–Series A startup doing a first SOC 2 Type I",
      problemStatement:
        "Compliance runs stall because evidence requests bounce between tools and people, so audit prep turns into weeks of status chasing.",
      solutionStatement:
        "A lightweight evidence checklist that maps controls to owners, auto-generates weekly “what’s blocked” reminders, and exports a clean auditor-ready packet.",
      differentiator:
        "Control-to-artifact mapping optimized for small teams (no heavy GRC platform), with 2-click export the auditor actually accepts."
    },
    dials: { pain: 5, reach: 3, differentiation: 2, speed: 3, complexity: 4, evidence: 1 }
  };

  const el = {
    tabs: $$(".tab"),
    panels: $$(".panel"),

    ideaName: $("#ideaName"),
    targetUser: $("#targetUser"),
    problemStatement: $("#problemStatement"),
    solutionStatement: $("#solutionStatement"),
    differentiator: $("#differentiator"),

    stampUpdated: $("#stampUpdated"),
    statusLine: $("#statusLine"),

    // dials inputs
    sPain: $("#s-pain"),
    sReach: $("#s-reach"),
    sDiff: $("#s-differentiation"),
    sSpeed: $("#s-speed"),
    sComplex: $("#s-complexity"),
    sEvidence: $("#s-evidence"),

    // dial values
    vPain: $("#v-pain"),
    vReach: $("#v-reach"),
    vDiff: $("#v-differentiation"),
    vSpeed: $("#v-speed"),
    vComplex: $("#v-complexity"),
    vEvidence: $("#v-evidence"),

    // report
    gConfidence: $("#gConfidence"),
    needle: $("#needle"),
    badgeVerdict: $("#badgeVerdict"),
    badgeScore: $("#badgeScore"),
    verdictText: $("#verdictText"),
    whyList: $("#whyList"),
    assumptionList: $("#assumptionList"),
    actionList: $("#actionList"),
    miniScore: $("#miniScore"),
    miniRisk: $("#miniRisk"),
    miniMode: $("#miniMode"),

    rMarket: $("#r-market"),
    rSolution: $("#r-solution"),
    rDelivery: $("#r-delivery"),
    barMarket: $("#bar-market"),
    barSolution: $("#bar-solution"),
    barDelivery: $("#bar-delivery"),

    ledMarket: $("#led-market .led"),
    ledSolution: $("#led-solution .led"),
    ledDelivery: $("#led-delivery .led"),

    btnCopy: $("#btn-copy"),
    copyToast: $("#copyToast"),
    btnReset: $("#btn-reset"),
    btnLedRisk: $("#btn-ledRisk"),
    btnDemoAlt: $("#btn-demoAlt")
  };

  function setStatus(text) {
    el.statusLine.textContent = text;
  }

  function setUpdated() {
    el.stampUpdated.textContent = nowStamp();
  }

  function mountBriefToInputs() {
    el.ideaName.value = state.brief.ideaName;
    el.targetUser.value = state.brief.targetUser;
    el.problemStatement.value = state.brief.problemStatement;
    el.solutionStatement.value = state.brief.solutionStatement;
    el.differentiator.value = state.brief.differentiator;
  }

  function mountDialsToInputs() {
    el.sPain.value = state.dials.pain;
    el.sReach.value = state.dials.reach;
    el.sDiff.value = state.dials.differentiation;
    el.sSpeed.value = state.dials.speed;
    el.sComplex.value = state.dials.complexity;
    el.sEvidence.value = state.dials.evidence;
  }

  function readBriefFromInputs() {
    state.brief.ideaName = el.ideaName.value.trim();
    state.brief.targetUser = el.targetUser.value.trim();
    state.brief.problemStatement = el.problemStatement.value.trim();
    state.brief.solutionStatement = el.solutionStatement.value.trim();
    state.brief.differentiator = el.differentiator.value.trim();
  }

  function setDial(metric, value) {
    state.dials[metric] = clamp(parseInt(value, 10) || 0, 0, 5);
  }

  function mountDialReadouts() {
    el.vPain.textContent = String(state.dials.pain);
    el.vReach.textContent = String(state.dials.reach);
    el.vDiff.textContent = String(state.dials.differentiation);
    el.vSpeed.textContent = String(state.dials.speed);
    el.vComplex.textContent = String(state.dials.complexity);
    el.vEvidence.textContent = String(state.dials.evidence);
  }

  function computeScores() {
    const { pain, reach, differentiation, speed, complexity, evidence } = state.dials;

    // Convert 0..5 to 0..100 where higher is better (except complexity).
    const painScore = (pain / 5) * 100;
    const reachScore = (reach / 5) * 100;
    const diffScore = (differentiation / 5) * 100;
    const speedScore = (speed / 5) * 100;
    const evidenceScore = (evidence / 5) * 100;
    const complexityPenalty = (complexity / 5) * 100; // higher is worse

    // Risk buckets: 0..100 (higher is riskier)
    const marketRisk = clamp(round(0.55 * (100 - painScore) + 0.45 * (100 - reachScore)), 0, 100);
    const solutionRisk = clamp(round(0.60 * (100 - diffScore) + 0.40 * (100 - evidenceScore)), 0, 100);
    const deliveryRisk = clamp(round(0.60 * complexityPenalty + 0.40 * (100 - speedScore)), 0, 100);

    const avgRisk = round((marketRisk + solutionRisk + deliveryRisk) / 3);

    // Confidence (0..100), penalize risk and reward evidence/speed/pain.
    const confidenceRaw =
      0.22 * painScore +
      0.18 * reachScore +
      0.18 * diffScore +
      0.16 * speedScore +
      0.18 * evidenceScore -
      0.22 * complexityPenalty;

    const confidence = clamp(round(confidenceRaw), 0, 100);

    const verdict = getVerdict(confidence, avgRisk, evidenceScore);

    return {
      confidence,
      verdict,
      risks: { marketRisk, solutionRisk, deliveryRisk, avgRisk },
      sub: { painScore, reachScore, diffScore, speedScore, evidenceScore, complexityPenalty }
    };
  }

  function getVerdict(confidence, avgRisk, evidenceScore) {
    // Simple, intentional thresholds: evidence can override slightly.
    if (confidence >= 70 && avgRisk <= 45) return "PURSUE";
    if (confidence <= 38 && evidenceScore <= 40 && avgRisk >= 60) return "DROP";
    return "REFINE";
  }

  function needleAngleForConfidence(confidence) {
    // Map 0..100 to -120..120 degrees (240-degree sweep)
    const minA = -120;
    const maxA = 120;
    return minA + (confidence / 100) * (maxA - minA);
  }

  function riskClass(risk) {
    if (risk <= 40) return "pos";
    if (risk <= 65) return "warn";
    return "danger";
  }

  function setLed(elLed, cls) {
    elLed.classList.remove("led--pos", "led--warn", "led--danger", "led--off");
    if (!state.ledMode) {
      elLed.classList.add("led--off");
      return;
    }
    if (cls === "pos") elLed.classList.add("led--pos");
    else if (cls === "warn") elLed.classList.add("led--warn");
    else elLed.classList.add("led--danger");
  }

  function renderReport() {
    const { confidence, verdict, risks, sub } = computeScores();

    // Gauge readout
    el.gConfidence.textContent = String(confidence);
    const angle = needleAngleForConfidence(confidence);
    el.needle.style.transform = `rotate(${angle}deg)`;

    // Bars
    el.rMarket.textContent = String(risks.marketRisk);
    el.rSolution.textContent = String(risks.solutionRisk);
    el.rDelivery.textContent = String(risks.deliveryRisk);

    el.barMarket.style.width = `${risks.marketRisk}%`;
    el.barSolution.style.width = `${risks.solutionRisk}%`;
    el.barDelivery.style.width = `${risks.deliveryRisk}%`;

    // Verdict badges
    el.badgeVerdict.textContent = verdict;
    el.badgeScore.textContent = `CONF ${confidence}/100`;

    el.verdictText.textContent = verdict;

    // LEDs
    setLed(el.ledMarket, riskClass(risks.marketRisk));
    setLed(el.ledSolution, riskClass(risks.solutionRisk));
    setLed(el.ledDelivery, riskClass(risks.deliveryRisk));

    // WHY bullets (structured, not a wall)
    const why = buildWhy(verdict, risks, sub);
    renderList(el.whyList, why, { ordered: false });

    // Assumptions (5–8)
    const assumptions = buildAssumptions(risks, sub);
    renderList(el.assumptionList, assumptions, { ordered: true });

    // Actions (this week)
    const actions = buildActions(risks, sub);
    renderList(el.actionList, actions, { ordered: false });

    // minis
    el.miniScore.textContent = `${confidence}/100`;
    el.miniRisk.textContent = `${risks.avgRisk}/100`;
    el.miniMode.textContent = state.ledMode ? "LED ON" : "LED OFF";

    setStatus(`UPDATED • ${verdict} • CONF ${confidence}/100 • RISK ${risks.avgRisk}/100`);
  }

  function renderList(root, items, { ordered }) {
    while (root.firstChild) root.removeChild(root.firstChild);
    items.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      root.appendChild(li);
    });
    if (ordered) root.setAttribute("aria-label", "Ordered list");
  }

  function buildWhy(verdict, risks, sub) {
    const out = [];

    const topRisk = [
      ["market", risks.marketRisk],
      ["solution", risks.solutionRisk],
      ["delivery", risks.deliveryRisk]
    ].sort((a, b) => b[1] - a[1])[0];

    const topRiskLabel =
      topRisk[0] === "market" ? "market clarity" : topRisk[0] === "solution" ? "differentiation/evidence" : "delivery complexity";

    if (verdict === "PURSUE") {
      out.push("Signals are directionally strong enough to justify a tight validation sprint.");
      if (sub.evidenceScore >= 60) out.push("You already have some evidence; focus on tightening the riskiest assumption next.");
      out.push(`Primary risk remaining is ${topRiskLabel}; keep scope small until it’s bounded.`);
    } else if (verdict === "DROP") {
      out.push("Risk is high relative to evidence; building now is likely to create sunk cost.");
      out.push(`The biggest red flag is ${topRiskLabel}; fix that before revisiting the concept.`);
      out.push("Treat this as a research topic, not a roadmap commitment.");
    } else {
      out.push("There’s promise, but the idea is not yet defensible enough to commit build time.");
      out.push(`Start by proving the highest-risk area: ${topRiskLabel}.`);
      if (sub.complexityPenalty >= 60) out.push("De-scope the first version to reduce delivery risk.");
    }

    // Add one more concrete readout line
    out.push(`Market/Solution/Delivery risk: ${risks.marketRisk}/${risks.solutionRisk}/${risks.deliveryRisk}.`);

    return out.slice(0, 4);
  }

  function buildAssumptions(risks, sub) {
    const assumptions = [];

    // Market
    if (risks.marketRisk >= 55) {
      assumptions.push("The target user experiences the problem frequently enough to pay (or switch) for a fix.");
      assumptions.push("There are enough buyers with the same job-to-be-done to support distribution beyond a few warm intros.");
    } else {
      assumptions.push("The buyer segment is reachable with a repeatable channel (not only founder-led sales).");
    }

    // Solution
    if (risks.solutionRisk >= 55) {
      assumptions.push("Your differentiator is actually valued versus existing workflows (not just “nice”).");
      assumptions.push("The outcome can be delivered reliably with the proposed approach (not a one-off concierge service).");
    } else {
      assumptions.push("Competitors cannot match the core workflow quickly without changing their product strategy.");
    }

    // Delivery
    if (risks.deliveryRisk >= 55) {
      assumptions.push("The first version can be shipped without critical cross-team dependencies or long integrations.");
      assumptions.push("You can achieve time-to-first-value without heavy onboarding or data migration.");
    } else {
      assumptions.push("The MVP scope is small enough to ship before the context changes.");
    }

    // Evidence
    if (sub.evidenceScore <= 40) {
      assumptions.push("Your current “evidence” is not just enthusiasm; you can reproduce it across multiple conversations.");
    } else {
      assumptions.push("Existing interest translates into committed behaviors (pilot, LOI, paid trial).");
    }

    // Keep to 5–8
    const deduped = Array.from(new Set(assumptions));
    return deduped.slice(0, 8);
  }

  function buildActions(risks, sub) {
    const actions = [];

    // Always include a crisp interview action
    actions.push("Run 6 customer calls with a single script: quantify frequency, current workaround, and willingness-to-switch triggers.");

    if (risks.marketRisk >= 55) {
      actions.push("Create a one-page positioning test: show 3 variants of the value prop and measure which one gets “tell me more.”");
      actions.push("Collect 10 examples of the problem in the wild (screenshots, links, tickets) to prove it’s real and repeatable.");
    }

    if (risks.solutionRisk >= 55) {
      actions.push("Do a concierge pilot for 3 users: deliver the promised outcome manually and track time spent + perceived value.");
      actions.push("List the top 5 alternatives your buyer uses today and write a comparison grid focused on outcomes, not features.");
    }

    if (risks.deliveryRisk >= 55) {
      actions.push("Define the MVP as a single workflow slice and cut integrations; prove demand before wiring systems.");
      actions.push("Estimate build with a pre-mortem: name 3 dependencies that could stall delivery and plan around them.");
    }

    if (sub.evidenceScore <= 40) {
      actions.push("Ask for a commitment: paid pilot, LOI, or a scheduled implementation date; treat “sounds cool” as non-evidence.");
    } else {
      actions.push("Convert interest into a time-bound pilot with a success metric and an explicit next-step decision.");
    }

    const deduped = Array.from(new Set(actions));
    return deduped.slice(0, 6);
  }

  function setActivePanel(panelId) {
    el.panels.forEach((p) => p.classList.remove("is-active"));
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add("is-active");

    el.tabs.forEach((t) => t.classList.remove("is-active"));
    const tab = el.tabs.find((t) => t.dataset.panel === panelId);
    if (tab) {
      tab.classList.add("is-active");
      el.tabs.for