"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useStats } from "@/hooks/useQueries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppShell from "@/components/AppShell";
import { Eye, Users, Image, MapPin, List, Loader2 } from "lucide-react";

const STAT_ICONS = [
  { label: "Individuals", key: "individuals" as const, icon: Users },
  { label: "Families", key: "families" as const, icon: Users },
  { label: "Sources", key: "sources" as const, icon: List },
  { label: "Media objects", key: "media" as const, icon: Image },
  { label: "Places", key: "places" as const, icon: MapPin },
  { label: "Notes", key: "notes" as const, icon: List },
];

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex justify-between items-center border-b pb-2 last:border-0">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export default function HomeContent() {
  const { data: stats, isLoading } = useStats();

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Family tree overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : stats ? (
                STAT_ICONS.map(({ label, key, icon }) => (
                  <StatCard key={key} label={label} value={stats[key]} icon={icon} />
                ))
              ) : (
                STAT_ICONS.map(({ label, key, icon }) => (
                  <StatCard key={key} label={label} value={0} icon={icon} />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>On this day</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No events on this date in your family tree.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent changes</CardTitle>
              <CardDescription>Latest additions and edits</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent changes.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
