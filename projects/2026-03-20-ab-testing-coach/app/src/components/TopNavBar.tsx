

const TopNavBar = () => {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/20 dark:border-slate-800/20 shadow-sm dark:shadow-none flex justify-between items-center px-8">
      <div className="flex items-center space-x-6">
        <div className="relative group focus-within:ring-2 focus-within:ring-blue-500/20 rounded-lg">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant/50">
            <span className="material-symbols-outlined text-sm">search</span>
          </span>
          <input
            type="text"
            placeholder="Search experiments..."
            className="bg-surface-container-low border-none rounded-lg text-sm pl-10 pr-4 py-2 focus:ring-0 focus:bg-surface-container-lowest transition-all w-64 outline-none"
          />
        </div>

        <nav className="flex space-x-6">
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 font-['Inter'] tabular-nums text-sm">Dashboard</a>
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 font-['Inter'] tabular-nums text-sm">Archive</a>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-500 hover:bg-surface-container-high rounded-full transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 text-slate-500 hover:bg-surface-container-high rounded-full transition-colors">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-outline-variant/20 flex items-center justify-center">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKcM38lpE-0X4Z5HQELMiLi65i9W4SbTyny_uMxg9CoeQBsDDMQQhcyRY5yyxnyI6WBZc4F3x9fNFNxHRYwToygGB87tXM79vlQEQc1oTcOFRuGAdshAagtu9LlVYkJl4NWp1_N0xZr2roWeoRdFF7dy8kBLWB9_D7I7OK9fac8rXneLSPBoiDX-CAvGc9kySkHeyJs-FmaQ1FGcihPVF3fXj5mOp4HDUCFs-RhXnCRBCQRnUU1skCaEOSnPsATcvZrRpflHv_9-7O" alt="User Profile Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;