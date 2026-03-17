(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const STORAGE_KEYS = {
    draft: 'fvr:draft:v1',
    runs: 'fvr:runs:v1',
    decisions: 'fvr:decisions:v1',
    settings: 'fvr:settings:v1'
  };

  const DEFAULT_SETTINGS = {
    autosave: 'on',
    scanlines: 'on',
    motion: 'subtle',
    tokenMode: 'chars4'
  };

  const state = {
    activeView: 'dashboard',
    activeTab: 'readme',
    lastPack: null,
    settings: { ...DEFAULT_SETTINGS },
    draft: null,
    runs: [],
    decisions: []
  };

  function safeJsonParse(s, fallback) {
    try { return JSON.parse(s); } catch { return fallback; }
  }

  function loadAll() {
    state.settings = { ...DEFAULT_SETTINGS, ...(safeJsonParse(localStorage.getItem(STORAGE_KEYS.settings), null) || {}) };
    state.draft = safeJsonParse(localStorage.getItem(STORAGE_KEYS.draft), null);
    state.runs = safeJsonParse(localStorage.getItem(STORAGE_KEYS.runs), []) || [];
    state.decisions = safeJsonParse(localStorage.getItem(STORAGE_KEYS.decisions), []) || [];
  }

  function persist(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function nowISO() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function fmtClock() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function estimateTokens(charCount) {
    const mode = state.settings.tokenMode;
    const div = mode === 'chars35' ? 3.5 : mode === 'chars5' ? 5 : 4;
    return Math.ceil(charCount / div);
  }

  function setRootToggles() {
    const root = document.documentElement;
    root.style.setProperty('--scanOn', state.settings.scanlines === 'on' ? '1' : '0');
    root.style.setProperty('--motionOn', state.settings.motion === 'off' ? '0' : '1');
  }

  function diag(line, kind = 'meta') {
    const log = $('#diagLog');
    const div = document.createElement('div');
    div.className = `line ${kind}`;
    div.textContent = `${fmtClock()}  ${line}`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function clearDiag() {
    $('#diagLog').innerHTML = '';
    diag('DIAGNOSTICS CLEARED', 'meta');
  }

  function sweep() {
    const el = $('#sweep');
    el.classList.remove('on');
    // force reflow
    void el.offsetWidth;
    el.classList.add('on');
    setTimeout(() => el.classList.remove('on'), 220);
  }

  function slotUpdate(el, targetValue) {
    const motionOn = state.settings.motion !== 'off';
    if (!motionOn) { el.textContent = String(targetValue); return; }
    const from = el.textContent.trim();
    const to = String(targetValue);
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ—';
    const maxLen = Math.max(from.length, to.length, 1);
    const duration = 200;
    const start = performance.now();

    function tick(t) {
      const p = Math.min(1, (t - start) / duration);
      let out = '';
      for (let i = 0; i < maxLen; i++) {
        const finalCh = to[i] ?? ' ';
        if (p < 0.85) {
          out += chars[(Math.random() * chars.length) | 0];
        } else {
          out += finalCh;
        }
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = to;
    }
    requestAnimationFrame(tick);
  }

  function getDraftFromUI() {
    return {
      projName: $('#projName').value.trim(),
      category: $('#category').value.trim(),
      styleId: $('#styleId').value.trim(),
      budget: Math.max(512, parseInt($('#budget').value || '7600', 10)),
      features: $('#features').value.split('\n').map(s => s.trim()).filter(Boolean),
      constraints: $('#constraints').value.trim()
    };
  }

  function setUIFromDraft(d) {
    if (!d) return;
    $('#projName').value = d.projName ?? 'Fix Verification Run';
    $('#category').value = d.category ?? 'PM productivity tools';
    $('#styleId').value = d.styleId ?? 'retro-future';
    $('#budget').value = d.budget ?? 7600;
    $('#features').value = (d.features ?? []).join('\n');
    $('#constraints').value = d.constraints ?? '';
  }

  function computeStructureChecks(pack) {
    const checks = [];

    function hasAll(text, needles) { return needles.every(n => text.includes(n)); }
    function countHeadings(md) { return (md.match(/^##\s+/gm) || []).length + (md.match(/^###\s+/gm) || []).length; }

    const readme = pack.readme || '';
    const manifest = pack.manifest || '';
    const decisions = pack.decisions || '';
    const compliance = pack.compliance || '';

    checks.push({
      name: 'README sections present',
      ok: hasAll(readme, ['# ', '## Goal', '## Problem', '## Requirements', '## How to Run', '## Diagnostics', '## Output Files'])
    });
    checks.push({
      name: 'Manifest JSON parseable',
      ok: (() => { try { JSON.parse(manifest); return true; } catch { return false; } })()
    });
    checks.push({ name: 'Decision log has entries header', ok: decisions.includes('# Decision Log') && decisions.includes('## Entries') });
    checks.push({ name: 'Compliance notes include style', ok: compliance.toLowerCase().includes('retro-future') && compliance.toLowerCase().includes('glow') });
    checks.push({ name: 'README density (headings >= 8)', ok: countHeadings(readme) >= 8 });
    checks.push({ name: 'Token budget under ceiling tag', ok: pack.estTokens <= pack.budget });

    const totalChars = readme.length + manifest.length + decisions.length + compliance.length;
    const density = totalChars >= 4500; // intentionally “rich” but still safe
    checks.push({ name: 'Content density (>= 4500 chars)', ok: density });

    return checks;
  }

  function riskLevel(pack, checks) {
    const fail = checks.filter(c => !c.ok).length;
    const pct = pack.estTokens / Math.max(pack.budget, 1);
    if (fail >= 3) return 'HIGH';
    if (pct >= 0.95 || fail === 2) return 'MED';
    return 'LOW';
  }

  function makePack(draft) {
    const time = nowISO();
    const runId = `RUN-${time.replace(/[-:]/g,'').replace('T','-')}`;

    const featureBullets = draft.features.map(f => `- ${f}`).join('\n');
    const reqs = [
      '- Output multi-file artifacts: README, manifest, decision log, compliance notes.',
      '- Keep high content density without truncation; maintain section structure.',
      '- Provide fast diagnostics: explain failures in under 2 minutes.',
      '- Budget-aware: estimate tokens and alarm when near ceiling.',
      '- Local persistence for drafts, runs, and decisions; export/import supported.',
      '- No external JS; vanilla only (Google Fonts link allowed).'
    ].join('\n');

    const diagPlaybook = [
      '1) Check BUDGET METER: if > 95%, reduce token budget stress or shorten constraints/features.',
      '2) Verify README section headers exist (Goal/Problem/Requirements/Diagnostics/Output Files).',
      '3) Confirm manifest parses; if not, locate the first unescaped character or missing comma.',
      '4) Compare last two runs in RUNS view to isolate which fields changed pack size.',
      '5) If density check fails, increase feature detail (examples, edge cases, acceptance criteria).'
    ].join('\n');

    const readme = [
`# ${draft.projName}

> A stress-test harness that generates a style-driven “project pack” (README + manifest + decision log) in one run, so you can verify rich file output without hitting a token ceiling.

**Status:** \`draft\`  
**Complexity:** \`complex\`  
**Bucket:** \`${draft.category}\`  
**Style:** \`${draft.styleId}\`

## Goal

Prove that style directives can reliably produce multiple long-form, high-fidelity artifacts (README, manifest, decision log, compliance notes) while staying under a configurable budget — and make failures diagnosable in under 2 minutes.

## Problem

Large generation responses can silently truncate or compress content to avoid hard limits. The failures are subtle: missing sections, malformed JSON, reduced density, or partial logs. This tool simulates that risk by:
- Estimating token usage from character counts
- Running structure + density checks
- Persisting run history for compare/diff

## Requirements

${reqs}

## What This Tool Generates

**1) README.md**  
A dense, sectioned spec with goals, requirements, and diagnostics.

**2) manifest.json**  
A machine-readable summary for verification runs (inputs, outputs, metrics).

**3) decision-log.md**  
A chronological log of important choices with rationale and tradeoffs.

**4) style-compliance.txt**  
A checklist mapping UI + content decisions back to the style directives.

## How to Run

- Fill out Project Name, Category, Style ID.
- Add 5+ features (one per line) to enforce “complex” content.
- Set token budget (e.g., 7600) to stress-test near the ceiling.
- Click **GENERATE PACK** and review the tabs.
- Save the run for later compare/diff.

## Diagnostics

When something fails, use this playbook:

${diagPlaybook}

## Output Files

- \`README.md\`
- \`manifest.json\`
- \`decision-log.md\`
- \`style-compliance.txt\`

## Notes / Constraints

${draft.constraints || '(none)'}

## Acceptance Criteria

- All four artifacts are generated in one run and remain structurally valid.
- JSON is parseable; Markdown has required headers.
- Estimated token usage stays within the configured budget.
- Failures produce actionable diagnostics without guessing.

## Feature List

${featureBullets}
`
    ].join('\n');

    const manifestObj = {
      schema: 'fvr.manifest.v1',
      runId,
      time,
      project: {
        name: draft.projName,
        category: draft.category,
        styleId: draft.styleId
      },
      inputs: {
        tokenBudget: draft.budget,
        features: draft.features,
        constraints: draft.constraints
      },
      outputs: {
        files: ['README.md','manifest.json','decision-log.md','style-compliance.txt']
      },
      metrics: {
        charCounts: { readme: 0, manifest: 0, decisionLog: 0, compliance: 0, total: 0 },
        estTokens: 0,
        checks: []
      }
    };

    const decisionsMd = (() => {
      const entries = state.decisions.slice().sort((a,b)=> (a.time < b.time ? -1 : 1));
      const lines = [
`# Decision Log

Project: **${draft.projName}**  
Run: **${runId}**  
Generated: **${time}**

## Purpose

Capture decisions that affect output correctness (structure), density (content richness), and diagnosability (fast failure isolation). This log is stored locally and exported with the project pack.

## Entries
`
      ];
      if (entries.length === 0) {
        lines.push('- (no local decisions yet) Add some in the DECISION LOG view.');
      } else {
        for (const d of entries) {
          lines.push(`### ${d.title}
- Time: \`${d.time}\`
- Type: \`${d.type}\`
- Owner: \`${d.owner || 'unspecified'}\`
- Rationale: ${d.rationale || '(none)'}
- Alternatives: ${d.alternatives || '(none)'}
- Implications: ${d.implications || 'Affects output quality and verification speed.'}
`);
        }
      }
      lines.push(`## Guidance

- Prefer decisions that reduce truncation risk (stable section templates, predictable JSON).
- Prefer checks that fail loud (parse errors, missing headings, budget overflow).
- Keep “why” explicit so future runs stay consistent.`);
      return lines.join('\n');
    })();

    const compliance = [
`STYLE COMPLIANCE — ${draft.styleId}

Aesthetic directives applied (retro-future):
- Dark-only deep purple-black base: background ${'#0A0010'}, surfaces ${'#12001E'}.
- Primary neon yellow-green text; key elements include glow via text-shadow (no drop shadow).
- Accents: hot pink + cyan used for active states, tags, and focus outlines.
- Typography: monospace (Share Tech Mono), uppercase labels, 0.18–0.22em heading tracking.
- Layout: centered panel “CRT monitor” with framed panels and corner brackets (CSS pseudo-elements).
- Nav: horizontal bar with separators, glow on active item.
- Inputs: dark, bright borders, monospace, caret blink (cursor feel).
- Tables: glowing header, dim alternating rows.
- Optional scanlines overlay (repeating-linear-gradient @ 2px) toggleable.
- Motion: subtle only — boot flicker, 150ms scan sweep on view change, 200ms slot-machine number updates.

Anti-pattern avoidance:
- No rounded buttons (square corners).
- No light backgrounds.
- No sans-serif body fonts.
- No realistic photography.
- No external JS libraries.

Content compliance:
- Multi-file artifact generation with rich density (README + manifest + decision log + compliance).
- Budget estimator and truncation risk checks included with diagnostics playbook.
`
    ].join('\n');

    // finalize manifest metrics
    const manifest = JSON.stringify(manifestObj, null, 2);
    const charCounts = {
      readme: readme.length,
      manifest: manifest.length,
      decisionLog: decisionsMd.length,
      compliance: compliance.length
    };
    const totalChars = charCounts.readme + charCounts.manifest + charCounts.decisionLog + charCounts.compliance;
    const estTokens = estimateTokens(totalChars);

    const pack = {
      runId,
      time,
      budget: draft.budget,
      readme,
      manifest: JSON.stringify({
        ...manifestObj,
        metrics: {
          ...manifestObj.metrics,
          charCounts: { ...charCounts, total: totalChars },
          estTokens
        }
      }, null, 2),
      decisions: decisionsMd,
      compliance,
      charCounts: { ...charCounts, total: totalChars },
      estTokens
    };

    const checks = computeStructureChecks(pack);
    const risk = riskLevel(pack, checks);

    return { ...pack, checks, risk };
  }

  function renderChecklist(pack) {
    const wrap = $('#checklist');
    wrap.innerHTML = '';
    for (const c of pack.checks) {
      const item = document.createElement('div');
      item.className = `check ${c.ok ? 'ok' : 'bad'}`;
      item.innerHTML = `<div class="name">${escapeHtml(c.name)}</div><div class="state">${c.ok ? 'OK' : 'FAIL'}</div>`;
      wrap.appendChild(item);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }

  function renderPack(pack) {
    $('#outReadme').value = pack.readme;
    $('#outManifest').value = pack.manifest;
    $('#outDecisions').value = pack.decisions;
    $('#outCompliance').value = pack.compliance;

    $('#streamPack').textContent = pack.runId;
    $('#streamReadme').textContent = String(pack.charCounts.readme);
    $('#streamManifest').textContent = String(pack.charCounts.manifest);
    $('#streamDecisions').textContent = String(pack.charCounts.decisionLog);
    $('#streamCompliance').textContent = String(pack.charCounts.compliance);

    const sectionsOk = pack.checks.filter(c => c.name.includes('sections') || c.name.includes('parseable') || c.name.includes('Decision log') || c.name.includes('Compliance')).every(c => c.ok);
    $('#streamSections').textContent = sectionsOk ? 'OK' : 'ISSUES';
    $('#streamDensity').textContent = pack.checks.find(c => c.name.startsWith('Content density'))?.ok ? 'RICH' : 'THIN';
    $('#streamTrunc').textContent = pack.risk === 'HIGH' ? 'HIGH' : pack.risk === 'MED' ? 'MED' : 'LOW';
    $('#streamLastRun').textContent = pack.time;

    const ratio = Math.min(1, pack.estTokens / Math.max(pack.budget, 1));
    $('#meterFill').style.width = `${Math.round(ratio * 100)}%`;
    $('.meter').setAttribute('aria-valuemax', String(pack.budget));
    $('.meter').setAttribute('aria-valuenow', String(pack.estTokens));
    $('#budgetReadout').textContent = `${pack.estTokens} / ${pack.budget}`;

    slotUpdate($('#kpiRuns'), state.runs.length);
    slotUpdate($('#kpiStatus'), pack.estTokens <= pack.budget ? 'OK' : 'OVER');
    slotUpdate($('#kpiSize'), pack.charCounts.total);
    slotUpdate($('#kpiRisk'), pack.risk);

    const health = $('#healthTag');
    if (pack.estTokens > pack.budget) {
      health.textContent = '⟦ HEALTH: OVER BUDGET ⟧';
      health.classList.add('tag-pink');
    } else if (pack.estTokens / pack.budget >= 0.95) {
      health.textContent = '⟦ HEALTH: NEAR CEILING ⟧';
      health.classList.add('tag-pink');
    } else {
      health.textContent = '⟦ HEALTH: OK ⟧';
      health.classList.remove('tag-pink');
    }

    renderChecklist(pack);

    // diagnostics
    diag(`PACK GENERATED: ${pack.runId}`, 'good');
    diag(`TOTAL CHARS=${pack.charCounts.total} • EST TOKENS=${pack.estTokens} • BUDGET=${pack.budget}`, pack.estTokens <= pack.budget ? 'good' : 'warn');
    const fails = pack.checks.filter(c => !c.ok);
    if (fails.length) {
      diag(`CHECK FAILURES (${fails.length}): ${fails.map(f => f.name).join(' | ')}`, 'warn');
      diag(`NEXT: OPEN GENERATOR TAB • VERIFY MISSING SECTIONS / JSON`, 'meta');
    } else {
      diag('ALL CHECKS PASS', 'good');
    }
  }

  function setView(view) {
    state.activeView = view;
    $$('.navbtn').forEach(b => b.setAttribute('aria-current', b.dataset.view === view ? 'page' : 'false'));
    $$('.view').forEach(v => v.classList.toggle('active', v.dataset.view === view));
    $('#activeViewTag').textContent = `⟦ VIEW: ${view.toUpperCase()} ⟧`;
    sweep();
  }

  function setTab(tab) {
    state.activeTab = tab;
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    $$('.tab').forEach(t => t.setAttribute('aria-selected', t.dataset.tab === tab ? 'true' : 'false'));
    $$('.tabpane').forEach(p => p.classList.toggle('active', p.dataset.tab === tab));
  }

  function downloadText(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      diag('COPIED TO CLIPBOARD', 'good');
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      diag('COPIED (FALLBACK)', 'good');
    }
  }

  function runToRow(run) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" data-runcheck="${escapeHtml(run.runId)}" /></td>
      <td class="smallcell">${escapeHtml(run.time)}</td>
      <td>${escapeHtml(run.project?.name || run.draft?.projName || '—')}</td>
      <td>${badgeHtml(run.status)}</td>
      <td>${escapeHtml(String(run.estTokens))}</td>
      <td class="smallcell">${escapeHtml(run.note || '')}</td>
    `;
    return tr;
  }

  function badgeHtml(status) {
    const s = String(status || '—');
    const cls = s === 'OK' ? 'ok' : (s === 'OVER' || s === 'NEAR') ? 'warn' : 'neutral';
    return `<span class="badge ${cls}">${escapeHtml(s)}</span>`;
  }

  function renderRuns() {
    const tb = $('#runsTbody');
    tb.innerHTML = '';
    const sorted = state.runs.slice().sort((a,b)=> (a.time < b.time ? 1 : -1));
    for (const r of sorted) tb.appendChild(runToRow(r));

    const selA = $('#compareA');
    const selB = $('#compareB');
    const opts = sorted.map(r => `<option value="${escapeHtml(r.runId)}">${escapeHtml(r.time)} • ${escapeHtml(r.runId)}</option>`).join('');
    selA.innerHTML = `<option value="">(select)</option>${opts}`;
    selB.innerHTML = `<option value="">(select)</option>${opts}`;

    slotUpdate($('#kpiRuns'), state.runs.length);
  }

  function normalizeLines(s) {
    return String(s || '').replace(/\r\n/g, '\n').split('\n');
  }

  function quickDiff(aText, bText) {
    const a = normalizeLines(aText);
    const b = normalizeLines(bText);
    const setA = new Set(a);
    const setB = new Set(b);
    const out = [];

    // lines unique to A
    for (const line of a) if (line && !setB.has(line)) out.push(`- ${line}`);
    // lines unique to B
    for (const line of b) if (line && !setA.has(line)) out.push(`+ ${line}`);

    return out.slice(0, 220).join('\n') || '(no differences detected by heuristic)';
  }

  function renderDiff(which) {
    const id = which === 'A' ? $('#compareA').value : $('#compareB').value;
    const otherId = which === 'A' ? $('#compareB').value : $('#compareA').value;
    const pre = which === 'A' ? $('#diffA') : $('#diffB');

    const run = state.runs.find(r => r.runId === id);
    const other = state.runs.find(r => r.runId === otherId);

    if (!run) { pre.textContent = '(select a run)'; return; }
    if (!other) { pre.textContent = '(select both runs to compare)'; return; }

    const aText = (which === 'A') ? run.pack?.readme : other.pack?.readme;
    const bText = (which === 'A') ? other.pack?.readme : run.pack?.readme;
    const d = quickDiff(aText, bText);
    pre.innerHTML = escapeHtml(d)
      .replaceAll('&lt;span class=&quot;hlplus&quot;&gt;','<span class="hlplus">')
      .replaceAll('&lt;/span&gt;','</span>');
    // add inline highlighting after escaping: do a second pass on textContent -> easier:
    pre.textContent = d;
    pre.innerHTML = pre.innerHTML
      .replace(/^(\+\s.*)$/gm, '<span class="hlplus">$1</span>')
      .replace(/^(-\s.*)$/gm, '<span class="hlminus">$1</span>');
  }

  function renderDecisions() {
    const wrap = $('#decisionList');
    wrap.innerHTML = '';
    const entries = state.decisions.slice().sort((a,b)=> (a.time < b.time ? 1 : -1));
    for (const d of entries) {
      const card = document.createElement('div');
      card.className = 'decision';
      card.innerHTML = `
        <div class="top">
          <div>
            <div class="t">${escapeHtml(d.title || '(untitled)')}</div>
            <div class="meta">TIME: ${escapeHtml(d.time)} • TYPE: ${escapeHtml(d.type)} • OWNER: ${escapeHtml(d.owner || 'unspecified')}</div>
          </div>
          <div class="tag ${d.type === 'style' ? 'tag-cyan' : d.type === 'risk' ? 'tag-pink' : ''}">&lt; ${escapeHtml(d.type)} &gt;</div>
        </div>
        <div class="body">
          <div><span class="smallcell">RATIONALE:</span> ${escapeHtml(d.rationale || '(none)')}</div>
          <div><span class="smallcell">ALTERNATIVES:</span> ${escapeHtml(d.alternatives || '(none)')}</div>
          <div><span class="smallcell">IMPLICATIONS:</span> ${escapeHtml(d.implications || 'Affects output quality and verification speed.')}</div>
        </div>
        <div class="controls">
          <button class="btn" data-deldecision="${escapeHtml(d.id)}">DELETE</button>
          <button class="btn" data-copydecision="${escapeHtml(d.id)}">COPY MD</button>
        </div>
      `;
      wrap.appendChild(card);
    }
  }

  function gatherModal(title, text) {
    const modal = $('#modal');
    $('#modalTitle').textContent = title;
    $('#modalPre').textContent = text;
    const copyBtn = $('#modalCopy');
    copyBtn.onclick = async (e) => {
      e.preventDefault();
      await copyText(text);
      modal.close();
    };
    modal.showModal();
  }

  function exportAllJson() {
    const payload = {
      schema: 'fvr.export.v1',
      time: nowISO(),
      settings: state.settings,
      draft: getDraftFromUI(),
      runs: state.runs,
      decisions: state.decisions
    };
    downloadText(`fvr-export-${Date.now()}.json`, JSON.stringify(payload, null, 2));
    diag('EXPORTED JSON', 'good');
  }

  function importAllJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const data = safeJsonParse(reader.result, null);
      if (!data || data.schema !== 'fvr.export.v1') {
        diag('IMPORT FAILED: INVALID SCHEMA', 'warn');
        return;
      }
      state.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
      state.draft = data.draft || null;
      state.runs = Array.isArray(data.runs) ? data.runs : [];
      state.decisions = Array.isArray(data.decisions) ? data.decisions : [];

      persist(STORAGE_KEYS.settings, state.settings);
      if (state.draft) persist(STORAGE_KEYS.draft, state.draft);
      persist(STORAGE_KEYS.runs, state.runs);
      persist(STORAGE_KEYS.decisions, state.decisions);

      applySettingsToUI();
      setUIFromDraft(state.draft);
      renderRuns();
      renderDecisions();
      diag('IMPORT OK', 'good');
    };
    reader.readAsText(file);
  }

  function applySettingsToUI() {
    $('#autosave').value = state.settings.autosave;
    $('#scanlines').value = state.settings.scanlines;
    $('#motion').value = state.settings.motion;
    $('#tokenMode').value = state.settings.tokenMode;
    setRootToggles();
  }

  function bindEvents() {
    $$('.navbtn').forEach(btn => {
      btn.addEventListener('click', () => setView(btn.dataset.view));
    });

    $$('.tab').forEach(t => {
      t.addEventListener('click', () => setTab(t.dataset.tab));
    });

    $('#btnGenerate').addEventListener('click', () => {
      const draft = getDraftFromUI();
      if (!draft.features.length || draft.features.length < 5) {
        diag('NEED 5+ FEATURES FOR COMPLEX MODE (ADD MORE LINES)', 'warn');
      }
      const pack = makePack(draft);
      state.lastPack = pack;
      renderPack(pack);
      setView('generator');
      setTab('readme');
      $('#streamPack').textContent = pack.runId;

      if (state.settings.autosave === 'on') {
        state.draft