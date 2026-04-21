"use client";

import dynamic from "next/dynamic";

// Importar dinámicamente sin SSR para evitar hydration mismatch
const SignupClient = dynamic(() => import("./page.client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-600">Cargando...</div>
    </div>
  ),
});

export default function SignupPage() {
  return <SignupClient />;
}
