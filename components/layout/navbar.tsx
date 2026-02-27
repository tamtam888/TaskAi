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
    <nav className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">
              משימות חכמות
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              href="/tasks"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                pathname === "/tasks"
                  ? "bg-purple-50 text-purple-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <CheckSquare className="h-4 w-4" />
              משימות
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                pathname === "/dashboard"
                  ? "bg-purple-50 text-purple-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
            className="gap-2 rounded-xl"
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
