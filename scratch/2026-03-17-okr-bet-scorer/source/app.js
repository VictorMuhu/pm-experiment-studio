(function(){
  "use strict";

  const STORAGE_KEY = "okr-bet-scorer.v1";

  const $ = (sel, root=document) => root.querySelector(sel);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const round1 = (n) => Math.round(n * 10) / 10;
  const nowId = () => Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);

  function escapeHtml(str){
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function fmtPct(n){
    if (!Number.isFinite(n)) return "—";
    return `${Math.round(n)}%`;
  }

  function fmtScore(n){
    if (!Number.isFinite(n)) return "—";
    return round1(n).toFixed(1);
  }

  function riskLabel(risk){
    if (risk === "low") return "LOW";
    if (risk === "med") return "MED";
    if (risk === "high") return "HIGH";
    return "—";
  }

  function riskColorClass(risk){
    if (risk === "low") return "pos";
    if (risk === "med") return "warn";
    if (risk === "high") return "neg";
    return "muted";
  }

  function defaultState(){
    const okrs = [
      {
        id: "okr-1",
        code: "OKR A",
        title: "Reduce time-to-resolution for support tickets",
        importance: 95,
        target: "P90 first-response under 2h; backlog -30%",
        owner: "Support Ops"
      },
      {
        id: "okr-2",
        code: "OKR B",
        title: "Increase activation for new SMB accounts",
        importance: 80,
        target: "Activation +8 pts; Day-7 retention +3 pts",
        owner: "Growth"
      },
      {
        id: "okr-3",
        code: "OKR C",
        title: "Stabilize core workflows and reduce regressions",
        importance: 70,
        target: "Sev2 incidents -25%; hotfixes -20%",
        owner: "Eng"
      },
      {
        id: "okr-4",
        code: "OKR D",
        title: "Improve billing clarity and reduce disputes",
        importance: 60,
        target: "Disputes -15%; invoice CSAT +0.4",
        owner: "FinOps"
      }
    ];

    const bets = [
      {
        id: "bet-1",
        title: "In-app ticket status timeline + next-step prompts",
        owner: "Mina (CX PM)",
        risk: "low",
        effort: 4,
        notes: "Target: deflection + fewer 'any update?' pings. Pair with email template update.",
        mapping: { "okr-1": 55, "okr-2": 5, "okr-3": 10, "okr-4": 0 }
      },
      {
        id: "bet-2",
        title: "Guided onboarding checklist for first 7 days",
        owner: "Arjun (Growth PM)",
        risk: "med",
        effort: 6,
        notes: "Focus on first successful integration + first report. Avoid over-personalization in v1.",
        mapping: { "okr-1": 0, "okr-2": 65, "okr-3": 5, "okr-4": 0 }
      },
      {
        id: "bet-3",
        title: "Support macro quality audit + auto-suggested replies",
        owner: "Leah (Support Ops)",
        risk: "high",
        effort: 7,
        notes: "Risk: adoption + trust. Keep suggestions scoped to known categories; measure handle time.",
        mapping: { "okr-1": 60, "okr-2": 0, "okr-3": 10, "okr-4": 0 }
      },
      {
        id: "bet-4",
        title: "Invoice line-item explainer with usage drill-down",
        owner: "Jordan (Billing PM)",
        risk: "med",
        effort: 8,
        notes: "Customer interviews say 'we don't trust the invoice'. Start with top 5 dispute reasons.",
        mapping: { "okr-1": 0, "okr-2": 0, "okr-3": 10, "okr-4": 70 }
      },
      {
        id: "bet-5",
        title: "Regression guardrails for critical flows (smoke + alert)",
        owner: "Priya (TPM)",
        risk: "low",
        effort: 5,
        notes: "Add fast checks around login, checkout, exports. Tie alerts to incident workflow.",
        mapping: { "okr-1": 5, "okr-2": 0, "okr-3": 60, "okr-4": 0 }
      },
      {
        id: "bet-6",
        title: "Renewal outreach playbook for at-risk accounts",
        owner: "Sam (CS Lead)",
        risk: "high",
        effort: 6,
        notes: "Feels important, but not clearly tied to this quarter’s OKRs unless we define success metric.",
        mapping: { "okr-1": 0, "okr-2": 0, "okr-3": 0, "okr-4": 0 }
      },
      {
        id: "bet-7",
        title: "Auto-tag ticket reasons from subject + first message",
        owner: "Mina (CX PM)",
        risk: "med",
        effort: 5,
        notes: "Aim: better routing + reporting. Validate taxonomy first; start with top 12 reasons.",
        mapping: { "okr-1": 45, "okr-2": 0, "okr-3": 15, "okr-4": 0 }
      },
      {
        id: "bet-8",
        title: "Activation funnel diagnostics for admins (why stuck?)",
        owner: "Arjun (Growth PM)",
        risk: "med",
        effort: 7,
        notes: "Expose the 3 common blockers; link to fix steps. Avoid large analytics replatform work.",
        mapping: { "okr-1": 0, "okr-2": 55, "okr-3": 10, "okr-4": 0 }
      },
      {
        id: "bet-9",
        title: "Refund policy copy refresh + dispute intake form",
        owner: "Jordan (Billing PM)",
        risk: "low",
        effort: 3,
        notes: "Low lift. Should measurably reduce back-and-forth and missing info in disputes.",
        mapping: { "okr-1": 10, "okr-2": 0, "okr-3": 0, "okr-4": 35 }
      },
      {
        id: "bet-10",
        title: "Status page improvements (component-level uptime + postmortems)",
        owner: "Priya (TPM)",
        risk: "low",
        effort: 4,
        notes: "Good hygiene. Might not move OKR metrics this quarter unless tied to incident rate.",
        mapping: { "okr-1": 0, "okr-2": 0, "okr-3": 25, "okr-4": 0 }
      }
    ];

    return {
      okrs,
      bets,
      config: {
        strongThreshold: 70,
        weakThreshold: 45,
        penalties: { low: 4, med: 10, high: 18 },
        effortPenaltyPerPoint: 1.2
      },
      ui: {
        selectedBetId: null,
        search: "",
        sortMode: "score-desc",
        hideBelowWeak: false,
        onlyOrphans: false
      }
    };
  }

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return defaultState();
      const parsed = JSON.parse(raw);

      if(!parsed || !Array.isArray(parsed.okrs) || !Array.isArray(parsed.bets)) return defaultState();

      const state = {
        okrs: parsed.okrs,
        bets: parsed.bets,
        config: parsed.config || defaultState().config,
        ui: { ...defaultState().ui, ...(parsed.ui || {}) }
      };

      state.okrs = state.okrs.map(o => ({
        id: String(o.id || nowId()),
        code: String(o.code || "OKR"),
        title: String(o.title || ""),
        importance: clamp(Number(o.importance ?? 50), 0, 100),
        target: String(o.target || ""),
        owner: String(o.owner || "")
      }));

      const okrIds = new Set(state.okrs.map(o => o.id));
      state.bets = state.bets.map(b => {
        const mapping = {};
        const srcMap = b.mapping || {};
        for(const okrId of okrIds){
          mapping[okrId] = clamp(Number(srcMap[okrId] ?? 0), 0, 100);
        }
        return {
          id: String(b.id || nowId()),
          title: String(b.title || "Untitled bet"),
          owner: String(b.owner || ""),
          risk: (b.risk === "low" || b.risk === "med" || b.risk === "high") ? b.risk : "med",
          effort: clamp(Number(b.effort ?? 5), 1, 10),
          notes: String(b.notes || ""),
          mapping
        };
      });

      const betIds = new Set(state.bets.map(b => b.id));
      if(state.ui.selectedBetId && !betIds.has(state.ui.selectedBetId)){
        state.ui.selectedBetId = null;
      }
      return state;
    }catch(_e){
      return defaultState();
    }
  }

  function saveState(){
    const toSave = {
      okrs: state.okrs,
      bets: state.bets,
      config: state.config,
      ui: state.ui
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }

  function ensureMappingForAll(){
    const okrIds = state.okrs.map(o => o.id);
    for(const bet of state.bets){
      bet.mapping = bet.mapping || {};
      for(const okrId of okrIds){
        if(bet.mapping[okrId] == null) bet.mapping[okrId] = 0;
      }
      for(const key of Object.keys(bet.mapping)){
        if(!okrIds.includes(key)) delete bet.mapping[key];
      }
    }
  }

  function computeBetScores(){
    // Raw Fit = sum(okrImportance * weight) / 100
    // Risk penalty = configured for risk
    // Effort penalty = effort * effortPenaltyPerPoint
    // Final = clamp(raw - risk - effortPenalty, 0, 100)
    // Also compute coveragePct = sum(weight) / 100 (not required to be <= 1)
    const penalties = state.config.penalties;
    const effortPenaltyPerPoint = Number(state.config.effortPenaltyPerPoint ?? 1.2);

    const okrById = new Map(state.okrs.map(o => [o.id, o]));
    const results = new Map();

    for(const bet of state.bets){
      let raw = 0;
      let coverageSum = 0;
      for(const [okrId, wRaw] of Object.entries(bet.mapping || {})){
        const okr = okrById.get(okrId);
        if(!okr) continue;
        const w = clamp(Number(wRaw), 0, 100);
        coverageSum += w;
        raw += (okr.importance * w) / 100;
      }
      const riskPenalty = clamp(Number(penalties[bet.risk] ?? 0), 0, 40);
      const effortPenalty = clamp(Number(bet.effort) * effortPenaltyPerPoint, 0, 40);
      const final = clamp(raw - riskPenalty - effortPenalty, 0, 100);

      const signals = deriveSignalsForBet(bet, { raw, riskPenalty, effortPenalty, final, coverageSum });

      results.set(bet.id, {
        raw,
        riskPenalty,
        effortPenalty,
        final,
        coverageSum,
        signals
      });
    }
    return results;
  }

  function deriveSignalsForBet(bet, score){
    const signals = [];

    const mapping = bet.mapping || {};
    const nonZeroOkrs = Object.entries(mapping).filter(([,w]) => Number(w) > 0);
    if(nonZeroOkrs.length === 0){
      signals.push({ level:"neg", title:"ORPHAN BET", desc:"No OKR weight assigned. This will be hard to defend in planning." });
    }else{
      const top = nonZeroOkrs.slice().sort((a,b)=>Number(b[1])-Number(a[1]))[0];
      const topOkr = state.okrs.find(o => o.id === top[0]);
      if(topOkr){
        signals.push({ level:"muted", title:"TOP OKR", desc:`Largest weight maps to ${topOkr.code}: ${topOkr.title}` });
      }
    }

    if(score.coverageSum > 120){
      signals.push({ level:"warn", title:"OVER-MAPPED", desc:"Total OKR weight is very high. Consider narrowing the narrative to 1–2 OKRs." });
    }

    if(score.coverageSum > 0 && score.coverageSum < 25){
      signals.push({ level:"warn", title:"LOW COVERAGE", desc:"Some OKR mapping exists, but the weight is low. This will read as a weak justification." });
    }

    if(bet.risk === "high"){
      signals.push({ level:"neg", title:"HIGH RISK", desc:"High risk bets get penalized. Call out mitigation or stage-gate the bet." });
    }

    if(Number(bet.effort) >= 8 && score.final < state.config.weakThreshold){
      signals.push({ level:"warn", title:"BIG + WEAK", desc:"High effort with weak OKR fit. This is a common “pet project” pattern." });
    }

    if(score.final >= state.config.strongThreshold && score.coverageSum > 0){
      signals.push({ level:"pos", title:"STRONG FIT", desc:"Meets the strong threshold after penalties. This is a defensible bet." });
    }else if(score.final >= state.config.weakThreshold && score.coverageSum > 0){
      signals.push({ level:"warn", title:"WEAK FIT", desc:"Above weak threshold but not strong. Tighten scope or strengthen the metric link." });
    }else if(score.coverageSum > 0){
      signals.push({ level:"neg", title:"BELOW WEAK", desc:"Mapped, but score is below the weak cut line after penalties." });
    }

    return signals.slice(0, 5);
  }

  function computeOkrCoverage(betScores){
    // coverageScore for OKR = sum(weights * betFinal / 100)  (weighted by bet quality)
    // betCount = number of bets with weight>0
    // gap = max(0, importance - coverageScore)
    const coverage = new Map();
    for(const okr of state.okrs){
      coverage.set(okr.id, { okrId: okr.id, coverageScore: 0, betCount: 0 });
    }
    for(const bet of state.bets){
      const sc = betScores.get(bet.id);
      if(!sc) continue;
      for(const [okrId, wRaw] of Object.entries(bet.mapping || {})){
        const w = clamp(Number(wRaw), 0, 100);
        if(w <= 0) continue;
        const c = coverage.get(okrId);
        if(!c) continue;
        c.betCount += 1;
        c.coverageScore += (w * sc.final) / 100;
      }
    }
    const out = [];
    for(const okr of state.okrs){
      const c = coverage.get(okr.id);
      const cov = c ? c.coverageScore : 0;
      const gap = Math.max(0, okr.importance - cov);
      out.push({
        okrId: okr.id,
        coverageScore: cov,
        betCount: c ? c.betCount : 0,
        gap
      });
    }
    return out;
  }

  function betStatus(betScore){
    const hasMapping = betScore.coverageSum > 0;
    if(!hasMapping) return "orphan";
    if(betScore.final >= state.config.strongThreshold) return "strong";
    if(betScore.final >= state.config.weakThreshold) return "weak";
    return "below";
  }

  function render(){
    ensureMappingForAll();
    const betScores = computeBetScores();
    const okrCoverage = computeOkrCoverage(betScores);

    renderKpis(betScores, okrCoverage);
    renderOkrTable(okrCoverage);
    renderBetsTable(betScores, okrCoverage);
    renderDetail(betScores, okrCoverage);

    saveState();
  }

  function renderKpis(betScores, okrCoverage){
    const kpiStrip = $("#kpiStrip");
    const bets = state.bets;

    const statuses = { strong:0, weak:0, orphan:0, below:0 };
    let avgFinal = 0;
    for(const bet of bets){
      const sc = betScores.get(bet.id);
      if(!sc) continue;
      statuses[betStatus(sc)] += 1;
      avgFinal += sc.final;
    }
    avgFinal = bets.length ? avgFinal / bets.length : 0;

    const orphans = statuses.orphan;
    const uncoveredOkrs = okrCoverage.filter(c => c.betCount === 0).length;

    const kpis = [
      { label: "BETS", value: `${bets.length}`, tone: "muted" },
      { label: "AVG FINAL", value: `${fmtScore(avgFinal)}`, tone: avgFinal >= state.config.strongThreshold ? "pos" : (avgFinal >= state.config.weakThreshold ? "warn" : "neg") },
      { label: "STRONG", value: `${statuses.strong}`, tone: statuses.strong > 0 ? "pos" : "muted" },
      { label: "WEAK", value: `${statuses.weak}`, tone: statuses.weak > 0 ? "warn" : "muted" },
      { label: "ORPHANS", value: `${orphans}`, tone: orphans > 0 ? "neg" : "pos" },
      { label: "UNCOVERED OKRS", value: `${uncoveredOkrs}`, tone: uncoveredOkrs > 0 ? "neg" : "pos" }
    ];

    kpiStrip.innerHTML = kpis.map(k => {
      return `
        <div class="kpi">
          <div class="kpi__label">${escapeHtml(k.label)}</div>
          <div class="kpi__value"><span class="${escapeHtml(k.tone)}">${escapeHtml(k.value)}</span></div>
        </div>
      `;
    }).join("");
  }

  function renderOkrTable(okrCoverage){
    const okrTbody = $("#okrTbody");
    const okrById = new Map(state.okrs.map(o => [o.id, o]));

    const sorted = okrCoverage.slice().sort((a,b) => {
      const okrA = okrById.get(a.okrId);
      const okrB = okrById.get(b.okrId);
      const aGap = a.gap;
      const bGap = b.gap;
      if(bGap !== aGap) return bGap - aGap; // biggest gap first
      const ai = okrA ? okrA.importance : 0;
      const bi = okrB ? okrB.importance : 0;
      return bi - ai;
    });

    const uncovered = sorted.filter(c => c.betCount === 0).length;
    const weaklyCovered = sorted.filter(c => c.betCount > 0 && c.coverageScore < (okrById.get(c.okrId)?.importance ?? 0) * 0.5).length;
    $("#okrSummarySub").textContent = `UNCOVERED ${uncovered} • LOW-COVER ${weaklyCovered}`;

    okrTbody.innerHTML = sorted.map(c => {
      const okr = okrById.get(c.okrId);
      const covPct = okr ? clamp((c.coverageScore / Math.max(1, okr.importance)) * 100, 0, 200) : 0;
      const covTone = c.betCount === 0 ? "neg" : (covPct >= 85 ? "pos" : (covPct >= 55 ? "warn" : "neg"));
      const gapTone = c.betCount === 0 ? "neg" : (c.gap <= 10 ? "pos" : (c.gap <= 25 ? "warn" : "neg"));

      const okrLabel = okr ? `${okr.code} — ${okr.title}` : "OKR — (missing)";
      return `
        <tr>
          <td title="${escapeHtml(okr ? (okr.target || okr.owner) : "")}">
            <div class="mono" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(okrLabel)}</div>
            <div class="smallmuted" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              IMP ${escapeHtml(fmtPct(okr ? okr.importance : 0))}${okr && okr.target ? ` • ${escapeHtml(okr.target)}` : ""}
            </div>
          </td>
          <td class="num"><span class="badge-num ${covTone}">${escapeHtml(fmtPct(covPct))}</span></td>
          <td class="num"><span class="badge-num muted">${escapeHtml(String(c.betCount))}</span></td>
          <td class="num"><span class="badge-num ${gapTone}">${escapeHtml(fmtScore(c.gap))}</span></td>
        </tr>
      `;
    }).join("");
  }

  function applyFiltersAndSort(bets, betScores, okrCoverage){
    const search = state.ui.search.trim().toLowerCase();
    const okrById = new Map(state.okrs.map(o => [o.id, o]));
    const covByOkrId = new Map(okrCoverage.map(c => [c.okrId, c]));

    let items = bets.slice();

    if(search){
      items = items.filter(b => {
        const sc = betScores.get(b.id);
        const mappedOkrs = Object.entries(b.mapping || {})
          .filter(([,w]) => Number(w) > 0)
          .map(([id]) => okrById.get(id))
          .filter(Boolean)
          .map(o => `${o.code} ${o.title}`);
        const hay = [
          b.title, b.owner, b.risk, String(b.effort), b.notes,
          ...mappedOkrs,
          sc ? String(round1(sc.final)) : ""
        ].join(" ").toLowerCase();
        return hay.includes(search);
      });
    }

    if(state.ui.onlyOrphans){
      items = items.filter(b => {
        const sc = betScores.get(b.id);
        return sc ? betStatus(sc) === "orphan" : false;
      });
    }

    if(state.ui.hideBelowWeak){
      items = items.filter(b => {
        const sc = betScores.get(b.id);
        if(!sc) return true;
        const status = betStatus(sc);
        return status === "strong" || status === "weak" || status === "orphan";
      });
    }

    const sortMode = state.ui.sortMode;
    const coll = new Intl.Collator(undefined, { numeric:true, sensitivity:"base" });

    items.sort((a,b) => {
      const sa = betScores.get(a.id);
      const sb = betScores.get(b.id);
      if(sortMode === "score-desc") return (sb?.final ?? -1) - (sa?.final ?? -1);
      if(sortMode === "score-asc") return (sa?.final ?? 999) - (sb?.final ?? 999);
      if(sortMode === "title-asc") return coll.compare(a.title, b.title);
      if(sortMode === "owner-asc") return coll.compare(a.owner, b.owner);
      if(sortMode === "coverage-asc"){
        const aTop = topMappedOkrId(a.mapping);
        const bTop = topMappedOkrId(b.mapping);
        const ac = aTop ? (covByOkrId.get(aTop)?.coverageScore ?? 0) : -1;
        const bc = bTop ? (covByOkrId.get(bTop)?.coverageScore ?? 0) : -1;
        return ac - bc;
      }
      return (sb?.final ?? -1) - (sa?.final ?? -1);
    });

    return items;

    function topMappedOkrId(mapping){
      if(!mapping) return null;
      let bestId = null;
      let bestW = -1;
      for(const [id,w] of Object.entries(mapping)){
        const ww = Number(w);
        if(ww > bestW){
          bestW = ww;
          bestId = id;
        }
      }
      return bestW > 0 ? bestId : null;
    }
  }

  function renderBetsTable(betScores, okrCoverage){
    const betsTbody = $("#betsTbody");

    const filtered = applyFiltersAndSort(state.bets, betScores, okrCoverage);

    const okrById = new Map(state.okrs.map(o => [o.id, o]));
    const strong = state.config.strongThreshold;
    const weak = state.config.weakThreshold;

    betsTbody.innerHTML = filtered.map(b => {
      const sc = betScores.get(b.id);
      const status = sc ? betStatus(sc) : "below";
      const isSelected = state.ui.selectedBetId === b.id;

      const chip = status === "strong"
        ? `<span class="chip chip--pos">STRONG</span>`
        : status === "weak"
          ? `<span class="chip chip--warn">WEAK</span>`
          : status === "orphan"
            ? `<span class="chip chip--neg">ORPHAN</span>`
            : `<span class="chip chip--muted">BELOW</span>`;

      const signal = sc?.signals?.[0];
      const signalText = signal ? signal.title : (status === "orphan" ? "ORPHAN BET" : "—");

      const rawFit = sc ? sc.raw : 0;

      const topOkr = (() => {
        const entries = Object.entries(b.mapping || {}).filter(([,w]) => Number(w) > 0);
        if(entries.length === 0) return null;
        entries.sort((a,b)=>Number(b[1])-Number(a[1]));
        return okrById.get(entries[0][0]) || null;
      })();

      const titleLine = topOkr ? `${b.title}` : b.title;

      const titleSub = topOkr
        ? `${topOkr.code} • w=${Math.round(Number(b.mapping[topOkr.id] || 0))}`
        : "NO OKR WEIGHT";

      const finalTone = !sc ? "muted" : (sc.final >= strong ? "pos" : (sc.final >= weak ? "warn" : "neg"));
      const riskTone = riskColorClass(b.risk);

      return `
        <tr class="row--clickable ${isSelected ? "row--selected" : ""}" data-bet-id="${escapeHtml(b.id)}">
          <td title="${escapeHtml(b.notes || "")}">
            <div class="mono" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(titleLine)}</div>
            <div class="smallmuted mono" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(titleSub)}</div>
          </td>
          <td class="mono" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(b.owner)}">${escapeHtml(b.owner)}</td>
          <td class="mono"><span class="badge-num ${riskTone}">${escapeHtml(riskLabel(b.risk))}</span></td>
          <td class="num"><span class="badge-num muted">${escapeHtml(String(b.effort))}</span></td>
          <td class="num"><span class="badge-num muted">${escapeHtml(fmtScore(rawFit))}</span></td>
          <td class="num"><span class="badge-num ${finalTone}">${escapeHtml(fmtScore(sc ? sc.final : 0))}</span></td>
          <td>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
              <div class="mono" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color: rgba(230,237,243,0.88);">${escapeHtml(signalText)}</div>
              ${chip}
            </div>
          </td>
        </tr>
      `;
    }).join("");

    $("#hintArea").textContent = filtered.length !== state.bets.length
      ? `Filtered: ${filtered.length}/${state.bets.length} bets visible.`
      : "Select a bet to view/edit its OKR mapping.";

    // click binding (event delegation)
    betsTbody.onclick = (e) => {
      const tr = e.target.closest("tr[data-bet-id]");
      if(!tr) return;
      const id = tr.getAttribute("data-bet-id");
      state.ui.selectedBetId = id;
      render();
    };
  }

  function renderDetail(betScores, okrCoverage){
    const empty = $("#detailEmpty");
    const content = $("#detailContent");
    const detailSub = $("#detailSub");

    const bet = state.bets.find(b => b.id === state.ui.selectedBetId) || null;
    if(!bet){
      empty.hidden = false;
      content.hidden = true;
      detailSub.textContent = "No bet selected";
      return;
    }

    empty.hidden = true;
    content.hidden = false;

    const sc = betScores.get(bet.id);
    const status = sc ? betStatus(sc) : "below";

    detailSub.textContent = `${status.toUpperCase()} • FINAL ${fmtScore(sc ? sc.final : 0)} • RISK ${riskLabel(bet.risk)} • EFFORT ${bet.effort}`;

    // meta fields
    $("#detailTitle").value = bet.title;
    $("#detailOwner").value = bet.owner;
    $("#detailRisk").value = bet.risk;
    $("#detailEffort").value = String(bet.effort);
    $("#detailNotes").value = bet.notes || "";

    // mapping table
    const okrById = new Map(state.okrs.map(o => [o.id, o]));
    const okrsSorted = state.okrs.slice().sort((a,b)=>b.importance-a.importance);

    const mappingTbody = $("#mappingTbody");
    mappingTbody.innerHTML = okrsSorted.map(o => {
      const w = clamp(Number((bet.mapping || {})[o.id] ?? 0), 0, 100);
      const contrib = sc ? (o.importance * w) / 100 : 0;
      const contribTone = w === 0 ? "muted" : (contrib >= 40 ? "pos" : (contrib >= 20 ? "warn" : "neg"));

      return `
        <tr data-okr-id="${escapeHtml(o.id)}">
          <td title="${escapeHtml(o.target || o.owner)}">
            <div class="mono" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(o.code)} — ${escapeHtml(o.title)}</div>
            <div class="smallmuted mono" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">IMP ${escapeHtml(fmtPct(o.importance))}${o.target ? ` • ${escapeHtml(o.target)}` : ""}</div>
          </td>
          <td class="num">
            <input class="input input--num map-weight" inputmode="numeric" type="number" min="0" max="100" step="1" value="${escapeHtml(String(Math.round(w)))}" aria-label="Weight for ${escapeHtml(o.code)}" />
          </td>
          <td class="num"><span class="badge-num ${contribTone}">${escapeHtml(fmtScore(contrib))}</span></td>
        </tr>
      `;
    }).join("");

    // mapping meta
    const nonZero = Object.entries(bet.mapping || {}).filter(([,w]) => Number(w) > 0).length;
    $("#mappingMeta").textContent = `MAPPED OKRS ${nonZero}/${state.okrs.length} • TOTAL WEIGHT ${Math.round(sc ? sc.coverageSum : 0)}`;

    // breakdown
    $("#bdRaw").textContent = fmtScore(sc ? sc.raw : 0);
    $("#bdRisk").textContent = sc ? `-${fmtScore(sc.riskPenalty)}` : "—";
    $("#bdEffort").textContent = sc ? `-${fmtScore(sc.effortPenalty)}` : "—";

    const finalTone = !sc ? "muted" : (sc.final >= state.config.strongThreshold ? "pos" : (sc.final >= state.config.weakThreshold ? "warn" : "neg"));
    $("#bdFinal").innerHTML = `<span class="badge-num ${escapeHtml(finalTone)}">${escapeHtml(fmtScore(sc ? sc.final : 0))}</span>`;

    $("#scoreMeta").textContent = `STRONG ≥ ${state.config.strongThreshold} • WEAK ≥ ${state.config.weakThreshold} • EFFORT PEN ${round1(state.config.effortPenaltyPerPoint).toFixed(1)}/PT`;

    // signals
    const signalList = $("#signalList");
    const signals = (sc && Array.isArray(sc.signals)) ? sc.signals : [];
    signalList.innerHTML = signals.map(s => {
      const chip = s.level === "pos"
        ? `<span class="chip chip--pos">POS</span>`
        : s.level === "warn"
          ? `<span class="chip chip--warn">WARN</span>`
          : s.level === "neg"
            ? `<span class="chip chip--neg">ALERT</span>`
            : `<span class="chip chip--muted">NOTE</span>`;
      return `
        <div class="signal">
          <div class="signal__left">
            <div class="signal__title">${escapeHtml(s.title)}</div>
            <div class="signal__desc">${escapeHtml(s.desc)}</div>
          </div>
          <div class="signal__badge">${chip}</div>
        </div>
      `;
    }).join("");

    // event handlers for detail fields
    $("#detailTitle").oninput = (e) => {
      bet.title = e.target.value;
      render();
    };
    $("#detailOwner").oninput = (e) => {
      bet.owner = e.target.value;
      render();
    };
    $("#detailRisk").onchange = (e) => {
      bet.risk = e.target.value;
      render();
    };
    $("#detailEffort").oninput = (e) => {
      bet.effort = clamp(Number(e.target.value || 1), 1, 10);
      render();
    };
    $("#detailNotes").oninput = (e) => {
      bet.notes = e.target.value;
      render();
    };

    // mapping weights handler (event delegation)
    mappingTbody.oninput = (e) => {
      const input = e.target.closest("input.map-weight");
      if(!input) return;
      const tr = input.closest("tr[data-okr-id]");
      if(!tr) return;
      const okrId = tr.getAttribute("data-okr-id");
      const val = clamp(Number(input.value || 0), 0, 100);
      bet.mapping[okrId] = val;
      render();
    };

    // delete
    $("#deleteBetBtn").onclick = () => {
      const ok = confirm("Delete this bet? This cannot be undone.");
      if(!ok) return;
      state.bets = state.bets.filter(b => b.id !== bet.id);
      state.ui.selectedBetId = null;
      render();
    };

    // exports
    $("#copyBetSummaryBtn").onclick = async () => {
      await copyTextToClipboard(makeBetSummaryTsv([bet], betScores));
      showToast("COPIED BET SUMMARY");
    };
    $("#copyCoverageBtn").onclick = async () => {
      await copyTextToClipboard(makeOkrCoverageTsv(okrCoverage));
      showToast("COPIED OKR COVERAGE");
    };
  }

  function makeBetSummaryTsv(bets, betScores){
    const okrById = new Map(state.okrs.map(o => [o.id, o]));
    const headers = [
      "bet",
      "owner",
      "risk",
      "effort",
      "raw_fit",
      "risk_penalty",
      "effort_penalty",
      "final_score",
      "top_okr",
      "top_weight",
      "notes"
    ];
    const rows = bets.map(b => {
      const sc = betScores.get(b.id);
      const entries = Object.entries(b.mapping || {}).filter(([,w]) => Number(w) > 0).sort((a,b)=>Number(b[1])-Number(a[1]));
      const top = entries[0] || null;
      const okr = top ? okrById.get(top[0]) : null;

      return [
        b.title,
        b.owner,
        riskLabel(b.risk),
        String(b.effort),
        fmtScore(sc ? sc.raw : 0),
        fmtScore(sc ? sc.riskPenalty : 0),
        fmtScore(sc ? sc.effortPenalty : 0),
        fmtScore(sc ? sc.final : 0),
        okr ? `${okr.code} — ${okr.title}` : "",
        top ? String(Math.round(Number(top[1]))) : "0",
        (b.notes || "").replaceAll("\t"," ").replaceAll("\n"," ")
      ];
    });
    return [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
  }

  function makeOkrCoverageTsv(okrCoverage){
    const okrById = new Map(state.okrs.map(o