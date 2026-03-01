"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="he" dir="rtl">
      <body
        style={{ margin: 0, fontFamily: "sans-serif", backgroundColor: "#f5f5f5" }}
        className="min-h-screen flex flex-col items-center justify-center text-center p-8"
      >
        <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          שגיאה קריטית
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem", maxWidth: "24rem" }}>
          {error.message || "אירעה שגיאה בלתי צפויה. אנא נסה לרענן את הדף."}
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.625rem 1.25rem",
            borderRadius: "0.75rem",
            backgroundColor: "#7c3aed",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
          }}
        >
          נסה שוב
        </button>
      </body>
    </html>
  );
}
