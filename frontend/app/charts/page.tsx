"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { individualsApi } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AncestryChart, DescendantsChart, FanChart, HourglassChart, RelationshipChart } from "@/components/charts";
import { Loader2, AlertCircle } from "lucide-react";

type ChartType = "ancestry" | "descendants" | "fan" | "hourglass" | "relationship";

const CHART_META: Record<ChartType, { label: string; description: string }> = {
  ancestry: { label: "Ancestry", description: "Family tree showing ancestors of an individual." },
  descendants: { label: "Descendants", description: "Family tree showing descendants of an individual." },
  fan: { label: "Fan Chart", description: "Radial chart showing ancestors in a circular layout." },
  hourglass: { label: "Hourglass", description: "Ancestors above and descendants below the root individual." },
  relationship: { label: "Relationship", description: "Path showing relationship between two individuals." },
};

export default function ChartsPage() {
  const [chartType, setChartType] = useState<ChartType>("ancestry");
  const [selectedId, setSelectedId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");

  const { data: individuals, isLoading: loadingIndividuals } = useQuery({
    queryKey: ["individuals-for-charts"],
    queryFn: () => individualsApi.list(),
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Charts</h1>
        <p className="mt-2 text-muted-foreground">
          Visualize your family tree with different chart layouts.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configure Chart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chart-type">Chart type</Label>
              <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
                <SelectTrigger id="chart-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(CHART_META) as [ChartType, { label: string }][]).map(
                    ([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="individual-select">Individual</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger id="individual-select">
                  <SelectValue placeholder="Select an individual..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingIndividuals ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    individuals?.map((ind) => (
                      <SelectItem key={ind.gedcom_id} value={ind.gedcom_id}>
                        {ind.names?.[0]?.full || ind.gedcom_id}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {chartType === "relationship" && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="target-select">Related individual</Label>
                <Select value={targetId} onValueChange={setTargetId}>
                  <SelectTrigger id="target-select">
                    <SelectValue placeholder="Select a related individual..." />
                  </SelectTrigger>
                  <SelectContent>
                    {individuals?.map((ind) => (
                      <SelectItem key={ind.gedcom_id} value={ind.gedcom_id}>
                        {ind.names?.[0]?.full || ind.gedcom_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{CHART_META[chartType].label}</CardTitle>
          <CardDescription>{CHART_META[chartType].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedId ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select an individual above to view the chart.</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-muted/20 min-h-[400px]">
              {chartType === "ancestry" && (
                <AncestryChart
                  root={individuals!.find((i) => i.gedcom_id === selectedId)!}
                  ancestors={[]}
                />
              )}
              {chartType === "descendants" && (
                <DescendantsChart
                  root={individuals!.find((i) => i.gedcom_id === selectedId)!}
                  descendants={[]}
                />
              )}
              {chartType === "fan" && (
                <FanChart
                  individuals={individuals!}
                  rootId={selectedId}
                />
              )}
              {chartType === "hourglass" && (
                <HourglassChart
                  root={individuals!.find((i) => i.gedcom_id === selectedId)!}
                  ancestors={[]}
                  descendants={[]}
                />
              )}
              {chartType === "relationship" && selectedId && targetId && (
                <RelationshipChart
                  from={individuals!.find((i) => i.gedcom_id === selectedId)!}
                  to={individuals!.find((i) => i.gedcom_id === targetId)!}
                  path={[]}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
