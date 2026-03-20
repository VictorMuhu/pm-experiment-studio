

const DecisionEngine = () => {
  return (
    <div className="px-10 pb-12 min-h-screen bg-surface pt-8">
      {/* Page Header */}
      <header className="mb-8 flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase mb-1">
            <span>Experiments</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary">Checkout flow v2.4</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Decision Engine</h1>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 text-sm font-semibold rounded bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-all">
            Export Analysis
          </button>
          <button className="px-6 py-2.5 text-sm font-bold rounded primary-gradient text-white shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            Apply Recommendation
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Primary Decision */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Decision Banner */}
          <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm relative overflow-hidden">
            <div className="flex items-start">
              <div className="h-16 w-16 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary mr-8">
                <span className="material-symbols-outlined text-4xl" style={ {fontVariationSettings: "'FILL' 1"} }>verified</span>
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary mb-2 block">Recommendation Engine</span>
                <h2 className="text-5xl font-black text-on-surface tracking-tighter mb-2">SHIP TO 100%</h2>
                <p className="text-on-surface-variant text-sm max-w-lg leading-relaxed">
                  Statistical significance reached for the primary conversion metric. Variance is within acceptable architectural bounds. Recommended action: <b>Launch</b>.
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black tabular tracking-tighter text-tertiary">94<span className="text-xl">%</span></div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Confidence</div>
              </div>
            </div>
          </section>

          {/* Primary Metric Lift */}
          <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-10">Primary Metric Lift Analysis</h3>

            <div className="relative h-48 w-full border-l border-b border-outline-variant/20 flex items-center justify-around">
              {/* Control Marker */}
              <div className="flex flex-col items-center">
                <div className="h-24 w-0.5 bg-outline-variant/30 relative flex items-center justify-center">
                  <div className="absolute w-4 h-0.5 bg-outline-variant/50 top-0"></div>
                  <div className="absolute w-4 h-0.5 bg-outline-variant/50 bottom-0"></div>
                  <div className="w-3 h-3 bg-on-surface-variant rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <span className="text-[10px] font-bold tabular mt-4 text-on-surface-variant uppercase">Control: 4.28%</span>
              </div>

              {/* Lift Arrow */}
              <div className="flex flex-col items-center pt-8">
                <div className="flex items-center gap-1 text-tertiary mb-2">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span className="text-xl font-black tabular">+6.2%</span>
                </div>
                <div className="w-32 h-0.5 bg-tertiary/20"></div>
              </div>

              {/* Variant Marker */}
              <div className="flex flex-col items-center">
                <div className="h-32 w-0.5 bg-primary/30 relative flex items-center justify-center">
                  <div className="absolute w-6 h-0.5 bg-primary/50 top-0"></div>
                  <div className="absolute w-6 h-0.5 bg-primary/50 bottom-0"></div>
                  <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md"></div>
                </div>
                <span className="text-[10px] font-bold tabular mt-4 text-primary uppercase">Variant A: 4.54%</span>
              </div>
            </div>
          </section>

          {/* Guardrail Metrics & Secondary Impact */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Guardrail Metrics & Secondary Impact</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-surface rounded-lg border border-outline-variant/5">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Avg. Order Value</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold tabular text-on-surface">$42.10</span>
                  <span className="text-[10px] font-bold text-tertiary">↑ +2.1%</span>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg border border-outline-variant/5">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Page Load Speed</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold tabular text-on-surface">1.2s</span>
                  <span className="text-[10px] font-bold text-on-surface-variant">~ 0.0%</span>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg border border-error/10">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Support Tickets</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold tabular text-on-surface">0.04%</span>
                  <span className="text-[10px] font-bold text-error">↑ +12%</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Insights & Actions */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Coach Insights Card */}
          <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 relative overflow-hidden">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 primary-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">Coach Insights</span>
                <h3 className="text-lg font-bold text-on-surface">Deep-Dive Analysis</h3>
              </div>
            </div>

            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 italic">
              "The uplift is most pronounced in mobile users on iOS. This suggests the checkout redesign successfully reduced friction in biometric authentication flows. Consider a full roll-out for mobile segments while monitoring Android web conversion for a 24h trailing window."
            </p>

            <button className="w-full py-2.5 text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20 hover:bg-primary/5 transition-colors">
              View Segment Breakdown
            </button>

            {/* Abstract Pattern */}
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[120px]">analytics</span>
            </div>
          </section>

          {/* Recommended Next Steps */}
          <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-xl">task_alt</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface">Recommended Next Steps</h3>
            </div>

            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">End Experiment Tracking</h4>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed mt-1">Sufficient data collected to reach 95% threshold. Avoid data peaking bias by concluding the test now.</p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Update Product Roadmap</h4>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed mt-1">Integrate Variant A as the new global baseline for the checkout service.</p>
                </div>
              </li>

              <li className="flex gap-4 opacity-50">
                <div className="h-6 w-6 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Schedule Retrospective</h4>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed mt-1">Log findings into the Empirical Ledger for future hypothesis generation.</p>
                </div>
              </li>
            </ul>
          </section>

          {/* Status Metadata */}
          <div className="flex items-center justify-between px-2 py-4 border-t border-outline-variant/10 opacity-60">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-[10px] font-bold uppercase tracking-tighter">
                <span className="material-symbols-outlined text-xs mr-1">history</span>
                Verified 2h ago
              </div>
              <div className="flex items-center text-[10px] font-bold uppercase tracking-tighter">
                <span className="material-symbols-outlined text-xs mr-1">verified_user</span>
                Integrity: High
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest">System Status</span>
              <div className="h-2 w-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionEngine;