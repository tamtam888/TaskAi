import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-violet-100/60 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-violet-600 shadow-lg shadow-violet-200 mb-4">
            <span className="text-white text-xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">משימות חכמות</h1>
          <p className="text-slate-500 mt-1.5">ניהול משימות אישי</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl shadow-violet-100 border border-violet-100 p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            התחברות
          </h2>
          <LoginForm />
          <div className="mt-6 text-center text-sm text-slate-500">
            אין לך חשבון?{" "}
            <Link
              href="/signup"
              className="text-violet-600 hover:text-violet-700 font-semibold"
            >
              הרשמה
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
