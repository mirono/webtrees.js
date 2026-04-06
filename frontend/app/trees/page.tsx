import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Family Trees — webtrees.js",
  description: "Browse and manage your family trees",
};

export default function TreesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Family Trees</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and manage your genealogy family trees.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No family trees found.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            Return to home
          </Link>{" "}
          to get started.
        </p>
      </div>
    </main>
  );
}
