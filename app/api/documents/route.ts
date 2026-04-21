import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents, cases } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { supabase } from "@/lib/supabase";

// GET: Obtener documentos de un caso
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const caseId = searchParams.get("caseId");

    if (!caseId) {
      return NextResponse.json(
        { error: "caseId requerido" },
        { status: 400 }
      );
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el caso pertenezca al usuario
    const caseItem = await db
      .select()
      .from(cases)
      .where(eq(cases.id, caseId))
      .then((rows) => rows[0]);

    if (!caseItem || caseItem.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso" },
        { status: 403 }
      );
    }

    // Obtener documentos
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.caseId, caseId));

    return NextResponse.json({ documents: docs });
  } catch (error) {
    console.error("Error en GET /api/documents:", error);
    return NextResponse.json(
      { error: "Error al obtener documentos" },
      { status: 500 }
    );
  }
}

// POST: Crear un documento
export async function POST(request: NextRequest) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { caseId, type, title, section, fileUrl, fileName } = body;

    if (!caseId || !type || !title) {
      return NextResponse.json(
        { error: "Parámetros requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el caso pertenezca al usuario
    const caseItem = await db
      .select()
      .from(cases)
      .where(eq(cases.id, caseId))
      .then((rows) => rows[0]);

    if (!caseItem || caseItem.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso" },
        { status: 403 }
      );
    }

    // Crear documento
    const newDoc = await db
      .insert(documents)
      .values({
        caseId,
        type,
        title,
        section: (section || "ACTUALIZACION_CASO") as any,
        fileUrl,
        fileName,
        uploadedByUserId: session.user.id,
      })
      .returning();

    // Actualizar flags en el caso si es necesario
    if (type === "SOPORTE_PAGO") {
      await db
        .update(cases)
        .set({ hasSoportoPago: true })
        .where(eq(cases.id, caseId));
    }

    if (type === "PODER_LEGAL") {
      await db
        .update(cases)
        .set({ hasPoderLegal: true })
        .where(eq(cases.id, caseId));
    }

    return NextResponse.json({ document: newDoc[0] }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/documents:", error);
    return NextResponse.json(
      { error: "Error al crear documento" },
      { status: 500 }
    );
  }
}
