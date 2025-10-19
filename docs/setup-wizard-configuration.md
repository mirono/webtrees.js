# Setup Wizard Configuration Management

This document describes the enhanced configuration management system implemented for the Webtrees Setup Wizard.

## Overview

The Setup Wizard now uses a centralized configuration management system that provides:

- **Type-safe configuration handling** with TypeScript interfaces
- **Real-time validation** of configuration data
- **Centralized state management** using React hooks
- **Configuration persistence** with localStorage support
- **Export/import capabilities** for configuration backup
- **Development debugging tools** for troubleshooting

## Architecture

### Core Components

1. **`useSetupConfiguration` Hook** - Main configuration management hook
2. **`SetupConfigurationContext`** - React context for sharing configuration across components
3. **Configuration Persistence** - Utilities for saving/loading configuration
4. **Configuration Export** - Tools for exporting configuration data
5. **Configuration Debug** - Development tools for monitoring configuration state

### Configuration Structure

```typescript
interface SetupConfiguration {
  language: string;
  serverConfig?: ServerConfig;
  databaseType?: DatabaseType;
  databaseConfig: DatabaseConfig;
  admin?: AdminAccount;
  familyTree?: FamilyTree;
}
```

## Usage

### Basic Usage in SetupWizard

```typescript
import { useSetupConfiguration } from '@/hooks/useSetupConfiguration';

const SetupWizard = () => {
  const {
    configuration,
    validationErrors,
    updateConfiguration,
    updatePartialConfiguration,
    validateConfiguration,
    getConfigurationSummary
  } = useSetupConfiguration();

  const handleNext = (data?: Partial<SetupConfiguration>) => {
    if (data) {
      updatePartialConfiguration(data);
    }
    // Move to next step
  };

  // Rest of component...
};
```

### Using Configuration Context

```typescript
import { SetupConfigurationProvider, useSetupConfigurationContext } from '@/contexts/SetupConfigurationContext';

// Wrap your app with the provider
<SetupConfigurationProvider>
  <SetupWizard />
</SetupConfigurationProvider>

// Use in any child component
const SomeComponent = () => {
  const { configuration, updateConfiguration } = useSetupConfigurationContext();
  // Use configuration...
};
```

### Configuration Persistence

```typescript
import { saveConfiguration, loadConfiguration, clearSavedConfiguration } from '@/utils/configurationPersistence';

// Save configuration (passwords are automatically excluded)
saveConfiguration(configuration);

// Load saved configuration
const savedConfig = loadConfiguration();
if (savedConfig) {
  updatePartialConfiguration(savedConfig);
}

// Clear saved configuration
clearSavedConfiguration();
```

### Configuration Export

```typescript
import { downloadConfigurationAsJson, generateConfigurationSummary } from '@/utils/configurationExport';

// Download configuration as JSON file
downloadConfigurationAsJson(configuration, 'my-setup-config.json');

// Generate markdown summary
const summary = generateConfigurationSummary(configuration);
console.log(summary);
```

## Configuration Validation

The system includes built-in validation for:

- **Language selection** - Required field
- **Database configuration** - Server details for non-SQLite databases
- **Admin account** - Name, username, password (min 6 chars), valid email
- **Family tree** - Title and URL requirements

### Using Validation

```typescript
const { validateConfiguration, validationErrors } = useSetupConfiguration();

// Validate current configuration
const validation = validateConfiguration();
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}

// Access validation errors for specific fields
if (validationErrors.admin) {
  console.log('Admin validation errors:', validationErrors.admin);
}
```

## Development Tools

### Configuration Debug Component

For development and troubleshooting, use the `ConfigurationDebug` component:

```typescript
import ConfigurationDebug from '@/components/ConfigurationDebug';

<ConfigurationDebug 
  configuration={configuration} 
  className="mt-4" 
/>
```

This component provides:
- Configuration summary with completion percentage
- Validation status and error details
- Save/load configuration buttons
- Raw configuration data viewer

### Configuration Summary

Get a quick overview of the configuration state:

```typescript
const summary = getConfigurationSummary();
console.log({
  language: summary.language,
  databaseType: summary.databaseType,
  hasAdminAccount: summary.hasAdminAccount,
  hasFamilyTree: summary.hasFamilyTree,
  completionPercentage: summary.completionPercentage
});
```

## Security Considerations

The configuration management system includes several security features:

1. **Password Exclusion** - Passwords are never saved to localStorage or exported
2. **Sensitive Data Filtering** - Database passwords and other sensitive data are excluded from persistence
3. **Validation** - Input validation prevents invalid or potentially dangerous configurations

## Migration from Legacy System

The new system maintains backward compatibility with the existing `SetupData` interface. Existing wizard steps will continue to work without modification.

### Legacy Interface Support

```typescript
// Legacy interface still supported
export interface SetupData {
  language: string;
  databaseType: DatabaseType;
  databaseConfig: { /* ... */ };
  admin: { /* ... */ };
  familyTree: { /* ... */ };
}
```

## API Reference

### useSetupConfiguration Hook

```typescript
const {
  configuration,           // Current configuration state
  validationErrors,        // Current validation errors
  updateConfiguration,     // Update single configuration field
  updatePartialConfiguration, // Update multiple fields at once
  validateConfiguration,   // Validate current configuration
  resetConfiguration,      // Reset to default configuration
  getConfigurationSummary  // Get configuration summary
} = useSetupConfiguration();
```

### Configuration Types

```typescript
type DatabaseType = "mysql" | "sqlite" | "postgresql" | "sqlserver";

interface DatabaseConfig {
  connectionType?: string;
  serverName?: string;
  port?: string;
  username?: string;
  password?: string;
  databaseName?: string;
  tablePrefix: string;
}

interface AdminAccount {
  name: string;
  username: string;
  password: string;
  email: string;
}

interface FamilyTree {
  title: string;
  url: string;
}

interface ServerConfig {
  baseUrl?: string;
  timezone?: string;
  maxFileSize?: string;
}
```

## Best Practices

1. **Use the hook directly** in the main SetupWizard component
2. **Use the context** when you need to access configuration in deeply nested components
3. **Validate before proceeding** to the next step or final submission
4. **Save configuration periodically** to prevent data loss
5. **Clear sensitive data** before any persistence or export operations
6. **Use the debug component** during development to monitor configuration state

## Troubleshooting

### Common Issues

1. **Configuration not persisting** - Check if localStorage is available and not blocked
2. **Validation errors not clearing** - Ensure you're using the update functions from the hook
3. **Type errors** - Make sure you're importing types from the correct location
4. **Context not available** - Ensure components are wrapped with `SetupConfigurationProvider`

### Debug Steps

1. Use the `ConfigurationDebug` component to inspect current state
2. Check browser console for validation errors
3. Verify localStorage contains saved configuration data
4. Use React DevTools to inspect hook state

## Future Enhancements

Potential improvements to consider:

1. **Server-side persistence** - Save configuration to backend API
2. **Configuration templates** - Pre-defined configuration templates
3. **Step-by-step validation** - Validate each step before allowing progression
4. **Configuration comparison** - Compare different configuration versions
5. **Automated testing** - Unit tests for configuration validation logic