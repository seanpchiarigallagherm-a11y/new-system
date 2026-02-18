
import React from 'react';
import { MessageClassification } from '../types';

interface HeaderProps {
  isSessionActive: boolean;
  onStop: () => void;
  lastClassification: MessageClassification | null;
}

const Header: React.FC<HeaderProps> = ({ isSessionActive, onStop, lastClassification }) => {
  const getClassificationStyles = (c: MessageClassification | null) => {
    switch (c) {
      case MessageClassification.IDENTITY: return 'bg-purple-900/30 text-purple-400 border-purple-500/50';
      case MessageClassification.MEANINGFUL: return 'bg-blue-900/30 text-blue-400 border-blue-500/50';
      case MessageClassification.SHALLOW: return 'bg-green-900/30 text-green-400 border-green-500/50';
      default: return 'bg-gray-800/30 text-gray-400 border-gray-700/50';
    }
  };

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 glass shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
        <h1 className="text-lg font-semibold tracking-tight">Interpretive Lens <span className="text-gray-500 font-normal">v1.0.4</span></h1>
      </div>
      
      <div className="flex items-center gap-6">
        {lastClassification && (
          <div className={`px-3 py-1 rounded-full border text-xs font-medium uppercase tracking-wider ${getClassificationStyles(lastClassification)}`}>
            {lastClassification} DEPTH
          </div>
        )}
        
        {isSessionActive && (
          <button 
            onClick={onStop}
            className="px-4 py-2 bg-red-950/20 text-red-400 border border-red-900/50 hover:bg-red-900/30 rounded-lg text-sm transition-all font-medium"
          >
            Terminal Session
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
