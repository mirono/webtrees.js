"use client";

import AppShell from "@/components/AppShell";
import { useTrees } from "@/hooks/useQueries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TreePine, Plus, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function TreesPage() {
  const { data: trees, isLoading } = useTrees();

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Family Trees</h1>
            <p className="mt-2 text-muted-foreground">
              Browse and manage your genealogy family trees.
            </p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New tree
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : trees && trees.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trees.map((tree) => (
              <Card key={tree.id} className="hover:bg-muted/30 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded">
                      <TreePine className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{tree.name}</p>
                      <p className="text-xs text-muted-foreground">{tree.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <TreePine className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No family trees found.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                <Link href="/" className="text-primary hover:underline">
                  Return to home
                </Link>{" "}
                to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
