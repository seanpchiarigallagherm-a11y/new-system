
export enum MessageClassification {
  TRIVIAL = 'TRIVIAL',
  SHALLOW = 'SHALLOW',
  MEANINGFUL = 'MEANINGFUL',
  IDENTITY = 'IDENTITY'
}

export interface InsightCard {
  id: string;
  pattern: string;
  causes: string[];
  shape: string;
  contradictions: string;
  futurePrediction: string;
  confidence: number;
  evidence: string[];
  status: 'pending' | 'agreed' | 'disagreed';
}

export interface OriginEntry {
  id: string;
  inference: string;
  experiences: string[];
  reasoning: string;
  confidence: number;
  status: 'pending' | 'confirmed' | 'rejected';
}

export interface SpeculativeHypothesis {
  id: string;
  primaryHypothesis: string;
  competingHypothesis: string;
  groundingSignals: string[];
  mechanismExplanation: string;
  shockLevel: 'low' | 'medium' | 'high'; // Added to track recognition shock
  status: 'pending' | 'confirmed_primary' | 'confirmed_competing' | 'rejected_all';
  adjustmentPlan?: string;
  timestamp: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  classification?: MessageClassification;
  timestamp: number;
}

export type ActiveTab = 'chat' | 'speculations' | 'origins' | 'profile';
