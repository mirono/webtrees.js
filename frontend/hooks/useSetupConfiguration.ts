import { useState, useCallback } from 'react';

export type DatabaseType = "mysql" | "sqlite" | "postgresql" | "sqlserver";

export interface DatabaseConfig {
  connectionType?: string;
  serverName?: string;
  port?: string;
  username?: string;
  password?: string;
  databaseName?: string;
  tablePrefix: string;
}

export interface AdminAccount {
  name: string;
  username: string;
  password: string;
  email: string;
}

export interface FamilyTree {
  title: string;
  url: string;
}

export interface ServerConfig {
  baseUrl?: string;
  timezone?: string;
  maxFileSize?: string;
}

export interface SetupConfiguration {
  language: string;
  serverConfig?: ServerConfig;
  databaseType?: DatabaseType;
  databaseConfig: DatabaseConfig;
  admin?: AdminAccount;
  familyTree?: FamilyTree;
}

export interface ConfigurationValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
}

const DEFAULT_CONFIG: SetupConfiguration = {
  language: "en-US",
  databaseConfig: { 
    tablePrefix: "wt_" 
  },
};

export const useSetupConfiguration = () => {
  const [configuration, setConfiguration] = useState<SetupConfiguration>(DEFAULT_CONFIG);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const updateConfiguration = useCallback(<K extends keyof SetupConfiguration>(
    key: K,
    value: SetupConfiguration[K]
  ) => {
    setConfiguration(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear validation errors for the updated field
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const updatePartialConfiguration = useCallback((updates: Partial<SetupConfiguration>) => {
    setConfiguration(prev => ({
      ...prev,
      ...updates
    }));

    // Clear validation errors for updated fields
    const updatedKeys = Object.keys(updates);
    if (updatedKeys.some(key => validationErrors[key])) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        updatedKeys.forEach(key => delete newErrors[key]);
        return newErrors;
      });
    }
  }, [validationErrors]);

  const validateConfiguration = useCallback((): ConfigurationValidation => {
    const errors: Record<string, string[]> = {};

    // Validate language
    if (!configuration.language) {
      errors.language = ['Language is required'];
    }

    // Validate database configuration
    if (configuration.databaseType) {
      if (configuration.databaseType !== 'sqlite') {
        if (!configuration.databaseConfig.serverName) {
          errors.databaseConfig = errors.databaseConfig || [];
          errors.databaseConfig.push('Server name is required for this database type');
        }
        if (!configuration.databaseConfig.username) {
          errors.databaseConfig = errors.databaseConfig || [];
          errors.databaseConfig.push('Username is required for this database type');
        }
        if (!configuration.databaseConfig.databaseName) {
          errors.databaseConfig = errors.databaseConfig || [];
          errors.databaseConfig.push('Database name is required');
        }
      }
    }

    // Validate admin account
    if (configuration.admin) {
      if (!configuration.admin.name) {
        errors.admin = errors.admin || [];
        errors.admin.push('Administrator name is required');
      }
      if (!configuration.admin.username) {
        errors.admin = errors.admin || [];
        errors.admin.push('Username is required');
      }
      if (!configuration.admin.password || configuration.admin.password.length < 6) {
        errors.admin = errors.admin || [];
        errors.admin.push('Password must be at least 6 characters long');
      }
      if (!configuration.admin.email || !/\S+@\S+\.\S+/.test(configuration.admin.email)) {
        errors.admin = errors.admin || [];
        errors.admin.push('Valid email address is required');
      }
    }

    // Validate family tree
    if (configuration.familyTree) {
      if (!configuration.familyTree.title) {
        errors.familyTree = errors.familyTree || [];
        errors.familyTree.push('Family tree title is required');
      }
      if (!configuration.familyTree.url) {
        errors.familyTree = errors.familyTree || [];
        errors.familyTree.push('Family tree URL is required');
      }
    }

    setValidationErrors(errors);

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [configuration]);

  const resetConfiguration = useCallback(() => {
    setConfiguration(DEFAULT_CONFIG);
    setValidationErrors({});
  }, []);

  const getConfigurationSummary = useCallback(() => {
    return {
      language: configuration.language,
      databaseType: configuration.databaseType,
      hasAdminAccount: !!configuration.admin,
      hasFamilyTree: !!configuration.familyTree,
      completionPercentage: calculateCompletionPercentage(configuration)
    };
  }, [configuration]);

  return {
    configuration,
    validationErrors,
    updateConfiguration,
    updatePartialConfiguration,
    validateConfiguration,
    resetConfiguration,
    getConfigurationSummary
  };
};

const calculateCompletionPercentage = (config: SetupConfiguration): number => {
  const steps = [
    !!config.language,
    !!config.serverConfig,
    !!config.databaseType,
    !!config.databaseConfig && (config.databaseType === 'sqlite' || 
      (!!config.databaseConfig.serverName && !!config.databaseConfig.username)),
    !!config.admin,
    !!config.familyTree
  ];
  
  const completedSteps = steps.filter(Boolean).length;
  return Math.round((completedSteps / steps.length) * 100);
};