"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // El hash se procesa automáticamente por Supabase
        // Aquí solo esperamos a que se confirme la sesión
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          router.push("/dashboard");
        } else {
          router.push("/login?message=Verifica tu email para continuar");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al confirmar el email"
        );
        setLoading(false);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Confirmando tu email...</p>
        <div className="mt-4 inline-block animate-spin">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
