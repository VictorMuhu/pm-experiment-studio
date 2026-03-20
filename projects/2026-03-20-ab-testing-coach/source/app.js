// ── SCREEN ROUTER ──────────────────────────────────────────────────────────
const SCREENS = ['experiments', 'hypotheses', 'metrics', 'simulator', 'decision'];

function showScreen(name) {
  SCREENS.forEach(id => {
    const el = document.getElementById('screen-' + id);
    if (el) el.classList.remove('active');
  });
  const target = document.getElementById('screen-' + name);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.screen === name);
  });
  window.scrollTo(0, 0);
}

// Initialise on Experiments screen
showScreen('experiments');

// ── TOAST ──────────────────────────────────────────────────────────────────
let _toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 2600);
}

// ── EXPERIMENTS — SLIDER LIVE UPDATES ─────────────────────────────────────
function updateSlider(input, id, plus, suffix) {
  const v = parseFloat(input.value).toFixed(1);
  document.getElementById(id).textContent = (plus ? '+' : '') + v + suffix;
}

function updateDecisionImpact() {
  const lift = 6.2; // Simulated baseline lift
  const threshold = parseFloat(document.getElementById('success-slider').value);
  const dec = document.getElementById('rec-decision');
  const det = document.getElementById('rec-detail');
  if (lift >= threshold) {
    dec.textContent = 'SHIP TO 100%';
    dec.style.color = '#131b2e';
    det.innerHTML = 'Threshold (+' + threshold.toFixed(1) + '%) met with high confidence. Estimated annual revenue impact: <span class="font-mono">+$420k</span>';
  } else {
    dec.textContent = 'CONTINUE TESTING';
    dec.style.color = '#d97706';
    det.innerHTML = 'Threshold (+' + threshold.toFixed(1) + '%) not yet met. Simulated lift is +6.2%. Extend run duration or increase traffic.';
  }
}

document.getElementById('success-slider').addEventListener('input', function () {
  updateSlider(this, 'success-val', true, '%');
  updateDecisionImpact();
});
document.getElementById('failure-slider').addEventListener('input', function () {
  updateSlider(this, 'failure-val', false, '%');
});

function resetExperimentDefaults() {
  document.getElementById('success-slider').value = 5;
  document.getElementById('failure-slider').value = -2;
  document.getElementById('success-val').textContent = '+5.0%';
  document.getElementById('failure-val').textContent = '-2.0%';
  document.getElementById('cb-pagespeed').checked = true;
  document.getElementById('cb-churn').checked = true;
  document.getElementById('cb-aov').checked = false;
  updateDecisionImpact();
  showToast('Defaults restored');
}

// ── HYPOTHESIS BUILDER ─────────────────────────────────────────────────────
function toggleSeg(btn) {
  btn.classList.toggle('selected');
  buildHypothesis();
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHypothesis() {
  const feature = document.getElementById('hyp-feature').value.trim() || 'feature variable';
  const segs = [...document.querySelectorAll('.segment-pill.selected')].map(b => b.dataset.seg);
  const segText = segs.length ? segs.join(' + ') : 'target audience';
  const metric = document.getElementById('hyp-metric').value;
  const change = document.getElementById('hyp-change').value || '0';
  const reason = document.getElementById('hyp-reason').value.trim() || '...';

  document.getElementById('hyp-output').innerHTML =
    '"If we implement a <span class="text-primary font-bold">' + esc(feature) +
    '</span> for <span class="text-primary font-bold">' + esc(segText) +
    '</span>, then we will see a <span class="text-primary font-bold tabular">' + esc(change) +
    '%</span> increase in <span class="text-primary font-bold">' + esc(metric) +
    '</span>, because ' + esc(reason) + '"';

  const coachMap = {
    'New Users': '"Hypotheses targeting 'New Users' typically see 3x higher variance. Ensure your sample size is at least 4,200 for 95% confidence."',
    'Paid Subscribers': '"Paid Subscribers convert at 4.1x the rate of free users. A 2–3% lift still yields strong business impact."',
    'Dormant Cohort': '"Dormant cohorts have high noise-to-signal. Run for at least 6 weeks to clear seasonal variance."',
    'Mobile-Only': '"Mobile-Only segments benefit most from friction-reduction. Expect 10–15% higher variance than desktop."'
  };
  const firstSeg = segs[0];
  if (firstSeg && coachMap[firstSeg]) {
    document.getElementById('coach-insight-text').textContent = coachMap[firstSeg];
  }
}

const HYP_PRESETS = {
  checkout: { feature: 'Shortened Checkout Flow', metric: 'Conversion Rate (CR)', change: '8.2', reason: 'reducing the number of steps in mobile checkout reduces cognitive load and drop-off at the payment screen.' },
  greeting: { feature: 'Personalized Dashboard Greeting', metric: 'Engagement Score', change: '2.1', reason: 'personalized UI elements increase session engagement through recognition and reciprocity.' },
  onboarding: { feature: 'Multi-Step Onboarding Form', metric: 'Retention (Day 30)', change: '12.4', reason: 'progressive disclosure in onboarding reduces churn by building product familiarity gradually.' }
};

function loadHypothesis(key) {
  const p = HYP_PRESETS[key];
  if (!p) return;
  document.getElementById('hyp-feature').value = p.feature;
  document.getElementById('hyp-change').value = p.change;
  document.getElementById('hyp-reason').value = p.reason;
  const sel = document.getElementById('hyp-metric');
  [...sel.options].forEach((o, i) => { if (o.value === p.metric || o.text === p.metric) sel.selectedIndex = i; });
  buildHypothesis();
  showToast('Historical hypothesis loaded');
}

// ── EXPERIMENT SIMULATOR ───────────────────────────────────────────────────
const SIM_CFG = {
  success: {
    path: 'M0,120 Q50,110 100,100 T200,85 T300,70 T400,60 T500,45 T600,30',
    area: 'M0,120 Q50,110 100,100 T200,85 T300,70 T400,60 T500,45 T600,30 L600,250 L0,250 Z',
    color: '#006242', label: 'Variant (Success)',
    bannerBorder: '#006242', icon: 'rocket_launch', iconBg: 'rgba(0,98,66,0.1)',
    title: 'Automated Recommendation: Launch Variant',
    desc: 'The simulated scenario meets the 95% confidence threshold and exceeds the 2.5% MDE requirement.',
    roi: 'EXPECTED ROI: +$14.2k / mo', roiColor: '#005236',
    cr: '4.22%', crd: '↑ +0.34%', crColor: '#006242',
    br: '32.1%', brd: '↓ -1.2%', brColor: '#4edea3',
    aov: '$84.50', aovd: '~ 0.0%', aovColor: '#434656',
    coachTitle: 'Coach Analysis: "The Emerald Path"',
    coachBody: 'In this <span class="text-tertiary font-bold">Success</span> scenario, the variant demonstrates high resilience against seasonal fluctuations. Even with a simulated 5% variance increase, the Bayesian probability of being better than control remains above 98%. However, notice the neutral movement in <span class="font-bold">Avg. Order Value</span>—this suggests that while more users are completing checkout, the redesign hasn't incentivized larger baskets. Consider adding a post-simulation "Upsell Analysis" to find secondary wins.'
  },
  neutral: {
    path: 'M0,120 Q50,119 100,122 T200,120 T300,121 T400,119 T500,121 T600,120',
    area: 'M0,120 Q50,119 100,122 T200,120 T300,121 T400,119 T500,121 T600,120 L600,250 L0,250 Z',
    color: '#434656', label: 'Variant (Neutral)',
    bannerBorder: '#747688', icon: 'drag_handle', iconBg: 'rgba(67,70,86,0.1)',
    title: 'No Statistical Signal Detected',
    desc: 'Confidence intervals overlap zero. Insufficient evidence to ship or kill. Continue the experiment or increase traffic allocation.',
    roi: 'EXPECTED ROI: ~$0 / mo', roiColor: '#434656',
    cr: '3.90%', crd: '~ 0.0%', crColor: '#131b2e',
    br: '33.2%', brd: '~ 0.0%', brColor: '#131b2e',
    aov: '$84.30', aovd: '~ 0.0%', aovColor: '#434656',
    coachTitle: 'Coach Analysis: "The Fog"',
    coachBody: 'In this <span class="text-on-surface-variant font-bold">Neutral</span> scenario, no statistical conclusion can be drawn. Consider running for an additional 2 weeks or increasing traffic to 70/30.'
  },
  failure: {
    path: 'M0,120 Q50,130 100,142 T200,158 T300,172 T400,186 T500,200 T600,215',
    area: 'M0,120 Q50,130 100,142 T200,158 T300,172 T400,186 T500,200 T600,215 L600,250 L0,250 Z',
    color: '#ba1a1a', label: 'Variant (Failure)',
    bannerBorder: '#ba1a1a', icon: 'error_outline', iconBg: 'rgba(186,26,26,0.1)',
    title: 'Automated Recommendation: Kill Experiment',
    desc: 'The simulated variant causes statistically significant regression below the failure threshold. Immediate action required.',
    roi: 'EXPECTED LOSS: -$8.1k / mo', roiColor: '#ba1a1a',
    cr: '3.50%', crd: '↓ -2.8%', crColor: '#ba1a1a',
    br: '38.4%', brd: '↑ +2.1%', brColor: '#ba1a1a',
    aov: '$81.20', aovd: '↓ -1.9%', aovColor: '#ba1a1a',
    coachTitle: 'Coach Analysis: "The Red Flag"',
    coachBody: 'In this <span class="text-error font-bold">Failure</span> scenario, the variant is causing measurable harm. Conversion Rate has dropped 2.8% with a p-value of 0.003. Kill the experiment immediately and review change logs from the past 72 hours.'
  }
};

function setSim(btn) {
  const mode = btn.dataset.mode;
  const cfg = SIM_CFG[mode];

  document.querySelectorAll('.sim-btn').forEach(b => {
    b.className = 'sim-btn w-full flex items-center justify-between p-4 rounded bg-surface-container-low border border-outline-variant/20 transition-all';
  });
  if (mode === 'success') {
    btn.className = 'sim-btn w-full flex items-center justify-between p-4 rounded bg-tertiary/5 border-2 border-tertiary transition-all';
  } else if (mode === 'failure') {
    btn.className = 'sim-btn w-full flex items-center justify-between p-4 rounded bg-error/5 border-2 border-error transition-all';
  } else {
    btn.className = 'sim-btn w-full flex items-center justify-between p-4 rounded bg-surface-container-high border-2 transition-all';
    btn.style.borderColor = '#747688';
  }

  document.getElementById('sim-path').setAttribute('d', cfg.path);
  document.getElementById('sim-path').setAttribute('stroke', cfg.color);
  document.getElementById('sim-area').setAttribute('d', cfg.area);
  document.getElementById('sg-stop').setAttribute('stop-color', cfg.color);

  document.getElementById('sim-legend-color').style.color = cfg.color;
  document.getElementById('sim-legend-label').textContent = cfg.label;
  document.getElementById('sim-legend-color').querySelector('span').style.background = cfg.color;

  const banner = document.getElementById('sim-banner');
  banner.style.borderLeftColor = cfg.bannerBorder;
  document.getElementById('sim-icon').textContent = cfg.icon;
  document.getElementById('sim-icon').style.color = cfg.color;
  document.getElementById('sim-icon-wrap').style.background = cfg.iconBg;
  document.getElementById('sim-title').textContent = cfg.title;
  document.getElementById('sim-desc').textContent = cfg.desc;
  const roi = document.getElementById('sim-roi');
  roi.textContent = cfg.roi;
  roi.style.color = cfg.roiColor;
  roi.style.borderColor = cfg.roiColor + '33';

  const cr = document.getElementById('sim-cr');
  cr.textContent = cfg.cr; cr.style.color = cfg.crColor;
  const crd = document.getElementById('sim-cr-d');
  crd.textContent = cfg.crd; crd.style.color = cfg.crColor;
  document.getElementById('sim-br').textContent = cfg.br;
  const brd = document.getElementById('sim-br-d');
  brd.textContent = cfg.brd; brd.style.color = cfg.brColor;
  document.getElementById('sim-aov').textContent = cfg.aov;
  const aovd = document.getElementById('sim-aov-d');
  aovd.textContent = cfg.aovd; aovd.style.color = cfg.aovColor;

  document.getElementById('sim-coach-title').textContent = cfg.coachTitle;
  document.getElementById('sim-coach-body').innerHTML = cfg.coachBody;
}

function resetSim() {
  setSim(document.querySelector('.sim-btn[data-mode="success"]'));
  showToast('Simulation reset to Statistical Success mode');
}

// ── DECISION ENGINE ────────────────────────────────────────────────────────
function markStep(li) {
  if (li.classList.contains('done')) return;
  li.classList.add('done');
  const badge = li.querySelector('.step-badge');
  badge.innerHTML = '<span class="material-symbols-outlined text-[12px]">check</span>';
  badge.style.background = '#006242';
  badge.style.color = 'white';
  showToast('Step marked complete');
}

function applyRec() {
  document.querySelectorAll('.step-item').forEach(li => markStep(li));
  showToast('Recommendation applied — Variant A is now live at 100%');
}

// ── MODAL ──────────────────────────────────────────────────────────────────
function openModal() {
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('new-exp-name').focus(), 100);
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}
function createExp() {
  const name = document.getElementById('new-exp-name').value.trim();
  closeModal();
  showToast(name ? '"' + name + '" created — configuring now' : 'New experiment created');
  setTimeout(() => showScreen('experiments'), 400);
}

document.getElementById('modal-overlay').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
