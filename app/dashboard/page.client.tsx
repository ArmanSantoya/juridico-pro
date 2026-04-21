"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">No autenticado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Juridico Pro</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">{user.email}</span>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
            >
              {signingOut ? "Cerrando..." : "Cerrar Sesión"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Casos */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-3xl font-bold text-indigo-600 mb-2">0</div>
            <h3 className="text-lg font-semibold text-gray-900">Casos Activos</h3>
            <p className="text-gray-600 text-sm mt-1">
              Casos en proceso
            </p>
          </div>

          {/* Card: Documentos */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
            <p className="text-gray-600 text-sm mt-1">
              Documentos subidos
            </p>
          </div>

          {/* Card: Bitácora */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <h3 className="text-lg font-semibold text-gray-900">Bitácora</h3>
            <p className="text-gray-600 text-sm mt-1">
              Casos pendientes
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition">
              + Nuevo Caso
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition">
              📄 Subir Documento
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
