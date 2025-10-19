import { SetupConfiguration } from '@/hooks/useSetupConfiguration';

export interface ConfigurationExport {
  version: string;
  timestamp: string;
  configuration: Omit<SetupConfiguration, 'admin'> & {
    admin?: Omit<SetupConfiguration['admin'], 'password'>;
  };
}

export const exportConfiguration = (configuration: SetupConfiguration): ConfigurationExport => {
  // Remove sensitive data before export
  const safeConfig = {
    ...configuration,
    admin: configuration.admin ? {
      name: configuration.admin.name,
      username: configuration.admin.username,
      email: configuration.admin.email,
      // password is intentionally omitted
    } : undefined,
    databaseConfig: {
      ...configuration.databaseConfig,
      password: '', // Clear password for security
    }
  };

  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    configuration: safeConfig
  };
};

export const downloadConfigurationAsJson = (configuration: SetupConfiguration, filename = 'webtrees-setup-config.json'): void => {
  const exportData = exportConfiguration(configuration);
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateConfigurationSummary = (configuration: SetupConfiguration): string => {
  const lines = [
    '# Webtrees Setup Configuration Summary',
    '',
    `**Language:** ${configuration.language}`,
    `**Database Type:** ${configuration.databaseType || 'Not configured'}`,
  ];

  if (configuration.databaseConfig.serverName) {
    lines.push(`**Database Server:** ${configuration.databaseConfig.serverName}:${configuration.databaseConfig.port || 'default'}`);
  }
  
  if (configuration.databaseConfig.databaseName) {
    lines.push(`**Database Name:** ${configuration.databaseConfig.databaseName}`);
  }

  lines.push(`**Table Prefix:** ${configuration.databaseConfig.tablePrefix}`);

  if (configuration.admin) {
    lines.push('', '## Administrator Account');
    lines.push(`**Name:** ${configuration.admin.name}`);
    lines.push(`**Username:** ${configuration.admin.username}`);
    lines.push(`**Email:** ${configuration.admin.email}`);
  }

  if (configuration.familyTree) {
    lines.push('', '## Family Tree');
    lines.push(`**Title:** ${configuration.familyTree.title}`);
    lines.push(`**URL:** ${configuration.familyTree.url}`);
  }

  if (configuration.serverConfig) {
    lines.push('', '## Server Configuration');
    if (configuration.serverConfig.baseUrl) {
      lines.push(`**Base URL:** ${configuration.serverConfig.baseUrl}`);
    }
    if (configuration.serverConfig.timezone) {
      lines.push(`**Timezone:** ${configuration.serverConfig.timezone}`);
    }
    if (configuration.serverConfig.maxFileSize) {
      lines.push(`**Max File Size:** ${configuration.serverConfig.maxFileSize}`);
    }
  }

  lines.push('', `*Generated on ${new Date().toLocaleString()}*`);

  return lines.join('\n');
};