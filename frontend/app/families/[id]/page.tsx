"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import EditFamilyForm from "@/components/gedcom/EditFamilyForm";
import { useFamily } from "@/hooks/useQueries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Pencil } from "lucide-react";
import Link from "next/link";

export default function FamilyPage() {
  const params = useParams();
  const id = params.id as string;
  const [editing, setEditing] = useState(false);
  const { data: family, isLoading, error } = useFamily(id);

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

  if (error || !family) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-2xl font-bold mb-4">Family Not Found</h1>
          <p className="text-muted-foreground">
            {error ? `Error: ${(error as Error).message}` : `No family found with ID: ${id}`}
          </p>
        </div>
      </AppShell>
    );
  }

  if (editing) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <EditFamilyForm
            family={family}
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
          <h1 className="text-2xl font-bold">Family {family.gedcom_id}</h1>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-muted p-3 rounded-full">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">Family {family.gedcom_id}</CardTitle>
                <CardDescription>{family.gedcom_id}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Husband</span>
                  {family.husband ? (
                    <Link href={`/individuals/${family.husband.gedcom_id}`}>
                      <Button variant="link" className="px-0 h-auto">
                        {family.husband.names?.[0]?.full || family.husband.gedcom_id}
                      </Button>
                    </Link>
                  ) : (
                    <p className="text-muted-foreground text-sm">Not recorded</p>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Wife</span>
                  {family.wife ? (
                    <Link href={`/individuals/${family.wife.gedcom_id}`}>
                      <Button variant="link" className="px-0 h-auto">
                        {family.wife.names?.[0]?.full || family.wife.gedcom_id}
                      </Button>
                    </Link>
                  ) : (
                    <p className="text-muted-foreground text-sm">Not recorded</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Children</CardTitle>
            </CardHeader>
            <CardContent>
              {family.children && family.children.length > 0 ? (
                <ul className="space-y-3">
                  {family.children.map((child) => (
                    <li key={child.id} className="flex items-center gap-3 border-b pb-2 last:border-0">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Link href={`/individuals/${child.gedcom_id}`}>
                        <Button variant="link" className="px-0 h-auto">
                          {child.names?.[0]?.full || child.gedcom_id}
                        </Button>
                      </Link>
                      <span className="text-muted-foreground text-sm">({child.gedcom_id})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No children recorded.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}