"use client";

import dynamic from "next/dynamic";

// Importar dinámicamente sin SSR para evitar hydration mismatch
const DashboardClient = dynamic(() => import("./page.client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Cargando dashboard...</div>
    </div>
  ),
});

export default function DashboardPage() {
  return <DashboardClient />;
}
