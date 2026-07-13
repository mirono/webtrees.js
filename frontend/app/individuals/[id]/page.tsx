"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import EditIndividualForm from "@/components/gedcom/EditIndividualForm";
import IndividualProfile from "@/components/gedcom/IndividualProfile";
import { useIndividual } from "@/hooks/useQueries";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export default function IndividualPage() {
  const params = useParams();
  const id = params.id as string;
  const [editing, setEditing] = useState(false);
  const { data: individual, isLoading } = useIndividual(id);

  if (isLoading) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!individual) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-2xl font-bold mb-4">Individual Not Found</h1>
          <p className="text-muted-foreground">No individual found with ID: {id}</p>
        </div>
      </AppShell>
    );
  }

  if (editing) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <EditIndividualForm
            individual={individual}
            onCancel={() => setEditing(false)}
            onSave={(data) => {
              console.log("Saving:", data);
              setEditing(false);
            }}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {individual.names?.[0]?.full || individual.gedcom_id}
          </h1>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
        <IndividualProfile id={id} />
      </div>
    </AppShell>
  );
}
