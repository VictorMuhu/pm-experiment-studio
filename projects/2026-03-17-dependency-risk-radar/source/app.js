// all JavaScript here
(() => {
  'use strict';

  const APP_VERSION = '1.0';
  const STORAGE_KEYS = {
    settings: 'drr.settings.v1',
    registry: 'drr.registry.v1',
    snapshots: 'drr.snapshots.v1',
    alerts: 'drr.alerts.v1',
    lastRun: 'drr.lastRun.v1'
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function nowIso() {
    return new Date().toISOString();
  }

  function formatDateShort(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${hh}:${mm}`;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function safeJsonParse(text) {
    try {
      return { ok: true, value: JSON.parse(text) };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  function readLS(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = safeJsonParse(raw);
    if (!parsed.ok) return fallback;
    return parsed.value;
  }

  function writeLS(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix = 'id') {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  function normalizePackageName(name) {
    return String(name || '')
      .trim()
      .replace(/^["']|["']$/g, '')
      .replace(/[,;]$/g, '')
      .toLowerCase();
  }

  function parseSemver(v) {
    const s = String(v || '').trim();
    const m = s.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!m) return null;
    return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]), raw: m[0] };
  }

  function semverMajor(v) {
    const p = parseSemver(v);
    return p ? p.major : null;
  }

  function guessLangFromName(name) {
    const n = normalizePackageName(name);
    if (n.includes('django') || n.includes('flask') || n.includes('fastapi') || n.includes('uvicorn')) return 'python';
    if (n.startsWith('@') || n.includes('-loader') || n.includes('webpack') || n.includes('react') || n.includes('eslint')) return 'js';
    return 'unknown';
  }

  function containsAny(name, keywords) {
    const n = normalizePackageName(name);
    return keywords.some(k => k && n.includes(k));
  }

  function daysSince(dateIso) {
    if (!dateIso) return null;
    const d = new Date(dateIso);
    if (Number.isNaN(d.getTime())) return null;
    const diff = Date.now() - d.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  const DEFAULT_SETTINGS = {
    preset: 'balanced',
    weights: {
      security: 35,
      maintenance: 35,
      breaking: 20,
      momentum: 10
    },
    sensitiveKeywords: [
      'auth','oauth','jwt','saml','crypto','tls','ssl','openssl','bcrypt','argon2',
      'payment','stripe','paypal','vault','kms','secrets','token','session'
    ],
    deprecatedKeywords: [
      'request','left-pad','core-js@2','core-js-2','babel-polyfill','event-stream',
      'moment','gulp','bower','phantomjs','python2','legacy','deprecated'
    ]
  };

  const PRESETS = {
    balanced: { security: 35, maintenance: 35, breaking: 20, momentum: 10 },
    security: { security: 50, maintenance: 25, breaking: 20, momentum: 5 },
    stability: { security: 30, maintenance: 45, breaking: 20, momentum: 5 },
    delivery: { security: 25, maintenance: 25, breaking: 35, momentum: 15 }
  };

  const DEMO_INPUT = `{
  "name": "checkout-service",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^13.5.6",
    "axios": "^1.6.2",
    "jsonwebtoken": "^9.0.2",
    "jwks-rsa": "^3.1.0",
    "bcrypt": "^5.1.1",
    "uuid": "^9.0.1",
    "lodash": "^4.17.21",
    "moment": "^2.29.4",
    "stripe": "^13.11.0",
    "@aws-sdk/client-dynamodb": "^3.490.0",
    "@aws-sdk/lib-dynamodb": "^3.490.0",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "qs": "^6.11.2",
    "sharp": "^0.33.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^14.1.2",
    "webpack": "^5.89.0",
    "babel-loader": "^9.1.3"
  }
}`;

  const state = {
    view: 'triage',
    settings: readLS(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
    registry: readLS(STORAGE_KEYS.registry, []),
    snapshots: readLS(STORAGE_KEYS.snapshots, []),
    alerts: readLS(STORAGE_KEYS.alerts, []),
    lastRun: readLS(STORAGE_KEYS.lastRun, null),

    currentRun: null, // { id, createdAt, meta, packages:[...], results:[...]}
    selectedNames: new Set(),
    focusedName: null,

    triageFilter: '',
    triageSort: 'riskDesc',

    registrySelectedId: null,
    diff: null
  };

  // DOM refs
  const dom = {};

  function cacheDom() {
    dom.navItems = $$('.nav__item');
    dom.views = $$('.view');

    dom.statusLastRun = $('#statusLastRun');
    dom.statusItemCount = $('#statusItemCount');

    dom.btnNewRun = $('#btnNewRun');
    dom.btnLoadDemo = $('#btnLoadDemo');
    dom.btnSaveSnapshot = $('#btnSaveSnapshot');

    dom.inputProjectName = $('#inputProjectName');
    dom.inputOwner = $('#inputOwner');
    dom.inputDueDate = $('#inputDueDate');
    dom.inputScope = $('#inputScope');
    dom.inputDeps = $('#inputDeps');

    dom.chkIncludeDev = $('#chkIncludeDev');
    dom.chkMergeRegistry = $('#chkMergeRegistry');

    dom.parserStatus = $('#parserStatus');

    dom.btnRunAnalysis = $('#btnRunAnalysis');
    dom.btnClearInput = $('#btnClearInput');

    dom.metricOverall = $('#metricOverall');
    dom.metricOverallHint = $('#metricOverallHint');
    dom.metricCritical = $('#metricCritical');
    dom.metricReview = $('#metricReview');
    dom.metricOk = $('#metricOk');
    dom.riskModelLabel = $('#riskModelLabel');

    dom.triageTbody = $('#triageTbody');
    dom.filterText = $('#filterText');
    dom.sortMode = $('#sortMode');
    dom.btnAddToRegistry = $('#btnAddToRegistry');
    dom.btnMarkReviewed = $('#btnMarkReviewed');

    dom.detailBody = $('#detailBody');
    dom.selectedCount = $('#selectedCount');
    dom.btnSelectAll = $('#btnSelectAll');
    dom.btnSelectNone = $('#btnSelectNone');
    dom.btnExportSelected = $('#btnExportSelected');

    dom.alertTrayBody = $('#alertTrayBody');
    dom.alertCountTag = $('#alertCountTag');
    dom.btnClearAlerts = $('#btnClearAlerts');

    // Registry
    dom.registryCount = $('#registryCount');
    dom.registrySearch = $('#registrySearch');
    dom.registryList = $('#registryList');

    dom.btnNewRegistryItem = $('#btnNewRegistryItem');
    dom.btnPurgeRegistry = $('#btnPurgeRegistry');
    dom.btnDeleteRegistryItem = $('#btnDeleteRegistryItem');

    dom.regName = $('#regName');
    dom.regOwner = $('#regOwner');
    dom.regCriticality = $('#regCriticality');
    dom.regAuditDate = $('#regAuditDate');
    dom.regLastIncident = $('#regLastIncident');
    dom.regPinnedVersion = $('#regPinnedVersion');
    dom.regNotes = $('#regNotes');

    dom.btnSaveRegistryItem = $('#btnSaveRegistryItem');
    dom.btnRiskFromRegistry = $('#btnRiskFromRegistry');

    dom.registryDetailStatus = $('#registryDetailStatus');
    dom.registryDetailTag = $('#registryDetailTag');

    // Diff
    dom.btnMakeSnapshotFromCurrent = $('#btnMakeSnapshotFromCurrent');
    dom.diffLeft = $('#diffLeft');
    dom.diffRight = $('#diffRight');
    dom.diffThreshold = $('#diffThreshold');
    dom.btnRunDiff = $('#btnRunDiff');
    dom.btnClearDiff = $('#btnClearDiff');
    dom.diffTbody = $('#diffTbody');
    dom.diffAdded = $('#diffAdded');
    dom.diffRemoved = $('#diffRemoved');
    dom.diffUp = $('#diffUp');
    dom.diffDown = $('#diffDown');

    // Export
    dom.exportPreview = $('#exportPreview');
    dom.exportSelectedCount = $('#exportSelectedCount');
    dom.exportMode = $('#exportMode');
    dom.exportCutoff = $('#exportCutoff');
    dom.exportIncludeOk = $('#exportIncludeOk');
    dom.exportIncludeSignals = $('#exportIncludeSignals');
    dom.exportIncludeReviewed = $('#exportIncludeReviewed');
    dom.btnRegenerateExport = $('#btnRegenerateExport');
    dom.btnCopyReport = $('#btnCopyReport');
    dom.btnDownloadJson = $('#btnDownloadJson');
    dom.exportStatus = $('#exportStatus');

    // Settings
    dom.appVersionLabel = $('#appVersionLabel');

    dom.presetSelect = $('#presetSelect');
    dom.presetLabel = $('#presetLabel');
    dom.wSecurity = $('#wSecurity');
    dom.wMaintenance = $('#wMaintenance');
    dom.wBreaking = $('#wBreaking');
    dom.wMomentum = $('#wMomentum');
    dom.wSecurityVal = $('#wSecurityVal');
    dom.wMaintenanceVal = $('#wMaintenanceVal');
    dom.wBreakingVal = $('#wBreakingVal');
    dom.wMomentumVal = $('#wMomentumVal');

    dom.sensitiveKeywords = $('#sensitiveKeywords');
    dom.deprecatedKeywords = $('#deprecatedKeywords');

    dom.btnSaveSettings = $('#btnSaveSettings');
    dom.btnResetSettings = $('#btnResetSettings');
    dom.settingsStatus = $('#settingsStatus');

    dom.btnBackupAll = $('#btnBackupAll');
    dom.fileRestore = $('#fileRestore');
    dom.btnClearAll = $('#btnClearAll');
  }

  function setView(next) {
    state.view = next;
    dom.navItems.forEach(btn => {
      const isActive = btn.dataset.view === next;
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
      if (!isActive) btn.removeAttribute('aria-current');
    });
    dom.views.forEach(v => {
      const match = v.dataset.viewPanel === next;
      v.hidden = !match;
    });

    if (next === 'export') {
      regenerateExportPreview();
    }
    if (next === 'diff') {
      renderDiffSnapshotOptions();
    }
    if (next === 'registry') {
      renderRegistry();
      renderRegistryDetail();
    }
    if (next === 'settings') {
      renderSettings();
    }
  }

  function pushAlert(level, message, meta = '') {
    const item = {
      id: uid('alert'),
      ts: nowIso(),
      level: level, // 'warn' | 'critical' | 'ok'
      message: String(message || ''),
      meta: String(meta || '')
    };
    state.alerts.unshift(item);
    state.alerts = state.alerts.slice(0, 60);
    writeLS(STORAGE_KEYS.alerts, state.alerts);
    renderAlerts();
  }

  function clearAlerts() {
    state.alerts = [];
    writeLS(STORAGE_KEYS.alerts, state.alerts);
    renderAlerts();
  }

  function renderAlerts() {
    const warnCount = state.alerts.filter(a => a.level === 'warn' || a.level === 'critical').length;
    dom.alertCountTag.textContent = `[WARN] ${warnCount}`;
    dom.alertTrayBody.innerHTML = '';
    if (state.alerts.length === 0) {
      const el = document.createElement('div');
      el.className = 'alertItem';
      el.innerHTML = `<div class="alertItem__msg">No alerts.</div><div class="alertItem__meta">${formatDateShort(nowIso())}</div>`;
      dom.alertTrayBody.appendChild(el);
      return;
    }
    for (const a of state.alerts) {
      const el = document.createElement('div');
      el.className = 'alertItem';
      const meta = a.meta ? ` • ${escapeHtml(a.meta)}` : '';
      el.innerHTML = `<div class="alertItem__msg">${escapeHtml(a.message)}</div><div class="alertItem__meta">${escapeHtml(a.level.toUpperCase())}${meta} • ${escapeHtml(formatDateShort(a.ts))}</div>`;
      dom.alertTrayBody.appendChild(el);
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

  function parseInputToDeps(rawText, includeDev) {
    const text = String(rawText || '').trim();
    if (!text) return { ok: false, error: 'No input' };

    // Try JSON first (package.json)
    if (text.startsWith('{') || text.startsWith('[')) {
      const parsed = safeJsonParse(text);
      if (parsed.ok && parsed.value && typeof parsed.value === 'object') {
        const obj = parsed.value;
        const deps = [];
        const addBlock = (block, source) => {
          if (!block || typeof block !== 'object') return;
          for (const [name, ver] of Object.entries(block)) {
            deps.push({ name: normalizePackageName(name), versionSpec: String(ver), source });
          }
        };
        addBlock(obj.dependencies, 'dependencies');
        if (includeDev) addBlock(obj.devDependencies, 'devDependencies');
        if (deps.length === 0) return { ok: false, error: 'Parsed JSON but found no dependencies/devDependencies' };
        return { ok: true, deps, format: 'package.json' };
      }
    }

    // requirements.txt (lines: pkg==1.2.3, pkg>=1.0, pkg~=, plus comments)
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const depsReq = [];
    const reqLineRe = /^([A-Za-z0-9_.-]+)\s*([=<>!~]{1,2}\s*[A-Za-z0-9+_.-]+)?/;
    let reqHits = 0;
    for (const l of lines) {
      if (l.startsWith('#')) continue;
      if (l.startsWith('-r ') || l.startsWith('--')) continue;
      const m = l.match(reqLineRe);
      if (m && m[1]) {
        reqHits++;
        const name = normalizePackageName(m[1]);
        const spec = String(m[2] || '').replace(/\s+/g, '');
        depsReq.push({ name, versionSpec: spec || '', source: 'requirements' });
      }
    }
    if (reqHits >= 3) {
      return { ok: true, deps: depsReq, format: 'requirements.txt' };
    }

    // lock excerpt: lines containing name@version, or "name": "x.y.z"
    const depsLoose = [];
    const seen = new Set();
    const linePatterns = [
      /(^|[\s"'`])(@?[\w.-]+\/?[\w.-]*)@(\d+\.\d+\.\d+)/g, // react@18.2.0, @scope/pkg@1.2.3
      /"(@?[\w.-]+\/?[\w.-]*)"\s*:\s*"([^"]+)"/g
    ];
    for (const l of lines) {
      for (const re of linePatterns) {
        let m;
        while ((m = re.exec(l)) !== null) {
          const name = normalizePackageName(m[2] || m[1]);
          const ver = String(m[3] || m[2] || '').trim();
          if (!name) continue;
          const key = `${name}@@${ver}`;
          if (seen.has(key)) continue;
          seen.add(key);
          depsLoose.push({ name, versionSpec: ver, source: 'loose' });
        }
      }
    }
    if (depsLoose.length >= 3) {
      return { ok: true, deps: depsLoose, format: 'lock excerpt' };
    }

    return { ok: false, error: 'Unrecognized format. Paste a package.json, requirements.txt, or lock excerpt with name@version.' };
  }

  function deriveSignals(dep, settings, registryRecord, meta) {
    const name = dep.name;
    const versionSpec = dep.versionSpec || '';
    const semver = parseSemver(versionSpec);
    const major = semver ? semver.major : null;

    const sensitiveHit = containsAny(name, settings.sensitiveKeywords);
    const deprecatedHit = containsAny(name, settings.deprecatedKeywords);

    // Heuristic: security exposure
    let security = 0;
    const securityReasons = [];

    if (sensitiveHit) {
      security += 22;
      securityReasons.push('Sensitive-area keyword match');
    }

    // Heuristic CVE-ish flags by name only (offline)
    const cvePatterns = [
      { kw: 'openssl', score: 18, why: 'Crypto surface area (offline heuristic)' },
      { kw: 'jsonwebtoken', score: 20, why: 'JWT libraries are frequently in incident paths' },
      { kw: 'log4j', score: 25, why: 'Historical high-impact vulnerabilities' },
      { kw: 'axios', score: 8, why: 'HTTP client; audit for SSRF/proxy issues' },
      { kw: 'qs', score: 12, why: 'Querystring parsers have had prototype pollution history' },
      { kw: 'lodash', score: 8, why: 'Utility libs have had prototype pollution CVEs' }
    ];
    for (const p of cvePatterns) {
      if (normalizePackageName(name).includes(p.kw)) {
        security += p.score;
        securityReasons.push(p.why);
      }
    }

    // Heuristic: maintenance risk
    let maintenance = 0;
    const maintenanceReasons = [];
    if (deprecatedHit) {
      maintenance += 24;
      maintenanceReasons.push('Deprecated/legacy keyword match');
    }
    if (normalizePackageName(name).includes('moment')) {
      maintenance += 18;
      maintenanceReasons.push('Known legacy status (consider modern alternatives)');
    }
    if (normalizePackageName(name).includes('request')) {
      maintenance += 25;
      maintenanceReasons.push('Known deprecated library family');
    }
    if (!versionSpec) {
      maintenance += 10;
      maintenanceReasons.push('No version specified (low confidence)');
    }
    if (versionSpec.includes('*') || versionSpec.includes('latest')) {
      maintenance += 12;
      maintenanceReasons.push('Non-pinned version spec (harder to reason about)');
    }

    // Heuristic: breaking-change risk
    let breaking = 0;
    const breakingReasons = [];

    const scope = meta.scope;
    if (scope === 'major') {
      if (major !== null && major >= 1) {
        // conservative bump pressure for majors, but not huge
        breaking += 10;
        breakingReasons.push('Major upgrade context (breaking changes likely somewhere)');
      } else if (major === 0) {
        breaking += 18;
        breakingReasons.push('0.x package: even minors can break');
      }
    } else if (scope === 'vendor') {
      breaking += 14;
      breakingReasons.push('Vendor switch context (integration risk higher)');
    } else {
      // minor
      if (major === 0) {
        breaking += 10;
        breakingReasons.push('0.x package in a minor bump: still risky');
      }
    }

    // Heuristic: momentum (protective, subtracts)
    let momentum = 0;
    const momentumReasons = [];
    const momentumWhitelist = [
      'react', 'react-dom', 'express', 'typescript', 'eslint', 'jest',
      '@aws-sdk', 'next', 'webpack', 'stripe', 'sharp', 'helmet'
    ];
    const n = normalizePackageName(name);
    if (momentumWhitelist.some(w => n === w || n.startsWith(`${w}/`) || n.startsWith(w))) {
      momentum += 10;
      momentumReasons.push('Commonly adopted ecosystem dependency');
    }
    if (n.startsWith('@aws-sdk/')) {
      momentum += 8;
      momentumReasons.push('Vendor-supported SDK family');
    }

    // Registry overlays
    const registry = registryRecord || null;
    const registryReasons = [];
    let registryScale = 1;
    if (registry) {
      if (registry.criticality === 'high') {
        registryScale = 1.15;
        registryReasons.push('Registry: high service criticality');
      }
      if (registry.criticality === 'low') {
        registryScale = 0.95;
        registryReasons.push('Registry: low service criticality');
      }

      const auditDays = daysSince(registry.lastAudited || null);
      if (auditDays === null) {
        maintenance += 12;
        registryReasons.push('Registry: never audited');
      } else if (auditDays > 365) {
        maintenance += 10;
        registryReasons.push('Registry: audit older than 12 months');
      } else if (auditDays > 180) {
        maintenance += 6;
        registryReasons.push('Registry: audit older than 6 months');
      }

      const incidentDays = daysSince(registry.last