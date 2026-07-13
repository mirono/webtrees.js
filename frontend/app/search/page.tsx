"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSearch } from "@/hooks/useQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, User, Users, AlertCircle } from "lucide-react";
import Link from "next/link";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  const { data, isLoading, error } = useSearch(query);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const q = formData.get("q") as string;
      setQuery(q);
      router.replace(`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`, { scroll: false });
    },
    [router],
  );

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="search-query">Search query</Label>
                <Input
                  id="search-query"
                  name="q"
                  type="search"
                  defaultValue={initialQuery}
                  placeholder="Name, place, or date..."
                  autoFocus
                />
              </div>
              <div className="flex items-end">
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {error && (
        <Card className="mb-8 border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive text-sm">
              Search failed: {(error as Error).message}
            </span>
          </CardContent>
        </Card>
      )}

      {!isLoading && query.length >= 2 && data && (
        <Tabs defaultValue="individuals">
          <TabsList>
            <TabsTrigger value="individuals">
              Individuals ({data.individuals.length})
            </TabsTrigger>
            <TabsTrigger value="families">
              Families ({data.families.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individuals">
            {data.individuals.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
                  No individuals match "{query}".
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="divide-y">
                  {data.individuals.map((ind) => (
                    <div key={ind.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
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
                          {ind.events?.[0]?.date && ` · ${ind.events[0].date}`}
                          {ind.events?.[0]?.place && ` · ${ind.events[0].place}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="families">
            {data.families.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
                  No families match "{query}".
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="divide-y">
                  {data.families.map((fam) => (
                    <div key={fam.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/families/${fam.gedcom_id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          Family {fam.gedcom_id}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                          {fam.husband?.names?.[0]?.full || "—"} &amp;{" "}
                          {fam.wife?.names?.[0]?.full || "—"}
                          {fam.children?.length ? ` · ${fam.children.length} child(ren)` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!isLoading && query.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          Enter at least 2 characters to search.
        </p>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Search</h1>
        <p className="mt-2 text-muted-foreground">
          Find individuals and families in your family tree.
        </p>
      </div>

      <Suspense
        fallback={
          <Card className="mb-8">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        }
      >
        <SearchContent />
      </Suspense>
    </main>
  );
}
