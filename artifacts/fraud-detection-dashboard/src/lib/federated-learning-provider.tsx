import { createContext, useContext, ReactNode } from 'react';
import { useFederatedLearning } from './use-federated-learning';

type FederatedLearningContextType = ReturnType<typeof useFederatedLearning>;

const FederatedLearningContext = createContext<FederatedLearningContextType | null>(null);

export function FederatedLearningProvider({ children }: { children: ReactNode }) {
  const fl = useFederatedLearning();
  
  return (
    <FederatedLearningContext.Provider value={fl}>
      {children}
    </FederatedLearningContext.Provider>
  );
}

export function useFederatedLearningContext() {
  const context = useContext(FederatedLearningContext);
  if (!context) {
    throw new Error('useFederatedLearningContext must be used within FederatedLearningProvider');
  }
  return context;
}
