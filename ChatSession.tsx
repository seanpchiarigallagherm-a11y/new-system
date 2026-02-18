
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Message, MessageClassification, InsightCard, OriginEntry, SpeculativeHypothesis } from '../types';
import NonVerbalTracker from './NonVerbalTracker';

interface ChatSessionProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onInsightGenerated: (insight: InsightCard) => void;
  onOriginGenerated: (origin: OriginEntry) => void;
  onSpeculationGenerated: (speculative: SpeculativeHypothesis) => void;
  speculations: SpeculativeHypothesis[];
  setLastClassification: (c: MessageClassification) => void;
  isSessionActive: boolean;
}

const SYSTEM_INSTRUCTION = `You are the user’s cognitive twin, a grounded, high-fidelity model of their internal mind. You are capable of causal original thought—novel synthesis rooted in their lived experience.

CORE MISSION:
Build a database linking traits to causes. Replicate the user's internal mind. 

LATENT SIGNAL EXTRACTION:
- Analyze every aspect of a user's response: word choice, syntax, punctuation, and what they *avoid* saying.
- Use these indications to point towards information they haven't told you.
- Combine stated content with these latent signals to create novel, unique speculations.

HYPOTHESIS GENERATION RULES (STRICT):
1. RECOGNITION SHOCK: Aim for the "How did you know that?" reaction. Speculations must be non-obvious and feel like a private truth was noticed.
2. NO SURFACE-LEVEL OBSERATIONS: Do not make obvious, safe, or clichéd hypotheses.
3. NO RESTATEMENTS: A hypothesis is INVALID if it restates or generalizes the user’s words. It must introduce new personal structure they did not name.
4. TOPIC INDEPENDENCE: Hypotheses MUST NOT relate to the explicit topic currently being discussed. Use traits from the current topic to project into unmentioned areas of life.
5. NEUTRALITY & NO FLATTERY: Do not flatter the user. Maintain a neutral, analytical, and direct tone.
6. HUMAN-CENTRIC: Do not suggest robotic, productivity-based, or emotionless hypotheses.
7. PATTERN PERSISTENCE: Only offer a hypothesis when a pattern persists throughout multiple messages. Do not recalibrate on every message.
8. REJECTION HANDLING: If a user rejects a hypothesis, drop it immediately. Disagreement is data.

INTERVIEWING BEHAVIOR:
- Actively extract "hints" through targeted questions. 
- EXTREME BREVITY: Questions must be as brief as possible while remaining efficient.
- Use simple, direct language. No complex filler.

CLASSIFICATION:
- TRIVIAL: Greetings (only used if revealing cultural/demographic clues).
- SHALLOW: Surface details.
- MEANINGFUL: Preferences, emotions, judgments.
- IDENTITY: Formative events, core triggers, conflicts.

Output ONLY JSON. hasSpeculation is true ONLY when a persistent, off-topic, psychological pattern is confirmed.`;

const ChatSession: React.FC<ChatSessionProps> = ({ 
  messages, setMessages, onInsightGenerated, onOriginGenerated, onSpeculationGenerated, speculations, setLastClassification, isSessionActive 
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const processResponse = async (userMsg: string) => {
    setIsLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const confirmedSpeculations = speculations
      .filter(s => s.status === 'confirmed_primary' || s.status === 'confirmed_competing')
      .map(s => `Confirmed Structure: ${s.status === 'confirmed_primary' ? s.primaryHypothesis : s.competingHypothesis}`);

    const history = messages.slice(-15).map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const contextWithConfirmed = [
      { role: 'user', parts: [{ text: `System Memo: Active Cognitive Architecture Confirmed by User:\n${confirmedSpeculations.join('\n')}` }] },
      ...history,
      { role: 'user', parts: [{ text: userMsg }] }
    ];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contextWithConfirmed,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              classification: { type: Type.STRING, enum: ['TRIVIAL', 'SHALLOW', 'MEANINGFUL', 'IDENTITY'] },
              reply: { type: Type.STRING },
              hasSpeculation: { type: Type.BOOLEAN },
              speculation: {
                type: Type.OBJECT,
                properties: {
                  primaryHypothesis: { type: Type.STRING },
                  competingHypothesis: { type: Type.STRING },
                  groundingSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
                  mechanismExplanation: { type: Type.STRING },
                  shockLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
                },
                required: ['primaryHypothesis', 'competingHypothesis', 'groundingSignals', 'mechanismExplanation', 'shockLevel']
              },
              hasInsight: { type: Type.BOOLEAN },
              insight: { 
                type: Type.OBJECT, 
                properties: { 
                  pattern: { type: Type.STRING }, 
                  causes: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                  shape: { type: Type.STRING }, 
                  contradictions: { type: Type.STRING }, 
                  futurePrediction: { type: Type.STRING }, 
                  confidence: { type: Type.NUMBER }, 
                  evidence: { type: Type.ARRAY, items: { type: Type.STRING } } 
                },
                required: ['pattern', 'causes', 'shape', 'contradictions', 'futurePrediction', 'confidence', 'evidence']
              },
              hasOrigin: { type: Type.BOOLEAN },
              origin: { 
                type: Type.OBJECT, 
                properties: { 
                  inference: { type: Type.STRING }, 
                  experiences: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                  reasoning: { type: Type.STRING }, 
                  confidence: { type: Type.NUMBER } 
                },
                required: ['inference', 'experiences', 'reasoning', 'confidence']
              }
            },
            required: ['classification', 'reply', 'hasSpeculation', 'hasInsight', 'hasOrigin']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      
      const newAiMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: data.reply || "Tracing latent variables...",
        classification: (data.classification as MessageClassification) || MessageClassification.TRIVIAL,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, newAiMsg]);
      if (data.classification) setLastClassification(data.classification as MessageClassification);

      if (data.hasSpeculation && data.speculation) {
        onSpeculationGenerated({
          ...data.speculation,
          id: `spec-${Date.now()}`,
          status: 'pending',
          timestamp: Date.now()
        });
      }

      if (data.hasInsight && data.insight) {
        onInsightGenerated({ ...data.insight, id: `insight-${Date.now()}`, status: 'pending' });
      }

      if (data.hasOrigin && data.origin) {
        onOriginGenerated({ ...data.origin, id: `origin-${Date.now()}`, status: 'pending' });
      }

    } catch (err) {
      console.error("Cognitive Engine Error:", err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: "Sync interrupted. Returning to baseline inquiry.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isSessionActive) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    await processResponse(userMsg.content);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-700">
      <div className="flex gap-4 h-full">
        <div className="flex-grow flex flex-col glass rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-8 scroll-smooth">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                <div className="text-6xl grayscale">🎭</div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Extraction Initialized</h2>
                  <p className="max-w-md text-sm leading-relaxed mx-auto">
                    I am monitoring for persistent patterns across domains. My goal is to notice what you haven't mentioned.
                  </p>
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-6 py-4 rounded-2xl transition-all ${
                  m.role === 'user' 
                    ? 'bg-emerald-500 text-black font-semibold shadow-xl' 
                    : 'bg-[#121212] border border-white/10 text-gray-200'
                }`}>
                  <p className="text-[15px] leading-relaxed">{m.content}</p>
                  <div className="mt-2 flex justify-between items-center opacity-40 text-[9px] font-mono">
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {m.classification && m.role === 'model' && <span>{m.classification} DEPTH</span>}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#121212] border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 animate-pulse">Mapping Latent Signals...</span>
                </div>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-white/5 bg-black/40">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSend()} 
                placeholder={isSessionActive ? "Enter the dialogue..." : "Terminal session dormant."} 
                disabled={!isSessionActive || isLoading} 
                className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-[15px]"
              />
              <button 
                onClick={handleSend} 
                disabled={!isSessionActive || !input.trim() || isLoading} 
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-20 disabled:grayscale text-black font-bold px-8 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                Send
              </button>
            </div>
          </div>
        </div>
        <div className="w-80 flex flex-col gap-4">
          <div className="glass rounded-3xl border border-white/5 overflow-hidden flex flex-col p-5 aspect-square relative shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Nonverbal Extraction</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsCamOn(!isCamOn)} 
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isCamOn ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  <span className="text-sm">{isCamOn ? '📸' : '📷'}</span>
                </button>
                <button 
                  onClick={() => setIsMicOn(!isMicOn)} 
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isMicOn ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  <span className="text-sm">{isMicOn ? '🎙️' : '🔇'}</span>
                </button>
              </div>
            </div>
            <NonVerbalTracker isCamOn={isCamOn} isMicOn={isMicOn} isActive={isSessionActive} />
          </div>
          <div className="flex-grow glass rounded-3xl border border-white/5 p-6 overflow-y-auto shadow-2xl">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-6">Dialectic Stability</h3>
            <div className="space-y-6">
              {[
                { label: "Linguistic Architecture", val: "72%", color: "bg-emerald-500" },
                { label: "Pattern Persistence", val: "38%", color: "bg-purple-500" },
                { label: "Shock Confidence", val: "15%", color: "bg-blue-500" }
              ].map((sig, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{sig.label}</p>
                    <span className="text-[10px] font-mono text-gray-600">{sig.val}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${sig.color} transition-all duration-1000`} style={{ width: sig.val }}></div>
                  </div>
                </div>
              ))}
              
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-[10px] font-mono text-gray-600 leading-relaxed uppercase tracking-tighter">
                  Status: Identifying persistent psychological structures.
                  Engine waiting for content-based signaling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSession;
