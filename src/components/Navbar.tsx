import React from 'react';
import { Sun, Moon, Eye, Terminal } from 'lucide-react';
import { LockLogicLogo } from './LockLogicLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLightMode: boolean;
  toggleTheme: () => void;
  isReducedMotion: boolean;
  toggleReducedMotion: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isLightMode,
  toggleTheme,
  isReducedMotion,
  toggleReducedMotion,
}) => {
  const navTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analyzer', label: 'Analyzer' },
    { id: 'attack-lab', label: 'Attack Lab' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'tips', label: 'Tips' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0B0F]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-8 py-3">
        {/* Zone 1: Single text element wordmark + Circuit-Trace Logomark */}
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 text-left cursor-pointer group shrink-0"
        >
          <LockLogicLogo size={32} glow className="group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="text-xl font-bold font-heading tracking-tight text-[#F4F5F7] group-hover:text-[#C6FF3D] transition-colors whitespace-nowrap">
              Lock<span className="text-[#C6FF3D]">Logic</span>
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#12141B] border border-white/10">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#C6FF3D] text-[#0A0B0F] font-semibold shadow-[0_0_15px_rgba(198,255,61,0.3)]'
                  : 'text-[#8E92A0] hover:text-[#F4F5F7] hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action & preference switches */}
        <div className="flex items-center gap-2 shrink-0">
          {/* HUD status marker */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#12141B] border border-white/10 text-[10px] font-mono text-[#7C5CFF]">
            <Terminal className="w-3 h-3 text-[#00E5FF]" />
            <span>PRIVACY // PRIVACY-FIRST</span>
          </div>

          {/* Reduced Motion Toggle */}
          <button
            onClick={toggleReducedMotion}
            className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
              isReducedMotion
                ? 'bg-[#7C5CFF]/20 text-[#7C5CFF] border-[#7C5CFF]/40'
                : 'bg-[#12141B] text-[#8E92A0] border-white/10 hover:text-[#F4F5F7]'
            }`}
            title={isReducedMotion ? 'Reduced motion active' : 'Enable reduced motion'}
            aria-label="Toggle reduced motion"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#12141B] border border-white/10 text-[#8E92A0] hover:text-[#C6FF3D] transition-colors cursor-pointer"
            title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {isLightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => setActiveTab('analyzer')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#C6FF3D] hover:bg-[#b5f524] text-[#0A0B0F] transition-all shadow-[0_0_18px_rgba(198,255,61,0.25)] cursor-pointer whitespace-nowrap shrink-0"
          >
            Audit Key
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="flex md:hidden items-center justify-around px-2 py-2 border-t border-white/5 bg-[#0A0B0F]/95 overflow-x-auto">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 py-1 text-[11px] font-medium whitespace-nowrap rounded ${
              activeTab === tab.id ? 'text-[#C6FF3D] font-semibold bg-[#12141B]' : 'text-[#8E92A0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
