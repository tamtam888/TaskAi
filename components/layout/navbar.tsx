"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { LogOut, LayoutDashboard, CheckSquare, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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
    <nav className="sticky top-0 z-40 w-full border-b border-violet-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              משימות חכמות
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              href="/tasks"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                pathname === "/tasks"
                  ? "bg-violet-100 text-violet-700 shadow-sm"
                  : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
              )}
            >
              <CheckSquare className="h-4 w-4" />
              משימות
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                pathname === "/dashboard"
                  ? "bg-violet-100 text-violet-700 shadow-sm"
                  : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              לוח מחוונים
            </Link>
          </div>

          {/* Logout */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="gap-2 rounded-xl border-violet-200 text-slate-600 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            התנתק
          </Button>
        </div>
      </div>
    </nav>
  );
}
