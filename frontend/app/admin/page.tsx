"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Database,
  Upload,
  Download,
  AlertTriangle,
  Search,
  Settings,
  Shield,
  Activity,
} from "lucide-react";
import Link from "next/link";

const STATS = [
  { label: "Individuals", value: 0, icon: Users },
  { label: "Families", value: 0, icon: Users },
  { label: "Sources", value: 0, icon: Database },
  { label: "Media objects", value: 0, icon: Database },
];

const TOOLS = [
  {
    category: "Data",
    items: [
      { label: "Find duplicates", icon: Search, href: "/admin/duplicates" },
      { label: "Merge records", icon: Database, href: "/admin/merge" },
      { label: "Check for errors", icon: AlertTriangle, href: "/admin/errors" },
      { label: "Find unrelated", icon: Users, href: "/admin/unrelated" },
    ],
  },
  {
    category: "GEDCOM",
    items: [
      { label: "Export GEDCOM", icon: Download, href: "/admin/export" },
      { label: "Import GEDCOM", icon: Upload, href: "/admin/import" },
    ],
  },
  {
    category: "Administration",
    items: [
      { label: "Users & access", icon: Shield, href: "/admin/users" },
      { label: "Preferences", icon: Settings, href: "/admin/preferences" },
      { label: "Privacy rules", icon: Shield, href: "/admin/privacy" },
    ],
  },
];

export default function AdminPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Control Panel</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your family tree, data quality, and site settings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {STATS.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue={TOOLS[0].category}>
        <TabsList>
          {TOOLS.map(({ category }) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        {TOOLS.map(({ category, items }) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {items.map(({ label, icon: Icon, href }) => (
                <Link key={label} href={href}>
                  <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                    <CardContent className="flex items-center gap-3 py-4">
                      <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                      <span className="font-medium">{label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Changes
          </CardTitle>
          <CardDescription>Latest changes to this family tree</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent changes.</p>
        </CardContent>
      </Card>
    </main>
  );
}
