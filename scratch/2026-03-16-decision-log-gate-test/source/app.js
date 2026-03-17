(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    lastRunAt: null,
    doc: {
      text: '',
      lines: [],
      words: 0,
      chars: 0
    },
    config: {
      passScore: 70,
      maxBlockers: 0,
      minWords: 220,
      strictMode: true
    },
    filter: {
      severity: 'all', // all | blocker | warning | info
      query: ''
    },
    analysis: {
      score: 0,
      verdict: '—', // PUBLISH | SCRATCH | —
      route: '—',
      rationale: '—',
      next: '—',
      issues: [],
      counts: { blocker: 0, warning: 0, info: 0 }
    },
    selection: {
      issueId: null
    },
    toastTimer: null,
    autoAnalyzeTimer: null
  };

  const TEMPLATE_PHRASES = [
    { phrase: '[trade-off', severity: 'blocker', label: 'BRACKET PROMPT' },
    { phrase: '[decision', severity: 'blocker', label: 'BRACKET PROMPT' },
    { phrase: '[context', severity: 'warning', label: 'BRACKET PROMPT' },
    { phrase: 'lorem ipsum', severity: 'blocker', label: 'PLACEHOLDER' },
    { phrase: 'john doe', severity: 'warning', label: 'PLACEHOLDER' },
    { phrase: 'example.com', severity: 'warning', label: 'PLACEHOLDER' },
    { phrase: 'kept it simple', severity: 'blocker', label: 'VAGUE' },
    { phrase: 'out of scope', severity: 'warning', label: 'VAGUE' },
    { phrase: 'best practice', severity: 'warning', label: 'VAGUE' },
    { phrase: 'various stakeholders', severity: 'warning', label: 'VAGUE' },
    { phrase: 'tbd', severity: 'warning', label: 'PLACEHOLDER' },
    { phrase: 'todo', severity: 'warning', label: 'PLACEHOLDER' }
  ];

  const SIGNALS = [
    {
      id: 'has-title',
      label: 'HAS TITLE',
      severity: 'warning',
      weight: 6,
      check: (doc) => /(^|\n)#{1,2}\s+\S.+/m.test(doc.text),
      why: 'Decision logs without a clear title are harder to scan in PR review.',
      fix: 'Add a single H1 title at the top that names the decision, not the feature.',
      signal: 'STRUCTURE'
    },
    {
      id: 'has-date',
      label: 'HAS DATE',
      severity: 'warning',
      weight: 5,
      check: (doc) => /(^|\n)(date|when)\s*:\s*\d{4}-\d{2}-\d{2}/im.test(doc.text),
      why: 'A date anchors the decision in time and avoids “floating” rationale.',
      fix: 'Add `Date: YYYY-MM-DD` near the top.',
      signal: 'STRUCTURE'
    },
    {
      id: 'has-why-exists',
      label: 'SPECIFIC PROBLEM MOMENT',
      severity: 'warning',
      weight: 10,
      check: (doc) => {
        const t = doc.text.toLowerCase();
        const hasPersona = /\b(cx|support|ops|reviewer|pm|on-call|analyst|lead)\b/.test(t);
        const hasMoment = /\b(pr review|review|handoff|incident|launch|migration|rollout|triage)\b/.test(t);
        const hasConsequence = /\b(waste|blocks|late|miss|ship|regression|confusion|rework|delay)\b/.test(t);
        return hasPersona && hasMoment && hasConsequence;
      },
      why: '“Why it exists” needs a persona + moment + consequence, not a generic statement.',
      fix: 'Rewrite the problem as: who, when, what goes wrong, and what it costs.',
      signal: 'SPECIFICITY'
    },
    {
      id: 'min-words',
      label: 'MIN WORD COUNT',
      severity: 'warning',
      weight: 12,
      check: (doc, cfg) => doc.words >= cfg.minWords,
      why: 'Very short logs often only restate the template headings without real trade-offs.',
      fix: 'Add concrete context, alternatives considered, and the “why now” in plain language.',
      signal: 'COMPLETENESS'
    },
    {
      id: 'no-bracket-prompts',
      label: 'NO BRACKET PROMPTS',
      severity: 'blocker',
      weight: 22,
      check: (doc) => !/\[[^\]]{2,80}\]/.test(doc.text),
      why: 'Bracket prompts (“[Trade-off title]”) indicate template text was not replaced.',
      fix: 'Search for `[` and replace every bracket prompt with real content, or remove the line.',
      signal: 'TEMPLATE'
    },
    {
      id: 'no-todo-tbd',
      label: 'NO TBD / TODO',
      severity: 'warning',
      weight: 10,
      check: (doc) => !/\b(tbd|todo)\b/i.test(doc.text),
      why: 'TBD/TODO reads as unfinished analysis and makes the log unsafe to publish as “judgment.”',
      fix: 'Replace TBD/TODO with a decision, or move open questions into a clearly labeled “Open Questions” section.',
      signal: 'FINISHING'
    },
    {
      id: 'has-explicit-left-out',
      label: 'WHAT WAS LEFT OUT PRESENT',
      severity: 'warning',
      weight: 10,
      check: (doc) => /\bwhat was left out\b/i.test(doc.text) || /(^|\n)#+\s+left out\b/im.test(doc.text),
      why: 'Reviewers look for explicit scope boundaries; without them, “done” is ambiguous.',
      fix: 'Add a “What Was Left Out” section with at least two exclusions and reasons.',
      signal: 'SCOPE'
    },
    {
      id: 'has-alternatives',
      label: 'ALTERNATIVES NAMED',
      severity: 'warning',
      weight: 10,
      check: (doc) => /\balternative(s)?\b/i.test(doc.text) || /\bconsidered\b/i.test(doc.text) || /\bover\b/i.test(doc.text),
      why: 'A decision without alternatives reads like a default choice, not a judgment call.',
      fix: 'Name 2 alternatives and why they were rejected for this context.',
      signal: 'TRADEOFF'
    },
    {
      id: 'has-tradeoff-language',
      label: 'TRADE-OFF LANGUAGE',
      severity: 'warning',
      weight: 10,
      check: (doc) => {
        const t = doc.text.toLowerCase();
        return /\btrade[-\s]?off\b/.test(t) || /\bcost\b/.test(t) || /\brisk\b/.test(t) || /\bdownside\b/.test(t);
      },
      why: 'Explicit trade-offs (costs/risks) separate judgment from narration.',
      fix: 'Add one downside you accepted and one risk you mitigated.',
      signal: 'TRADEOFF'
    },
    {
      id: 'avoids-vague-exclusions',
      label: 'NO VAGUE EXCLUSIONS',
      severity: 'warning',
      weight: 8,
      check: (doc) => !/\bout of scope\b/i.test(doc.text),
      why: '“Out of scope” is a non-decision unless it names what and why.',
      fix: 'Replace “out of scope” with specific exclusions and the reason (time, complexity, dependency).',
      signal: 'SCOPE'
    },
    {
      id: 'avoids-kept-simple',
      label: 'NO “KEPT IT SIMPLE”',
      severity: 'blocker',
      weight: 16,
      check: (doc) => !/\bkept it simple\b/i.test(doc.text),
      why: '“Kept it simple” hides the actual trade-off. Reviewers can’t evaluate the judgment.',
      fix: 'State what was simplified, the consequence of simplifying, and what would change your decision.',
      signal: 'VAGUENESS'
    },
    {
      id: 'has-acceptance-criteria',
      label: 'HAS “DONE” DEFINITION',
      severity: 'info',
      weight: 6,
      check: (doc) => /\b(acceptance criteria|success criteria|definition of done|done when)\b/i.test(doc.text),
      why: 'Success criteria makes the decision falsifiable and improves review quality.',
      fix: 'Add 2–4 bullet success criteria (“done when…”) tied to the decision.',
      signal: 'QUALITY'
    },
    {
      id: 'has-metrics-or-measurement',
      label: 'MEASUREMENT MENTIONED',
      severity: 'info',
      weight: 6,
      check: (doc) => /\b(metric|measure|rate|latency|csat|nps|sla|time to|error|incident|deflection)\b/i.test(doc.text),
      why: 'Mentioning measurement indicates the decision can be verified in production.',
      fix: 'Add one metric you’ll monitor and a rough baseline/target if you have it.',
      signal: 'QUALITY'
    },
    {
      id: 'no-ai-filler-words',
      label: 'NO CORP-FILLER',
      severity: 'warning',
      weight: 8,
      check: (doc) => {
        const t = doc.text.toLowerCase();
        const bad = ['seamlessly', 'leverage', 'utilize', 'empower'];
        return !bad.some(w => t.includes(w));
      },
      why: 'Filler words correlate with generic, non-specific decision logs.',
      fix: 'Replace corp-filler with concrete verbs and constraints.',
      signal: 'CLARITY'
    }
  ];

  const ISSUE_LIBRARY = {
    'no-bracket-prompts': {
      title: 'Bracket prompts detected',
      why: 'Bracket prompts are template markers. Reviewers interpret them as “this was not written.”',
      fix: 'Replace bracket prompts with real content. If a section isn’t needed, delete it entirely.',
      next: 'Search for `[` and ensure there are zero bracket tokens in the final log.'
    },
    'avoids-kept-simple': {
      title: 'Vague trade-off phrase (“kept it simple”)',
      why: 'The phrase hides the decision’s cost. It reads like justification, not reasoning.',
      fix: 'Write: what you simplified, why, what you gave up, and the trigger for revisiting.',
      next: 'Add one sentence each for: simplification, downside, revisit trigger.'
    },
    'avoids-vague-exclusions': {
      title: '“Out of scope” without specifics',
      why: '“Out of scope” is a label, not a boundary. It blocks review because it’s not testable.',
      fix: 'Name 2 things you are not building and why (time, complexity, dependency).',
      next: 'Replace the phrase with explicit exclusions + reasons.'
    },
    'min-words': {
      title: 'Too short to carry real judgment',
      why: 'Short logs can be structurally correct while containing only headings and thin rationale.',
      fix: 'Add: context, alternatives, risks, “what was left out,” and success criteria.',
      next: 'Expand with one paragraph per: context, alternatives, trade-off, left out.'
    },
    'has-alternatives': {
      title: 'Alternatives not named',
      why: 'Without alternatives, the decision looks like a default choice (not evaluated judgment).',
      fix: 'Add a short “Alternatives considered” list and why each was rejected.',
      next: 'Include at least 2 alternatives + rejection reasons.'
    },
    'has-explicit-left-out': {
      title: 'Missing “What Was Left Out” boundary',
      why: 'Reviewers need to see where you intentionally stopped to assess risk and completeness.',
      fix: 'Add “What Was Left Out” with at least two exclusions, each with a reason.',
      next: 'Write 2 bullet exclusions + rationale.'
    },
    'has-why-exists': {
      title: 'Problem statement not specific enough',
      why: 'A decision log is evidence of judgment; generic problem statements weaken it.',
      fix: 'Write: persona + moment + consequence. Make it one tight paragraph.',
      next: 'Include who, when, what fails, and cost.'
    }
  };

  const els = {};
  function cacheEls() {
    els.kpiVerdict = $('#kpiVerdict');
    els.kpiScore = $('#kpiScore');
    els.kpiBlockers = $('#kpiBlockers');

    els.btnLoadDemo = $('#btnLoadDemo');
    els.btnAnalyze = $('#btnAnalyze');
    els.btnCopyReport = $('#btnCopyReport');
    els.btnReset = $('#btnReset');

    els.inputPassScore = $('#inputPassScore');
    els.inputMaxBlockers = $('#inputMaxBlockers');
    els.inputMinWords = $('#inputMinWords');
    els.inputStrictMode = $('#inputStrictMode');

    els.filterChips = $$('.chip');
    els.activeFilterLabel = $('#activeFilterLabel');

    els.lastRun = $('#lastRun');
    els.docStats = $('#docStats');
    els.phraseList = $('#phraseList');

    els.toggleLineNumbers = $('#toggleLineNumbers');
    els.toggleAutoAnalyze = $('#toggleAutoAnalyze');

    els.gutter = $('#gutter');
    els.inputText = $('#inputText');
    els.inputHint = $('#inputHint');
    els.cursorInfo = $('#cursorInfo');

    els.inputSearch = $('#inputSearch');

    els.issuesTbody = $('#issuesTbody');
    els.issuesSummary = $('#issuesSummary');

    els.detailTitle = $('#detailTitle');
    els.detailMeta = $('#detailMeta');
    els.detailWhy = $('#detailWhy');
    els.detailFix = $('#detailFix');
    els.detailSnippet = $('#detailSnippet');
    els.btnJumpToLine = $('#btnJumpToLine');
    els.btnCopyFix = $('#btnCopyFix');

    els.recMeta = $('#recMeta');
    els.recRoute = $('#recRoute');
    els.recRationale = $('#recRationale');
    els.recNext = $('#recNext');

    els.reviewComment = $('#reviewComment');
    els.btnCopyComment = $('#btnCopyComment');
    els.btnClearSelection = $('#btnClearSelection');

    els.toast = $('#toast');
  }

  function fmtTime(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function toast(msg) {
    clearTimeout(state.toastTimer);
    els.toast.textContent = msg;
    els.toast.style.display = 'block';
    state.toastTimer = setTimeout(() => {
      els.toast.style.display = 'none';
    }, 1400);
  }

  function setConfigFromInputs() {
    state.config.passScore = clampInt(parseInt(els.inputPassScore.value, 10), 0, 100, 70);
    state.config.maxBlockers = clampInt(parseInt(els.inputMaxBlockers.value, 10), 0, 10, 0);
    state.config.minWords = clampInt(parseInt(els.inputMinWords.value, 10), 80, 2000, 220);
    state.config.strictMode = els.inputStrictMode.value === 'on';
  }

  function clampInt(v, min, max, fallback) {
    if (!Number.isFinite(v)) return fallback;
    return Math.max(min, Math.min(max, v));
  }

  function computeDoc(text) {
    const normalized = text.replaceAll('\r\n', '\n');
    const lines = normalized.split('\n');
    const words = (normalized.match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) || []).length;
    return {
      text: normalized,
      lines,
      words,
      chars: normalized.length
    };
  }

  function lineOfMatch(doc, matcher) {
    for (let i = 0; i < doc.lines.length; i++) {
      if (matcher(doc.lines[i], i)) return i + 1;
    }
    return null;
  }

  function findFirstRegexLine(doc, regex) {
    return lineOfMatch(doc, (line) => regex.test(line));
  }

  function severityRank(s) {
    if (s === 'blocker') return 3;
    if (s === 'warning') return 2;
    return 1;
  }

  function analyzeDoc(doc, cfg) {
    const issues = [];

    const strict = cfg.strictMode;

    for (const sig of SIGNALS) {
      const passed = sig.check(doc, cfg);
      if (passed) continue;

      let sev = sig.severity;
      let weight = sig.weight;

      if (!strict) {
        if (sig.id === 'no-bracket-prompts') {
          sev = 'warning';
          weight = Math.round(weight * 0.65);
        }
        if (sig.id === 'avoids-kept-simple') {
          sev = 'warning';
          weight = Math.round(weight * 0.7);
        }
      }

      const line = inferLineForSignal(sig.id, doc);
      const snippet = buildSnippet(doc, line);

      issues.push({
        id: `${sig.id}:${issues.length + 1}`,
        signalId: sig.id,
        signal: sig.signal,
        label: sig.label,
        severity: sev,
        weight,
        line,
        detail: buildDetail(sig.id, sig.label, doc, cfg),
        why: (ISSUE_LIBRARY[sig.id]?.why) || sig.why,
        fix: (ISSUE_LIBRARY[sig.id]?.fix) || sig.fix,
        next: (ISSUE_LIBRARY[sig.id]?.next) || 'Revise the document and re-run the gate.',
        snippet
      });
    }

    // Template phrase occurrences as issues (secondary signals)
    const phraseHits = findTemplatePhrases(doc);
    for (const hit of phraseHits) {
      let sev = hit.severity;
      let weight = hit.severity === 'blocker' ? 10 : hit.severity === 'warning' ? 6 : 4;

      if (!strict && sev === 'blocker') {
        sev = 'warning';
        weight = 6;
      }

      issues.push({
        id: `phrase:${hit.phrase}:${hit.line}`,
        signalId: 'template-phrase',
        signal: 'PHRASE',
        label: hit.label,
        severity: sev,
        weight,
        line: hit.line,
        detail: `Matched phrase: “${hit.phrase}”`,
        why: 'Template-like phrases correlate with low-signal decision logs that pass structure checks but fail judgment checks.',
        fix: 'Replace the phrase with concrete specifics (what, why, trade-off, constraints).',
        next: 'Rewrite the sentence containing the phrase to include measurable or contextual detail.',
        snippet: buildSnippet(doc, hit.line)
      });
    }

    // Deduplicate by id (some phrase ids unique) & sort
    const sorted = issues
      .sort((a, b) => {
        const r = severityRank(b.severity) - severityRank(a.severity);
        if (r !== 0) return r;
        const w = (b.weight || 0) - (a.weight || 0);
        if (w !== 0) return w;
        return (a.line || 1e9) - (b.line || 1e9);
      });

    const counts = { blocker: 0, warning: 0, info: 0 };
    for (const it of sorted) counts[it.severity] = (counts[it.severity] || 0) + 1;

    const score = computeScore(sorted, cfg);
    const verdict = computeVerdict(score, counts, cfg);
    const recommendation = computeRecommendation(verdict, score, counts, cfg, doc);

    return {
      score,
      verdict,
      counts,
      issues: sorted,
      ...recommendation
    };
  }

  function computeScore(issues, cfg) {
    // Start at 100; subtract weights with a cap. Keep dense + interpretable.
    let score = 100;
    for (const issue of issues) {
      const mult = issue.severity === 'blocker' ? 1.0 : issue.severity === 'warning' ? 0.65 : 0.35;
      score -= (issue.weight || 0) * mult;
    }
    score = Math.round(Math.max(0, Math.min(100, score)));
    // If too short, clamp to max 69 in strict to prevent accidental publish on tiny docs.
    if (cfg.strictMode && state.doc.words < cfg.minWords) score = Math.min(score, 69);
    return score;
  }

  function computeVerdict(score, counts, cfg) {
    if (counts.blocker > cfg.maxBlockers) return 'SCRATCH';
    if (score >= cfg.passScore) return 'PUBLISH';
    return 'SCRATCH';
  }

  function computeRecommendation(verdict, score, counts, cfg, doc) {
    const route = verdict === 'PUBLISH' ? '/projects' : '/scratch';
    const blockerText = counts.blocker === 1 ? '1 blocker' : `${counts.blocker} blockers`;
    const warningText = counts.warning === 1 ? '1 warning' : `${counts.warning} warnings`;

    let rationale = `Score ${score}/100 with ${blockerText}, ${warningText}.`;
    if (counts.blocker > cfg.maxBlockers) {
      rationale += ` Blockers exceed MAX BLOCKERS (${cfg.maxBlockers}).`;
    } else if (score < cfg.passScore) {
      rationale += ` Score below PASS SCORE (${cfg.passScore}).`;
    } else {
      rationale += ` Meets PASS SCORE and blocker threshold.`;
    }

    let next = 'Resolve blockers first, then re-run the gate.';
    if (verdict === 'PUBLISH') next = 'Add a screenshot and proceed with PR review.';
    if (verdict === 'SCRATCH' && doc.words < cfg.minWords) {
      next = `Expand the log (min ${cfg.minWords} words), then fix template markers.`;
    }

    return { route, rationale, next };
  }

  function inferLineForSignal(signalId, doc) {
    const t = doc.text;

    if (signalId === 'no-bracket-prompts') {
      return findFirstRegexLine(doc, /\[[^\]]{2,80}\]/);
    }
    if (signalId === 'avoids-kept-simple') {
      return findFirstRegexLine(doc, /\bkept it simple\b/i);
    }
    if (signalId === 'avoids-vague-exclusions') {
      return findFirstRegexLine(doc, /\bout of scope\b/i);
    }
    if (signalId === 'no-todo-tbd') {
      return findFirstRegexLine(doc, /\b(tbd|todo)\b/i);
    }
    if (signalId === 'has-explicit-left-out') {
      // If missing, point at top
      return 1;
    }
    if (signalId === 'has-alternatives') {
      return 1;
    }
    if (signalId === 'has-why-exists') {
      const line = findFirstRegexLine(doc, /\b(problem|why it exists)\b/i);
      return line || 1;
    }
    if (signalId === 'has-title') {
      return 1;
    }
    if (signalId === 'has-date') {
      return 1;
    }
    if (signalId === 'min-words') {
      return 1;
    }
    if (signalId === 'has-tradeoff-language') {
      return 1;
    }
    if (signalId === 'has-acceptance-criteria') {
      return 1;
    }
    if (signalId === 'has-metrics-or-measurement') {
      return 1;
    }
    if (signalId === 'no-ai-filler-words') {
      // Find first offending word
      const bad = ['seamlessly', 'leverage', 'utilize', 'empower'];
      for (const w of bad) {
        const rx = new RegExp(`\\b${w}\\b`, 'i');
        const line = findFirstRegexLine(doc, rx);
        if (line) return line;
      }
      return 1;
    }

    // fallback
    if (t.length === 0) return 1;
    return 1;
  }

  function buildDetail(signalId, label, doc, cfg) {
    if (signalId === 'min-words') {
      return `Word count ${doc.words} < MIN DECISION WORDS (${cfg.minWords})`;
    }
    if (signalId === 'has-date') return 'No `Date: YYYY-MM-DD` line found';
    if (signalId === 'has-title') return 'No Markdown H1/H2 title found';
    return label;
  }

  function buildSnippet(doc, lineNumber) {
    if (!lineNumber) return '—';
    const idx = Math.max(1, Math.min(doc.lines.length, lineNumber)) - 1;
    const start = Math.max(0, idx - 2);
    const end = Math.min(doc.lines.length, idx + 3);
    const block = [];
    for (let i = start; i < end; i++) {
      const ln = String(i + 1).padStart(3, ' ');
      const content = doc.lines[i];
      block.push(`${ln} | ${content}`);
    }
    return block.join('\n');
  }

  function findTemplatePhrases(doc) {
    const hits = [];
    const lowerLines = doc.lines.map(l => l.toLowerCase());
    for (let i = 0; i < lowerLines.length; i++) {
      const line = lowerLines[i];
      for (const p of TEMPLATE_PHRASES) {
        if (line.includes(p.phrase)) {
          hits.push({
            phrase: p.phrase,
            label: p.label,
            severity: p.severity,
            line: i + 1
          });
        }
      }
    }
    return hits;
  }

  function renderPhraseList() {
    els.phraseList.innerHTML = '';
    for (const p of TEMPLATE_PHRASES) {
      const row = document.createElement('div');
      row.className = 'phrase';
      const txt = document.createElement('div');
      txt.className = 'phrase__txt';
      txt.textContent = p.phrase;
      const tag = document.createElement('div');
      tag.className = `phrase__tag ${p.severity === 'blocker' ? 'tag--neg' : p.severity === 'warning' ? 'tag--warn' : 'tag--info'}`;
      tag.textContent = p.severity.toUpperCase();
      row.appendChild(txt);
      row.appendChild(tag);
      els.phraseList.appendChild(row);
    }
  }

  function renderKPIs() {
    const { verdict, score, counts } = state.analysis;

    els.kpiVerdict.textContent = verdict;
    els.kpiScore.textContent = `${score}/100`;
    els.kpiBlockers.textContent = String(counts.blocker);

    if (verdict === 'PUBLISH') {
      els.kpiVerdict.style.color = 'var(--pos)';
    } else if (verdict === 'SCRATCH') {
      els.kpiVerdict.style.color = 'var(--neg)';
    } else {
      els.kpiVerdict.style.color = 'var(--text)';
    }

    els.kpiScore.style.color = score >= state.config.passScore ? 'var(--pos)' : 'var(--warn)';
  }

  function renderMeta() {
    els.lastRun.textContent = state.lastRunAt ? fmtTime(state.lastRunAt) : '—';
    els.docStats.textContent = `${state.doc.lines.length} lines / ${state.doc.words} words / ${state.doc.chars} chars`;
  }

  function renderIssuesTable() {
    const filtered = getFilteredIssues();
    const selId = state.selection.issueId;

    els.issuesTbody.innerHTML = '';

    if (state.doc.text.trim().length === 0) {
      els.issuesSummary.textContent = 'No input yet — load demo or paste a decision log.';
      return;
    }

    if (state.analysis.issues.length === 0) {
      els.issuesSummary.textContent = 'No issues detected. (This is rare — double-check strict mode.)';
    } else {
      const c = state.analysis.counts;
      els.issuesSummary.textContent = `${state.analysis.issues.length} issues — ${c.blocker} blockers, ${c.warning} warnings, ${c.info} info`;
    }

    for (const it of filtered) {
      const tr = document.createElement('tr');
      if (it.id === selId) tr.classList.add('is-selected');

      const tdSev = document.createElement('td');
      tdSev.className = 'cell-mono';
      const badge = document.createElement('span');
      badge.className = `badge ${it.severity === 'blocker' ? 'badge--blocker' : it.severity === 'warning' ? 'badge--warning' : 'badge--info'}`;
      badge.textContent = it.severity;
      tdSev.appendChild(badge);

      const tdSignal = document.createElement('td');
      tdSignal.className = 'cell-mono';
      tdSignal.textContent = it.signal;

      const tdDetail = document.createElement('td');
      tdDetail.innerHTML = escapeHtml(it.detail);

      const tdLine = document.createElement('td');
      tdLine.className = 'cell-mono cell-muted';
      tdLine.textContent = it.line ? `Ln ${it.line}` : '—';

      tr.appendChild(tdSev);
      tr.appendChild(tdSignal);
      tr.appendChild(tdDetail);
      tr.appendChild(tdLine);

      tr.addEventListener('click', () => {
        state.selection.issueId = it.id;
        renderIssuesTable();
        renderDetail();
      });

      els.issuesTbody.appendChild(tr);
    }
  }

  function getFilteredIssues() {
    const { severity, query } = state.filter;
    const q = query.trim().toLowerCase();

    return state.analysis.issues.filter(it => {
      const sevOk = severity === 'all' ? true : it.severity === severity;
      if (!sevOk) return false;
      if (!q) return true;
      const hay = `${it.severity} ${it.signal} ${it.label} ${it.detail} ${it.why} ${it.fix}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function renderDetail() {
    const issue = state.analysis.issues.find(i => i.id === state.selection.issueId) || null;

    if (!issue) {
      els.detailTitle.textContent = 'No selection';
      els.detailMeta.textContent = '—';
      els.detailWhy.textContent = 'Select a row in the issues table.';
      els.detailFix.textContent = '—';
      els.detailSnippet.textContent = '—';
      els.btnJumpToLine.disabled = true;
      els.btnCopyFix.disabled = true;
    } else {
      els.detailTitle.textContent = issue.label;
      els.detailMeta.textContent = `${issue.severity.toUpperCase()} • ${issue.signal}${issue.line ? ` • LN ${issue.line}` : ''}`;
      els.detailWhy.textContent = issue.why;
      els.detailFix.textContent = issue.fix;
      els.detailSnippet.textContent = issue.snippet || '—';
      els.btnJumpToLine.disabled = !issue.line;
      els.btnCopyFix.disabled = false;
    }

    // Recommendation box always reflects latest analysis
    els.recMeta.textContent = state.lastRunAt ? `LAST RUN ${fmtTime(state.lastRunAt)}` : '—';
    els.recRoute.textContent = state.analysis.route;
    els.recRationale.textContent = state.analysis.rationale;
    els.recNext.textContent = state.analysis.next;

    // Review comment (structured, not a wall of text)
    els.reviewComment.value = buildReviewComment();

    renderKPIs();
    renderMeta();
  }

  function buildReviewComment() {
    if (!state.doc.text.trim()) {
      return [
        'Decision log gate: no input detected.',
        '',
        '- Please paste the draft decision log and re-run the gate.',
      ].join('\n');
    }

    const c = state.analysis.counts;
    const strict = state.config.strictMode ? 'ON' : 'OFF';
    const header = `Decision log gate (${strict}): ${state.analysis.verdict} → ${state.analysis.route}`;
    const summary = `Score ${state.analysis.score}/100 • ${c.blocker} blocker(s), ${c.warning} warning(s), ${c.info} info`;
    const top = state.analysis.issues.slice(0, 5);

    const bullets = top.map(it => {
      const ln = it.line ? ` (Ln ${it.line})` : '';
      return `- ${it.severity.toUpperCase()}: ${it.detail}${ln}`;
    });

    const next = state.analysis.verdict === 'PUBLISH'
      ? '- Next: add screenshot + proceed with PR review.'
      : '- Next: resolve blockers, then re-run. If still failing, expand the “why” + alternatives + left-out boundary.';

    return [header, summary, '', ...bullets, '', next].join('\n');
  }

  function setFilter(sev) {
    state.filter.severity = sev;
    for (const chip of els.filterChips) {
      const active = chip.dataset.filter === sev;
      chip.classList.toggle('chip--active', active);
    }
    els.activeFilterLabel.textContent = `FILTER: ${sev.toUpperCase()}`;
    renderIssuesTable();
  }

  function syncGutter() {
    const show = els.toggleLineNumbers.checked;
    els.gutter.style.display = show ? 'block' : 'none';

    if (!show) return;

    const n = state.doc.lines.length || 1;
    const lines = [];
    for (let i = 1; i <= n; i++) lines.push(String(i));
    els.gutter.textContent = lines.join('\n');

    // Scroll sync
    els.gutter.scrollTop = els.inputText.scrollTop;
  }

  function updateCursorInfo() {
    const ta = els.inputText;
    const pos = ta.selectionStart || 0;
    const upTo = ta.value.slice(0, pos);
    const lines = upTo.split('\n');
    const ln = lines.length;
    const col = lines[lines.length - 1].length + 1;
    els.cursorInfo.textContent = `Ln ${ln}, Col ${col}`;
  }

  function jumpToLine(line) {
    const ta = els.inputText;
    const target = Math.max(1, Math.min(state.doc.lines.length || 1, line));

    // Compute index by summing lengths
    let idx = 0;
    for (let i = 0; i < target - 1; i++) idx += state.doc.lines[i].length + 1;

    ta.focus();
    ta.setSelectionRange(idx, idx);
    // Scroll roughly into view
    const approxLineHeight = 18; // dense console; close enough
    ta.scrollTop = Math.max(0, (target - 3) * approxLineHeight);
    syncGutter();
    updateCursorInfo();
  }

  function copyToClipboard(text) {
    const t = String(text || '');
    if (!t) return false;

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(t).then(
        () => toast('COPIED'),
        () => fallbackCopy(t)
      );
      return true;
    }
    return fallbackCopy(t);
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', 'readonly');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    toast(ok ? 'COPIED' : 'COPY FAILED');
    return ok;
  }

  function runAnalysis() {
    setConfigFromInputs();
    state.doc = computeDoc(els.inputText.value);
    state.lastRunAt = Date.now();

    state.analysis = analyzeDoc(state.doc, state.config);

    state.selection.issueId = null;
    renderAll();

    if (state.analysis.verdict === 'PUBLISH') {
      els.inputHint.textContent = 'Gate passed. Sanity-check the log, then proceed.';
    } else {
      els.inputHint.textContent = 'Gate failed. Resolve blockers/warnings, then re-run.';
    }
  }

  function renderAll() {
    syncGutter();
    renderKPIs();
    renderMeta();
    renderIssuesTable();
    renderDetail();
  }

  function scheduleAutoAnalyze() {
    clearTimeout(state.autoAnalyzeTimer);
    if (!els.toggleAutoAnalyze.checked) return;
    state.autoAnalyzeTimer = setTimeout(() => {
      runAnalysis();
    }, 450);
  }

  function loadDemo() {
    const demo = [
      '# Decision Log — Gate harness for template-y decision logs',
      'Date: 2026-03-16',
      '',
      '## What It Is',
      'A local-only harness that flags “template-y” decision logs (bracket prompts, vague trade-offs, incomplete boundaries) and outputs a publish vs.