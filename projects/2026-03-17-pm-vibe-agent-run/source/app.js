(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const STATE = {
    route: 'today',      // today | history | update
    mode: 'triage',      // triage | review
    filter: 'all',       // all | attention | resolved
    sort: 'severity',    // severity | type | time
    tone: 'crisp',       // crisp | candid
    selectedItemId: null,
    selectedRunId: null,
    isParsing: false,
    runs: [],
    todayRunId: null
  };

  const TYPE_ORDER = ['risk', 'decision', 'ask', 'progress'];
  const TYPE_LABEL = {
    risk: 'Risk',
    decision: 'Decision',
    ask: 'Ask',
    progress: 'Progress'
  };

  const SEVERITY_ORDER = { critical: 3, warning: 2, watch: 1, info: 0 };

  const DEMO_RUNS = createDemoRuns();

  // Elements
  const navBtns = $$('.nav__item');
  const navTodayMeta = $('#navTodayMeta');
  const navHistoryMeta = $('#navHistoryMeta');
  const navUpdateMeta = $('#navUpdateMeta');

  const pageKicker = $('#pageKicker');
  const pageTitle = $('#pageTitle');

  const notesInput = $('#notesInput');
  const notesMeta = $('#notesMeta');
  const parseBtn = $('#parseBtn');
  const loadDemoBtn = $('#loadDemoBtn');
  const clearNotesBtn = $('#clearNotesBtn');
  const seedAltBtn = $('#seedAltBtn');

  const modeBtnTriage = $('#modeBtnTriage');
  const modeBtnReview = $('#modeBtnReview');

  const openHelpBtn = $('#openHelpBtn');
  const modalBackdrop = $('#modalBackdrop');
  const closeModalBtn = $('#closeModalBtn');
  const closeModalBtn2 = $('#closeModalBtn2');

  const filterBtns = $$('.select__btn[data-filter]');
  const sortBtns = $$('.select__btn[data-sort]');
  const thSortBtns = $$('.th-btn[data-th-sort]');
  const sortIndicatorType = $('#sortIndicatorType');
  const sortIndicatorSeverity = $('#sortIndicatorSeverity');
  const sortIndicatorTime = $('#sortIndicatorTime');

  const itemsTbody = $('#itemsTbody');
  const tableSkeleton = $('#tableSkeleton');
  const itemCountBadge = $('#itemCountBadge');

  const inspectorEmpty = $('#inspectorEmpty');
  const inspectorContent = $('#inspectorContent');
  const inspectorSubtitle = $('#inspectorSubtitle');
  const inspectorType = $('#inspectorType');
  const inspectorTitle = $('#inspectorTitle');
  const inspectorContext = $('#inspectorContext');
  const inspectorImpact = $('#inspectorImpact');
  const inspectorNext = $('#inspectorNext');
  const inspectorSeverityPill = $('#inspectorSeverityPill');
  const inspectorStatusPill = $('#inspectorStatusPill');
  const resolveBtn = $('#resolveBtn');
  const convertToAskBtn = $('#convertToAskBtn');
  const copyItemBtn = $('#copyItemBtn');

  const vibeScoreNum = $('#vibeScoreNum');
  const vibeLabelPill = $('#vibeLabelPill');
  const vibeRing = $('#vibeRing');
  const ringValue = $('.ring__value', vibeRing);

  const metricOpenRisks = $('#metricOpenRisks');
  const metricUnconfirmedDecisions = $('#metricUnconfirmedDecisions');
  const metricPendingAsks = $('#metricPendingAsks');

  const updatePanel = $('#updatePanel');
  const updateOutput = $('#updateOutput');
  const updateMeta = $('#updateMeta');
  const changeList = $('#changeList');
  const copyUpdateBtn = $('#copyUpdateBtn');
  const toneBtnCrisp = $('#toneBtnCrisp');
  const toneBtnCandid = $('#toneBtnCandid');

  const toast = $('#toast');
  const toastInner = $('#toastInner');

  init();

  function init() {
    STATE.runs = deepClone(DEMO_RUNS);
    STATE.todayRunId = STATE.runs[0].id;
    STATE.selectedRunId = STATE.todayRunId;
    hydrateTodayInputFromRun();
    bindEvents();
    setRoute('today');
    renderAll();
  }

  function bindEvents() {
    navBtns.forEach(btn => {
      btn.addEventListener('click', () => setRoute(btn.dataset.route));
    });

    modeBtnTriage.addEventListener('click', () => setMode('triage'));
    modeBtnReview.addEventListener('click', () => setMode('review'));

    filterBtns.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));
    sortBtns.forEach(btn => btn.addEventListener('click', () => setSort(btn.dataset.sort)));

    thSortBtns.forEach(btn => btn.addEventListener('click', () => setSort(btn.dataset.thSort)));

    parseBtn.addEventListener('click', () => parseNotesFlow());
    loadDemoBtn.addEventListener('click', () => {
      STATE.runs = deepClone(DEMO_RUNS);
      STATE.todayRunId = STATE.runs[0].id;
      STATE.selectedRunId = STATE.todayRunId;
      STATE.selectedItemId = null;
      hydrateTodayInputFromRun();
      renderAll();
      showToast('Demo reloaded');
    });

    clearNotesBtn.addEventListener('click', () => {
      notesInput.value = '';
      updateNotesMeta();
    });

    seedAltBtn.addEventListener('click', () => {
      const todayIdx = STATE.runs.findIndex(r => r.id === STATE.todayRunId);
      const alt = STATE.runs[(todayIdx + 1) % STATE.runs.length];
      STATE.selectedRunId = alt.id;
      STATE.todayRunId = alt.id;
      STATE.selectedItemId = null;
      hydrateTodayInputFromRun();
      renderAll();
      showToast(`Loaded: ${alt.dateLabel}`);
    });

    openHelpBtn.addEventListener('click', () => openModal(true));
    closeModalBtn.addEventListener('click', () => openModal(false));
    closeModalBtn2.addEventListener('click', () => openModal(false));
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) openModal(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') openModal(false);
    });

    resolveBtn.addEventListener('click', () => resolveSelectedItem());
    convertToAskBtn.addEventListener('click', () => convertSelectedItemToAsk());
    copyItemBtn.addEventListener('click', () => copySelectedItemSummary());

    toneBtnCrisp.addEventListener('click', () => setTone('crisp'));
    toneBtnCandid.addEventListener('click', () => setTone('candid'));
    copyUpdateBtn.addEventListener('click', () => copyUpdate());

    notesInput.addEventListener('input', () => updateNotesMeta());
  }

  function setRoute(route) {
    STATE.route = route;
    navBtns.forEach(b => b.classList.toggle('is-active', b.dataset.route === route));

    if (route === 'update') {
      updatePanel.hidden = false;
      pageKicker.textContent = 'Output';
      pageTitle.textContent = 'Exec update';
    } else if (route === 'history') {
      updatePanel.hidden = true;
      pageKicker.textContent = 'Run log';
      pageTitle.textContent = 'History (demo)';
    } else {
      updatePanel.hidden = true;
      pageKicker.textContent = 'Today';
      pageTitle.textContent = 'Run snapshot';
    }

    renderAll();
  }

  function setMode(mode) {
    STATE.mode = mode;
    modeBtnTriage.classList.toggle('is-active', mode === 'triage');
    modeBtnReview.classList.toggle('is-active', mode === 'review');
    modeBtnTriage.setAttribute('aria-selected', mode === 'triage' ? 'true' : 'false');
    modeBtnReview.setAttribute('aria-selected', mode === 'review' ? 'true' : 'false');
    renderAll();
  }

  function setFilter(filter) {
    STATE.filter = filter;
    filterBtns.forEach(b => b.classList.toggle('is-active', b.dataset.filter === filter));
    renderAll();
  }

  function setSort(sort) {
    STATE.sort = sort;
    sortBtns.forEach(b => b.classList.toggle('is-active', b.dataset.sort === sort));
    updateSortIndicators();
    renderAll();
  }

  function setTone(tone) {
    STATE.tone = tone;
    toneBtnCrisp.classList.toggle('is-active', tone === 'crisp');
    toneBtnCandid.classList.toggle('is-active', tone === 'candid');
    toneBtnCrisp.setAttribute('aria-selected', tone === 'crisp' ? 'true' : 'false');
    toneBtnCandid.setAttribute('aria-selected', tone === 'candid' ? 'true' : 'false');
    renderAll();
  }

  function openModal(open) {
    if (!open) {
      modalBackdrop.hidden = true;
      modalBackdrop.classList.remove('is-open');
      return;
    }
    modalBackdrop.hidden = false;
    requestAnimationFrame(() => modalBackdrop.classList.add('is-open'));
  }

  function renderAll() {
    updateNotesMeta();
    renderNavMeta();
    renderTable();
    renderInspector();
    renderMetrics();
    renderUpdatePanel();
  }

  function updateNotesMeta() {
    const lines = notesInput.value.trim().split('\n').filter(Boolean);
    const chars = notesInput.value.length;
    notesMeta.textContent = `${lines.length} lines • ${chars.toLocaleString()} chars`;
  }

  function hydrateTodayInputFromRun() {
    const run = getSelectedRun();
    notesInput.value = run.rawNotes;
    updateNotesMeta();
  }

  function getSelectedRun() {
    return STATE.runs.find(r => r.id === STATE.selectedRunId) || STATE.runs[0];
  }

  function getItemsForSelectedRun() {
    const run = getSelectedRun();
    return run.items;
  }

  function renderNavMeta() {
    const today = STATE.runs.find(r => r.id === STATE.todayRunId) || STATE.runs[0];
    const openCount = today.items.filter(i => !i.resolved).length;
    navTodayMeta.textContent = `${openCount} open`;

    navHistoryMeta.textContent = `${STATE.runs.length} days`;
    navUpdateMeta.textContent = formatDateShort(today.dateISO);
  }

  function renderTable() {
    const items = getVisibleItems();
    itemCountBadge.textContent = `${items.length} items`;

    if (STATE.isParsing) {
      tableSkeleton.classList.add('is-visible');
    } else {
      tableSkeleton.classList.remove('is-visible');
    }

    itemsTbody.innerHTML = '';
    const frag = document.createDocumentFragment();

    items.forEach(item => {
      const tr = document.createElement('tr');
      tr.dataset.id = item.id;
      tr.className = STATE.selectedItemId === item.id ? 'is-selected' : '';
      tr.tabIndex = 0;

      const typeTd = document.createElement('td');
      typeTd.className = 'col-type';
      typeTd.appendChild(makePill(TYPE_LABEL[item.type], item.type === 'ask' ? 'accent' : 'neutral'));

      const titleTd = document.createElement('td');
      titleTd.className = 'col-title';
      const title = document.createElement('div');
      title.style.fontWeight = '700';
      title.style.letterSpacing = '-0.01em';
      title.textContent = item.title;
      const sub = document.createElement('div');
      sub.className = 'caption';
      sub.textContent = item.context;
      titleTd.append(title, sub);

      const sevTd = document.createElement('td');
      sevTd.className = 'col-sev';
      sevTd.appendChild(makeSeverityPill(item.severity));

      const statusTd = document.createElement('td');
      statusTd.className = 'col-status';
      statusTd.appendChild(makeStatusPill(item));

      const ageTd = document.createElement('td');
      ageTd.className = 'col-age';
      ageTd.textContent = item.timeLabel;

      tr.append(typeTd, titleTd, sevTd, statusTd, ageTd);

      tr.addEventListener('click', () => selectItem(item.id));
      tr.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectItem(item.id);
        }
      });

      frag.appendChild(tr);
    });

    itemsTbody.appendChild(frag);
  }

  function getVisibleItems() {
    let items = getItemsForSelectedRun().slice();

    // Mode affects display: triage hides "info" unless selected, review shows all.
    if (STATE.mode === 'triage') {
      items = items.filter(i => i.severity !== 'info' || i.id === STATE.selectedItemId);
    }

    // Filter
    if (STATE.filter === 'attention') {
      items = items.filter(i => needsAttention(i));
    } else if (STATE.filter === 'resolved') {
      items = items.filter(i => i.resolved);
    }

    // Sort
    items.sort((a, b) => {
      if (STATE.sort === 'severity') {
        return SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity] || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
      }
      if (STATE.sort === 'type') {
        return TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity];
      }
      // time
      return b.timeMins - a.timeMins || SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity];
    });

    return items;
  }

  function updateSortIndicators() {
    const active = STATE.sort;
    sortIndicatorType.textContent = active === 'type' ? '▾' : '▴';
    sortIndicatorSeverity.textContent = active === 'severity' ? '▾' : '▴';
    sortIndicatorTime.textContent = active === 'time' ? '▾' : '▴';
  }

  function selectItem(id) {
    STATE.selectedItemId = id;
    renderTable();
    renderInspector();
  }

  function renderInspector() {
    const item = getSelectedItem();
    const has = !!item;

    inspectorEmpty.hidden = has;
    inspectorContent.hidden = !has;
    copyItemBtn.disabled = !has;

    if (!has) {
      inspectorSubtitle.textContent = 'Select a run item to view context, decision framing, and actions.';
      return;
    }

    inspectorSubtitle.textContent = `Selected from ${formatDateLong(getSelectedRun().dateISO)} • ${item.timeLabel}`;
    inspectorType.textContent = TYPE_LABEL[item.type];
    inspectorTitle.textContent = item.title;
    inspectorContext.textContent = item.context;
    inspectorImpact.textContent = item.impact;
    inspectorNext.textContent = item.next;

    setPill(inspectorSeverityPill, severityLabel(item.severity), severityPillClass(item.severity));
    setPill(inspectorStatusPill, item.resolved ? 'Resolved' : (needsAttention(item) ? 'Needs attention' : 'Tracked'), item.resolved ? 'pill--green' : (needsAttention(item) ? 'pill--yellow' : 'pill--neutral'));

    resolveBtn.disabled = item.resolved;
    convertToAskBtn.disabled = item.type === 'ask';

    resolveBtn.textContent = item.resolved ? 'Resolved' : 'Mark resolved';
  }

  function getSelectedItem() {
    if (!STATE.selectedItemId) return null;
    return getItemsForSelectedRun().find(i => i.id === STATE.selectedItemId) || null;
  }

  function renderMetrics() {
    const run = getSelectedRun();
    const metrics = computeRunMetrics(run);

    metricOpenRisks.textContent = metrics.openRisks.toString();
    metricUnconfirmedDecisions.textContent = metrics.unconfirmedDecisions.toString();
    metricPendingAsks.textContent = metrics.pendingAsks.toString();

    vibeScoreNum.textContent = metrics.vibeScore.toString();
    const vibeLabel = vibeLabelForScore(metrics.vibeScore);
    setPill(vibeLabelPill, vibeLabel, vibeLabelPillClass(metrics.vibeScore));

    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (circumference * metrics.vibeScore / 100);
    ringValue.style.strokeDasharray = `${circumference.toFixed(3)}`;
    ringValue.style.strokeDashoffset = `${offset.toFixed(3)}`;
    ringValue.style.stroke = ringColorForScore(metrics.vibeScore);
  }

  function renderUpdatePanel() {
    const run = getSelectedRun();
    const update = generateExecUpdate(run, STATE.tone);

    updateOutput.textContent = update.text;
    updateMeta.textContent = `Tone: ${STATE.tone === 'crisp' ? 'Crisp' : 'Candid'} • Built from ${run.items.length} items • ${formatDateLong(run.dateISO)}`;

    changeList.innerHTML = '';
    const changes = computeChangeHighlights(run);
    changes.forEach(c => {
      const div = document.createElement('div');
      div.className = 'change';
      const t = document.createElement('div');
      t.className = 'change__title';
      t.textContent = c.title;
      const s = document.createElement('div');
      s.className = 'change__sub';
      s.textContent = c.sub;
      div.append(t, s);
      changeList.appendChild(div);
    });
  }

  function parseNotesFlow() {
    const raw = notesInput.value.trim();
    if (!raw) {
      showToast('Add notes to parse');
      return;
    }

    STATE.isParsing = true;
    renderTable();

    // Simulate a lightweight parse (skeleton loader instead of spinner)
    window.setTimeout(() => {
      const parsed = parseRawNotesToItems(raw);
      const run = getSelectedRun();
      run.rawNotes = raw;

      // Replace items but keep stable IDs for those that match titles (basic)
      run.items = reconcileItems(run.items, parsed);
      STATE.selectedItemId = null;
      STATE.isParsing = false;
      renderAll();
      showToast(`Parsed into ${run.items.length} items`);
    }, 520);
  }

  function reconcileItems(existing, next) {
    const byTitle = new Map(existing.map(i => [i.title.trim().toLowerCase(), i]));
    return next.map(n => {
      const key = n.title.trim().toLowerCase();
      const found = byTitle.get(key);
      if (!found) return n;
      return {
        ...n,
        id: found.id,
        resolved: found.resolved,
        createdAtISO: found.createdAtISO
      };
    });
  }

  function resolveSelectedItem() {
    const item = getSelectedItem();
    if (!item || item.resolved) return;

    item.resolved = true;
    item.resolvedAtISO = new Date().toISOString();

    renderAll();
    showToast('Marked resolved');
  }

  function convertSelectedItemToAsk() {
    const item = getSelectedItem();
    if (!item || item.type === 'ask') return;

    item.type = 'ask';
    item.severity = item.severity === 'info' ? 'watch' : item.severity;
    item.next = `Send ask: ${suggestAskRecipient(item)} • include by ${suggestDeadlineLabel(item)}`;
    item.title = normalizeAskTitle(item.title);
    item.context = item.context.includes('Owner:') ? item.context : `${item.context} • Owner: you`;

    renderAll();
    showToast('Converted to ask');
  }

  function copySelectedItemSummary() {
    const item = getSelectedItem();
    if (!item) return;

    const text = [
      `• ${TYPE_LABEL[item.type]} — ${item.title}`,
      `  Context: ${item.context}`,
      `  Impact: ${item.impact}`,
      `  Next: ${item.next}`,
      `  Status: ${item.resolved ? 'Resolved' : (needsAttention(item) ? 'Needs attention' : 'Tracked')} • Severity: ${severityLabel(item.severity)}`
    ].join('\n');

    copyToClipboard(text);
    showToast('Item copied');
  }

  function copyUpdate() {
    const run = getSelectedRun();
    const update = generateExecUpdate(run, STATE.tone);
    copyToClipboard(update.text);
    showToast('Update copied');
  }

  function showToast(text) {
    toastInner.textContent = text;
    toast.hidden = false;
    toast.classList.add('is-visible');

    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => { toast.hidden = true; }, 220);
    }, 1400);
  }

  function parseRawNotesToItems(raw) {
    const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);

    const blocks = [];
    let current = null;

    for (const line of lines) {
      const maybeHeader = parseHeader(line);
      if (maybeHeader) {
        if (current) blocks.push(current);
        current = { ...maybeHeader, bullets: [] };
        continue;
      }
      if (!current) {
        // Fallback bucket if user didn't paste with headers
        current = { type: 'progress', severity: 'info', bullets: [] };
      }
      current.bullets.push(line.replace(/^[-*•]\s*/, ''));
    }
    if (current) blocks.push(current);

    const nowISO = new Date().toISOString();
    const items = [];

    blocks.forEach((b, idx) => {
      const joined = b.bullets.join(' ').trim();
      const title = summarizeTitle(joined, b.type);

      const item = {
        id: `i_${Math.random().toString(16).slice(2)}_${idx}`,
        type: b.type,
        severity: b.severity,
        title,
        context: extractContext(joined, b.type),
        impact: extractImpact(joined, b.type),
        next: extractNext(joined, b.type),
        resolved: false,
        createdAtISO: nowISO,
        timeLabel: inferTimeLabel(joined, idx),
        timeMins: inferTimeMins(joined, idx)
      };

      // heuristic: decisions can be "confirmed" if line contains "confirmed" or "aligned"
      if (item.type === 'decision' && /(confirmed|aligned|signed off)/i.test(joined)) {
        item.resolved = true;
      }
      // heuristic: progress items default to resolved (they are informational)
      if (item.type === 'progress') {
        item.resolved = true;
      }

      items.push(item);
    });

    // Keep only meaningful items (avoid super short noise)
    return items.filter(i => i.title.length >= 10);
  }

  function parseHeader(line) {
    const l = line.toLowerCase();
    const headerMatch = l.match(/^(risk|risks|decision|decisions|ask|asks|progress|updates)\s*[:\-]/i);
    if (!headerMatch) return null;

    const key = headerMatch[1];
    let type = 'progress';
    if (key.startsWith('risk')) type = 'risk';
    else if (key.startsWith('decision')) type = 'decision';
    else if (key.startsWith('ask')) type = 'ask';
    else type = 'progress';

    // severity hints
    let severity = 'info';
    if (/\b(sev|p)\s*0\b|\bcritical\b|\bblocker\b/i.test(line)) severity = 'critical';
    else if (/\b(sev|p)\s*1\b|\bhigh\b|\burgent\b|\brisk\b/i.test(line)) severity = 'warning';
    else if (/\b(sev|p)\s*2\b|\bmedium\b|\bwatch\b/i.test(line)) severity = 'watch';
    else severity = type === 'risk' ? 'watch' : 'info';

    return { type, severity };
  }

  function summarizeTitle(text, type) {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned) return type === 'risk' ? 'Unspecified risk' : 'Unspecified note';

    const max = 76;
    const base = cleaned.length > max ? cleaned.slice(0, max - 1).trim() + '…' : cleaned;

    if (type === 'risk') {
      return base.replace(/^risk[:\-]\s*/i, '');
    }
    if (type === 'decision') {
      return base.replace(/^decision[:\-]\s*/i, '');
    }
    if (type === 'ask') {
      return base.replace(/^ask[:\-]\s*/i, '');
    }
    return base;
  }

  function extractContext(text, type) {
    if (type === 'risk') {
      return firstSentence(text, 110) || 'Risk surfaced in coordination work; context missing.';
    }
    if (type === 'decision') {
      return firstSentence(text, 110) || 'Decision captured from discussion; context missing.';
    }
    if (type === 'ask') {
      return firstSentence(text, 110) || 'Ask drafted from notes; context missing.';
    }
    return firstSentence(text, 110) || 'Work captured from notes.';
  }

  function extractImpact(text, type) {
    const t = text.toLowerCase();
    if (type === 'risk') {
      if (t.includes('launch') || t.includes('ship')) return 'May delay planned rollout or degrade quality if unmitigated.';
      if (t.includes('retention') || t.includes('activation')) return 'Could create measurable drop in key funnel metrics if it lands wrong.';
      if (t.includes('legal') || t.includes('security')) return 'Compliance or trust risk; needs explicit sign-off.';
      return 'Potential schedule or scope impact; requires explicit mitigation.';
    }
    if (type === 'decision') {
      return 'Creates a new constraint for execution; misalignment later would create rework.';
    }
    if (type === 'ask') {
      return 'Unblocks a dependency; without it, progress stalls or scope balloons.';
    }
    return 'Provides evidence of movement; helpful for stakeholder confidence and planning.';
  }

  function extractNext(text, type) {
    const t = text.toLowerCase();
    if (type === 'risk') {
      if (t.includes('qa') || t.includes('test')) return 'Validate the failure mode with QA + instrumentation; propose mitigation options.';
      if (t.includes('backend') || t.includes('api')) return 'Confirm root cause with backend owner; agree on patch + rollout plan.';
      if (t.includes('design')) return 'Schedule a 15-min design review to align on edge cases and success criteria.';
      return 'Write a mitigation plan and get an explicit owner + date.';
    }
    if (type === 'decision') {
      return 'Confirm decision in writing (Slack/email) and update ticket acceptance criteria.';
    }
    if (type === 'ask') {
      return 'Send the ask with a clear deadline and expected artifact (PRD, spec, approval).';
    }
    return 'Capture next concrete step and assign an owner.';
  }

  function inferTimeLabel(text, idx) {
    const t = text.toLowerCase();
    if (t.includes('am') || t.includes('morning')) return 'Morning';
    if (t.includes('noon') || t.includes('lunch')) return 'Midday';
    if (t.includes('eod') || t.includes('end of day') || t.includes('pm')) return 'EOD';
    return idx < 2 ? 'Morning' : (idx < 4 ? 'Midday' : 'Afternoon');
  }

  function inferTimeMins(text, idx) {
    const t = text.toLowerCase();
    if (t.includes('morning')) return 540;
    if (t.includes('midday') || t.includes('noon')) return 780;
    if (t.includes('afternoon')) return 900;
    if (t.includes('eod') || t.includes('end of day')) return 1020;
    return 600 + idx * 90;
  }

  function needsAttention(item) {
    if (item.resolved) return false;
    if (item.type === 'risk' && (item.severity === 'critical' || item.severity === 'warning' || item.severity === 'watch')) return true;
    if (item.type === 'decision') return true; // until confirmed/resolved
    if (item.type === 'ask') return true; // asks are actionable by default
    return false;
  }

  function computeRunMetrics(run) {
    const items = run.items;

    const openRisks = items.filter(i => i.type === 'risk' && !i.resolved).length;
    const openCriticalRisks = items.filter(i => i.type === 'risk' && !i.resolved && i.severity === 'critical').length;
    const openWarningRisks = items.filter(i => i.type === 'risk' && !i.resolved && i.severity === 'warning').length;

    const unconfirmedDecisions = items.filter(i => i.type === 'decision' && !i.resolved).length;
    const pendingAsks = items.filter(i => i.type === 'ask' && !i.resolved).length;

    const resolvedCount = items.filter(i => i.resolved).length;

    // Heuristic score (0-100)
    let score = 82;
    score -= openCriticalRisks * 16;
    score -= openWarningRisks * 10;
    score -= openRisks * 4;
    score -= unconfirmedDecisions * 8;
    score -= pendingAsks * 6;
    score += resolvedCount * 2;

    // Clamp
    score = Math.max(18, Math.min(98, Math.round(score)));

    return {
      openRisks,
      unconfirmedDecisions,
      pendingAsks,
      vibeScore: score
    };
  }

  function vibeLabelForScore(score) {
    if (score >= 78) return 'Calm + controlled';
    if (score >= 58) return 'Busy but stable';
    if (score >= 42) return 'Risky / needs alignment';
    return 'On fire';
  }

  function ringColorForScore(score) {
    if (score >= 78) return '#10B981';
    if (score >= 58) return '#F59E0B';
    return '#EF4444';
  }

  function vibeLabelPillClass(score) {
    if (score >= 78) return 'pill--green';
    if (score >= 58) return 'pill--yellow';
    return 'pill--red';
  }

  function severityLabel(sev) {
    if (sev === 'critical') return 'Critical';
    if (sev === 'warning') return 'High';
    if (sev === 'watch') return 'Watch';
    return 'Info';
  }

  function severityPillClass(sev) {
    if (sev === 'critical') return 'pill--red';
    if (sev === 'warning') return 'pill--yellow';
    if (sev === 'watch') return 'pill--neutral';
    return 'pill--neutral';
  }

  function makeSeverityPill(sev) {
    const label = severityLabel(sev);
    const cls = severityPillClass(sev);
    const pill = document.createElement('span');
    pill.className = `pill ${cls}`;
    pill.textContent = label;
    return pill;
  }

  function makeStatusPill(item) {
    const pill = document.createElement('span');
    let text = 'Tracked';
    let cls = 'pill--neutral';

    if (item.resolved) {
      text = 'Resolved';
      cls = 'pill--green';
    } else if (needsAttention(item)) {
      text = 'Needs attention';
      cls = 'pill--yellow';
    }

    pill.className = `pill ${cls}`;
    pill.textContent = text;
    return pill;
  }

  function makePill(text, variant) {
    const pill = document.createElement('span');
    const cls = variant === 'accent' ? 'pill--accent' : 'pill--neutral';
    pill.className = `pill ${cls}`;
    pill.textContent = text;
    return pill;
  }

  function setPill(el, text, cls) {
    el.textContent = text;
    el.className = `pill ${cls}`;
  }

  function generateExecUpdate(run, tone) {
    const metrics = computeRunMetrics(run);
    const vibeLabel = vibeLabelForScore(metrics.vibeScore);

    const openRisks = run.items.filter(i => i.type === 'risk' && !i.resolved)
      .sort((a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity])
      .slice(0, 3);

    const openDecisions = run.items.filter(i => i.type === 'decision' && !i.resolved).slice(0, 3);
    const asks = run.items.filter(i => i.type === 'ask' && !i.resolved).slice(0, 4);

    const shipped = run.items.filter(i => i.type === 'progress').slice(0, 4);

    const headline = tone === 'crisp'
      ? `Daily update — ${formatDateShort(run.dateISO)}`
      : `Daily update (candid) — ${formatDateShort(run.dateISO)}`;

    const vibeLine = tone === 'crisp'
      ? `Vibe: ${vibeLabel} (${metrics.vibeScore}/100)`
      : `Vibe: ${vibeLabel} (${metrics.vibeScore}/100). Main drag: ${metrics.openRisks} open risks, ${metrics.unconfirmedDecisions} unconfirmed decisions.`;

    const lines = [];
    lines.push(headline);
    lines.push(vibeLine);
    lines.push('');
    lines.push('Progress');
    lines.push(formatBullets(shipped.map(i => i.title), shipped.length === 0 ? ['No notable ships captured; mostly coordination day.'] : null));
    lines.push('');
    lines.push('Decisions');
    lines.push(formatBullets(openDecisions.map(i => i.title), openDecisions.length === 0 ? ['No pending decisions.'] : null));
    lines.push('');
    lines.push('Risks');
    lines.push(formatBullets(openRisks.map(i => `${severityLabel(i.severity)} — ${i.title}`), openRisks.length === 0 ? ['No open risks.'] : null));
    lines.push('');
    lines.push('Asks');
    lines.push(formatBullets(asks.map(i => i.title), asks.length === 0 ? ['No asks outstanding.'] : null));

    if (tone === 'candid') {
      const candidAdd = candidFootnote(run);
      lines.push('');
      lines.push('Notes');
      lines.push(formatBullets(candidAdd, null));
    }

    return { text: lines.join('\n') };
  }

  function candidFootnote(run) {
    const items = run.items;
    const highRisk = items.find(i => i.type === 'risk' && !i.resolved && (i.severity === 'critical' || i.severity === 'warning'));
    const unconfirmed = items.find(i => i.type === 'decision' && !i.resolved);
    const ask = items.find(i => i.type === 'ask' && !i.resolved);

    const out = [];
    if (highRisk) out.push(`I’d like an explicit owner/date for “${highRisk.title}” to avoid passive drift.`);
    if (unconfirmed) out.push(`We should confirm “${unconfirmed.title}” in writing; it’s currently a verbal alignment only.`);
    if (ask) out.push(`The biggest unblocker is “${ask.title}” — if we can’t get it by tomorrow, we should re-scope.`);
    if (out.length === 0) out.push('No red flags; main work is keeping dependencies moving.');
    return out;
  }

  function computeChangeHighlights(run) {
    const metrics = computeRunMetrics(run);
    const attention = run.items.filter(i => needsAttention(i)).length;
    const resolved = run.items.filter(i => i.resolved).length;
    const openCritical = run.items.filter(i => i.type === 'risk' && !i.resolved && i.severity === 'critical').length;

    const a = {
      title: 'Attention load',
      sub: attention === 0 ? 'No items currently flagged as needs-attention.' : `${attention} items currently need attention (risks/decisions/asks).`
    };
    const b = {
      title: 'Resolution progress',
      sub: `${resolved} resolved items captured today (including progress updates).`
    };
    const c = {
      title: 'Vibe score drivers',
      sub: openCritical > 0
        ? `${openCritical} critical risk(s) are suppressing the score.`
        : `Score reflects ${metrics.openRisks} open risks + ${metrics.unconfirmedDecisions} unconfirmed decisions.`
    };

    return [a, b, c];
  }

  function formatBullets(items, fallback) {
    const list = (items && items.length ? items : fallback) || [];
    return list.map(s => `• ${s}`).join('\n');
  }

  function normalizeAskTitle(title) {
    const t = title.trim();
    if (/^need\s/i.test(t)) return t;
    if (/^ask\s/i.test(t)) return t.replace(/^ask\s*[:\-]?\s*/i, 'Need ');
    return `Need ${t.charAt(0).toLowerCase()}${t.slice(1)}`;
  }

  function suggestAskRecipient(item) {
    const t = `${item.title} ${item.context}`.toLowerCase();
    if (t.includes('design') || t.includes('copy') || t.includes('ux')) return 'Design';
    if (t.includes('api') || t.includes('backend') || t.includes('db')) return 'Backend';
    if (t.includes('legal') || t.includes('privacy')) return 'Legal/Privacy';
    if (t.includes('sales') || t.includes('enablement')) return 'Sales Enablement';
    if (t.includes('support')) return 'Support';
    if (t.includes('data') || t.includes('metric') || t.includes('analytics')) return 'Data';
    return 'Eng lead';
  }

  function suggestDeadlineLabel(item) {
    if (item.severity === 'critical') return 'tomorrow EOD';
    if (item.severity === 'warning') return 'this week';
    return 'next week';
  }

  function copyToClipboard(text) {
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', 'true');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      document.body.removeChild(ta);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(fallback);
    } else {
      fallback();
    }
  }

  function firstSentence(text, maxLen) {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned) return '';
    const parts = cleaned.split(/([.?!])\s+/);
    const sentence = parts.length > 1 ? (parts[0] + (parts[1] || '')) : cleaned;
    return sentence.length > maxLen ? sentence.slice(0, maxLen - 1).trim() + '…' : sentence;
  }

  function formatDateShort(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function formatDateLong(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function createDemoRuns() {
    const now = new Date();
    const d0 = isoFrom(now);
    const d1 = isoFrom(addDays(now, -1));
    const d2 = isoFrom(addDays(now, -2));

    return [
      {
        id: 'run_0',
        dateISO: d0,
        dateLabel: 'Today',
        rawNotes: demoNotesDay0(),
        items: demoItemsDay0(d0)
      },
      {
        id: 'run_1',
        dateISO: d1,
        dateLabel: 'Yesterday',
        rawNotes: demoNotesDay1(),
        items: demoItemsDay1(d1)
      },
      {
        id: 'run_2',
        dateISO: d2,
        dateLabel: 'Two days ago',
        rawNotes: demoNotesDay2(),
        items: demoItemsDay2(d2)
      }
    ];
  }

  function isoFrom(d) {
    const x = new Date(d);
    x.setHours(9, 30, 0, 0);
    return x.toISOString();
  }
  function addDays(d, delta) {
    const x = new Date(d);
    x.setDate(x.getDate() + delta);
    return x;
  }

  function demoNotesDay0() {
    return [
      'Progress:',
      '- Landed copy + UX tweaks for “Invite teammates” screen; Design signed off on empty states.',
      '- Met with Sales Ops: onboarding friction is “who owns access” + “when do we invite” — need clearer defaults.',
      '',
      'Decisions:',
      '- Alignment: make SSO setup optional for Pro trials; keep an admin reminder banner post-trial.',
      '- Need to confirm with Security whether we can log email domain for discovery flows.',
      '',
      'Risks:',
      '- P0: API rate-limit spikes on /events ingest after the partner rollout; possible backpressure causing drops.',
      '- P1: New plan picker copy might increase confusion for teams migrating from legacy billing.',
      '',
      'Asks:',
      '- Need Backend to confirm the ingest spike root cause + mitigation plan by tomorrow EOD.',
      '- Need Data to validate if activation drop is instrumentation vs behavior (check cohort definitions).'
    ].join('\n');
  }

  function demoNotesDay1() {
    return [
      'Progress:',
      '- Finished PRD v2 for “Workspace roles” and circulated to Eng + Design.',
      '- Added acceptance criteria to the migration epic; cleared 3 ambiguous tickets.',
      '',
      'Decisions:',
      '- Decision: ship role audit log in v1 even if UI is barebones (aligned with Eng).',
      '- Decision: de-scope multi-workspace bulk actions for GA (needs follow-up note).',
      '',
      'Risks:',
      '- P1: Customer success is getting escalations about “missing invites” after SCIM sync; might be misunderstanding or a real bug.',
      '',
      'Asks:',
      '- Need CS to share 5 recent escalation threads so we can classify root causes.'
    ].join('\n');
  }

  function demoNotesDay2() {
    return [
      'Progress:',
      '- Ran a quick triage on support tickets tagged “permission denied”; most are role misconfiguration.',
      '- Drafted a 1-pager for leadership on trial-to-paid conversion: biggest lever is first admin invite.',
      '',
      'Decisions:',
      '- Need alignment from Marketing on whether we can use “Free forever” language on the pricing page.',
      '',
      'Risks:',
      '- P0: If we require admin verification for invites, we might tank activation for small teams.',
      '- P2: Event naming inconsistencies make dashboards hard to trust; ongoing debt.',
      '',
      'Asks:',
      '- Need Design to propose a “Who should I invite?” default that works for both SMB and mid-market.'
    ].join('\n');
  }

  function demoItemsDay0(dateISO) {
    return [
      {
        id: 'i_0a',
        type: 'progress',
        severity: 'info',
        title: 'Invite teammates UX/copy tweaks landed; empty states signed off',
        context: 'Polished the “Invite teammates” flow and tightened empty state guidance to reduce hesitation.',
        impact: 'Improves first-session clarity and reduces stalls at the invite step.',
        next: 'Monitor onboarding funnel for invite-start → invite-sent lift over the next 7 days.',
        resolved: true,
        createdAtISO: dateISO,
        timeLabel: 'Morning',
        timeMins: 560
      },
      {
        id: 'i_0b',
        type: 'decision',
        severity: 'watch',
        title: 'Make SSO optional for Pro trials; keep an admin reminder banner post-trial',
        context: 'Eng + Sales agreed trials shouldn’t be blocked by SSO configuration.',
        impact: 'Removes a common mid-market trial blocker while keeping a path to secure setup before paid.',
        next: 'Post decision in #launch-readiness and update trial checklist in docs.',
        resolved: false,
        createdAtISO: dateISO,
        timeLabel: 'Midday',
        timeMins: 760
      },
      {
        id: 'i_0c',
        type: 'decision',
        severity: 'warning',
        title: 'Confirm with Security whether we can log email domain for discovery flows',
        context: 'Discovery wants domain-based suggestions; privacy expectations vary by region.',
        impact: 'Potential compliance/trust issue if logged without explicit policy/consent.',
        next: 'Send a one-paragraph question to Security + Privacy with the exact data fields + retention.',
        resolved: false,
        createdAtISO: dateISO,
        timeLabel: 'Midday',
        timeMins: 820
      },
      {
        id: 'i_0d',
        type: 'risk',
        severity: 'critical',
        title: 'API rate-limit spikes on /events ingest after partner rollout',
        context: 'After the partner rollout, ingest traffic pattern changed; signs of backpressure.',
        impact: 'Could drop events → undercount activation and break dashboards; also risks delayed processing.',
        next: 'Confirm root cause with backend owner and agree on patch + rollout plan.',
        resolved: false,
        createdAtISO: dateISO,
        timeLabel: 'Afternoon',
        timeMins: 920
      },
      {
        id: 'i_0e',
        type: 'risk',
        severity: 'warning',
        title: 'Plan picker copy may confuse teams migrating from legacy billing',
        context: 'Migration cohorts may interpret “per seat” differently due to historical plan constraints.',
        impact: 'Conversion and support load risk if customers choose the wrong tier or pause checkout.',
        next: 'Schedule a 15-min design review to align on edge cases and success criteria.',
        resolved: false,
        createdAtISO: dateISO,
        timeLabel: 'Afternoon',
        timeMins: 980
      },
      {
        id: 'i_0f',
        type: 'ask',
        severity: 'warning',
        title: 'Need Backend to confirm ingest spike root cause + mitigation plan',
        context: 'Partner rollout changed traffic; need clarity on rate-limits and queue behavior.',
        impact: 'Unblocks correct incident response and prevents misleading product metrics.',
        next: 'Send ask: Backend • include by tomorrow EOD',
        resolved: false,
        createdAtISO: dateISO,
        timeLabel: 'EOD',
        timeMins: 1040
      },
      {
        id: 'i_0g',
        type: 'ask',
        severity: 'watch',
        title: 'Need Data to validate activation drop: instrumentation vs behavior',
        context: 'Sales Ops reported friction; need cohort definition sanity check.',
        impact: 'Prevents chasing the wrong root cause and avoids reactive scope changes.',
        next: 'Send ask: Data • include by this week',
        resolved: false,
        createdAtISO: dateISO,
        timeLabel: 'EOD',
        timeMins: 1060
      }
    ];
  }

  function demoItemsDay1(dateISO) {
    return [
      {
        id: 'i_1a',
        type: 'progress',
        severity: 'info',
        title: 'PRD v2 for “Workspace roles” circulated to Eng + Design',
        context: 'Updated scope, clarified success metrics, and added rollout plan for roles.',
        impact: 'Creates a single reference artifact for execution and reduces churn in ticket discussions.',
        next: 'Collect async feedback and lock v2 by Thursday.',
        resolved: true,
        createdAtISO: dateISO,
        timeLabel: 'Morning',
        timeMins: 600
      },
      {
        id: 'i_1b',
        type: 'progress',
        severity: 'info',
        title: 'Migration epic acceptance criteria tightened; 3 ambiguous tickets cleared',
        context: 'Removed “definition of done” ambiguity in edge cases that were blocking dev start.',
        impact: 'Avoids rework and aligns cross-team expectations earlier.',
        next: 'Ask QA to review the highest-risk edge cases for coverage.',
        resolved: true,
        createdAtISO: dateISO,
        timeLabel: 'Midday',
        timeMins: 780
      },
      {
        id: 'i_1c',
        type: 'decision',
        severity: 'watch',
        title: 'Ship role audit log in v1 even if UI is barebones',
        context: 'Aligned with Eng: value is existence + exportability; UI polish can follow.',
        impact: 'Reduces security objections and supports enterprise procurement checks.',
        next: 'Confirm decision in writing and update ticket acceptance criteria.',
        resolved: true,
        createdAtISO: dateISO,
        timeLabel: 'Afternoon',
        timeMins: 900
      },
      {
        id: 'i_1d',
        type: 'decision',
        severity: 'warning',
        title: 'De-scope multi-workspace bulk actions for GA',
        context: 'Not enough confidence in permissions model; risks accidental destructive operations.',
        impact: 'Cuts scope to protect reliability; may disappoint a small set of power users.',
        next: 'Confirm in writing (Slack/email) and add a follow-up item for post-GA roadmap.',
        resolved: false,
        createdAtISO: dateISO,
        timeLabel: 'Afternoon',
        timeMins: 960
      },
      {
        id: 'i_1e',
        type: 'risk',
        severity: 'warning',
        title: 'Escalations about “missing invites” after SCIM sync: misunderstanding or real bug',
        context: 'CS reports confusion when SCIM is enabled; invites may be suppressed intentionally.',
        impact: 'Trust risk with enterprise admins; could slow rollouts and increase churn risk.',
        next: 'Validate the failure mode with QA + instrumentation; propose mitigation options.',
        resolved: false,
        createdAtISO: dateISO,
        timeLabel: 'EOD',
        timeMins: 1040
      },
      {
        id: 'i_1f',
        type: 'ask',
        severity: 'watch',
        title: 'Need CS to share 5 recent SCIM escalation threads for classification',
        context: 'Need real examples to separate “expected behavior” from product gaps.',
        impact: 'Unblocks decision on whether to add UI education vs fix a bug.',
        next: 'Send ask: Support • include by this week',
        resolved: false,
        createdAtISO: dateISO,
        timeLabel: 'EOD',
        timeMins: 1060
      }
    ];
  }

  function demoItemsDay2(dateISO) {
    return [
      {
        id: 'i_2a',
        type: 'progress',
        severity: 'info',
        title: 'Triage of “permission denied” tickets: mostly role misconfiguration',
        context: 'Clustered tickets by scenario; most were missing “Billing admin” role assignments.',
        impact: 'Indicates we need better in-product education; not necessarily a platform bug.',
        next: 'Draft a tooltip + inline help proposal for roles screen.',
        resolved: true,
        createdAtISO: dateISO,
        timeLabel: 'Morning',
        timeMins: 560
      },
      {
        id: 'i_2b',
        type: 'progress',
        severity: 'info',
        title: 'Leadership 1-pager: trial-to-paid lever is first admin invite',
        context: 'Summarized conversion drivers and proposed a focused experiment on invite defaults.',
        impact: 'Creates executive clarity on where to focus and what to measure.',
        next: 'Review in weekly metrics meeting; align on experiment owner.',
        resolved: true,
        createdAtISO: dateISO,
        timeLabel: 'Midday',
        timeMins: 780
      },
      {
        id: 'i_2c',
        type: 'decision',
        severity: 'warning',
        title: 'Need Marketing alignment on “Free forever” language for pricing page',
        context: 'Pricing messaging affects expectations; legal/comms concerns possible.',
        impact: 'Messaging mismatch can create support load and downgrade trust post-checkout.',
        next: 'Confirm decision in writing and update the pricing page ticket.',
        resolved: false,
        createdAtISO: dateISO,
        timeLabel: 'Afternoon',
        timeMins: 900
      },
      {
        id: 'i_2d',
        type: 'risk',
        severity: 'critical',
        title: 'Admin verification requirement could tank activation for small teams',
        context: 'If invites are gated, SMB teams may stall before adding teammates.',
        impact: 'Activation and conversion risk; could reverse recent onboarding improvements.',
        next: 'Write a mitigation plan and test a lighter-weight verification path.',
        resolved: false,
        createdAtISO: dateISO,
        timeLabel: 'Afternoon',
        timeMins: 960
      },
      {
        id: 'i_2e',
        type: 'risk',
        severity: 'watch',
        title: 'Event naming inconsistencies make dashboards hard to trust',
        context: 'Analytics events have drifted across teams; definitions aren’t stable.',
        impact: 'Decision-making risk: teams debate the metric instead of acting on it.',
        next: 'Propose an event schema baseline and a 2-week cleanup sprint.',
        resolved: false,
        createdAtISO: dateISO,
        timeLabel: 'EOD',
        timeMins: 1040
      },
      {
        id: 'i_2f',
        type: 'ask',
        severity: 'watch',
        title: 'Need Design to propose a “Who should I invite?” default (SMB + mid-market)',
        context: 'Invite defaults should match both low-touch onboarding and IT-led rollouts.',
        impact: 'Unblocks a scoped experiment on invite guidance without building complex logic.',
        next: 'Send ask: Design • include by next week',
        resolved: false,
        createdAtISO: dateISO,
        timeLabel: 'EOD',
        timeMins: 1060
      }
    ];
  }
})();