

const ExperimentConfiguration = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Page Header */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-headline tracking-tight text-on-surface">Experiment Configuration</h2>
          <p className="text-on-surface-variant mt-1 text-sm">
            Define metrics and statistical boundaries for <span className="font-mono bg-surface-container-high px-1.5 py-0.5 rounded text-primary">EXP-402: Check-out Optimization</span>
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-5 py-2.5 text-sm font-semibold rounded bg-secondary-container text-on-secondary-container hover:bg-surface-container-high transition-all">
            Reset Defaults
          </button>
          <button className="px-6 py-2.5 text-sm font-bold rounded bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg hover:opacity-90 active:scale-[0.98] transition-all">
            Launch Simulation
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Metric Definition */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Primary Metric Card */}
          <section className="bg-surface-container-lowest p-6 rounded shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Primary Success Metric</h3>
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">REQUIRED</span>
            </div>

            <div className="flex items-center p-4 bg-surface-container-low rounded group cursor-pointer hover:bg-surface-container transition-colors">
              <div className="h-10 w-10 rounded bg-primary flex items-center justify-center text-on-primary mr-4">
                <span className="material-symbols-outlined">shopping_cart</span>
              </div>
              <div>
                <p className="font-semibold text-on-surface">Conversion Rate</p>
                <p className="text-xs text-on-surface-variant">Percentage of users completing checkout.</p>
              </div>
              <span className="material-symbols-outlined ml-auto text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward_ios</span>
            </div>
          </section>

          {/* Guardrail & Counter Metrics */}
          <section className="bg-surface-container-lowest p-6 rounded shadow-sm border border-outline-variant/10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Health & Business Metrics</h3>
            <div className="space-y-4">
              {/* Metric Row */}
              <div className="flex items-center justify-between py-3 border-b border-surface-container">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-on-surface-variant mr-3 text-lg">speed</span>
                  <div>
                    <p className="text-sm font-medium">Page Load Time</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Guardrail</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-mono text-on-surface-variant">Max +100ms</span>
                  <input type="checkbox" defaultChecked className="rounded w-4 h-4 text-primary border-outline-variant focus:ring-primary/20" />
                </div>
              </div>

              {/* Metric Row */}
              <div className="flex items-center justify-between py-3 border-b border-surface-container">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-on-surface-variant mr-3 text-lg">person_off</span>
                  <div>
                    <p className="text-sm font-medium">Churn Rate</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Guardrail</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-mono text-on-surface-variant">Max +0.5%</span>
                  <input type="checkbox" defaultChecked className="rounded w-4 h-4 text-primary border-outline-variant focus:ring-primary/20" />
                </div>
              </div>

              {/* Metric Row */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-on-surface-variant mr-3 text-lg">payments</span>
                  <div>
                    <p className="text-sm font-medium">Avg. Order Value</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Counter Metric</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-mono text-on-surface-variant">Inform Only</span>
                  <input type="checkbox" className="rounded w-4 h-4 text-primary border-outline-variant focus:ring-primary/20" />
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-2 border border-dashed border-outline-variant rounded text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors">
              + ADD CUSTOM METRIC
            </button>
          </section>
        </div>

        {/* Right Column: Threshold Setting (The Demo Moment) */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <section className="bg-surface-container-lowest p-8 rounded shadow-sm border border-outline-variant/10">
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Decision Thresholds</h3>
              <p className="text-sm text-on-surface-variant">Calibrate the engine to declare a winner or kill a failing test.</p>
            </div>

            {/* Historical Baseline Visualization */}
            <div className="bg-surface-container-low p-6 rounded mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl">show_chart</span>
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Historical Baseline (30d)</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold tabular tracking-tighter">4.28%</span>
                    <span className="text-xs font-medium text-on-surface-variant">CVR</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Confidence Interval</p>
                  <p className="text-sm font-mono text-on-surface">95.0%</p>
                </div>
              </div>

              {/* Simple Sparkline Representation */}
              <div className="mt-4 h-12 flex items-end space-x-1 opacity-40">
                {[50, 75, 66, 80, 50, 60, 66, 50, 80, 75].map((height, i) => (
                  <div key={i} className={`bg-primary w-full rounded-t-sm`} style={ { height: `${height}%` } }></div>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-10 px-2">
              {/* Success Threshold */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-bold flex items-center">
                    <span className="w-2 h-2 bg-tertiary rounded-full mr-2"></span>
                    Success Threshold (Lift)
                  </label>
                  <span className="text-lg font-mono font-bold text-tertiary tabular">+5.0%</span>
                </div>
                <input type="range" min="0" max="20" defaultValue="5" className="w-full cursor-pointer accent-tertiary" />
                <div className="flex justify-between mt-2 text-[10px] font-mono text-on-surface-variant">
                  <span>CONSERVATIVE (+1%)</span>
                  <span>AGGRESSIVE (+20%)</span>
                </div>
              </div>

              {/* Failure Threshold */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-bold flex items-center">
                    <span className="w-2 h-2 bg-error rounded-full mr-2"></span>
                    Failure Threshold (Drop)
                  </label>
                  <span className="text-lg font-mono font-bold text-error tabular">-2.0%</span>
                </div>
                <input type="range" min="-10" max="0" defaultValue="-2" className="w-full cursor-pointer accent-error" />
                <div className="flex justify-between mt-2 text-[10px] font-mono text-on-surface-variant">
                  <span>SENSITIVE (-0.5%)</span>
                  <span>TOLERANT (-10%)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Real-time Decision Impact */}
          <section className="bg-surface-container p-8 rounded-xl relative border-2 border-primary/20">
            <div className="flex items-start">
              <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm mr-6">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Predicted Engine Action</h4>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Simulated Result</p>
                    <p className="text-2xl font-bold font-headline">+6.2% Lift</p>
                    <p className="text-xs text-on-surface-variant mt-1">Probability of Beat: <span className="font-mono">98.4%</span></p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-lg border border-primary/10">
                    <div className="flex items-center text-tertiary mb-1">
                      <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Recommended Decision</span>
                    </div>
                    <p className="text-xl font-extrabold text-on-surface">SHIP TO 100%</p>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed mt-2">
                      Threshold (+5.0%) met with high confidence. Estimated annual revenue impact: <span className="font-mono">+$420k</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer Meta */}
      <footer className="mt-12 flex items-center justify-between py-6 border-t border-surface-container text-on-surface-variant">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-2">history</span>
            <span className="text-xs">Last updated by <strong>Admin</strong> 2h ago</span>
          </div>
          <div className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-2">verified_user</span>
            <span className="text-xs">Statistical Integrity: <strong>Verified</strong></span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-widest opacity-40">System Status</span>
          <span className="h-2 w-2 rounded-full bg-tertiary-fixed-dim"></span>
        </div>
      </footer>
    </div>
  );
};

export default ExperimentConfiguration;