"use client";

import React from "react";
import Link from "next/link";
import { useIndividual, useAncestors, useDescendants } from "@/hooks/useQueries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AncestryChart, DescendantsChart, FanChart, HourglassChart, RelationshipChart } from "@/components/charts";
import { Loader2, User, Edit, Users, ExternalLink } from "lucide-react";
import { Suspense } from "react";

interface IndividualProfileProps {
  id: string;
  onEdit?: () => void;
}

const EVENT_LABELS: Record<string, string> = {
  BIRT: "Birth",
  DEAT: "Death",
  MARR: "Marriage",
  DIV: "Divorce",
  ADOP: "Adoption",
  BURI: "Burial",
  CENS: "Census",
  RESI: "Residence",
  OCCU: "Occupation",
  CHR: "Christening",
  BAPM: "Baptism",
  _TODO: "Event",
};

export default function IndividualProfile({ id, onEdit }: IndividualProfileProps) {
  const { data: individual, isLoading, error } = useIndividual(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !individual) {
    return (
      <div className="p-8 text-center text-destructive">
        Error loading individual: {(error as Error)?.message || "Not found"}
      </div>
    );
  }

  const primaryName = individual.names?.[0]?.full || "Unknown";
  const birthEvent = individual.events?.find((e) => e.event_type === "BIRT");
  const deathEvent = individual.events?.find((e) => e.event_type === "DEAT");
  const sexLabel = individual.sex === "M" ? "Male" : individual.sex === "F" ? "Female" : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="bg-muted p-3 rounded-full">
            <User className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl">{primaryName}</CardTitle>
            <CardDescription>
              {individual.gedcom_id}
              {sexLabel ? ` · ${sexLabel}` : ""}
            </CardDescription>
          </div>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Birth</span>
              <p>{birthEvent ? [birthEvent.date, birthEvent.place].filter(Boolean).join(" ") || "—" : "Not recorded"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Death</span>
              <p>{deathEvent ? [deathEvent.date, deathEvent.place].filter(Boolean).join(" ") || "—" : "Not recorded"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Life Events</CardTitle>
            </CardHeader>
            <CardContent>
              {individual.events && individual.events.length > 0 ? (
                <ul className="space-y-3">
                  {individual.events.map((event) => (
                    <li key={event.id} className="flex justify-between border-b pb-2 last:border-0">
                      <span className="font-medium">
                        {EVENT_LABELS[event.event_type] ?? event.event_type}
                      </span>
                      <span className="text-muted-foreground text-sm text-right">
                        {event.date}
                        {event.place && ` — ${event.place}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No events recorded.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Family</CardTitle>
            </CardHeader>
            <CardContent>
              {individual.links && individual.links.length > 0 ? (
                <ul className="space-y-3">
                  {individual.links.map((link) => (
                    <li key={link.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{link.role}</span>
                      </div>
                      <Link href={`/families/${link.family.gedcom_id}`}>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {link.family.gedcom_id}
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No family links recorded.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <div className="space-y-4">
            <Suspense fallback={<div className="h-48 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
              <AncestryChartCard id={id} primaryName={primaryName} />
            </Suspense>

            <Suspense fallback={<div className="h-48 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
              <DescendantsChartCard id={id} primaryName={primaryName} />
            </Suspense>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fan Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-muted/20">
                  <FanChart
                    individuals={[individual]}
                    rootId={individual.gedcom_id}
                    onNodeClick={(ind) => {
                      window.location.href = `/individuals/${ind.gedcom_id}`;
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Suspense fallback={<div className="h-48 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
              <HourglassChartCard id={id} />
            </Suspense>

            <Suspense fallback={<div className="h-48 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
              <RelationshipChartCard individual={individual} />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RelationshipChartCard({ individual }: { individual: NonNullable<ReturnType<typeof useIndividual>["data"]> }) {
  if (!individual) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Relationship Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 bg-muted/20">
          <RelationshipChart
            from={individual}
            to={individual}
            path={[]}
            onNodeClick={(ind) => {
              window.location.href = `/individuals/${ind.gedcom_id}`;
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function AncestryChartCard({ id, primaryName }: { id: string; primaryName: string }) {
  const { data: individual } = useIndividual(id);
  const { data: ancestors } = useAncestors(id, 3);

  if (!individual) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ancestry Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Showing ancestors of {primaryName}. Click any node to navigate to that individual.
        </p>
        <div className="border rounded-lg p-4 bg-muted/20">
          <AncestryChart
            root={individual}
            ancestors={ancestors ?? []}
            onNodeClick={(ind) => {
              window.location.href = `/individuals/${ind.gedcom_id}`;
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DescendantsChartCard({ id, primaryName }: { id: string; primaryName: string }) {
  const { data: individual } = useIndividual(id);
  const { data: descendants } = useDescendants(id, 3);

  if (!individual) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Descendants Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Showing descendants of {primaryName}.
        </p>
        <div className="border rounded-lg p-4 bg-muted/20">
          <DescendantsChart
            root={individual}
            descendants={descendants ?? []}
            onNodeClick={(ind) => {
              window.location.href = `/individuals/${ind.gedcom_id}`;
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function HourglassChartCard({ id }: { id: string }) {
  const { data: individual } = useIndividual(id);
  const { data: ancestors } = useAncestors(id, 3);
  const { data: descendants } = useDescendants(id, 3);

  if (!individual) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hourglass Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 bg-muted/20">
          <HourglassChart
            root={individual}
            ancestors={ancestors ?? []}
            descendants={descendants ?? []}
            onNodeClick={(ind) => {
              window.location.href = `/individuals/${ind.gedcom_id}`;
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
