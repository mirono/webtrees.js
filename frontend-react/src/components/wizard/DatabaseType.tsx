import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { DatabaseType as DBType } from "../SetupWizard";

interface DatabaseTypeProps {
  onNext: (data: { databaseType: DBType }) => void;
  onBack: () => void;
}

const databaseTypes = [
  { value: "mysql", label: "MySQL / MariaDB", description: "Recommended for most installations" },
  { value: "sqlite", label: "SQLite", description: "Best for small sites and testing" },
  { value: "postgresql", label: "PostgreSQL", description: "Advanced open-source database" },
  { value: "sqlserver", label: "SQL Server", description: "Microsoft SQL Server" },
];

const DatabaseType = ({ onNext, onBack }: DatabaseTypeProps) => {
  const [selectedType, setSelectedType] = useState<DBType>("mysql");

  const handleSubmit = () => {
    onNext({ databaseType: selectedType });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-primary/10 rounded-full">
            <Database className="h-12 w-12 text-primary" />
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Connection to Database Server</CardTitle>
            <CardDescription className="text-base mt-2">
              webtrees needs a database to store your genealogy data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Database type</label>
              <RadioGroup value={selectedType} onValueChange={(value) => setSelectedType(value as DBType)}>
                <div className="space-y-3">
                  {databaseTypes.map((type) => (
                    <div
                      key={type.value}
                      className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedType(type.value as DBType)}
                    >
                      <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                      <Label htmlFor={type.value} className="flex-1 cursor-pointer">
                        <div className="font-medium text-foreground">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={onBack} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseType;
