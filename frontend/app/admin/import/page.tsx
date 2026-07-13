"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type ImportState = "idle" | "uploading" | "importing" | "done" | "error";

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [encoding, setEncoding] = useState("automatic");
  const [keepMedia, setKeepMedia] = useState(false);
  const [addSpaces, setAddSpaces] = useState(false);
  const [removeMediaPath, setRemoveMediaPath] = useState(false);
  const [mediaPath, setMediaPath] = useState("");
  const [state, setState] = useState<ImportState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".ged") || f.name.endsWith(".gedcom"))) {
      setFile(f);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setState("uploading");
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("encoding", encoding);
      formData.append("keepMediaObjects", String(keepMedia));
      formData.append("addSpaces", String(addSpaces));
      formData.append("removeMediaPath", String(removeMediaPath));
      formData.append("mediaPathToRemove", mediaPath);

      setState("importing");
      setProgress(40);

      const result = await fetch("http://localhost:3001/api/gedcom/import", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!result.ok) {
        const err = await result.json().catch(() => ({ message: "Import failed" }));
        throw new Error(err.message);
      }

      setProgress(100);
      setState("done");
    } catch (err) {
      setState("error");
      setErrorMsg((err as Error).message);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="text-sm text-muted-foreground mb-2">
          <Link href="/admin" className="hover:underline">Control Panel</Link> / GEDCOM Import
        </div>
        <h1 className="text-3xl font-bold text-foreground">GEDCOM Import</h1>
      </div>

      {state === "done" ? (
        <Card className="border-green-500">
          <CardContent className="flex items-center gap-3 py-6">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-medium">Import complete!</p>
              <p className="text-sm text-muted-foreground">
                Your family tree has been updated with the GEDCOM data.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30">
            <CardContent className="flex items-start gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-yellow-700 dark:text-yellow-300 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This will replace all existing genealogy data with data from the GEDCOM file.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select GEDCOM file</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                {file ? (
                  <p className="font-medium text-foreground">{file.name}</p>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-2">
                      Drag and drop your GEDCOM file here
                    </p>
                    <label className="cursor-pointer text-primary hover:underline">
                      or browse to select
                      <input type="file" accept=".ged,.gedcom" className="hidden" onChange={handleFileChange} />
                    </label>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Import preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Character encoding</Label>
                <select
                  value={encoding}
                  onChange={(e) => setEncoding(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="automatic">Automatic</option>
                  <option value="utf-8">UTF-8</option>
                  <option value="iso-8859-1">ISO-8859-1</option>
                  <option value="windows-1252">Windows-1252</option>
                </select>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="keepMedia" checked={keepMedia} onCheckedChange={(c) => setKeepMedia(!!c)} />
                <Label htmlFor="keepMedia" className="text-sm leading-relaxed cursor-pointer">
                  Keep existing media objects (merge)
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="addSpaces" checked={addSpaces} onCheckedChange={(c) => setAddSpaces(!!c)} />
                <Label htmlFor="addSpaces" className="text-sm leading-relaxed cursor-pointer">
                  Add spaces where long lines were wrapped
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="removeMediaPath" checked={removeMediaPath} onCheckedChange={(c) => setRemoveMediaPath(!!c)} />
                <Label htmlFor="removeMediaPath" className="text-sm leading-relaxed cursor-pointer">
                  Remove GEDCOM media path from filenames
                </Label>
              </div>
              {removeMediaPath && (
                <div className="space-y-2 ml-8">
                  <Label htmlFor="mediaPath">Path prefix to remove</Label>
                  <input
                    id="mediaPath"
                    value={mediaPath}
                    onChange={(e) => setMediaPath(e.target.value)}
                    placeholder="C:\Documents\"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {state === "error" && (
            <Card className="mb-6 border-destructive">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-destructive text-sm">{errorMsg}</span>
              </CardContent>
            </Card>
          )}

          {(state === "uploading" || state === "importing") && (
            <Card className="mb-6">
              <CardContent className="py-4 space-y-3">
                <p className="text-sm font-medium">
                  {state === "uploading" ? "Uploading file..." : "Importing GEDCOM data..."}
                </p>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  This may take a while for large family trees.
                </p>
              </CardContent>
            </Card>
          )}

          <Button onClick={handleImport} disabled={!file || state === "uploading" || state === "importing"}>
            {state === "uploading" || state === "importing" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              "Import GEDCOM File"
            )}
          </Button>
        </>
      )}
    </main>
  );
}
