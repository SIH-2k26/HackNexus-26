import { BankMetrics, GlobalModel, TransactionInput, ScoreResult } from './types';

// Seeded random number generator for consistent simulation
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

// Initialize bank data with fixed sample counts per session
export function initializeBanks(): BankMetrics[] {
  const rng = new SeededRandom(Date.now());
  
  return [0, 1, 2, 3].map(i => {
    const sampleCount = Math.floor(rng.range(250, 750));
    
    return {
      bankId: `Bank_${i}`,
      sampleCount,
      // Round 0: model knows nothing, catches almost no fraud
      accuracy: rng.range(0.96, 0.98), // High but trivial (predicts "not fraud")
      precision: rng.range(0.10, 0.20), // Low
      recall: rng.range(0.10, 0.15), // Very low - catches almost nothing
      f1: 0.11, // Will be computed
      weights: Array(16).fill(0).map(() => rng.range(-0.1, 0.1)), // Small random weights
    };
  });
}

// Initialize global model
export function initializeGlobalModel(): GlobalModel {
  return {
    round: 0,
    accuracy: 0.97,
    precision: 0.12,
    recall: 0.12,
    f1: 0.12,
    weights: Array(16).fill(0),
    isTraining: false,
  };
}

// Compute F1 score
function computeF1(precision: number, recall: number): number {
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

// FedAvg: weighted average of bank weights
export function federatedAverage(banks: BankMetrics[]): number[] {
  const totalSamples = banks.reduce((sum, bank) => sum + bank.sampleCount, 0);
  const weightLength = banks[0].weights.length;
  const globalWeights = Array(weightLength).fill(0);

  for (let i = 0; i < weightLength; i++) {
    let weightedSum = 0;
    for (const bank of banks) {
      const weight = bank.sampleCount / totalSamples;
      weightedSum += bank.weights[i] * weight;
    }
    globalWeights[i] = weightedSum;
  }

  return globalWeights;
}

// Simulate one training round
export function trainRound(
  banks: BankMetrics[],
  currentRound: number
): { banks: BankMetrics[]; globalModel: GlobalModel } {
  const rng = new SeededRandom(42 + currentRound * 100);
  const newRound = currentRound + 1;

  // Improvement rates decrease as model converges
  const recallBoost = Math.max(0.08, 0.12 - newRound * 0.008); // 8-12% early, slowing
  const precisionBoost = Math.max(0.05, 0.09 - newRound * 0.006);
  const accuracyBoost = Math.max(0.002, 0.005 - newRound * 0.0003);

  // Update each bank's local model
  const updatedBanks = banks.map((bank, idx) => {
    const bankRng = new SeededRandom(42 + currentRound * 100 + idx * 10);
    
    // Each bank improves at slightly different rates (±3-5%)
    const variance = bankRng.range(0.95, 1.05);
    
    const newRecall = Math.min(0.96, bank.recall + recallBoost * variance);
    const newPrecision = Math.min(0.95, bank.precision + precisionBoost * variance);
    const newAccuracy = Math.min(0.99, bank.accuracy + accuracyBoost * variance);
    const newF1 = computeF1(newPrecision, newRecall);

    // Update weights (simulate gradient descent)
    const newWeights = bank.weights.map((w, i) => {
      const delta = bankRng.range(-0.05, 0.05) * (11 - newRound) / 10; // Smaller changes as we converge
      return w + delta;
    });

    return {
      ...bank,
      accuracy: newAccuracy,
      precision: newPrecision,
      recall: newRecall,
      f1: newF1,
      weights: newWeights,
    };
  });

  // Compute global model via FedAvg
  const globalWeights = federatedAverage(updatedBanks);
  
  // Global metrics = weighted average of bank metrics
  const totalSamples = updatedBanks.reduce((sum, b) => sum + b.sampleCount, 0);
  let globalAccuracy = 0;
  let globalPrecision = 0;
  let globalRecall = 0;

  for (const bank of updatedBanks) {
    const weight = bank.sampleCount / totalSamples;
    globalAccuracy += bank.accuracy * weight;
    globalPrecision += bank.precision * weight;
    globalRecall += bank.recall * weight;
  }

  const globalF1 = computeF1(globalPrecision, globalRecall);

  const globalModel: GlobalModel = {
    round: newRound,
    accuracy: globalAccuracy,
    precision: globalPrecision,
    recall: globalRecall,
    f1: globalF1,
    weights: globalWeights,
    isTraining: false,
  };

  // After FedAvg, all banks update to global weights (simplified federation)
  const synchronizedBanks = updatedBanks.map(bank => ({
    ...bank,
    weights: globalWeights,
  }));

  return { banks: synchronizedBanks, globalModel };
}

// Score a transaction for fraud
export function scoreTransaction(
  input: TransactionInput,
  globalRound: number
): ScoreResult {
  const explanation: string[] = [];
  
  // Base fraud probability from input features
  let fraudScore = 0;

  // Amount risk (normalized to 0-0.25)
  if (input.amount > 100000) {
    fraudScore += 0.25;
    explanation.push('Large transaction amount detected');
  } else if (input.amount > 50000) {
    fraudScore += 0.15;
    explanation.push('Moderately high transaction amount');
  } else {
    explanation.push('Transaction amount within normal range');
  }

  // Frequency risk (0-0.2)
  if (input.frequency > 15) {
    fraudScore += 0.2;
    explanation.push('Unusually high transaction frequency');
  } else if (input.frequency > 8) {
    fraudScore += 0.1;
  }

  // Account age (negative risk - older = safer)
  if (input.accountAge < 90) {
    fraudScore += 0.15;
    explanation.push('New account - higher risk profile');
  } else if (input.accountAge < 365) {
    fraudScore += 0.05;
  } else {
    fraudScore -= 0.05; // Bonus for established accounts
    explanation.push('Established account history');
  }

  // Cross-bank activity (0-0.15)
  if (input.crossBankActivity > 5) {
    fraudScore += 0.15;
    explanation.push('High cross-bank activity detected');
  } else if (input.crossBankActivity > 2) {
    fraudScore += 0.08;
  }

  // Velocity (0-0.15)
  if (input.velocity > 10) {
    fraudScore += 0.15;
    explanation.push('High transaction velocity');
  } else if (input.velocity > 5) {
    fraudScore += 0.08;
  }

  // Unusual hour (0-0.1)
  if (input.unusualHour) {
    fraudScore += 0.1;
    explanation.push('Transaction during unusual hours');
  }

  // New device (0-0.1)
  if (input.newDevice) {
    fraudScore += 0.1;
    explanation.push('Transaction from new device');
  }

  // Model effectiveness increases with training
  // Round 0: model can't distinguish well (add noise)
  // Round 10: model is highly accurate
  const modelConfidence = globalRound / 10;
  const finalScore = Math.max(0, Math.min(1, fraudScore));
  
  // Adjust score based on model training
  let adjustedScore: number;
  if (globalRound === 0) {
    // Untrained model - poor discrimination
    adjustedScore = 0.5 + (finalScore - 0.5) * 0.2; // Compress toward 0.5
    explanation.unshift('Warning: Global model not yet trained - predictions unreliable');
  } else {
    // Trained model - better discrimination
    adjustedScore = 0.5 + (finalScore - 0.5) * (0.5 + modelConfidence * 0.5);
  }

  const isFraud = adjustedScore > 0.5;
  
  // Confidence based on distance from threshold and model training
  let confidence: 'high' | 'medium' | 'low';
  const distanceFromThreshold = Math.abs(adjustedScore - 0.5);
  
  if (globalRound < 3) {
    confidence = 'low';
  } else if (distanceFromThreshold > 0.3 && globalRound >= 7) {
    confidence = 'high';
  } else if (distanceFromThreshold > 0.2 && globalRound >= 5) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  if (!isFraud && adjustedScore < 0.3) {
    explanation.push('Multiple normal transaction indicators present');
  }

  return {
    fraudProbability: adjustedScore,
    isFraud,
    confidence,
    explanation,
  };
}
