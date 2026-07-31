export interface BankMetrics {
  bankId: string; // "Bank_0" through "Bank_3"
  sampleCount: number; // 250 to 750, randomized per bank, fixed per session
  accuracy: number; // 0.0 to 1.0
  precision: number;
  recall: number; // most important — fraud actually caught
  f1: number;
  weights: number[]; // simulated weight vector, length 16
}

export interface GlobalModel {
  round: number; // 0 = untrained, max 10
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  weights: number[]; // FedAvg of bank weights
  isTraining: boolean;
}

export interface FederatedState {
  globalModel: GlobalModel;
  banks: BankMetrics[];
  roundHistory: Array<{
    round: number;
    globalAccuracy: number;
    globalRecall: number;
    globalF1: number;
    bankMetrics: BankMetrics[];
  }>;
  status: 'idle' | 'training' | 'complete';
}

export interface TransactionInput {
  amount: number;
  frequency: number;
  accountAge: number;
  crossBankActivity: number;
  velocity: number;
  unusualHour: boolean;
  newDevice: boolean;
}

export interface ScoreResult {
  fraudProbability: number; // 0.0 to 1.0
  isFraud: boolean; // threshold 0.5
  confidence: 'high' | 'medium' | 'low';
  explanation: string[];
}
