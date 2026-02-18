
import React from 'react';
import { InsightCard } from '../types';

interface InsightCardProps {
  insight: InsightCard;
  onAgree: () => void;
  onDisagree: () => void;
}

const InsightCardComponent: React.FC<InsightCardProps> = ({ insight, onAgree, onDisagree }) => {
  return (
    <div className="bg-[#121212] border border-white/10 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-right fade-in duration-500 flex flex-col">
      <div className="bg-purple-500/10 px-4 py-2 border-b border-purple-500/20 flex justify-between items-center">
        <span className="text-[10px] font-bold text-purple-400 tracking-widest uppercase">Cognitive Pattern Found</span>
        <span className="text-[10px] font-mono text-purple-400/50">Conf: {Math.round(insight.confidence * 100)}%</span>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-tighter mb-1">The Pattern</h4>
          <p className="text-sm text-gray-100 font-medium leading-relaxed">{insight.pattern}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-1">Predicted Reaction</h4>
            <p className="text-[11px] text-gray-400 leading-tight">{insight.futurePrediction}</p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-1">Contradiction</h4>
            <p className="text-[11px] text-gray-400 leading-tight">{insight.contradictions}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button 
            onClick={onAgree}
            className="flex-grow py-2 bg-emerald-500 text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors"
          >
            ✓ Correct
          </button>
          <button 
            onClick={onDisagree}
            className="flex-grow py-2 bg-white/5 text-gray-400 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors border border-white/10"
          >
            ✗ Misaligned
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightCardComponent;
