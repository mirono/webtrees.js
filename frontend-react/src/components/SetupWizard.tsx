import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import LanguageSelection from "./wizard/LanguageSelection";
import ServerConfiguration from "./wizard/ServerConfiguration";
import DatabaseType from "./wizard/DatabaseType";
import DatabaseConfig from "./wizard/DatabaseConfig";
import AdminAccount from "./wizard/AdminAccount";
import FamilyTree from "./wizard/FamilyTree";
import Dashboard from "./wizard/Dashboard";

export type DatabaseType = "mysql" | "sqlite" | "postgresql" | "sqlserver";

export interface SetupData {
  language: string;
  databaseType: DatabaseType;
  databaseConfig: {
    connectionType?: string;
    serverName?: string;
    port?: string;
    username?: string;
    password?: string;
    databaseName?: string;
    tablePrefix: string;
  };
  admin: {
    name: string;
    username: string;
    password: string;
    email: string;
  };
  familyTree: {
    title: string;
    url: string;
  };
}

const TOTAL_STEPS = 7;

const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [setupData, setSetupData] = useState<Partial<SetupData>>({
    language: "en-US",
    databaseConfig: { tablePrefix: "wt_" },
  });

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = (data?: Partial<SetupData>) => {
    if (data) {
      setSetupData({ ...setupData, ...data });
    }
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <LanguageSelection onNext={handleNext} defaultLanguage={setupData.language || "en-US"} />;
      case 2:
        return <ServerConfiguration onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <DatabaseType onNext={handleNext} onBack={handleBack} />;
      case 4:
        return (
          <DatabaseConfig
            databaseType={setupData.databaseType || "mysql"}
            onNext={handleNext}
            onBack={handleBack}
            initialData={setupData.databaseConfig}
          />
        );
      case 5:
        return <AdminAccount onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <FamilyTree onNext={handleNext} onBack={handleBack} />;
      case 7:
        return <Dashboard familyTreeData={setupData.familyTree} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentStep < 7 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-foreground">Setup Wizard</h2>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}
      
      <div className={currentStep < 7 ? "pt-24" : ""}>
        {renderStep()}
      </div>
    </div>
  );
};

export default SetupWizard;
