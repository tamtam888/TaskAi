import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-background">
      <p className="text-7xl font-black text-primary/20 mb-4">404</p>
      <h1 className="text-2xl font-bold text-foreground mb-2">הדף לא נמצא</h1>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        הדף שחיפשת אינו קיים או שהועבר למיקום אחר.
      </p>
      <Link
        href="/tasks"
        className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        חזרה למשימות
      </Link>
    </div>
  );
}
