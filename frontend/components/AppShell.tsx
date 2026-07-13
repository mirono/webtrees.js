"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useStats } from "@/hooks/useQueries";
import { Button } from "@/components/ui/button";
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
  Shield,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/trees", label: "Family trees", icon: TreePine },
  { href: "/charts", label: "Charts", icon: PieChart },
  { href: "/lists", label: "Lists", icon: List },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/search", label: "Search", icon: Search },
];

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppShell({ children, title = "webtrees" }: AppShellProps) {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-card text-card-foreground border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-foreground">
              {title}
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
                <Link href="/search" aria-label="Search">
                  <Search className="h-4 w-4" />
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

      <main className="flex-1 pt-[110px]">
        {children}
      </main>
    </div>
  );
}