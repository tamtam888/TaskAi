import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">משימות חכמות</h1>
          <p className="text-slate-500 mt-2">ניהול משימות אישי</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            התחברות
          </h2>
          <LoginForm />
          <div className="mt-6 text-center text-sm text-slate-500">
            אין לך חשבון?{" "}
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              הרשמה
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
