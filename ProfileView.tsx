
import React, { useEffect, useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Message, InsightCard, OriginEntry } from '../types';

interface ProfileViewProps {
  messages: Message[];
  insights: InsightCard[];
  origins: OriginEntry[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ messages, insights, origins }) => {
  const [theories, setTheories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const hasGenerated = useRef(false);

  useEffect(() => {
    const generateTheories = async () => {
      if (hasGenerated.current || messages.length < 5) {
        setLoading(false);
        return;
      }
      
      hasGenerated.current = true;
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const history = messages.slice(-20).map(m => `${m.role}: ${m.content}`).join('\n');
      const patternContext = insights.map(i => i.pattern).join('; ');

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: `SYNTHESIS PROMPT:
Generate 3 identity-level psychological theories of the user's mind.
Goal: Recognition Shock.
Avoid: Clichés, flattery, flowery language, therapy labels, surface-level traits, or productivity-based analysis.
Tone: Neutral, analytical, and direct.
Focus: Latent identity stance, the internal "logic" of their thought and feeling.

Inputs:
Patterns: ${patternContext}
Recent Dialogue: ${history}

Format: JSON array of { theory, competing, logic, shockEvidence }.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  theory: { type: Type.STRING },
                  competing: { type: Type.STRING },
                  logic: { type: Type.STRING },
                  shockEvidence: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['theory', 'competing', 'logic', 'shockEvidence']
              }
            }
          }
        });
        
        const content = response.text || '[]';
        setTheories(JSON.parse(content));
      } catch (err) {
        console.error("Profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    generateTheories();
  }, [messages, insights, origins]);

  return (
    <div className="h-full overflow-y-auto max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-1000">
      <div className="mb-20 text-center">
        <h2 className="text-6xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-600">
          Construct Profile
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
          The internal blueprint of your original thought. These structures define the lens through which you process all experience.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-500/50 rounded-full animate-pulse scale-110"></div>
          </div>
          <p className="text-emerald-500 font-mono text-xs animate-pulse tracking-[0.3em] uppercase font-black">Synthesizing Latent Construct...</p>
        </div>
      ) : theories.length === 0 ? (
        <div className="text-center py-32 glass rounded-[3rem] border border-dashed border-white/5 opacity-40 italic text-xl tracking-tight">
          Dialogue depth insufficient for identity-level synthesis.
        </div>
      ) : (
        <div className="space-y-24 pb-32">
          {theories.map((t, i) => (
            <div key={i} className="glass border border-white/10 rounded-[3rem] p-12 hover:border-emerald-500/30 transition-all duration-700 shadow-2xl relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-[10rem] font-black pointer-events-none select-none">
                0{i + 1}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-12 relative z-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                    <h4 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em]">Primary Stance</h4>
                  </div>
                  <p className="text-4xl font-bold leading-tight text-white tracking-tight">{t.theory}</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 opacity-50 shadow-lg shadow-blue-500/50"></div>
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] opacity-60">Competing Model</h4>
                  </div>
                  <p className="text-3xl font-medium leading-tight text-gray-500 italic opacity-80">{t.competing}</p>
                </div>
              </div>

              <div className="p-10 bg-black/60 rounded-[2rem] border border-white/5 shadow-inner relative z-10">
                <h5 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Inference Logic & Evidence</h5>
                <div className="flex flex-wrap gap-3 mb-8">
                  {t.shockEvidence?.map((g: string, j: number) => (
                    <span key={j} className="text-[10px] bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-300 font-bold uppercase tracking-widest">
                      {g}
                    </span>
                  ))}
                </div>
                <p className="text-lg text-gray-400 font-medium leading-relaxed border-l-4 border-emerald-500/40 pl-8">
                  {t.logic}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileView;
