"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Server, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ServerConfigurationProps {
  onNext: () => void;
  onBack: () => void;
}

const ServerConfiguration = ({ onNext, onBack }: ServerConfigurationProps) => {
  const [checking, setChecking] = useState(true);
  const [configOk, setConfigOk] = useState(false);
  const [capacityChecked, setCapacityChecked] = useState(false);

  useEffect(() => {
    // Simulate server configuration check
    const timer1 = setTimeout(() => {
      setConfigOk(true);
    }, 1500);

    const timer2 = setTimeout(() => {
      setCapacityChecked(true);
      setChecking(false);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-primary/10 rounded-full">
            <Server className="h-12 w-12 text-primary" />
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Server Configuration</CardTitle>
            <CardDescription className="text-base mt-2">
              Verifying your server environment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Configuration Check */}
              <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                <div className="mt-1">
                  {!configOk ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Checking server configuration</h3>
                  {configOk && (
                    <p className="text-sm text-success mt-1">The server configuration is OK.</p>
                  )}
                </div>
              </div>

              {/* Capacity Check */}
              <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                <div className="mt-1">
                  {!capacityChecked ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Checking server capacity</h3>
                  {capacityChecked && (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        The memory and CPU time requirements depend on the number of individuals in your family tree.
                      </p>
                      <div className="text-sm space-y-1">
                        <p className="text-foreground">
                          <span className="font-medium">Small systems (500 individuals):</span> 16–32 MB, 10–20 seconds
                        </p>
                        <p className="text-foreground">
                          <span className="font-medium">Medium systems (5,000 individuals):</span> 32–64 MB, 20–40 seconds
                        </p>
                        <p className="text-foreground">
                          <span className="font-medium">Large systems (50,000 individuals):</span> 64–128 MB, 40–80 seconds
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {capacityChecked && (
              <Alert className="bg-success/10 border-success/20">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertTitle className="text-success">Server Ready</AlertTitle>
                <AlertDescription className="text-success-foreground">
                  This server's memory limit is <strong>128 MB</strong> and its CPU time limit is <strong>30 seconds</strong>.
                  <br />
                  <span className="text-sm mt-2 block">
                    If you try to exceed these limits, you may experience server time-outs and blank pages.
                  </span>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={onBack} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={() => onNext()} disabled={checking} className="flex-1">
                {checking ? "Checking..." : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServerConfiguration;
