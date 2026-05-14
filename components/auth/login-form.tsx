"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "אימייל הוא שדה חובה")
    .email("כתובת אימייל לא תקינה"),
  password: z.string().min(1, "סיסמה היא שדה חובה"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function translateAuthError(error: string): string {
  if (error.includes("Invalid login credentials"))
    return "אימייל או סיסמה שגויים";
  if (error.includes("Email not confirmed"))
    return "נא לאמת את כתובת האימייל תחילה";
  if (error.includes("Too many requests"))
    return "יותר מדי ניסיונות, נסה שוב מאוחר יותר";
  if (error.includes("User not found")) return "משתמש לא נמצא";
  return "שגיאה בהתחברות, נסה שוב";
}

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(translateAuthError(error.message));
      setIsLoading(false);
      return;
    }

    toast.success("התחברת בהצלחה!");
    // Use a full-page navigation (not router.push) so the browser sends the
    // newly-written auth cookies in the outgoing HTTP request headers.
    // router.push() triggers a soft RSC navigation that can serve a prefetched
    // unauthenticated cache frame, causing the middleware to see no session
    // and redirect back to /login before the cookies are ever read server-side.
    window.location.href = "/tasks";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" dir="rtl">
      <div className="space-y-2">
        <Label htmlFor="email">אימייל</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          dir="ltr"
          className="text-right"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">סיסמה</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          dir="ltr"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            מתחבר...
          </>
        ) : (
          "התחבר"
        )}
      </Button>
    </form>
  );
}
