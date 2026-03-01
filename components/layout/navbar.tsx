"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  LogOut,
  LayoutDashboard,
  CheckSquare,
  Loader2,
  Sparkles,
  FolderOpen,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/tasks",     label: "משימות",       Icon: CheckSquare },
  { href: "/projects",  label: "פרויקטים",     Icon: FolderOpen },
  { href: "/dashboard", label: "לוח מחוונים",  Icon: LayoutDashboard },
  { href: "/settings",  label: "הגדרות",       Icon: SlidersHorizontal },
] as const;

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("שגיאה בהתנתקות");
      setIsLoggingOut(false);
      return;
    }
    toast.success("התנתקת בהצלחה");
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight hidden sm:block">
              משימות חכמות
            </span>
          </div>

          {/* Navigation links */}
          <div className="flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                  pathname === href
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:block">{label}</span>
              </Link>
            ))}
          </div>

          {/* Theme toggle + Logout */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="gap-2 rounded-xl border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="hidden sm:block">התנתק</span>
            </Button>
          </div>

        </div>
      </div>
    </nav>
  );
}
