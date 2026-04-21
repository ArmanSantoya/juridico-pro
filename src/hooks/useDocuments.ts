import { useState } from "react";

interface Document {
  id: string;
  caseId: string;
  documentType: string;
  title: string;
  section: string;
  url: string;
  createdAt: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDocuments = async (caseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents?caseId=${caseId}`);
      if (!response.ok) throw new Error("Error al obtener documentos");
      const data = await response.json();
      setDocuments(data.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    caseId: string,
    documentType: string,
    title: string,
    url: string,
    section?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          documentType,
          title,
          url,
          section: section || "SECTION_1",
        }),
      });
      if (!response.ok) throw new Error("Error al subir documento");
      const data = await response.json();
      setDocuments([...documents, data.document]);
      return data.document;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar documento");
      setDocuments(documents.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    documents,
    loading,
    error,
    getDocuments,
    uploadDocument,
    deleteDocument,
  };
}
