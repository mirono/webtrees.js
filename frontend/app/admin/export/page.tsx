"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ExportPage() {
  const [encoding, setEncoding] = useState("UTF-8");
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/gedcom/export?encoding=${encoding}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "family-tree.ged";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="text-sm text-muted-foreground mb-2">
          <Link href="/admin" className="hover:underline">Control Panel</Link> / GEDCOM Export
        </div>
        <h1 className="text-3xl font-bold text-foreground">GEDCOM Export</h1>
      </div>

      {done ? (
        <Card className="border-green-500">
          <CardContent className="flex items-center gap-3 py-6">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-medium">Export complete!</p>
              <p className="text-sm text-muted-foreground">
                Your GEDCOM file has been downloaded.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Export options</CardTitle>
            <CardDescription>
              Download your family tree as a standard GEDCOM 5.5 file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="encoding">Character encoding</Label>
              <Select value={encoding} onValueChange={setEncoding}>
                <SelectTrigger id="encoding">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTF-8">UTF-8 (recommended)</SelectItem>
                  <SelectItem value="ANSEL">ANSEL</SelectItem>
                  <SelectItem value="ISO-8859-1">ISO-8859-1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExport} disabled={downloading}>
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download GEDCOM File
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
