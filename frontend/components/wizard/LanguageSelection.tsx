"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

interface LanguageSelectionProps {
  onNext: (data: { language: string }) => void;
  defaultLanguage: string;
}

const languages = [
  { value: "en-US", label: "American English" },
  { value: "en-GB", label: "British English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Português" },
  { value: "nl", label: "Nederlands" },
  { value: "sv", label: "Svenska" },
  { value: "pl", label: "Polski" },
];

const LanguageSelection = ({ onNext, defaultLanguage }: LanguageSelectionProps) => {
  const [language, setLanguage] = useState(defaultLanguage);

  const handleSubmit = () => {
    onNext({ language });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-primary/10 rounded-full">
            <Globe className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Welcome to Family Tree Setup</CardTitle>
            <CardDescription className="text-base mt-2">
              Let's get started by selecting your preferred language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="language" className="text-sm font-medium text-foreground">
                Select Language
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="w-full">
                  <SelectValue placeholder="Choose a language" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LanguageSelection;
