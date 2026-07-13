"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useStats } from "@/hooks/useQueries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginDialog from "@/components/auth/LoginDialog";
import {
  Sun,
  Moon,
  Globe,
  LogIn,
  Search,
  TreePine,
  PieChart,
  List,
  Calendar,
  Eye,
  Users,
  Image,
  MapPin,
  Shield,
  Loader2,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/trees", label: "Family trees", icon: TreePine },
  { href: "/charts", label: "Charts", icon: PieChart },
  { href: "/individuals", label: "Lists", icon: List },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/search", label: "Search", icon: Search },
];

const STAT_ICONS = [
  { label: "Individuals", key: "individuals" as const, icon: Users },
  { label: "Families", key: "families" as const, icon: Users },
  { label: "Sources", key: "sources" as const, icon: List },
  { label: "Media objects", key: "media" as const, icon: Image },
  { label: "Places", key: "places" as const, icon: MapPin },
  { label: "Notes", key: "notes" as const, icon: List },
];

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex justify-between items-center border-b pb-2 last:border-0">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export default function MainApp() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { data: stats, isLoading } = useStats();

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card text-card-foreground border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-foreground">
              webtrees
            </Link>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

              <Button variant="ghost" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Language</span>
              </Button>

              <Button variant="ghost" size="sm" asChild>
                <Link href="/search">
                  <Search className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Search</span>
                </Link>
              </Button>

              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{user.username}</span>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Sign out
                  </Button>
                </div>
              ) : (
                <LoginDialog
                  trigger={
                    <Button variant="ghost" size="sm">
                      <LogIn className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Sign in</span>
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Button Bar */}
      <nav
        className="fixed top-[57px] left-0 right-0 z-40 bg-card text-card-foreground border-b border-border"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Button key={href} variant="ghost" size="sm" className="flex items-center gap-2 shrink-0" asChild>
                <Link href={href}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </Button>
            ))}
            <Button variant="ghost" size="sm" className="flex items-center gap-2 shrink-0" asChild>
              <Link href="/admin">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-[110px] pb-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Family tree overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : stats ? (
                  STAT_ICONS.map(({ label, key, icon }) => (
                    <StatCard key={key} label={label} value={stats[key]} icon={icon} />
                  ))
                ) : (
                  STAT_ICONS.map(({ label, key, icon }) => (
                    <StatCard key={key} label={label} value={0} icon={icon} />
                  ))
                )}
              </CardContent>
            </Card>

            {/* On This Day */}
            <Card>
              <CardHeader>
                <CardTitle>On this day</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No events on this date in your family tree.</p>
              </CardContent>
            </Card>

            {/* Recent Changes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent changes</CardTitle>
                <CardDescription>Latest additions and edits</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No recent changes.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Views: —</span>
            </div>
            <div className="flex items-center gap-4">
              <span>© {new Date().getFullYear()} webtrees</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
