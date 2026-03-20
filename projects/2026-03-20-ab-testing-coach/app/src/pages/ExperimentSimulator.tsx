

const ExperimentSimulator = () => {
  return (
    <div className="px-10 pb-12">
      {/* Header Section */}
      <header className="mb-10 flex justify-between items-end">
        <div>
          <span className="text-label-sm text-on-surface-variant uppercase tracking-[0.2em] font-semibold text-[10px]">Simulation Module</span>
          <h2 className="text-[2rem] font-bold text-on-surface tracking-tight leading-none mt-1">Experiment Simulator</h2>
          <p className="text-on-surface-variant mt-2 max-w-2xl">Project potential outcomes for <span className="font-bold text-primary italic">"Checkout Redesign v2"</span> based on current confidence intervals and synthetic variance.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-5 py-2.5 bg-secondary-container text-on-secondary-container font-medium rounded text-sm hover:opacity-90 transition-all flex items-center">
            <span className="material-symbols-outlined mr-2 text-[18px]">refresh</span> Reset Simulation
          </button>
          <button className="px-5 py-2.5 primary-gradient text-on-primary font-bold rounded text-sm hover:opacity-90 transition-all flex items-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined mr-2 text-[18px]">publish</span> Sync Parameters
          </button>
        </div>
      </header>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Simulation Controls */}
        <section className="col-span-4 space-y-6">
          {/* Outcome Selection */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border-none shadow-sm">
            <h3 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-widest">Select Outcome Mode</h3>

            <div className="grid grid-cols-1 gap-3">
              {/* Success Toggle */}
              <button className="w-full flex items-center justify-between p-4 rounded bg-tertiary/5 border-2 border-tertiary transition-all group">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-tertiary mr-3" style={ {fontVariationSettings: "'FILL' 1"} }>check_circle</span>
                  <div className="text-left">
                    <p className="text-sm font-bold text-on-surface">Statistical Success</p>
                    <p className="text-[11px] text-on-surface-variant">Variant exceeds MDE threshold</p>
                  </div>
                </div>
                <span className="text-tertiary font-bold tabular">+4.2%</span>
              </button>

              {/* Neutral Toggle */}
              <button className="w-full flex items-center justify-between p-4 rounded bg-surface-container-low border border-outline-variant/20 hover:border-outline-variant transition-all">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-on-surface-variant mr-3">drag_handle</span>
                  <div className="text-left">
                    <p className="text-sm font-bold text-on-surface">Neutral / Non-Inference</p>
                    <p className="text-[11px] text-on-surface-variant">Confidence intervals overlap 0</p>
                  </div>
                </div>
                <span className="text-on-surface-variant font-bold tabular">~0.0%</span>
              </button>

              {/* Failure Toggle */}
              <button className="w-full flex items-center justify-between p-4 rounded bg-surface-container-low border border-outline-variant/20 hover:border-error/50 transition-all">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-error mr-3">error_outline</span>
                  <div className="text-left">
                    <p className="text-sm font-bold text-on-surface">Statistical Failure</p>
                    <p className="text-[11px] text-on-surface-variant">Variant causes negative regression</p>
                  </div>
                </div>
                <span className="text-error font-bold tabular">-2.8%</span>
              </button>
            </div>
          </div>

          {/* Parameters Card */}
          <div className="bg-surface-container-low p-6 rounded-xl">
            <h3 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-widest">Confidence Thresholds</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-on-surface-variant mb-2">
                  <span>P-VALUE THRESHOLD</span>
                  <span className="tabular">0.05</span>
                </div>
                <div className="h-1.5 w-full bg-surface-dim rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[85%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-on-surface-variant mb-2">
                  <span>STATISTICAL POWER</span>
                  <span className="tabular">80%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-dim rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[80%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Visual Projection & Analysis */}
        <section className="col-span-8 space-y-6">
          {/* Chart Section */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border-none relative overflow-hidden">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">Metric Projection: Conversion Rate</h3>
                <p className="text-[12px] text-on-surface-variant">Projected 14-day cumulative movement</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-on-surface-variant/30 rounded-sm"></span>
                  <span className="text-[11px] font-bold text-on-surface-variant">CONTROL</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-tertiary rounded-sm"></span>
                  <span className="text-[11px] font-bold text-on-surface">VARIANT (SIM)</span>
                </div>
              </div>
            </div>

            {/* Mock Chart Visualization */}
            <div className="h-64 w-full relative">
              {/* Y-Axis Labels */}
              <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] tabular text-on-surface-variant/60 font-medium">
                <span>4.0%</span>
                <span>3.5%</span>
                <span>3.0%</span>
                <span>2.5%</span>
              </div>

              {/* Grid Lines */}
              <div className="ml-10 h-full w-[calc(100%-2.5rem)] flex flex-col justify-between">
                <div className="border-b border-surface-container-high w-full"></div>
                <div className="border-b border-surface-container-high w-full"></div>
                <div className="border-b border-surface-container-high w-full"></div>
                <div className="border-b border-surface-container-high w-full"></div>
              </div>

              {/* SVG Paths (Control & Sim) */}
              <svg className="absolute top-0 left-10 w-[calc(100%-2.5rem)] h-full overflow-visible">
                {/* Control Path */}
                <path d="M0,120 Q50,115 100,125 T200,122 T300,128 T400,120 T500,125 T600,122" fill="none" opacity="0.4" stroke="#434656" strokeDasharray="4 4" strokeWidth="2"></path>
                {/* Sim Path (Success) */}
                <path d="M0,120 Q50,110 100,100 T200,85 T300,70 T400,60 T500,45 T600,30" fill="none" stroke="#006242" strokeWidth="3"></path>
                {/* Gradient Area */}
                <path d="M0,120 Q50,110 100,100 T200,85 T300,70 T400,60 T500,45 T600,30 V256 H0 Z" fill="url(#grad1)" opacity="0.1"></path>
                <defs>
                  <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={ {stopColor: '#006242', stopOpacity: 1} }></stop>
                    <stop offset="100%" style={ {stopColor: '#ffffff', stopOpacity: 0} }></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Decision Feedback Banner */}
          <div className="glass-panel p-6 rounded-xl flex items-center justify-between border-l-4 border-tertiary">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-tertiary/10 flex items-center justify-center rounded-lg mr-5">
                <span className="material-symbols-outlined text-tertiary" style={ {fontVariationSettings: "'FILL' 1"} }>rocket_launch</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface mb-0.5">Automated Recommendation: Launch Variant</h4>
                <p className="text-xs text-on-surface-variant">The simulated scenario meets the 95% confidence threshold and exceeds the 2.5% MDE requirement.</p>
              </div>
            </div>
            <div className="bg-white/50 px-4 py-2 rounded text-[11px] font-bold text-tertiary-fixed-variant border border-tertiary/20 tabular">
              EXPECTED ROI: +$14.2k / mo
            </div>
          </div>

          {/* Impact Analysis Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-5 rounded-xl border-none shadow-sm">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Primary Metric</span>
              <h5 className="text-xs font-bold text-on-surface mt-1 mb-3">Conversion Rate</h5>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-tertiary tabular">4.22%</span>
                <span className="text-[10px] text-tertiary font-bold">↑ +0.34%</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-xl border-none shadow-sm">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Guardrail</span>
              <h5 className="text-xs font-bold text-on-surface mt-1 mb-3">Bounce Rate</h5>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-on-surface tabular">32.1%</span>
                <span className="text-[10px] text-tertiary-fixed-dim font-bold">↓ -1.2%</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-xl border-none shadow-sm">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Guardrail</span>
              <h5 className="text-xs font-bold text-on-surface mt-1 mb-3">Avg. Order Value</h5>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-on-surface tabular">$84.50</span>
                <span className="text-[10px] text-on-surface-variant font-bold">~ 0.0%</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Coach Insights Side Panel */}
      <section className="mt-8">
        <div className="bg-surface-container-low rounded-xl p-8 border-none overflow-hidden relative">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 primary-gradient rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary/30">
                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-on-surface mb-2">Coach Analysis: "The Emerald Path"</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-4xl">
                In this <span className="text-tertiary font-bold">Success</span> scenario, the variant demonstrates high resilience against seasonal fluctuations. Even with a simulated 5% variance increase, the Bayesian probability of being better than control remains above 98%. However, notice the neutral movement in <span className="font-bold">Avg. Order Value</span>—this suggests that while more users are completing checkout, the redesign hasn't incentivized larger baskets. Consider adding a post-simulation "Upsell Analysis" to find secondary wins.
              </p>
              <div className="mt-6 flex space-x-4">
                <button className="text-xs font-bold text-primary hover:underline flex items-center uppercase tracking-widest">
                  EXPLORE COUNTER-FACTUALS <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                </button>
                <button className="text-xs font-bold text-on-surface-variant hover:text-on-surface flex items-center uppercase tracking-widest">
                  EXPORT SIMULATION PDF <span className="material-symbols-outlined text-sm ml-1">download</span>
                </button>
              </div>
            </div>
          </div>

          {/* Abstract Texture Overlay */}
          <div className="absolute right-0 top-0 h-full w-48 pointer-events-none opacity-10">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuADL-IRcnaHQr0lhelsB7r89TKmlhXFwdDxzAl9X-KzT5kNosAaCx83xSLV0VsfcG-vPZ_hncJBIU_0qVvFploMAwQ7IHpYpW6ZzWm2uc5NORY1HzM634n6fT2ju2iEYY0o8yY9eSghZqEOTmio2S1QTYd7-aIKEs4Pymv2c6bOou42wTCTXHf8HxQYFyc3tMP-nCOFjGQFHUDxqW4jX-iRc-BLqPSMem_c62UnQO8s4OLvBxkFEXpnyVv3NrhtoqPNjQFQlF2CGXwa" alt="Abstract network pattern background" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExperimentSimulator;