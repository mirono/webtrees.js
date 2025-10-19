"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TreePine } from "lucide-react";

interface FamilyTreeProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

const FamilyTree = ({ onNext, onBack }: FamilyTreeProps) => {
  const [title, setTitle] = useState("My family tree");
  const [url, setUrl] = useState("tree1");

  const handleSubmit = () => {
    onNext({
      familyTree: {
        title,
        url,
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-primary/10 rounded-full">
            <TreePine className="h-12 w-12 text-primary" />
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Create a Family Tree</CardTitle>
            <CardDescription className="text-base mt-2">
              Set up your first family tree
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Family tree title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My family tree"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  http://localhost:8080/index.php?route=/tree/
                </span>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="tree1"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Avoid spaces and punctuation. A family name might be a good choice.
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                After creating the family tree, you will be able to import data from a GEDCOM file.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={onBack} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Create Family Tree
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FamilyTree;
