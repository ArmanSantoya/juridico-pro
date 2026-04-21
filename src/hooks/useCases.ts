import { useState } from "react";

interface Case {
  id: string;
  name: string;
  status: string;
  caseTypeId: string;
  documentCount?: number;
  hasSoportoPago: boolean;
  hasPoderLegal: boolean;
  createdAt: string;
}

export function useCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cases");
      if (!response.ok) throw new Error("Error al obtener casos");
      const data = await response.json();
      setCases(data.cases);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const createCase = async (
    name: string,
    caseTypeId: string,
    description?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, caseTypeId, description }),
      });
      if (!response.ok) throw new Error("Error al crear caso");
      const data = await response.json();
      setCases([data.case, ...cases]);
      return data.case;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCase = async (
    id: string,
    updates: { name?: string; description?: string; status?: string }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Error al actualizar caso");
      const data = await response.json();
      setCases(cases.map((c) => (c.id === id ? data.case : c)));
      return data.case;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCase = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/cases/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar caso");
      setCases(cases.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    cases,
    loading,
    error,
    getCases,
    createCase,
    updateCase,
    deleteCase,
  };
}
