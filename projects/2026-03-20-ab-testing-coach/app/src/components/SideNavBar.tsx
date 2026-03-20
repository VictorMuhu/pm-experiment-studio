
import { NavLink } from 'react-router-dom';

const SideNavBar = () => {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r-0 bg-slate-50 dark:bg-slate-900 flex flex-col py-6 z-50">
      <div className="px-6 mb-8">
        <div className="text-xl font-bold text-slate-900 dark:text-slate-50 uppercase tracking-widest">Empirical Ledger</div>
        <div className="text-[10px] text-on-surface-variant font-medium tracking-widest mt-1 opacity-70">A/B Testing Coach</div>
      </div>

      <nav className="flex-1 space-y-1">
        <NavLink
          to="/experiments"
          className={({ isActive }) => `flex items-center px-6 py-3 space-x-3 transition-colors duration-200 font-['Inter'] font-medium tracking-tight text-sm ${isActive ? 'text-blue-700 dark:text-blue-400 font-bold border-r-4 border-blue-700 dark:border-blue-400 bg-white dark:bg-slate-800' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'}`}
        >
          <span className="material-symbols-outlined">science</span>
          <span>Experiments</span>
        </NavLink>

        <NavLink
          to="/hypotheses"
          className={({ isActive }) => `flex items-center px-6 py-3 space-x-3 transition-colors duration-200 font-['Inter'] font-medium tracking-tight text-sm ${isActive ? 'text-blue-700 dark:text-blue-400 font-bold border-r-4 border-blue-700 dark:border-blue-400 bg-white dark:bg-slate-800' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'}`}
        >
          <span className="material-symbols-outlined">lightbulb</span>
          <span>Hypotheses</span>
        </NavLink>

        <NavLink
          to="/metrics"
          className={({ isActive }) => `flex items-center px-6 py-3 space-x-3 transition-colors duration-200 font-['Inter'] font-medium tracking-tight text-sm ${isActive ? 'text-blue-700 dark:text-blue-400 font-bold border-r-4 border-blue-700 dark:border-blue-400 bg-white dark:bg-slate-800' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'}`}
        >
          <span className="material-symbols-outlined" style={ {fontVariationSettings: "'FILL' 1"} }>analytics</span>
          <span>Metrics</span>
        </NavLink>

        <NavLink
          to="/simulator"
          className={({ isActive }) => `flex items-center px-6 py-3 space-x-3 transition-colors duration-200 font-['Inter'] font-medium tracking-tight text-sm ${isActive ? 'text-blue-700 dark:text-blue-400 font-bold border-r-4 border-blue-700 dark:border-blue-400 bg-white dark:bg-slate-800' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'}`}
        >
          <span className="material-symbols-outlined">model_training</span>
          <span>Simulator</span>
        </NavLink>

        <NavLink
          to="/decision-engine"
          className={({ isActive }) => `flex items-center px-6 py-3 space-x-3 transition-colors duration-200 font-['Inter'] font-medium tracking-tight text-sm ${isActive ? 'text-blue-700 dark:text-blue-400 font-bold border-r-4 border-blue-700 dark:border-blue-400 bg-white dark:bg-slate-800' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'}`}
        >
          <span className="material-symbols-outlined">gavel</span>
          <span>Decision Engine</span>
        </NavLink>
      </nav>

      <div className="mt-auto px-6 space-y-1">
        <a href="#" className="flex items-center py-2 space-x-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </a>
        <a href="#" className="flex items-center py-2 space-x-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">
          <span className="material-symbols-outlined">help</span>
          <span>Support</span>
        </a>
      </div>
    </aside>
  );
};

export default SideNavBar;