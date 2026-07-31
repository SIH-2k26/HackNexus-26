import { useState, useCallback, useRef } from 'react';
import { FederatedState, TransactionInput, ScoreResult } from './types';
import {
  initializeBanks,
  initializeGlobalModel,
  trainRound,
  scoreTransaction as scoreTransactionEngine,
} from './fl-engine';

export function useFederatedLearning() {
  const [state, setState] = useState<FederatedState>(() => ({
    globalModel: initializeGlobalModel(),
    banks: initializeBanks(),
    roundHistory: [],
    status: 'idle',
  }));

  const isRunningRef = useRef(false);

  const runOneRound = useCallback(() => {
    setState(prev => {
      if (prev.globalModel.round >= 10 || prev.status === 'training') {
        return prev;
      }

      const { banks: newBanks, globalModel: newGlobalModel } = trainRound(
        prev.banks,
        prev.globalModel.round
      );

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
  }, []);

  const runAllRounds = useCallback(async () => {
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    
    setState(prev => {
      const roundsToRun = 10 - prev.globalModel.round;
      
      if (roundsToRun <= 0) {
        isRunningRef.current = false;
        return prev;
      }

      // Set training status
      const newState = {
        ...prev,
        status: 'training' as const,
        globalModel: { ...prev.globalModel, isTraining: true },
      };

      // Run rounds sequentially
      (async () => {
        let currentState = newState;
        
        for (let i = 0; i < roundsToRun; i++) {
          await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s per round
          
          const { banks: newBanks, globalModel: newGlobalModel } = trainRound(
            currentState.banks,
            currentState.globalModel.round
          );

          const newHistory = [
            ...currentState.roundHistory,
            {
              round: newGlobalModel.round,
              globalAccuracy: newGlobalModel.accuracy,
              globalRecall: newGlobalModel.recall,
              globalF1: newGlobalModel.f1,
              bankMetrics: newBanks,
            },
          ];

          currentState = {
            ...currentState,
            globalModel: newGlobalModel,
            banks: newBanks,
            roundHistory: newHistory,
            status: (newGlobalModel.round >= 10 ? 'complete' : 'training') as 'idle' | 'training' | 'complete',
          };

          setState(currentState);
        }

        // Mark training complete
        setState(prev => ({
          ...prev,
          status: 'complete',
          globalModel: { ...prev.globalModel, isTraining: false },
        }));
        isRunningRef.current = false;
      })();

      return newState;
    });
  }, []);

  const resetSystem = useCallback(() => {
    isRunningRef.current = false;
    setState({
      globalModel: initializeGlobalModel(),
      banks: initializeBanks(),
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
