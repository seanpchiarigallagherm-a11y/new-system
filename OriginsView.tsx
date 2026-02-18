
import React from 'react';
import { OriginEntry, InsightCard } from '../types';
import InsightCardComponent from './InsightCard';

interface OriginsViewProps {
  origins: OriginEntry[];
  insights: InsightCard[];
  onUpdateOriginStatus: (id: string, status: 'confirmed' | 'rejected') => void;
  onUpdateInsightStatus: (id: string, status: 'agreed' | 'disagreed') => void;
}

const OriginsView: React.FC<OriginsViewProps> = ({ origins, insights, onUpdateOriginStatus, onUpdateInsightStatus }) => {
  return (
    <div className="h-full overflow-y-auto space-y-12 max-w-4xl mx-auto py-8 px-4">
      <div>
        <h2 className="text-3xl font-bold mb-2">Origins Engine</h2>
        <p className="text-gray-500">Mapping detected patterns and their inferred causal origins.</p>
      </div>

      <div className="space-y-8">
        {insights.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest border-l-2 border-purple-500 pl-3">Cognitive Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.map(insight => (
                <div key={insight.id} className="opacity-90">
                  <InsightCardComponent 
                    insight={insight} 
                    onAgree={() => onUpdateInsightStatus(insight.id, 'agreed')}
                    onDisagree={() => onUpdateInsightStatus(insight.id, 'disagreed')}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {origins.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest border-l-2 border-blue-500 pl-3">Causal Inferences</h3>
            {origins.map((origin) => (
              <div key={origin.id} className="glass rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                      <div className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold rounded uppercase">Inference Node</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onUpdateOriginStatus(origin.id, 'confirmed')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${origin.status === 'confirmed' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}>CONFIRM</button>
                      <button onClick={() => onUpdateOriginStatus(origin.id, 'rejected')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${origin.status === 'rejected' ? 'bg-red-500 text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}>REJECT</button>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 leading-tight">{origin.inference}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Foundational Stimuli</h4>
                      <ul className="space-y-2">
                        {origin.experiences.map((exp, i) => (
                          <li key={i} className="flex gap-3 text-sm text-gray-300 items-start"><span className="text-emerald-500 mt-1">•</span>{exp}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Reasoning Chain</h4>
                      <p className="text-sm text-gray-400 italic leading-relaxed">{origin.reasoning}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {origins.length === 0 && insights.length === 0 && (
          <div className="text-center py-20 opacity-30">
            <p className="text-lg italic">The engine is idle. Continue the dialogue to surface cognitive architecture.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OriginsView;
