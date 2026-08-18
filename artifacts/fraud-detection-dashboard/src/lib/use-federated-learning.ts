import { useState, useCallback, useRef, useEffect } from 'react';
import { FederatedState, BankMetrics, GlobalModel, TransactionInput, ScoreResult } from './types';
import { getAuthApiKey } from './utils';
import { scoreTransaction as scoreTransactionEngine } from './fl-engine';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function getInitialBanks(): BankMetrics[] {
  return [
    { bankId: 'Bank_0', sampleCount: 1000, accuracy: 0.97, precision: 0.0, recall: 0.0, f1: 0.0, weights: Array(16).fill(0) },
    { bankId: 'Bank_1', sampleCount: 1500, accuracy: 0.97, precision: 0.0, recall: 0.0, f1: 0.0, weights: Array(16).fill(0) },
    { bankId: 'Bank_2', sampleCount: 1100, accuracy: 0.97, precision: 0.0, recall: 0.0, f1: 0.0, weights: Array(16).fill(0) },
    { bankId: 'Bank_3', sampleCount: 1400, accuracy: 0.97, precision: 0.0, recall: 0.0, f1: 0.0, weights: Array(16).fill(0) },
  ];
}

function getInitialGlobalModel(): GlobalModel {
  return {
    round: 0,
    accuracy: 0.97,
    precision: 0.0,
    recall: 0.0,
    f1: 0.0,
    weights: Array(16).fill(0),
    isTraining: false,
  };
}

function mapBackendRoundResult(
  result: any,
  prevBanks: BankMetrics[]
): { banks: BankMetrics[]; globalModel: GlobalModel } {
  const perBank = result.per_bank_metrics || {};
  const perBankAccuracy = result.per_bank_accuracy || {};
  const contribution = result.per_bank_contribution || {};

  const mappedBanks: BankMetrics[] = ['bank_0', 'bank_1', 'bank_2', 'bank_3'].map((bKey, idx) => {
    const metrics = perBank[bKey] || {};
    const bankLabel = `Bank_${idx}`;
    const prev = prevBanks.find(b => b.bankId.toLowerCase() === bankLabel.toLowerCase());
    
    // Sample counts from contribution weight or fallback
    const weightFraction = contribution[bKey] ?? 0.25;
    const sampleCount = Math.round(weightFraction * 5000) || prev?.sampleCount || 1000;

    return {
      bankId: bankLabel,
      sampleCount: sampleCount,
      accuracy: metrics.accuracy ?? perBankAccuracy[bKey] ?? 0.97,
      precision: metrics.precision ?? 0.0,
      recall: metrics.recall ?? 0.0,
      f1: metrics.f1 ?? 0.0,
      weights: Array(16).fill(0),
    };
  });

  const gMetrics = result.global_metrics || {};
  const newGlobalModel: GlobalModel = {
    round: result.round ?? 1,
    accuracy: gMetrics.accuracy ?? 0.97,
    precision: gMetrics.precision ?? 0.0,
    recall: gMetrics.recall ?? 0.0,
    f1: gMetrics.f1 ?? 0.0,
    weights: Array(16).fill(0),
    isTraining: false,
  };

  return { banks: mappedBanks, globalModel: newGlobalModel };
}

export function useFederatedLearning() {
  const [state, setState] = useState<FederatedState>(() => ({
    globalModel: getInitialGlobalModel(),
    banks: getInitialBanks(),
    roundHistory: [],
    status: 'idle',
  }));

  const isRunningRef = useRef(false);

  // Sync with backend status on initial mount if rounds already exist
  useEffect(() => {
    let isMounted = true;
    async function syncBackendStatus() {
      try {
        const apiKey = getAuthApiKey();
        if (!apiKey) return;
        const res = await fetch(`${API_BASE_URL}/status`, {
          headers: { 'x-api-key': apiKey },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.history && Array.isArray(data.history) && data.history.length > 0 && isMounted) {
            let currentBanks = getInitialBanks();
            const historyItems = data.history.map((h: any) => {
              const mapped = mapBackendRoundResult(h, currentBanks);
              currentBanks = mapped.banks;
              return {
                round: mapped.globalModel.round,
                globalAccuracy: mapped.globalModel.accuracy,
                globalRecall: mapped.globalModel.recall,
                globalF1: mapped.globalModel.f1,
                bankMetrics: mapped.banks,
              };
            });
            const lastRound = data.history[data.history.length - 1];
            const { banks: latestBanks, globalModel: latestModel } = mapBackendRoundResult(lastRound, currentBanks);

            setState({
              globalModel: latestModel,
              banks: latestBanks,
              roundHistory: historyItems,
              status: latestModel.round >= 10 ? 'complete' : 'idle',
            });
          }
        }
      } catch (err) {
        console.warn('Initial backend status sync notice:', err);
      }
    }
    syncBackendStatus();
    return () => { isMounted = false; };
  }, []);

  const runOneRound = useCallback(async () => {
    if (state.globalModel.round >= 10 || state.status === 'training') {
      return;
    }

    // Set truthful "training in progress" state
    setState(prev => ({
      ...prev,
      status: 'training',
      globalModel: { ...prev.globalModel, isTraining: true },
    }));

    try {
      const apiKey = getAuthApiKey();
      const res = await fetch(`${API_BASE_URL}/train?epsilon=1.0&use_dp=true&simulate_secagg=false`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Training failed' }));
        console.error('Backend training error:', err);
        setState(prev => ({
          ...prev,
          status: 'idle',
          globalModel: { ...prev.globalModel, isTraining: false },
        }));
        return;
      }

      const roundResult = await res.json();

      setState(prev => {
        const { banks: newBanks, globalModel: newGlobalModel } = mapBackendRoundResult(roundResult, prev.banks);
        const newHistory = [
          ...prev.roundHistory,
          {
            round: newGlobalModel.round,
            globalAccuracy: newGlobalModel.accuracy,
            globalRecall: newGlobalModel.recall,
            globalF1: newGlobalModel.f1,
            bankMetrics: newBanks,
          },
        ];

        return {
          ...prev,
          globalModel: newGlobalModel,
          banks: newBanks,
          roundHistory: newHistory,
          status: newGlobalModel.round >= 10 ? 'complete' : 'idle',
        };
      });
    } catch (err) {
      console.error('Training network error:', err);
      setState(prev => ({
        ...prev,
        status: 'idle',
        globalModel: { ...prev.globalModel, isTraining: false },
      }));
    }
  }, [state.globalModel.round, state.status]);

  const runAllRounds = useCallback(async () => {
    if (isRunningRef.current || state.globalModel.round >= 10) return;

    isRunningRef.current = true;
    const apiKey = getAuthApiKey();

    setState(prev => ({
      ...prev,
      status: 'training',
      globalModel: { ...prev.globalModel, isTraining: true },
    }));

    let currentRound = state.globalModel.round;

    while (currentRound < 10 && isRunningRef.current) {
      try {
        const res = await fetch(`${API_BASE_URL}/train?epsilon=1.0&use_dp=true&simulate_secagg=false`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
        });

        if (!res.ok) {
          console.error('Stop sequencing rounds due to error:', res.status);
          break;
        }

        const roundResult = await res.json();
        currentRound = roundResult.round;

        setState(prev => {
          const { banks: newBanks, globalModel: newGlobalModel } = mapBackendRoundResult(roundResult, prev.banks);
          const newHistory = [
            ...prev.roundHistory,
            {
              round: newGlobalModel.round,
              globalAccuracy: newGlobalModel.accuracy,
              globalRecall: newGlobalModel.recall,
              globalF1: newGlobalModel.f1,
              bankMetrics: newBanks,
            },
          ];

          return {
            ...prev,
            globalModel: newGlobalModel,
            banks: newBanks,
            roundHistory: newHistory,
            status: newGlobalModel.round >= 10 ? 'complete' : 'training',
          };
        });

        // Small interval between rounds
        await new Promise(r => setTimeout(r, 600));
      } catch (err) {
        console.error('Sequential training error:', err);
        break;
      }
    }

    isRunningRef.current = false;
    setState(prev => ({
      ...prev,
      status: prev.globalModel.round >= 10 ? 'complete' : 'idle',
      globalModel: { ...prev.globalModel, isTraining: false },
    }));
  }, [state.globalModel.round]);

  const resetSystem = useCallback(async () => {
    isRunningRef.current = false;
    try {
      const apiKey = getAuthApiKey();
      await fetch(`${API_BASE_URL}/reset`, {
        method: 'POST',
        headers: { 'x-api-key': apiKey },
      });
    } catch (err) {
      console.warn('Backend reset notice:', err);
    }

    setState({
      globalModel: getInitialGlobalModel(),
      banks: getInitialBanks(),
      roundHistory: [],
      status: 'idle',
    });
  }, []);

  const scoreTransaction = useCallback(
    (input: TransactionInput): ScoreResult => {
      return scoreTransactionEngine(input, state.globalModel.round);
    },
    [state.globalModel.round]
  );

  return {
    state,
    runOneRound,
    runAllRounds,
    resetSystem,
    scoreTransaction,
    isRunning: isRunningRef.current || state.status === 'training',
  };
}
