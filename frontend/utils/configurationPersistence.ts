import { SetupConfiguration } from '@/hooks/useSetupConfiguration';

const STORAGE_KEY = 'webtrees_setup_configuration';

export const saveConfiguration = (configuration: SetupConfiguration): void => {
  try {
    // Don't save sensitive information like passwords
    const configToSave = {
      ...configuration,
      admin: configuration.admin ? {
        ...configuration.admin,
        password: '' // Clear password for security
      } : undefined,
      databaseConfig: {
        ...configuration.databaseConfig,
        password: '' // Clear database password for security
      }
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
  } catch (error) {
    console.warn('Failed to save configuration to localStorage:', error);
  }
};

export const loadConfiguration = (): Partial<SetupConfiguration> | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load configuration from localStorage:', error);
  }
  return null;
};

export const clearSavedConfiguration = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear saved configuration:', error);
  }
};

export const hasSavedConfiguration = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    return false;
  }
};