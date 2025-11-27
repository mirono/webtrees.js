import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, ChevronRight, Globe, LogOut } from "lucide-react";
import GedcomImport from "../gedcom/GedcomImport";

interface DashboardProps {
  familyTreeData?: {
    title: string;
    url: string;
  };
  onEnterApp?: () => void;
  configuration?: any;
  configurationSummary?: any;
}

const menuSections = [
  {
    title: "Family tree",
    items: ["Home page", "Preferences", "Privacy", "Data fixes"],
  },
  {
    title: "Genealogy data",
    items: [
      "Find duplicates",
      "Merge records",
      "Check for errors",
      "Find unrelated individuals",
      "Renumber XREFs",
      "Changes log",
    ],
  },
  {
    title: "Add unlinked records",
    items: ["Individual", "Source", "Repository", "Media object", "Shared note", "Submitter"],
  },
  {
    title: "GEDCOM file",
    items: ["Export", "Import"],
  },
];

const Dashboard = ({ familyTreeData, onEnterApp }: DashboardProps) => {
  const [activeView, setActiveView] = useState<string>("dashboard");

  const handleMenuClick = (item: string) => {
    if (item === "Import") {
      setActiveView("gedcom-import");
    }
  };

  const handleBackToDashboard = () => {
    setActiveView("dashboard");
  };

  if (activeView === "gedcom-import") {
    return (
      <GedcomImport
        onBack={handleBackToDashboard}
        treeName={familyTreeData?.title || "My family tree"}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card text-card-foreground border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">webtrees</h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                My page
              </Button>
              <Button variant="ghost" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                Language
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Success Message */}
          <Alert className="mb-6 bg-success/10 border-success/20">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertTitle className="text-success">Success</AlertTitle>
            <AlertDescription className="text-foreground">
              The family tree "{familyTreeData?.url || "tree1"}" has been created.
            </AlertDescription>
          </Alert>

          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer">Control panel</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Manage family trees</span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <h2 className="text-3xl font-bold text-foreground">Manage family trees</h2>
          </div>

          <div
            className="text-xl text-muted-foreground mb-8 cursor-pointer hover:text-primary transition-colors inline-flex items-center gap-2"
            onClick={onEnterApp}
          >
            <span className="underline decoration-dotted underline-offset-4">
              {familyTreeData?.url || "tree1"} — {familyTreeData?.title || "My family tree"}
            </span>
            <ChevronRight className="h-5 w-5" />
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuSections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left font-normal hover:bg-muted"
                          size="sm"
                          onClick={() => handleMenuClick(item)}
                        >
                          {item}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
