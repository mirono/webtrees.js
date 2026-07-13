"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import { usePlaces } from "@/hooks/useQueries";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlacesPage() {
  const [query, setQuery] = useState("");
  const { data: places, isLoading } = usePlaces();

  const filtered = places?.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Places</h1>
          <p className="mt-2 text-muted-foreground">
            Browse the locations recorded in your family tree.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="place-search">Search places</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="place-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="City, country, region..."
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
              {query ? "No places match your search." : "No places found."}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((place) => (
              <Card key={place.id} className="hover:bg-muted/30 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="font-medium">{place.name}</p>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-2 ml-6">
                    <span>{place.individuals} individuals</span>
                    <span>{place.families} families</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
