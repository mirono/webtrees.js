"use client";

import { useState } from "react";
import { useIndividuals } from "@/hooks/useQueries";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, User } from "lucide-react";
import Link from "next/link";

export default function IndividualsPage() {
  const [filter, setFilter] = useState("");
  const { data: individuals, isLoading } = useIndividuals();

  const filtered = filter
    ? individuals?.filter((ind) => {
        const name = ind.names?.[0]?.full || "";
        const id = ind.gedcom_id;
        const q = filter.toLowerCase();
        return name.toLowerCase().includes(q) || id.toLowerCase().includes(q);
      })
    : individuals;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Individuals</h1>
        <p className="mt-2 text-muted-foreground">
          {individuals ? `${individuals.length} individuals in your family tree.` : "Loading..."}
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
                placeholder="Filter by name or ID..."
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered && filtered.length > 0 ? (
        <Card>
          <CardContent className="divide-y p-0">
            {filtered.map((ind) => (
              <div
                key={ind.id}
                className="flex items-center gap-3 py-3 px-6 hover:bg-muted/30 transition-colors"
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
                    {ind.sex && ` · ${ind.sex === "M" ? "Male" : ind.sex === "F" ? "Female" : ""}`}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            {filter ? `No individuals match "${filter}".` : "No individuals found."}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
