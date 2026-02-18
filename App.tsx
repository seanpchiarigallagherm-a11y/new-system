
import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatSession from './components/ChatSession';
import OriginsView from './components/OriginsView';
import ProfileView from './components/ProfileView';
import HypothesisView from './components/HypothesisView';
import { GoogleGenAI } from "@google/genai";
import { Message, InsightCard, OriginEntry, MessageClassification, SpeculativeHypothesis, ActiveTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [origins, setOrigins] = useState<OriginEntry[]>([]);
  const [speculations, setSpeculations] = useState<SpeculativeHypothesis[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [lastClassification, setLastClassification] = useState<MessageClassification | null>(null);

  const handleAddInsight = (insight: InsightCard) => {
    setInsights(prev => [insight, ...prev]);
  };

  const handleAddOrigin = (origin: OriginEntry) => {
    setOrigins(prev => [origin, ...prev]);
  };

  const handleAddSpeculation = (spec: SpeculativeHypothesis) => {
    setSpeculations(prev => [spec, ...prev]);
  };

  const handleUpdateInsightStatus = (id: string, status: 'agreed' | 'disagreed') => {
    setInsights(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const handleUpdateOriginStatus = (id: string, status: 'confirmed' | 'rejected') => {
    setOrigins(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleUpdateSpeculationStatus = async (id: string, status: SpeculativeHypothesis['status']) => {
    // Optimistic update
    setSpeculations(prev => prev.map(s => s.id === id ? { ...s, status } : s));

    const speculation = speculations.find(s => s.id === id);
    if (!speculation) return;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Calibration feedback received.
Hypothesis: ${speculation.primaryHypothesis}
Status: ${status}
Grounding: ${speculation.groundingSignals.join(', ')}

Explain how the model should shift its tone or interpretive logic for this user specifically based on their internal psychological structure. Keep it brief and structural.`,
      });
      
      const plan = response.text || "Modeling adapted.";
      setSpeculations(prev => prev.map(s => s.id === id ? { ...s, adjustmentPlan: plan } : s));
    } catch (err) {
      console.error("Calibration error:", err);
    }
  };

  const handleStopSession = () => {
    setIsSessionActive(false);
    setActiveTab('profile');
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden text-gray-200">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        insightsCount={insights.filter(i => i.status === 'pending').length}
        originsCount={origins.filter(o => o.status === 'pending').length}
        specCount={speculations.filter(s => s.status === 'pending').length}
      />
      
      <div className="flex flex-col flex-grow relative overflow-hidden">
        <Header 
          isSessionActive={isSessionActive} 
          onStop={handleStopSession} 
          lastClassification={lastClassification}
        />
        
        <main className="flex-grow overflow-hidden flex flex-col p-6 bg-gradient-to-br from-[#050505] to-[#0a0a0a]">
          {activeTab === 'chat' && (
            <ChatSession 
              messages={messages} 
              setMessages={setMessages}
              onInsightGenerated={handleAddInsight}
              onOriginGenerated={handleAddOrigin}
              onSpeculationGenerated={handleAddSpeculation}
              speculations={speculations}
              setLastClassification={setLastClassification}
              isSessionActive={isSessionActive}
            />
          )}
          {activeTab === 'speculations' && (
            <HypothesisView 
              speculations={speculations}
              onUpdateStatus={handleUpdateSpeculationStatus}
            />
          )}
          {activeTab === 'origins' && (
            <OriginsView 
              origins={origins} 
              insights={insights}
              onUpdateOriginStatus={handleUpdateOriginStatus}
              onUpdateInsightStatus={handleUpdateInsightStatus}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileView 
              messages={messages}
              insights={insights}
              origins={origins}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
