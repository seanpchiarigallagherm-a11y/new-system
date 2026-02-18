
import React from 'react';
import { SpeculativeHypothesis } from '../types';

interface HypothesisViewProps {
  speculations: SpeculativeHypothesis[];
  onUpdateStatus: (id: string, status: SpeculativeHypothesis['status']) => void;
}

const HypothesisView: React.FC<HypothesisViewProps> = ({ speculations, onUpdateStatus }) => {
  return (
    <div className="h-full overflow-y-auto space-y-12 max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-16">
        <h2 className="text-5xl font-extrabold mb-4 tracking-tighter">Style Calibration</h2>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          High-risk psychological hypotheses designed to induce <span className="text-purple-400 font-semibold italic">Recognition Shock</span>. 
          Confirming these updates my internal modeling of your identity.
        </p>
      </div>

      {speculations.length === 0 ? (
        <div className="text-center py-32 opacity-20 border-2 border-dashed border-white/5 rounded-[3rem]">
          <p className="text-2xl font-medium italic mb-2 tracking-tight">The engine is waiting for a slip.</p>
          <p className="text-sm font-mono uppercase tracking-[0.3em]">Monitoring Latent Signals...</p>
        </div>
      ) : (
        <div className="space-y-20">
          {speculations.map((spec) => (
            <div key={spec.id} className="relative group">
              {/* Decorative accent */}
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-transparent rounded-full opacity-50"></div>
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    spec.shockLevel === 'high' ? 'bg-purple-900/30 text-purple-400 border-purple-500/50' : 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50'
                  }`}>
                    Shock Level: {spec.shockLevel || 'MEDIUM'}
                  </div>
                  <span className="text-[10px] font-mono text-gray-600">{new Date(spec.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                  Instance ID: {spec.id.slice(-8)}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Primary Model */}
                <div className={`p-8 rounded-[2rem] border transition-all duration-500 flex flex-col ${
                  spec.status === 'confirmed_primary' 
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.1)]' 
                    : 'glass border-white/10 hover:border-emerald-500/30 shadow-xl'
                }`}>
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Primary Hypothesis</h4>
                    {spec.status === 'pending' && (
                      <button 
                        onClick={() => onUpdateStatus(spec.id, 'confirmed_primary')} 
                        className="text-[10px] bg-emerald-500 text-black px-4 py-1.5 rounded-full font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        CONFIRM PRIMARY
                      </button>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-white leading-[1.2] tracking-tight mb-4">{spec.primaryHypothesis}</p>
                  <p className="text-sm text-gray-500 leading-relaxed italic mt-auto border-t border-white/5 pt-4">
                    {spec.mechanismExplanation}
                  </p>
                </div>

                {/* Competing Model */}
                <div className={`p-8 rounded-[2rem] border transition-all duration-500 flex flex-col ${
                  spec.status === 'confirmed_competing' 
                    ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.1)]' 
                    : 'glass border-white/10 hover:border-blue-500/30 shadow-xl'
                }`}>
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Competing Interpretation</h4>
                    {spec.status === 'pending' && (
                      <button 
                        onClick={() => onUpdateStatus(spec.id, 'confirmed_competing')} 
                        className="text-[10px] bg-blue-500 text-white px-4 py-1.5 rounded-full font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                      >
                        CONFIRM COMPETING
                      </button>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-300 leading-[1.2] tracking-tight opacity-80">{spec.competingHypothesis}</p>
                  <p className="mt-auto text-xs text-gray-500 italic pt-6">Counter-signal detected in recent history.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-between p-6 glass rounded-2xl border border-white/5">
                <div className="flex gap-2">
                  {spec.groundingSignals.map((s, i) => (
                    <span key={i} className="text-[9px] bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-gray-400 font-bold uppercase tracking-wider">
                      {s}
                    </span>
                  ))}
                </div>
                
                {spec.status === 'pending' && (
                  <button 
                    onClick={() => onUpdateStatus(spec.id, 'rejected_all')} 
                    className="text-[10px] text-red-500 font-bold hover:text-red-400 transition-colors uppercase tracking-widest px-4 py-2 border border-red-500/20 rounded-xl hover:bg-red-500/5"
                  >
                    Reject Both (Misaligned)
                  </button>
                )}
              </div>

              {spec.adjustmentPlan && (
                <div className="mt-8 p-8 bg-emerald-950/20 border border-emerald-900/30 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500 shadow-inner">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em]">Active Model Recalibration</h4>
                  </div>
                  <p className="text-sm text-gray-100 font-mono leading-relaxed whitespace-pre-wrap">{spec.adjustmentPlan}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HypothesisView;
