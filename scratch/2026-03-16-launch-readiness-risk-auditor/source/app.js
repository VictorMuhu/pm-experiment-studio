(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    tab: 'dashboard',
    data: null,
    toastTimer: null
  };

  const defaultData = () => ({
    launch: {
      name: 'Billing v2 — Usage-based invoices',
      date: '2026-04-02',
      segment: 'Self-serve + Mid-market (US/EU)',
      platform: 'Web + API'
    },
    rubric: [
      { key: 'product', label: 'Product', weight: 18 },
      { key: 'engineering', label: 'Engineering', weight: 22 },
      { key: 'qa', label: 'QA', weight: 12 },
      { key: 'security', label: 'Security', weight: 10 },
      { key: 'docs', label: 'Docs', weight: 10 },
      { key: 'marketing', label: 'Marketing', weight: 10 },
      { key: 'sales', label: 'Sales', weight: 8 },
      { key: 'support', label: 'Support', weight: 10 }
    ],
    owners: [
      {
        ownerKey: 'eng',
        ownerLabel: 'Engineering',
        items: [
          {
            id: 'eng-rollback',
            title: 'Rollback playbook written + linked in release notes',
            detail: 'Include feature flag names, data backfill steps, and on-call contact',
            severity: 'blocker',
            status: 'open'
          },
          {
            id: 'eng-migrations',
            title: 'Invoice schema migration dry-run in staging',
            detail: 'Capture run time + rollback validation (snapshot restore)',
            severity: 'blocker',
            status: 'open'
          },
          {
            id: 'eng-metrics',
            title: 'Billing anomaly alerts configured',
            detail: 'Charge failure rate, invoice generation lag, duplicate invoices',
            severity: 'risk',
            status: 'open'
          }
        ]
      },
      {
        ownerKey: 'qa',
        ownerLabel: 'QA',
        items: [
          {
            id: 'qa-testplan',
            title: 'Final test plan executed for invoices + refunds',
            detail: 'Include partial refunds + multi-currency rounding cases',
            severity: 'blocker',
            status: 'open'
          },
          {
            id: 'qa-release',
            title: 'Release candidate signed off',
            detail: 'RC build 2026.13.0, tagged + notes posted in #release',
            severity: 'risk',
            status: 'open'
          }
        ]
      },
      {
        ownerKey: 'docs',
        ownerLabel: 'Docs',
        items: [
          {
            id: 'docs-api',
            title: 'API docs updated for invoice events + webhook payloads',
            detail: 'Add examples for invoice.paid, invoice.failed, invoice.adjusted',
            severity: 'blocker',
            status: 'open'
          },
          {
            id: 'docs-migration',
            title: 'Migration guide published for existing customers',
            detail: 'What changes in invoices, how to validate, FAQ for finance teams',
            severity: 'risk',
            status: 'open'
          }
        ]
      },
      {
        ownerKey: 'marketing',
        ownerLabel: 'Marketing',
        items: [
          {
            id: 'mkt-pricing-page',
            title: 'Pricing page matches new invoice language',
            detail: 'Remove “monthly invoice” wording, add usage billing explanation',
            severity: 'blocker',
            status: 'open'
          },
          {
            id: 'mkt-email',
            title: 'Customer email scheduled with support escalation path',
            detail: 'Include “what changes” + “what to do if something looks off”',
            severity: 'risk',
            status: 'open'
          }
        ]
      },
      {
        ownerKey: 'sales',
        ownerLabel: 'Sales',
        items: [
          {
            id: 'sales-onepager',
            title: 'Sales one-pager approved (objections + talk track)',
            detail: 'Include “how invoicing changed” + “who is impacted”',
            severity: 'risk',
            status: 'open'
          },
          {
            id: 'sales-enable',
            title: 'Enablement session held (recording + notes)',
            detail: 'AE + SE; include sandbox walkthrough',
            severity: 'blocker',
            status: 'open'
          }
        ]
      },
      {
        ownerKey: 'support',
        ownerLabel: 'Support',
        items: [
          {
            id: 'sup-macros',
            title: 'Support macros updated for billing questions',
            detail: 'Chargebacks, duplicate invoices, invoice timing, refunds',
            severity: 'blocker',
            status: 'open'
          },
          {
            id: 'sup-training',
            title: 'Support training run + handoff checklist completed',
            detail: 'Cover invoice event troubleshooting and escalation rules',
            severity: 'blocker',
            status: 'open'
          }
        ]
      }
    ]
  });

  function nowLabel() {
    const d = new Date();
    const opts = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    return d.toLocaleString(undefined, opts);
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function computeScore(data) {
    const { rubric, owners } = data;

    const allItems = owners.flatMap(o => o.items.map(i => ({ ...i, ownerLabel: o.ownerLabel })));
    const weightsByKey = new Map(rubric.map(r => [r.key, r.weight]));

    const categoryMap = new Map([
      ['Engineering', 'engineering'],
      ['QA', 'qa'],
      ['Docs', 'docs'],
      ['Marketing', 'marketing'],
      ['Sales', 'sales'],
      ['Support', 'support']
    ]);

    // Default: if an owner isn't in map, treat as product (rare in demo)
    const itemCategoryKey = (ownerLabel) => categoryMap.get(ownerLabel) || 'product';

    const openPenaltyBySeverity = { blocker: 1.0, risk: 0.5, info: 0.25 };
    const doneMultiplier = 0;

    const categoryOpenPenalty = new Map();
    for (const item of allItems) {
      const cat = itemCategoryKey(item.ownerLabel);
      const current = categoryOpenPenalty.get(cat) || 0;
      const mult = item.status === 'done' ? doneMultiplier : (openPenaltyBySeverity[item.severity] || 0.25);
      categoryOpenPenalty.set(cat, current + mult);
    }

    // Convert penalties into category scores from 0..100, then weighted average.
    // Penalty curve: each blocker knocks harder than each risk.
    // Map penalty p -> score = 100 * exp(-0.55 * p)
    let weighted = 0;
    let totalW = 0;

    for (const r of rubric) {
      const p = categoryOpenPenalty.get(r.key) || 0;
      const score = 100 * Math.exp(-0.55 * p);
      weighted += score * r.weight;
      totalW += r.weight;
    }

    const overall = totalW > 0 ? (weighted / totalW) : 0;
    const overallRounded = Math.round(overall);

    const blockersOpen = allItems.filter(i => i.severity === 'blocker' && i.status !== 'done');
    const risksOpen = allItems.filter(i => i.severity === 'risk' && i.status !== 'done');

    return {
      overall: clamp(overallRounded, 0, 100),
      blockersOpen,
      risksOpen,
      allItems
    };
  }

  function riskBand(score, blockersCount) {
    if (blockersCount >= 3) return { label: 'NO-GO', tone: 'danger' };
    if (blockersCount >= 1) return { label: 'AT RISK', tone: 'warn' };
    if (score >= 85) return { label: 'ON TRACK', tone: 'good' };
    if (score >= 70) return { label: 'WATCH', tone: 'warn' };
    return { label: 'AT RISK', tone: 'warn' };
  }

  function accentForTone(tone) {
    // Context-driven accents, still within iOS-like palette.
    if (tone === 'danger') return '#FF375F'; // health red
    if (tone === 'warn') return '#FF9F0A'; // iOS orange
    return '#5AC8FA'; // weather blue
  }

  function setCssAccent(hex) {
    document.documentElement.style.setProperty('--accent', hex);
  }

  function setAmbientBackground(score) {
    // Subtle hue shift with "readiness": lower score → warmer; higher → cooler.
    const hue = Math.round(12 + (score / 100) * 208); // ~12 (warm) to ~220 (cool)
    document.documentElement.style.setProperty('--bgHue', String(hue));
  }

  function animateNumber(el, to, duration = 150) {
    const from = Number(el.getAttribute('data-num')) || 0;
    const start = performance.now();
    const delta = to - from;

    function tick(t) {
      const p = clamp((t - start) / duration, 0, 1);
      // easeOutQuad
      const e = 1 - (1 - p) * (1 - p);
      const val = Math.round(from + delta * e);
      el.textContent = String(val);
      if (p < 1) requestAnimationFrame(tick);
      else el.setAttribute('data-num', String(to));
    }

    requestAnimationFrame(tick);
  }

  function showToast(msg) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = msg;

    if (state.toastTimer) window.clearTimeout(state.toastTimer);
    toast.classList.add('toast--show');
    state.toastTimer = window.setTimeout(() => {
      toast.classList.remove('toast--show');
    }, 1400);
  }

  function buildOwnerList(data) {
    const list = $('#ownerList');
    list.innerHTML = '';

    const owners = data.owners.map(o => {
      const open = o.items.filter(i => i.status !== 'done');
      const openBlockers = open.filter(i => i.severity === 'blocker');
      const openRisks = open.filter(i => i.severity === 'risk');
      return {
        ...o,
        open,
        openBlockers,
        openRisks
      };
    });

    // Sort: owners with blockers first, then by total open
    owners.sort((a, b) => {
      if (b.openBlockers.length !== a.openBlockers.length) return b.openBlockers.length - a.openBlockers.length;
      return b.open.length - a.open.length;
    });

    for (const owner of owners) {
      const card = document.createElement('div');
      card.className = 'ownerCard';
      card.setAttribute('role', 'listitem');

      const header = document.createElement('div');
      header.className = 'ownerHeader';

      const ownerName = document.createElement('div');
      ownerName.className = 'ownerName';
      ownerName.textContent = owner.ownerLabel;

      const ownerStat = document.createElement('div');
      ownerStat.className = 'ownerStat';
      const b = owner.openBlockers.length;
      const r = owner.openRisks.length;
      ownerStat.textContent = `${b} BLOCKER${b === 1 ? '' : 'S'} • ${r} RISK${r === 1 ? '' : 'S'}`;

      header.appendChild(ownerName);
      header.appendChild(ownerStat);

      const itemsWrap = document.createElement('div');
      itemsWrap.className = 'items';

      const openSorted = owner.open.slice().sort((x, y) => {
        const sevRank = (s) => (s === 'blocker' ? 0 : s === 'risk' ? 1 : 2);
        if (sevRank(x.severity) !== sevRank(y.severity)) return sevRank(x.severity) - sevRank(y.severity);
        return x.title.localeCompare(y.title);
      });

      for (const item of openSorted) {
        const row = document.createElement('div');
        row.className = 'item';
        row.dataset.itemId = item.id;

        const left = document.createElement('div');
        left.className = 'item__left';

        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.background = item.severity === 'blocker' ? '#FF375F' : '#FF9F0A';
        dot.style.boxShadow = `0 0 0 4px color-mix(in srgb, ${dot.style.background} 14%, transparent)`;

        const text = document.createElement('div');
        text.style.minWidth = '0';

        const title = document.createElement('p');
        title.className = 'item__title';
        title.textContent = item.title;

        const meta = document.createElement('div');
        meta.className = 'item__meta';
        meta.textContent = item.detail;

        text.appendChild(title);
        text.appendChild(meta);

        left.appendChild(dot);
        left.appendChild(text);

        const btn = document.createElement('button');
        btn.className = 'item__btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', `Mark done: ${item.title}`);

        const btnLabel = document.createElement('div');
        btnLabel.className = 'item__btnLabel';
        btnLabel.textContent = 'DONE';
        btn.appendChild(btnLabel);

        btn.addEventListener('click', () => {
          markItemDone(item.id);
        });

        row.appendChild(left);
        row.appendChild(btn);

        itemsWrap.appendChild(row);
      }

      card.appendChild(header);
      card.appendChild(itemsWrap);

      list.appendChild(card);
    }
  }

  function markItemDone(itemId) {
    const data = state.data;
    for (const owner of data.owners) {
      for (const item of owner.items) {
        if (item.id === itemId) {
          item.status = 'done';
        }
      }
    }
    render();
    showToast('UPDATED');
  }

  function findTopRisk(stats) {
    // Priority: any blockers first (earliest in list), then highest-impact risk via simple heuristic.
    const blockers = stats.blockersOpen;
    if (blockers.length > 0) {
      // Choose the blocker that would be most visible in go/no-go: rollback/pricing/support training
      const priorityPhrases = [
        'Rollback', 'Pricing', 'Support', 'migration', 'test plan', 'schema', 'alerts', 'enablement', 'API docs'
      ];
      const scored = blockers.map(i => {
        const t = `${i.title} ${i.detail}`.toLowerCase();
        let s = 10;
        for (const p of priorityPhrases) {
          if (t.includes(p.toLowerCase())) s += 4;
        }
        return { i, s };
      }).sort((a, b) => b.s - a.s);

      return {
        pill: 'BLOCKER',
        title: scored[0].i.title,
        detail: `${scored[0].i.ownerLabel} • ${scored[0].i.detail}`
      };
    }

    const risks = stats.risksOpen;
    if (risks.length > 0) {
      return {
        pill: 'RISK',
        title: risks[0].title,
        detail: `${risks[0].ownerLabel} • ${risks[0].detail}`
      };
    }

    return {
      pill: 'CLEAR',
      title: 'No open blockers or risks',
      detail: 'Checklist is fully cleared for launch'
    };
  }

  function findNextAction(stats) {
    // One action: the single most time-sensitive blocker.
    const blockers = stats.blockersOpen;
    if (blockers.length === 0) {
      const risks = stats.risksOpen;
      if (risks.length === 0) {
        return { title: 'Hold go/no-go meeting', detail: 'Confirm comms are sent and monitoring is live' };
      }
      return { title: 'Close the top open risk', detail: `${risks[0].ownerLabel} • ${risks[0].title}` };
    }

    // Prefer actions that unblock multiple teams: rollback, test plan, support training, pricing page, API docs
    const preference = [
      'Rollback', 'test plan', 'Support training', 'Pricing page', 'API docs', 'migration', 'enablement', 'alerts'
    ];

    const scored = blockers.map(i => {
      const t = `${i.title} ${i.detail}`.toLowerCase();
      let s = 0;
      for (let idx = 0; idx < preference.length; idx++) {
        if (t.includes(preference[idx].toLowerCase())) s += (preference.length - idx) * 3;
      }
      return { i, s };
    }).sort((a, b) => b.s - a.s);

    const pick = scored[0]?.i || blockers[0];
    return { title: pick.title, detail: `${pick.ownerLabel} • Mark done when link is posted` };
  }

  function ownersCoverage(data) {
    const owners = data.owners;
    const openOwners = owners.filter(o => o.items.some(i => i.status !== 'done')).length;
    return { openOwners, totalOwners: owners.length };
  }

  function renderMeta(data) {
    $('#metaLaunchName').textContent = data.launch.name;
    $('#metaLaunchDate').textContent = data.launch.date;
    $('#metaSegment').textContent = data.launch.segment;
    $('#metaPlatform').textContent = data.launch.platform;
  }

  function renderDashboard(data) {
    const stats = computeScore(data);

    const blockersCount = stats.blockersOpen.length;
    const risksCount = stats.risksOpen.length;

    const band = riskBand(stats.overall, blockersCount);
    const accent = accentForTone(band.tone);
    setCssAccent(accent);
    setAmbientBackground(stats.overall);

    // Hero
    const scoreEl = $('#readinessScore');
    animateNumber(scoreEl, stats.overall, 150);

    const riskText = $('#riskTagText');
    riskText.textContent = band.label;
    const heroSub = $('#heroSub');
    heroSub.textContent = `${blockersCount} blocker${blockersCount === 1 ? '' : 's'} • ${risksCount} risk${risksCount === 1 ? '' : 's'} open`;

    // Blockers tile
    const blockerEl = $('#blockerCount');
    animateNumber(blockerEl, blockersCount, 150);
    $('#blockerSub').textContent = blockersCount === 0 ? 'No-go items cleared' : 'Must close before go/no-go';

    // Owners tile
    const cov = ownersCoverage(data);
    const covText = `${cov.openOwners}/${cov.totalOwners}`;
    $('#ownerCoverage').textContent = covText;
    $('#ownerCoverage').setAttribute('data-num', '0'); // avoid animateNumber on non-numeric
    $('#ownerSub').textContent = cov.openOwners === 0 ? 'All owners clear' : 'Owners still have open items';

    // Top risk tile
    const top = findTopRisk(stats);
    $('#topRiskPill').textContent = top.pill;
    $('#topRiskTitle').textContent = top.title;
    $('#topRiskDetail').textContent = top.detail;

    // Next action tile
    const next = findNextAction(stats);
    $('#nextActionTitle').textContent = next.title;
    $('#nextActionDetail').textContent = next.detail;

    // Tag dot inherits accent via CSS var; nothing else needed
  }

  function setTab(tab) {
    state.tab = tab;

    for (const b of $$('.tab')) {
      const active = b.dataset.tab === tab;
      b.classList.toggle('tab--active', active);
      if (active) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    }

    // Single-screen action principle: only show export in checklist context
    const panelChecklist = $('#panelChecklist');
    const grid = $('.grid');
    const metaPanel = $$('.panel').find(p => p !== panelChecklist) || null;

    // We keep content visible without interaction in dashboard; tabs are still allowed per style spec.
    // Tab behavior: dashboard shows everything; other tabs focus the user.
    if (tab === 'dashboard') {
      grid.style.display = 'grid';
      panelChecklist.style.display = 'block';
      if (metaPanel) metaPanel.style.display = 'block';
    } else if (tab === 'checklist') {
      grid.style.display = 'none';
      panelChecklist.style.display = 'block';
      if (metaPanel) metaPanel.style.display = 'none';
    } else if (tab === 'risks') {
      grid.style.display = 'grid';
      panelChecklist.style.display = 'none';
      if (metaPanel) metaPanel.style.display = 'none';
    } else if (tab === 'about') {
      grid.style.display = 'none';
      panelChecklist.style.display = 'none';
      if (metaPanel) metaPanel.style.display = 'block';
    }
  }

  function exportChecklistText(data) {
    const stats = computeScore(data);
    const band = riskBand(stats.overall, stats.blockersOpen.length);

    const owners = data.owners.map(o => {
      const open = o.items.filter(i => i.status !== 'done');
      const blockers = open.filter(i => i.severity === 'blocker');
      const risks = open.filter(i => i.severity === 'risk');
      return { ...o, open, blockers, risks };
    }).filter(o => o.open.length > 0);

    owners.sort((a, b) => {
      if (b.blockers.length !== a.blockers.length) return b.blockers.length - a.blockers.length;
      return b.open.length - a.open.length;
    });

    const lines = [];
    lines.push(`Launch: ${data.launch.name}`);
    lines.push(`Date: ${data.launch.date}`);
    lines.push(`Readiness: ${stats.overall}/100 (${band.label})`);
    lines.push(`Open blockers: ${stats.blockersOpen.length} • Open risks: ${stats.risksOpen.length}`);
    lines.push('');
    lines.push('Blocking checklist (by owner):');

    for (const o of owners) {
      const b = o.blockers.length;
      const r = o.risks.length;
      lines.push(``);
      lines.push(`- ${o.ownerLabel} (${b} blocker${b === 1 ? '' : 's'}, ${r} risk${r === 1 ? '' : 's'})`);
      const sorted = o.open.slice().sort((x, y) => {
        const sevRank = (s) => (s === 'blocker' ? 0 : s === 'risk' ? 1 : 2);
        if (sevRank(x.severity) !== sevRank(y.severity)) return sevRank(x.severity) - sevRank(y.severity);
        return x.title.localeCompare(y.title);
      });
      for (const item of sorted) {
        const tag = item.severity === 'blocker' ? '[BLOCKER]' : item.severity === 'risk' ? '[RISK]' : '[INFO]';
        lines.push(`  - ${tag} ${item.title} — ${item.detail}`);
      }
    }

    lines.push('');
    lines.push(`Updated: ${nowLabel()}`);

    return lines.join('\n');
  }

  function openSheet(text) {
    const sheet = $('#sheet');
    const ta = $('#exportText');
    ta.value = text;
    sheet.classList.add('sheet--open');
    sheet.setAttribute('aria-hidden', 'false');
    $('#copyStatus').textContent = 'Ready to copy.';
  }

  function closeSheet() {
    const sheet = $('#sheet');
    sheet.classList.remove('sheet--open');
    sheet.setAttribute('aria-hidden', 'true');
  }

  async function copyExport() {
    const ta = $('#exportText');
    const status = $('#copyStatus');
    const text = ta.value;

    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Copied.';
      showToast('COPIED');
    } catch (e) {
      // Fallback: select text so user can copy manually
      ta.focus();
      ta.select();
      status.textContent = 'Clipboard blocked — text selected for manual copy.';
      showToast('SELECTED');
    }
  }

  function wireEvents() {
    for (const t of $$('.tab')) {
      t.addEventListener('click', () => setTab(t.dataset.tab));
    }

    $('#btnExport').addEventListener('click', () => {
      const text = exportChecklistText(state.data);
      openSheet(text);
    });

    $('#btnCloseSheet').addEventListener('click', closeSheet);
    $('#sheetBackdrop').addEventListener('click', closeSheet);
    $('#btnCopy').addEventListener('click', copyExport);

    $('#btnReset').addEventListener('click', () => {
      state.data = defaultData();
      render();
      showToast('RESET');
    });

    // Escape closes sheet
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSheet();
    });
  }

  function render() {
    const data = state.data;

    $('#lastUpdated').textContent = `UPDATED ${nowLabel().toUpperCase()}`;

    renderMeta(data);
    buildOwnerList(data);
    renderDashboard(data);

    // Keep current tab rendering consistent after updates
    setTab(state.tab);
  }

  function init() {
    state.data = defaultData();
    wireEvents();
    render();
  }

  init();
})();