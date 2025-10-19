"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DatabaseType } from "../SetupWizard";

interface DatabaseConfigProps {
  databaseType: DatabaseType;
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const DatabaseConfig = ({ databaseType, onNext, onBack, initialData }: DatabaseConfigProps) => {
  const [connectionType, setConnectionType] = useState(initialData?.connectionType || "network");
  const [serverName, setServerName] = useState(initialData?.serverName || "");
  const [port, setPort] = useState(initialData?.port || "3306");
  const [username, setUsername] = useState(initialData?.username || "");
  const [password, setPassword] = useState(initialData?.password || "");
  const [databaseName, setDatabaseName] = useState(initialData?.databaseName || "");
  const [tablePrefix, setTablePrefix] = useState(initialData?.tablePrefix || "wt_");

  const handleSubmit = () => {
    onNext({
      databaseConfig: {
        connectionType,
        serverName,
        port,
        username,
        password,
        databaseName,
        tablePrefix,
      },
    });
  };

  const getTitle = () => {
    const titles: Record<DatabaseType, string> = {
      mysql: "Database connection – MySQL / MariaDB / Percona",
      sqlite: "Database connection – SQLite",
      postgresql: "Database connection – PostgreSQL",
      sqlserver: "Database connection – SQL Server",
    };
    return titles[databaseType];
  };

  const renderMySQLConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Connection type</Label>
        <RadioGroup value={connectionType} onValueChange={setConnectionType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="local" id="local" />
            <Label htmlFor="local" className="font-normal cursor-pointer">
              localhost:/tmp/mysql.sock
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="network" id="network" />
            <Label htmlFor="network" className="font-normal cursor-pointer">
              network
            </Label>
          </div>
        </RadioGroup>
      </div>

      {connectionType === "network" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serverName">Server name</Label>
              <Input
                id="serverName"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="localhost"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port number</Label>
              <Input
                id="port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="3306"
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="username">Database user account</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="root"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Database password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="databaseName">Database name</Label>
        <Input
          id="databaseName"
          value={databaseName}
          onChange={(e) => setDatabaseName(e.target.value)}
          placeholder="webtrees"
        />
      </div>
    </>
  );

  const renderSQLiteConfig = () => (
    <>
      <Alert>
        <AlertDescription>
          SQLite is only suitable for small sites, testing and evaluation.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="databaseName">Database name</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">/Users/miron/Dev/webtrees/data/</span>
          <Input
            id="databaseName"
            value={databaseName}
            onChange={(e) => setDatabaseName(e.target.value)}
            placeholder="webtrees"
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground">.sqlite</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Use letters A-Z, a-z, digits 0-9, or underscores
        </p>
      </div>
    </>
  );

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
            <CardTitle className="text-2xl">{getTitle()}</CardTitle>
            <CardDescription className="text-base mt-2">
              Configure your database connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {databaseType === "mysql" && renderMySQLConfig()}
            {databaseType === "sqlite" && renderSQLiteConfig()}
            {(databaseType === "postgresql" || databaseType === "sqlserver") && renderMySQLConfig()}

            <div className="space-y-2">
              <Label htmlFor="tablePrefix">Table prefix</Label>
              <Input
                id="tablePrefix"
                value={tablePrefix}
                onChange={(e) => setTablePrefix(e.target.value)}
                placeholder="wt_"
              />
              <p className="text-xs text-muted-foreground">
                The prefix is optional, but recommended. By giving the table names a unique prefix you can let
                several different applications share the same database. Use letters A-Z, a-z, digits 0-9, or
                underscores
              </p>
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

export default DatabaseConfig;
