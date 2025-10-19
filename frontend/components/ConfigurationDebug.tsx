import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSetupConfiguration, type SetupConfiguration } from '@/hooks/useSetupConfiguration';
import { saveConfiguration, clearSavedConfiguration, hasSavedConfiguration } from '@/utils/configurationPersistence';

interface ConfigurationDebugProps {
  configuration: SetupConfiguration;
  className?: string;
}

const ConfigurationDebug: React.FC<ConfigurationDebugProps> = ({ 
  configuration, 
  className = '' 
}) => {
  const { validateConfiguration, getConfigurationSummary } = useSetupConfiguration();
  const validation = validateConfiguration();
  const summary = getConfigurationSummary();

  const handleSaveConfig = () => {
    saveConfiguration(configuration);
    alert('Configuration saved to localStorage (passwords excluded for security)');
  };

  const handleClearConfig = () => {
    clearSavedConfiguration();
    alert('Saved configuration cleared from localStorage');
  };

  const getStatusBadge = (isValid: boolean) => (
    <Badge variant={isValid ? "default" : "destructive"}>
      {isValid ? "Valid" : "Invalid"}
    </Badge>
  );

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Configuration Debug
          <div className="flex gap-2">
            <Button onClick={handleSaveConfig} variant="outline" size="sm">
              Save Config
            </Button>
            <Button onClick={handleClearConfig} variant="outline" size="sm">
              Clear Saved
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Development tool for monitoring setup configuration state
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Summary</h4>
            <div className="space-y-1 text-sm">
              <div>Language: <Badge variant="outline">{summary.language}</Badge></div>
              <div>Database: <Badge variant="outline">{summary.databaseType || 'Not set'}</Badge></div>
              <div>Admin Account: {getStatusBadge(summary.hasAdminAccount)}</div>
              <div>Family Tree: {getStatusBadge(summary.hasFamilyTree)}</div>
              <div>Completion: <Badge variant="outline">{summary.completionPercentage}%</Badge></div>
              <div>Has Saved Config: {getStatusBadge(hasSavedConfiguration())}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Validation Status</h4>
            <div className="space-y-1 text-sm">
              <div>Overall: {getStatusBadge(validation.isValid)}</div>
              {Object.entries(validation.errors).map(([field, errors]) => (
                <div key={field} className="text-red-600">
                  {field}: {errors.length} error(s)
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {!validation.isValid && (
          <div>
            <h4 className="font-medium mb-2 text-red-600">Validation Errors</h4>
            <div className="space-y-2">
              {Object.entries(validation.errors).map(([field, errors]) => (
                <div key={field} className="p-2 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-red-800">{field}</div>
                  <ul className="list-disc list-inside text-sm text-red-600">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Configuration (collapsed by default) */}
        <details className="border rounded p-2">
          <summary className="cursor-pointer font-medium">Raw Configuration Data</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-64">
            {JSON.stringify(configuration, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};

export default ConfigurationDebug;