import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { supabase } from "@/lib/supabase";

// DELETE: Eliminar un documento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el documento pertenezca al usuario
    const doc = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .then((rows) => rows[0]);

    if (!doc) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    if (doc.uploadedByUserId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este documento" },
        { status: 403 }
      );
    }

    // Eliminar documento
    await db.delete(documents).where(eq(documents.id, id));

    return NextResponse.json({ message: "Documento eliminado" });
  } catch (error) {
    console.error("Error en DELETE /api/documents/[id]:", error);
    return NextResponse.json(
      { error: "Error al eliminar documento" },
      { status: 500 }
    );
  }
}
