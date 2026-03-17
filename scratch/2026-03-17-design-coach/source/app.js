(function(){
  'use strict';

  const $ = (sel, root=document) => root.querySelector(sel);

  const DOMAIN_CONFIG = {
    checkout: { label: 'Checkout', accent: '#5AC8FA', bgShift: 'rgba(90,200,250,0.10)' },       // weather blue
    onboarding:{ label:'Onboarding', accent:'#34C759', bgShift: 'rgba(52,199,89,0.10)' },      // system green
    settings: { label:'Account settings', accent:'#AF52DE', bgShift: 'rgba(175,82,222,0.10)' }, // system purple
    invite:   { label:'Team invite', accent:'#FF9F0A', bgShift: 'rgba(255,159,10,0.10)' },     // system orange
    upload:   { label:'File upload', accent:'#FF375F', bgShift: 'rgba(255,55,95,0.10)' }       // health red
  };

  const EDGE_CATEGORIES = [
    { id:'empty', label:'Empty state' },
    { id:'failure', label:'Failure / error' },
    { id:'permission', label:'Permission / access' },
    { id:'offline', label:'Connectivity / offline' },
    { id:'abandon', label:'Abandonment / resume' },
    { id:'partial', label:'Partial completion' },
    { id:'dup', label:'Duplicates / retries' },
    { id:'latency', label:'Latency / waiting' }
  ];

  const QUESTIONS_BY_DOMAIN = {
    checkout: [
      { cat:'permission', q:'If a user is on a corporate card, who is allowed to place the order — and how do you confirm it?' },
      { cat:'empty', q:'If the cart is empty (or becomes empty), what does the screen show and where do you send the user?' },
      { cat:'failure', q:'If payment fails, what does the user see and what can they do next?' },
      { cat:'dup', q:'What prevents double charges if the user taps “Pay” twice or refreshes?' },
      { cat:'latency', q:'If confirmation takes 20–40 seconds, what does the UI do so users don’t abandon?' },
      { cat:'abandon', q:'If a user abandons after entering shipping, what information is saved and for how long?' },
      { cat:'partial', q:'What happens if shipping address validates partially (e.g., missing apartment/unit)?' },
      { cat:'offline', q:'If the network drops mid-payment, how do you reconcile the final state when the user returns?' },
      { cat:'failure', q:'What’s the customer support escalation path from the error state (receipt, order ID, contact)?' },
      { cat:'permission', q:'If an item can’t ship to the selected region, where and how do you communicate it?' },
      { cat:'empty', q:'If a discount code is invalid or expired, what message is shown and does the user keep the code entry focus?' },
      { cat:'dup', q:'If the payment succeeds but the confirmation page fails to load, can the user recover without repeating payment?' }
    ],
    onboarding: [
      { cat:'permission', q:'If permissions are denied (notifications, contacts, location), what does the product do differently?' },
      { cat:'abandon', q:'If the user closes the app halfway, what step do they resume on and what do you re-ask?' },
      { cat:'empty', q:'If the user has no data to import, what’s the first meaningful “win” you show?' },
      { cat:'failure', q:'If OTP/email verification fails repeatedly, what’s the safe fallback?' },
      { cat:'dup', q:'If the verification link is tapped twice, do you handle duplicate sessions gracefully?' },
      { cat:'latency', q:'If account creation takes 15 seconds, what’s the progress state and what’s cancel behavior?' },
      { cat:'offline', q:'If connectivity drops, can the user proceed on cached steps and retry later?' },
      { cat:'partial', q:'If the user skips optional steps, do you show a reminder later without blocking?' },
      { cat:'permission', q:'If the user is under 18 / outside supported region, how do you block access with clear next steps?' }
    ],
    settings: [
      { cat:'permission', q:'If a user can view settings but not change them, how do you signal read-only vs broken?' },
      { cat:'failure', q:'If saving fails, do you revert fields or keep edits and show retry?' },
      { cat:'dup', q:'If the user taps “Save” multiple times, is the request idempotent?' },
      { cat:'latency', q:'If settings take time to apply (e.g., org policy), how do you show pending state?' },
      { cat:'abandon', q:'If the user navigates away with unsaved changes, do you warn or autosave?' },
      { cat:'empty', q:'If there are no configurable settings yet, what do you show so the screen isn’t a dead end?' },
      { cat:'partial', q:'If one field fails validation and others are valid, do you block all or allow partial save?' }
    ],
    invite: [
      { cat:'permission', q:'Who is allowed to invite teammates, and how do you communicate restrictions?' },
      { cat:'dup', q:'What happens if you invite an email that’s already invited (or already a member)?' },
      { cat:'failure', q:'If sending the invite email fails, can the user retry without creating duplicates?' },
      { cat:'abandon', q:'If the inviter closes the modal mid-entry, do you keep their drafted list?' },
      { cat:'empty', q:'If the inviter has no teammates to add, what’s the fallback path (skip, later reminder)?' },
      { cat:'latency', q:'If provisioning takes time, what is the UI state for “invited” vs “active”?' },
      { cat:'partial', q:'If some emails are invalid and others valid, do you send the valid ones and report the rest?' }
    ],
    upload: [
      { cat:'empty', q:'If the file is empty or only headers, what do you show and what does “success” mean?' },
      { cat:'failure', q:'If parsing fails mid-way, do you show line-level errors and let users fix & retry?' },
      { cat:'permission', q:'If the user lacks permission to upload, do you hide the action or show a request-access path?' },
      { cat:'dup', q:'If the same file is uploaded twice, do you dedupe or version it?' },
      { cat:'latency', q:'If processing takes minutes, do you keep the user on screen or send a notification/email?' },
      { cat:'offline', q:'If connectivity drops, can you resume upload or must restart? How do you prevent corruption?' },
      { cat:'partial', q:'If some rows are valid and some invalid, do you import partial and provide a correction report?' }
    ]
  };

  const appState = {
    domain: 'checkout',
    steps: 12,
    // demo defaults: missing permission + dup + latency + offline
    edgeCoverage: {
      empty: true,
      failure: true,
      permission: false,
      offline: false,
      abandon: true,
      partial: true,
      dup: false,
      latency: false
    },
    coachIndex: 2, // points at the "payment fails" question for checkout demo
    toastTimer: null
  };

  const els = {
    domainSelect: $('#domainSelect'),
    domainTag: $('#domainTag'),
    heroValue: $('#heroValue'),
    stepsValue: $('#stepsValue'),
    stepsUpBtn: $('#stepsUpBtn'),
    stepsDownBtn: $('#stepsDownBtn'),

    coverageValue: $('#coverageValue'),
    riskValue: $('#riskValue'),
    missingValue: $('#missingValue'),
    missingHint: $('#missingHint'),

    questionsValue: $('#questionsValue'),
    questionsHint: $('#questionsHint'),

    checklist: $('#checklist'),

    coachQuestion: $('#coachQuestion'),
    coachMeta: $('#coachMeta'),
    nextQuestionBtn: $('#nextQuestionBtn'),

    resetBtn: $('#resetBtn'),

    toast: $('#toast'),
    toastInner: $('#toastInner'),
    modeText: $('#modeText'),

    tabChecklist: $('#tabChecklist'),
    tabCoach: $('#tabCoach'),
    tabSetup: $('#tabSetup')
  };

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  function setAccent(hex){
    document.documentElement.style.setProperty('--accent', hex);
    document.documentElement.style.setProperty('--accent2', hexToRgba(hex, 0.18));
  }

  function hexToRgba(hex, alpha){
    const h = hex.replace('#','').trim();
    const full = h.length === 3 ? h.split('').map(ch => ch+ch).join('') : h;
    const r = parseInt(full.slice(0,2), 16);
    const g = parseInt(full.slice(2,4), 16);
    const b = parseInt(full.slice(4,6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function setAmbientBgShift(){
    const cfg = DOMAIN_CONFIG[appState.domain];
    const shift = cfg.bgShift;
    // "Background color shifts with ambient data changes" (subtle)
    document.body.style.background = `linear-gradient(180deg, ${shift}, transparent 55%), var(--bg)`;
  }

  function animateNumber(el, from, to, duration=150){
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      el.textContent = String(to);
      return;
    }
    const start = performance.now();
    const delta = to - from;
    function tick(now){
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + delta * eased);
      el.textContent = String(value);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function computeCoverage(){
    const total = EDGE_CATEGORIES.length;
    const on = EDGE_CATEGORIES.reduce((acc, c) => acc + (appState.edgeCoverage[c.id] ? 1 : 0), 0);
    const pct = Math.round((on / total) * 100);
    const missing = total - on;
    return { total, on, pct, missing };
  }

  function computeRisk(pct, steps){
    // Simple heuristic: more steps + lower edge coverage => higher risk
    const riskScore = (100 - pct) * 0.65 + clamp((steps - 6) * 4, 0, 40);
    if (riskScore >= 70) return 'HIGH';
    if (riskScore >= 40) return 'MED';
    return 'LOW';
  }

  function computeQuestionsCount(){
    // Review questions are driven by uncovered categories, plus a base.
    const base = 3;
    const missingCats = EDGE_CATEGORIES.filter(c => !appState.edgeCoverage[c.id]).length;
    // More steps tends to invite more questions
    const stepFactor = Math.round(clamp((appState.steps - 8) / 4, 0, 3));
    return base + (missingCats * 2) + stepFactor;
  }

  function missingHintText(){
    const missing = EDGE_CATEGORIES.filter(c => !appState.edgeCoverage[c.id]).map(c => c.label);
    if (missing.length === 0) return 'Looks review-ready — focus on tradeoffs';
    if (missing.length === 1) return `Common miss: ${missing[0]}`;
    if (missing.length === 2) return `Watch: ${missing[0]} + ${missing[1]}`;
    return `Likely gaps: ${missing.slice(0,2).join(' + ')} (and more)`;
  }

  function renderChecklist(){
    els.checklist.innerHTML = '';
    for (const cat of EDGE_CATEGORIES){
      const on = !!appState.edgeCoverage[cat.id];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `check ${on ? 'check--on' : ''}`;
      btn.setAttribute('data-edge', cat.id);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');

      const left = document.createElement('div');
      left.className = 'check__left';

      const dot = document.createElement('span');
      dot.className = 'check__dot';
      dot.setAttribute('aria-hidden','true');

      const text = document.createElement('div');
      text.className = 'check__text';
      text.textContent = cat.label;

      left.appendChild(dot);
      left.appendChild(text);

      const badge = document.createElement('div');
      badge.className = 'check__badge';
      badge.textContent = on ? 'covered' : 'missing';

      btn.appendChild(left);
      btn.appendChild(badge);

      btn.addEventListener('click', () => {
        appState.edgeCoverage[cat.id] = !appState.edgeCoverage[cat.id];
        btn.classList.toggle('check--on', appState.edgeCoverage[cat.id]);
        btn.setAttribute('aria-pressed', appState.edgeCoverage[cat.id] ? 'true' : 'false');
        badge.textContent = appState.edgeCoverage[cat.id] ? 'covered' : 'missing';
        renderStats(true);
        toast(`Edge case: ${cat.label} → ${appState.edgeCoverage[cat.id] ? 'covered' : 'missing'}`);
      });

      els.checklist.appendChild(btn);
    }
  }

  function currentQuestionList(){
    return QUESTIONS_BY_DOMAIN[appState.domain] || [];
  }

  function nextCoachQuestion(){
    const list = currentQuestionList();
    if (list.length === 0) return;
    appState.coachIndex = (appState.coachIndex + 1) % list.length;
    renderCoach(true);
  }

  function renderCoach(animate=false){
    const list = currentQuestionList();
    if (list.length === 0){
      els.coachQuestion.textContent = 'No coach questions available for this domain.';
      els.coachMeta.textContent = 'Pick another domain';
      return;
    }
    const item = list[appState.coachIndex];

    els.coachQuestion.textContent = item.q;
    const catLabel = (EDGE_CATEGORIES.find(c => c.id === item.cat) || {label:'General'}).label;
    els.coachMeta.textContent = `From “${catLabel}” category`;

    if (animate && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)){
      els.coachQuestion.animate(
        [
          { transform: 'translateY(2px)', opacity: 0.0 },
          { transform: 'translateY(0px)', opacity: 1.0 }
        ],
        { duration: 200, easing: 'cubic-bezier(.2,.9,.2,1)' }
      );
    }
  }

  function renderStats(animateHero=false){
    const cfg = DOMAIN_CONFIG[appState.domain];
    setAccent(cfg.accent);
    setAmbientBgShift();

    els.domainTag.textContent = cfg.label;
    els.domainSelect.value = appState.domain;

    const prevSteps = parseInt(els.heroValue.textContent, 10);
    if (animateHero && Number.isFinite(prevSteps)) animateNumber(els.heroValue, prevSteps, appState.steps, 150);
    else els.heroValue.textContent = String(appState.steps);

    els.stepsValue.textContent = String(appState.steps);

    const { pct, missing } = computeCoverage();
    els.coverageValue.textContent = `${pct}%`;
    els.missingValue.textContent = String(missing);
    els.missingHint.textContent = missingHintText();

    const risk = computeRisk(pct, appState.steps);
    els.riskValue.textContent = risk;

    const questionsCount = computeQuestionsCount();
    els.questionsValue.textContent = String(questionsCount);
    els.questionsHint.textContent = risk === 'HIGH'
      ? 'Expect “what if” questions — handle the failure modes'
      : (risk === 'MED' ? 'Good baseline — tighten the missing states' : 'Low risk — sanity check tradeoffs');

    els.modeText.textContent = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'Adaptive mode · Dark'
      : 'Adaptive mode · Light';
  }

  function toast(message){
    clearTimeout(appState.toastTimer);
    els.toastInner.textContent = message;
    els.toast.classList.add('toast--on');
    appState.toastTimer = window.setTimeout(() => {
      els.toast.classList.remove('toast--on');
    }, 1400);
  }

  function setSteps(next){
    const prev = appState.steps;
    appState.steps = clamp(next, 3, 24);
    renderStats(true);
    if (appState.steps !== prev) toast(`Steps → ${appState.steps}`);
  }

  function resetToDemo(){
    appState.domain = 'checkout';
    appState.steps = 12;
    appState.edgeCoverage = {
      empty: true,
      failure: true,
      permission: false,
      offline: false,
      abandon: true,
      partial: true,
      dup: false,
      latency: false
    };
    appState.coachIndex = 2;

    renderChecklist();
    renderStats(false);
    renderCoach(false);
    toast('Reset to demo flow');
  }

  function wireTabs(){
    function scrollToTile(label){
      const tiles = Array.from(document.querySelectorAll('.tile'));
      const target = tiles.find(t => (t.getAttribute('aria-label') || '').toLowerCase().includes(label));
      if (!target) return;
      target.scrollIntoView({ behavior: (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'auto' : 'smooth', block: 'start' });
    }

    els.tabChecklist.addEventListener('click', () => scrollToTile('checklist'));
    els.tabCoach.addEventListener('click', () => scrollToTile('coach'));
    els.tabSetup.addEventListener('click', () => $('#sheet').scrollIntoView({ behavior: (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'auto' : 'smooth', block: 'start' }));
  }

  function init(){
    renderChecklist();
    renderStats(false);
    renderCoach(false);

    els.domainSelect.addEventListener('change', (e) => {
      appState.domain = e.target.value;
      // keep coach index within bounds
      const list = currentQuestionList();
      appState.coachIndex = clamp(appState.coachIndex, 0, Math.max(0, list.length - 1));
      renderStats(false);
      renderCoach(true);
      toast(`Domain → ${DOMAIN_CONFIG[appState.domain].label}`);
    });

    els.stepsUpBtn.addEventListener('click', () => setSteps(appState.steps + 1));
    els.stepsDownBtn.addEventListener('click', () => setSteps(appState.steps - 1));

    els.nextQuestionBtn.addEventListener('click', () => {
      nextCoachQuestion();
      toast('Next question');
    });

    els.resetBtn.addEventListener('click', resetToDemo);

    wireTabs();

    if (window.matchMedia){
      const mm = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => renderStats(false);
      if (typeof mm.addEventListener === 'function') mm.addEventListener('change', handler);
      else if (typeof mm.addListener === 'function') mm.addListener(handler);
    }
  }

  init();
})();