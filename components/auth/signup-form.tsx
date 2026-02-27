"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "אימייל הוא שדה חובה")
      .email("כתובת אימייל לא תקינה"),
    password: z
      .string()
      .min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
    confirmPassword: z.string().min(1, "אימות סיסמה הוא שדה חובה"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

function translateAuthError(error: string): string {
  if (error.includes("User already registered"))
    return "כתובת אימייל זו כבר רשומה במערכת";
  if (error.includes("Password should be at least"))
    return "הסיסמה חייבת להכיל לפחות 6 תווים";
  if (error.includes("Unable to validate email"))
    return "כתובת אימייל לא תקינה";
  if (error.includes("Too many requests"))
    return "יותר מדי ניסיונות, נסה שוב מאוחר יותר";
  return "שגיאה בהרשמה, נסה שוב";
}

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    const supabase = createClient();

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${siteUrl}/tasks`,
      },
    });

    if (error) {
      toast.error(translateAuthError(error.message));
      setIsLoading(false);
      return;
    }

    toast.success("נרשמת בהצלחה! ניתן להתחבר כעת.");
    router.push("/tasks");
    router.refresh();
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
          placeholder="לפחות 6 תווים"
          autoComplete="new-password"
          dir="ltr"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">אימות סיסמה</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="חזור על הסיסמה"
          autoComplete="new-password"
          dir="ltr"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            נרשם...
          </>
        ) : (
          "הרשמה"
        )}
      </Button>
    </form>
  );
}
