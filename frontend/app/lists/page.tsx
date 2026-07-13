"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useIndividuals } from "@/hooks/useQueries";
import { useFamilies } from "@/hooks/useQueries";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, User, Users } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

function IndividualsList({ filter }: { filter: string }) {
  const { data: individuals, isLoading } = useIndividuals();

  const filtered = filter
    ? individuals?.filter((ind) => {
        const name = ind.names?.[0]?.full || "";
        const id = ind.gedcom_id;
        const q = filter.toLowerCase();
        return name.toLowerCase().includes(q) || id.toLowerCase().includes(q);
      })
    : individuals;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="h-4 w-4" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!filtered || filtered.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        {filter ? `No individuals match "${filter}".` : "No individuals found."}
      </div>
    );
  }

  return (
    <div className="divide-y">
      {filtered.map((ind) => (
        <div
          key={ind.id}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-muted/30 px-2 -mx-2 rounded-lg transition-colors"
        >
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <Link
              href={`/individuals/${ind.gedcom_id}`}
              className="font-medium text-primary hover:underline"
            >
              {ind.names?.[0]?.full || ind.gedcom_id}
            </Link>
            <p className="text-xs text-muted-foreground truncate">
              {ind.gedcom_id}
              {ind.sex === "M" ? " · Male" : ind.sex === "F" ? " · Female" : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FamiliesList({ filter }: { filter: string }) {
  const { data: families, isLoading } = useFamilies();

  const filtered = filter
    ? families?.filter((fam) => {
        const q = filter.toLowerCase();
        const husband = fam.husband?.names?.[0]?.full || "";
        const wife = fam.wife?.names?.[0]?.full || "";
        return (
          fam.gedcom_id.toLowerCase().includes(q) ||
          husband.toLowerCase().includes(q) ||
          wife.toLowerCase().includes(q)
        );
      })
    : families;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="h-4 w-4" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!filtered || filtered.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        {filter ? `No families match "${filter}".` : "No families found."}
      </div>
    );
  }

  return (
    <div className="divide-y">
      {filtered.map((fam) => (
        <div
          key={fam.id}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-muted/30 px-2 -mx-2 rounded-lg transition-colors"
        >
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <Link
              href={`/families/${fam.gedcom_id}`}
              className="font-medium text-primary hover:underline"
            >
              Family {fam.gedcom_id}
            </Link>
            <p className="text-xs text-muted-foreground truncate">
              {fam.husband?.names?.[0]?.full || "—"} &amp; {fam.wife?.names?.[0]?.full || "—"}
              {fam.children?.length ? ` · ${fam.children.length} child(ren)` : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ListsPage() {
  const [filter, setFilter] = useState("");

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Lists</h1>
          <p className="mt-2 text-muted-foreground">
            Browse all individuals and families in your family tree.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="space-y-1">
              <Label htmlFor="filter">Filter</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter by name or GEDCOM ID..."
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="individuals">
          <TabsList>
            <TabsTrigger value="individuals">Individuals</TabsTrigger>
            <TabsTrigger value="families">Families</TabsTrigger>
          </TabsList>

          <TabsContent value="individuals">
            <Card>
              <CardContent className="p-4">
                <IndividualsList filter={filter} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="families">
            <Card>
              <CardContent className="p-4">
                <FamiliesList filter={filter} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
