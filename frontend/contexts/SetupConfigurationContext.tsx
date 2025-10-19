import React, { createContext, useContext, ReactNode } from 'react';
import { useSetupConfiguration, type SetupConfiguration, type ConfigurationValidation } from '@/hooks/useSetupConfiguration';

interface SetupConfigurationContextType {
  configuration: SetupConfiguration;
  validationErrors: Record<string, string[]>;
  updateConfiguration: <K extends keyof SetupConfiguration>(key: K, value: SetupConfiguration[K]) => void;
  updatePartialConfiguration: (updates: Partial<SetupConfiguration>) => void;
  validateConfiguration: () => ConfigurationValidation;
  resetConfiguration: () => void;
  getConfigurationSummary: () => {
    language: string;
    databaseType?: string;
    hasAdminAccount: boolean;
    hasFamilyTree: boolean;
    completionPercentage: number;
  };
}

const SetupConfigurationContext = createContext<SetupConfigurationContextType | undefined>(undefined);

interface SetupConfigurationProviderProps {
  children: ReactNode;
}

export const SetupConfigurationProvider: React.FC<SetupConfigurationProviderProps> = ({ children }) => {
  const configurationHook = useSetupConfiguration();

  return (
    <SetupConfigurationContext.Provider value={configurationHook}>
      {children}
    </SetupConfigurationContext.Provider>
  );
};

export const useSetupConfigurationContext = (): SetupConfigurationContextType => {
  const context = useContext(SetupConfigurationContext);
  if (context === undefined) {
    throw new Error('useSetupConfigurationContext must be used within a SetupConfigurationProvider');
  }
  return context;
};

export default SetupConfigurationContext;