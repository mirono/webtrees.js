import { useState } from "react";
import { Upload } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface GedcomImportProps {
  onContinue?: (data: GedcomImportData) => void;
  onBack?: () => void;
  treeName?: string;
}

interface GedcomImportData {
  file: File | null;
  encoding: string;
  keepMediaObjects: boolean;
  addSpaces: boolean;
  removeMediaPath: boolean;
  mediaPathToRemove: string;
}

const GedcomImport = ({ onContinue, onBack, treeName = "My family tree" }: GedcomImportProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [encoding, setEncoding] = useState("automatic");
  const [keepMediaObjects, setKeepMediaObjects] = useState(false);
  const [addSpaces, setAddSpaces] = useState(false);
  const [removeMediaPath, setRemoveMediaPath] = useState(false);
  const [mediaPathToRemove, setMediaPathToRemove] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.toLowerCase().endsWith(".ged")) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleContinue = () => {
    onContinue?.({
      file,
      encoding,
      keepMediaObjects,
      addSpaces,
      removeMediaPath,
      mediaPathToRemove,
    });
  };

  const handleBreadcrumbClick = (e: React.MouseEvent) => {
    if (onBack) {
      e.preventDefault();
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home" onClick={handleBreadcrumbClick}>Control panel</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/home" onClick={handleBreadcrumbClick}>Manage family trees</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Import a GEDCOM file — {treeName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground">
          Import a GEDCOM file — {treeName}
        </h1>

        {/* Warning Message */}
        <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30">
          <CardContent className="p-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              This will delete all the genealogy data from "{treeName}" and replace it with data from a GEDCOM file.
            </p>
          </CardContent>
        </Card>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30 hover:border-primary/50"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            Drag and drop your GEDCOM file here, or
          </p>
          <label className="cursor-pointer">
            <span className="text-primary hover:underline">browse to select a file</span>
            <input
              type="file"
              accept=".ged,.gedcom"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {file && (
            <p className="mt-4 text-sm text-foreground font-medium">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* Import Preferences */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Import preferences</h2>

          {/* Character Encoding */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <Label className="text-sm font-medium pt-2">Character encoding</Label>
            <div className="md:col-span-2">
              <Select value={encoding} onValueChange={setEncoding}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select encoding" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">automatic</SelectItem>
                  <SelectItem value="utf-8">UTF-8</SelectItem>
                  <SelectItem value="iso-8859-1">ISO-8859-1</SelectItem>
                  <SelectItem value="windows-1252">Windows-1252</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Keep Media Objects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <Label className="text-sm font-medium pt-1">Keep media objects</Label>
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="keepMedia"
                  checked={keepMediaObjects}
                  onCheckedChange={(checked) => setKeepMediaObjects(checked as boolean)}
                />
                <Label htmlFor="keepMedia" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  If you have created media objects in webtrees, and have subsequently edited this GEDCOM file using genealogy software that deletes media objects, then select this option to merge the current media objects with the new GEDCOM file.
                </Label>
              </div>
            </div>
          </div>

          {/* Add Spaces */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <Label className="text-sm font-medium pt-1">Add spaces where long lines were wrapped</Label>
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="addSpaces"
                  checked={addSpaces}
                  onCheckedChange={(checked) => setAddSpaces(checked as boolean)}
                />
                <Label htmlFor="addSpaces" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  If you created this GEDCOM file using genealogy software that omits spaces when splitting long lines, then select this option to reinsert the missing spaces.
                </Label>
              </div>
            </div>
          </div>

          {/* Remove Media Path */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <Label className="text-sm font-medium pt-1">Remove the GEDCOM media path from filenames</Label>
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="removeMediaPath"
                  checked={removeMediaPath}
                  onCheckedChange={(checked) => setRemoveMediaPath(checked as boolean)}
                />
                <Label htmlFor="removeMediaPath" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  Some genealogy software creates GEDCOM files that contain media filenames with full paths. These paths will not exist on the web-server. To allow webtrees to find the file, the first part of the path must be removed. For example, if the GEDCOM file contains <code className="bg-muted px-1 rounded text-foreground">C:\Documents\family\photo.jpeg</code> and webtrees expects to find <code className="bg-muted px-1 rounded text-foreground">family/photo.jpeg</code> in the media folder, then you would need to remove <code className="bg-muted px-1 rounded text-foreground">C:\Documents\</code>.
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <Button onClick={handleContinue} disabled={!file}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GedcomImport;
