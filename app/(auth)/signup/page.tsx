import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">משימות חכמות</h1>
          <p className="text-slate-500 mt-2">ניהול משימות אישי</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            יצירת חשבון
          </h2>
          <SignupForm />
          <div className="mt-6 text-center text-sm text-slate-500">
            כבר יש לך חשבון?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              התחברות
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
