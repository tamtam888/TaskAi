import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary shadow-lg shadow-primary/20 mb-4">
            <span className="text-primary-foreground text-xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">משימות חכמות</h1>
          <p className="text-muted-foreground mt-1.5">ניהול משימות אישי</p>
        </div>
        <div className="bg-card rounded-2xl shadow-xl shadow-black/5 border border-border p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            יצירת חשבון
          </h2>
          <SignupForm />
          <div className="mt-6 text-center text-sm text-muted-foreground">
            כבר יש לך חשבון?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-semibold"
            >
              התחברות
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
