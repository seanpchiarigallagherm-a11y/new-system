
import React from 'react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  insightsCount: number;
  originsCount: number;
  specCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, insightsCount, originsCount, specCount }) => {
  const NavItem = ({ id, label, icon, badge }: { id: ActiveTab, label: string, icon: string, badge?: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mb-1 ${
        activeTab === id 
          ? 'bg-white/10 text-white shadow-lg' 
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      {badge ? (
        <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <aside className="w-72 glass border-r border-white/5 flex flex-col p-4 shrink-0">
      <div className="mb-8 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
        <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1">Active Model</p>
        <p className="text-sm font-semibold text-gray-200">Gemini-3-Pro (Cognitive)</p>
        <div className="mt-3 flex gap-1">
          {[1,2,3,4,5].map(i => <div key={i} className="h-1 flex-grow bg-emerald-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
          </div>)}
        </div>
      </div>

      <nav className="flex-grow">
        <NavItem id="chat" label="Cognitive Dialogue" icon="💬" />
        <NavItem id="speculations" label="Speculations" icon="✨" badge={specCount} />
        <NavItem id="origins" label="Origins Engine" icon="🧬" badge={originsCount + insightsCount} />
        <NavItem id="profile" label="Construct Profile" icon="👤" />
      </nav>

      <div className="mt-auto p-4 glass rounded-xl border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <p className="text-xs text-gray-400">Alignment: 89.2%</p>
        </div>
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full w-[89.2%]"></div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
