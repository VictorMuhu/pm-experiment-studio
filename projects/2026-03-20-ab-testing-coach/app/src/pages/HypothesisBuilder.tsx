

const HypothesisBuilder = () => {
  return (
    <div className="px-12 pb-12 flex gap-8">
      {/* Builder Column */}
      <div className="flex-1 max-w-4xl space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline mb-2">Hypothesis Builder</h1>
          <p className="text-on-surface-variant text-sm">Structure your experimentation logic with empirical discipline.</p>
        </header>

        {/* Builder Module */}
        <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_4px_24px_rgba(19,27,46,0.04)] space-y-10">
          {/* IF Section */}
          <div className="grid grid-cols-[100px_1fr] gap-6 items-start">
            <div className="pt-2">
              <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">If:</span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest px-1">Experiment Type</label>
                  <select className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 py-3 outline-none">
                    <option>A/B Test (Split)</option>
                    <option>Multivariate</option>
                    <option>Personalization</option>
                    <option>Feature Flag Rollout</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest px-1">Feature Variable</label>
                  <input type="text" placeholder="e.g., 'Sticky CTA'" className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 py-3 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* FOR Section */}
          <div className="grid grid-cols-[100px_1fr] gap-6 items-start">
            <div className="pt-2">
              <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">For:</span>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest px-1">Target Audience Segment</label>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-full border border-primary bg-primary-fixed/30 text-primary text-xs font-semibold">New Users</button>
                <button className="px-4 py-2 rounded-full border border-outline-variant/30 text-on-surface-variant text-xs font-medium hover:bg-surface-container-high">Paid Subscribers</button>
                <button className="px-4 py-2 rounded-full border border-outline-variant/30 text-on-surface-variant text-xs font-medium hover:bg-surface-container-high">Dormant Cohort</button>
                <button className="px-4 py-2 rounded-full border border-outline-variant/30 text-on-surface-variant text-xs font-medium hover:bg-surface-container-high">Mobile-Only</button>
                <button className="px-2 py-2 text-primary">
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
              </div>
            </div>
          </div>

          {/* THEN Section */}
          <div className="grid grid-cols-[100px_1fr] gap-6 items-start">
            <div className="pt-2">
              <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Then:</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest px-1">Primary Success Metric</label>
                <select className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 py-3 outline-none">
                  <option>Conversion Rate (CR)</option>
                  <option>Average Order Value (AOV)</option>
                  <option>Retention (Day 30)</option>
                  <option>Engagement Score</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest px-1">Expected Change (%)</label>
                <div className="relative">
                  <input type="number" placeholder="4.5" className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 py-3 tabular outline-none" />
                  <span className="absolute right-4 top-3 text-on-surface-variant/50 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* BECAUSE Section */}
          <div className="grid grid-cols-[100px_1fr] gap-6 items-start">
            <div className="pt-2">
              <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Because:</span>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest px-1">Behavioral Reasoning</label>
              <textarea
                className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 p-4 resize-none outline-none"
                placeholder="Describe the psychological or behavioral trigger you're trying to activate..."
                rows={4}
              ></textarea>
            </div>
          </div>
        </section>

        {/* Preview Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Generated Hypothesis Statement</h3>
          <div className="glass-effect p-8 rounded-xl border border-white/40 shadow-xl">
            <p className="text-lg font-headline leading-relaxed text-on-background">
              "If we implement a <span className="text-primary font-bold">Sticky CTA</span> for <span className="text-primary font-bold">New Users</span>, then we will see a <span className="text-primary font-bold tabular">4.5%</span> increase in <span className="text-primary font-bold">Conversion Rate</span>, because reducing interaction cost on long landing pages increases mental availability for the purchase decision."
            </p>
          </div>
        </section>

        {/* Action Bar */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <button className="px-6 py-3 text-on-secondary-container font-semibold hover:bg-surface-container-high transition-all rounded">
            Save Draft
          </button>
          <button className="primary-gradient px-8 py-3 text-white font-bold rounded shadow-lg flex items-center space-x-2 transition-transform active:scale-95">
            <span>Define Metrics</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* History Sidebar */}
      <aside className="w-80 space-y-6">
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold tracking-tight text-on-surface">Historical Record</h3>
            <span className="material-symbols-outlined text-on-surface-variant text-lg">history</span>
          </div>

          <div className="space-y-4">
            {/* History Item 1 */}
            <div className="bg-surface-container-lowest p-4 rounded-lg border-l-4 border-tertiary shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-tertiary-container uppercase tracking-tighter">Success</span>
                <span className="text-[10px] text-on-surface-variant tabular">12 Oct 2023</span>
              </div>
              <p className="text-xs font-medium text-on-surface mb-2 line-clamp-2">"Shortened checkout flow for mobile users..."</p>
              <div className="flex items-center text-[10px] text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
                <span>+8.2% Conv.</span>
              </div>
            </div>

            {/* History Item 2 */}
            <div className="bg-surface-container-lowest p-4 rounded-lg border-l-4 border-error shadow-sm opacity-80">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-error uppercase tracking-tighter">Inconclusive</span>
                <span className="text-[10px] text-on-surface-variant tabular">28 Sep 2023</span>
              </div>
              <p className="text-xs font-medium text-on-surface mb-2 line-clamp-2">"Personalized greeting on dashboard..."</p>
              <div className="flex items-center text-[10px] text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-[14px] mr-1">flatware</span>
                <span>p &gt; 0.05</span>
              </div>
            </div>

            {/* History Item 3 */}
            <div className="bg-surface-container-lowest p-4 rounded-lg border-l-4 border-primary shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Success</span>
                <span className="text-[10px] text-on-surface-variant tabular">15 Sep 2023</span>
              </div>
              <p className="text-xs font-medium text-on-surface mb-2 line-clamp-2">"Multi-step onboarding form vs Single page..."</p>
              <div className="flex items-center text-[10px] text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
                <span>+12.4% Completion</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 py-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:bg-primary-fixed/20 transition-colors">
            View Complete Ledger
          </button>
        </div>

        {/* Coach Insight Card */}
        <div className="bg-tertiary-container p-6 rounded-xl text-white relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-tertiary-fixed">auto_awesome</span>
              <span className="text-[10px] font-bold tracking-widest uppercase">Coach Insight</span>
            </div>
            <p className="text-xs leading-relaxed font-medium">
              "Hypotheses targeting 'New Users' typically see 3x higher variance. Ensure your sample size is at least 4,200 for 95% confidence."
            </p>
          </div>
          {/* Abstract Pattern Decoration */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-tertiary-fixed opacity-10 rounded-full blur-2xl"></div>
        </div>
      </aside>

      {/* Contextual FAB */}
      <button className="fixed bottom-8 right-8 primary-gradient w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90 group">
        <span className="material-symbols-outlined" style={ {fontVariationSettings: "'FILL' 0, 'wght' 600"} }>add</span>
        <span className="absolute right-16 bg-on-surface text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">New Experiment</span>
      </button>
    </div>
  );
};

export default HypothesisBuilder;