"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Film, FileText, Music } from "lucide-react";
import { useMedia } from "@/hooks/useQueries";
import { Skeleton } from "@/components/ui/skeleton";

type MediaType = "all" | "photo" | "document" | "video" | "audio";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  photo: Image,
  document: FileText,
  video: Film,
  audio: Music,
};

export default function MediaPage() {
  const [filter, setFilter] = useState<MediaType>("all");
  const { data: media, isLoading } = useMedia();

  const filtered =
    filter === "all"
      ? media
      : media?.filter((m) => m.type === filter);

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Media Gallery</h1>
          <p className="mt-2 text-muted-foreground">
            Photos, documents, and other media from your family tree.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          {(["all", "photo", "document", "video", "audio"] as MediaType[]).map(
            (t) => {
              const Icon = TYPE_ICONS[t] || Image;
              return (
                <Button
                  key={t}
                  variant={filter === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(t)}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              );
            }
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
              No media of this type found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((m) => {
              const Icon = TYPE_ICONS[m.type] || Image;
              return (
                <Card
                  key={m.id}
                  className="hover:bg-muted/30 transition-colors overflow-hidden"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <Icon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardContent className="py-3 px-4">
                    <p className="text-sm font-medium truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {m.filename}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
