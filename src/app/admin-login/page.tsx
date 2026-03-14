import { Suspense } from "react";
import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-sage flex items-center justify-center">
        <div className="text-forest text-center">
          <div className="text-4xl mb-3">🌿</div>
          <p className="font-semibold">Loading…</p>
        </div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
