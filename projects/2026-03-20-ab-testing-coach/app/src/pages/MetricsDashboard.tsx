

const MetricsDashboard = () => {
  return (
    <div className="px-8 pb-12 bg-surface min-h-screen pt-4">
      {/* Page Header is theoretically covered by TopNavBar, but Screen 5 had its own specific header structure.
          I will include the title in the page itself as per the layout assumption. */}
      <header className="mb-8">
        <h2 className="text-lg font-bold text-[#131b2e] dark:text-slate-100 font-['Inter'] tracking-tight">Metrics Dashboard</h2>
      </header>

      <div className="grid grid-cols-12 gap-8 mt-4">
        {/* Left Column: Primary Metrics & Guardrails */}
        <div className="col-span-12 lg:col-span-8 space-y-8">

          {/* Section 1: Primary Metrics (High-Impact Cards) */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Primary Metrics</h3>
              <span className="text-xs font-medium text-on-surface-variant tabular">Past 30 Days</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Conversion Rate Card */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border-none transition-all hover:bg-surface-container-high/20">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-tight">Conversion Rate</span>
                  <span className="material-symbols-outlined text-primary text-lg" style={ {fontVariationSettings: "'FILL' 1"} }>trending_up</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight tabular">4.82%</span>
                  <span className="text-xs font-bold text-tertiary tabular">+0.12%</span>
                </div>
                <div className="mt-4 h-12 w-full bg-surface-container-low rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/20"></div>
                  <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary opacity-30"></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/10">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase">Variance</p>
                    <p className="text-xs font-bold tabular">σ 0.04</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase">Confidence</p>
                    <p className="text-xs font-bold tabular">98.4%</p>
                  </div>
                </div>
              </div>

              {/* ARPU Card */}
              <div className="bg-surface-container-lowest p-6 rounded-xl border-none transition-all hover:bg-surface-container-high/20">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-tight">Revenue Per User</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">payments</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight tabular">$124.50</span>
                  <span className="text-xs font-bold text-on-surface-variant tabular">Stable</span>
                </div>
                <div className="mt-4 h-12 w-full bg-surface-container-low rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-on-surface-variant/5 to-on-surface-variant/10"></div>
                  <div className="absolute bottom-4 left-0 h-[1px] w-full bg-on-surface-variant opacity-20"></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/10">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase">Baseline</p>
                    <p className="text-xs font-bold tabular">$124.00</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase">P-Value</p>
                    <p className="text-xs font-bold tabular">0.021</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Guardrail & Counter Metrics */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Guardrail & Counter Metrics</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-tertiary px-2 py-0.5 bg-tertiary-fixed-dim/20 rounded">SAFE: 3</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-error px-2 py-0.5 bg-error-container/40 rounded">DRIFT: 1</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-on-surface-variant">Metric Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-on-surface-variant">Current Value</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-on-surface-variant">Baseline Shift</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold">Page Load Speed</p>
                      <p className="text-[10px] text-on-surface-variant">Core Vitals (LCP)</p>
                    </td>
                    <td className="px-6 py-4 tabular text-sm">1.2s</td>
                    <td className="px-6 py-4 tabular text-sm text-tertiary font-bold">-0.1s</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-tertiary px-2 py-1 bg-tertiary/10 rounded-lg">SAFE</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold">Churn Rate</p>
                      <p className="text-[10px] text-on-surface-variant">7-Day Retention</p>
                    </td>
                    <td className="px-6 py-4 tabular text-sm">2.4%</td>
                    <td className="px-6 py-4 tabular text-sm text-error font-bold">+0.8%</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-error px-2 py-1 bg-error/10 rounded-lg">WARNING</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold">Support Tickets</p>
                      <p className="text-[10px] text-on-surface-variant">Volume per 1k DAU</p>
                    </td>
                    <td className="px-6 py-4 tabular text-sm">12.5</td>
                    <td className="px-6 py-4 tabular text-sm text-on-surface-variant">Stable</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-on-surface-variant px-2 py-1 bg-surface-container/50 rounded-lg">SAFE</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Metric Repository */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Metric Repository</h3>
              <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                View All <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="group bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between hover:bg-surface-container-high transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-surface-container-lowest">
                    <span className="material-symbols-outlined">dataset</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Search Precision (NDCG)</h4>
                    <p className="text-xs text-on-surface-variant">Ranking quality based on manual relevance scoring.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Owner</p>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs font-medium">Growth Team</span>
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5QlGULS2ZGql68Q_rwD_eTEQNMH5voHQGOw7S8Qaj4Y7WPe4O-iNlb_vwJ1C8XgKBTMqmLiZp609hX9M2ChWEIpbZbCW1vzH74jXhDjhUaKdbFCVyBiFu5zHoEv9YjbpFBUGq19NDmJ-KXB2jSn4zrWjjONM7xFAtoDmXJ_wdCjCb6VDuui1wZnKwjI4pOhwuViKW0tiEbPGOsGVPazidrt2iJtJmeyrqJipidwD-Zne1fZn3GZbsUtDA52sXfnHONeJUep9xtE5C" alt="Growth team logo" className="w-5 h-5 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="group bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between hover:bg-surface-container-high transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-surface-container-lowest">
                    <span className="material-symbols-outlined">touch_app</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">CTR: Primary CTA</h4>
                    <p className="text-xs text-on-surface-variant">Clicks on 'Start Trial' divided by unique visitors.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Owner</p>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs font-medium">Product Design</span>
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNWH-DwGNmuRNNh45U-w-KvqYupsF_8cPs5g_fNVbaRZZZzvnC8CSW6VwdpWlBZ8jMo6-OnI_VwwpoNjWzHiVRNpCO7AICI25nklRGl2zTdim-1EuGOJoz1hwUM-i_AYHwvEGHVubSKNxliTolV0Zt2kkm-s9FsOw7xQqPz5O45s08X6Zwcl1ZN-_KmMGyE4ARoH3FAHkXI8q6heY4CeCxGiX9vrghS_PkNFQBfVooGAoT5u_UnZyjZtQROyCBJkflf9etilawEGUg" alt="Product design logo" className="w-5 h-5 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Coach Insights Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="sticky top-24">
            <div className="bg-surface-variant/70 backdrop-blur-xl p-6 rounded-xl border-none shadow-sm relative overflow-hidden">
              {/* Glassmorphism Signature Gradient */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-3xl"></div>

              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary" style={ {fontVariationSettings: "'FILL' 1"} }>auto_awesome</span>
                <h3 className="text-sm font-black uppercase tracking-widest text-on-surface">Coach Insights</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-on-surface-variant">Data Integrity Health</span>
                    <span className="text-xs font-black tabular">94%</span>
                  </div>
                  <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary-fixed-dim" style={ {width: '94%'} }></div>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-lowest/50 rounded-lg">
                  <p className="text-xs font-bold text-on-surface mb-2">Anomalies Detected</p>
                  <ul className="space-y-2">
                    <li className="flex gap-2 text-[11px] text-on-surface-variant leading-relaxed">
                      <span className="material-symbols-outlined text-[14px] text-secondary mt-0.5">info</span>
                      <span>Conversion Rate for "Checkout v2" shows unusual variance in mobile segments.</span>
                    </li>
                    <li className="flex gap-2 text-[11px] text-on-surface-variant leading-relaxed">
                      <span className="material-symbols-outlined text-[14px] text-error mt-0.5">warning</span>
                      <span>Sample Ratio Mismatch (SRM) warning for Experiment ID: #1042.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <p className="text-[10px] font-black uppercase text-on-surface-variant mb-4">Integrity Checklist</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-tertiary text-sm" style={ {fontVariationSettings: "'FILL' 1"} }>check_circle</span>
                      <span className="text-xs font-medium">Event Duplication: <span className="tabular">0.0%</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-tertiary text-sm" style={ {fontVariationSettings: "'FILL' 1"} }>check_circle</span>
                      <span className="text-xs font-medium">Tracking Latency: <span className="tabular">&lt;200ms</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant text-sm opacity-30">pending</span>
                      <span className="text-xs font-medium text-on-surface-variant">Segment Overlap Check</span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 bg-primary text-on-primary text-xs font-bold rounded shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  Run Integrity Audit
                </button>
              </div>
            </div>

            {/* Secondary Insights Tooltip-like Card */}
            <div className="mt-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold mb-1">Optimization Hint</p>
                  <p className="text-[11px] text-on-surface-variant leading-tight">Your guardrail metrics have remained stable for 14 days. Consider increasing exposure for Experiment #1042.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;