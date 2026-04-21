import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cases, documents } from "@/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { supabase } from "@/lib/supabase";

// GET: Obtener todos los casos del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener casos del usuario
    const userCases = await db
      .select()
      .from(cases)
      .where(and(eq(cases.ownerId, session.user.id), isNull(cases.deletedAt)))
      .orderBy(desc(cases.createdAt));

    // Contar documentos por caso
    const casesWithCounts = await Promise.all(
      userCases.map(async (caseItem) => {
        const docs = await db
          .select()
          .from(documents)
          .where(eq(documents.caseId, caseItem.id));

        return {
          ...caseItem,
          documentCount: docs.length,
          hasSoportoPago: docs.some((d) => d.type === "SOPORTE_PAGO"),
          hasPoderLegal: docs.some((d) => d.type === "PODER_LEGAL"),
        };
      })
    );

    return NextResponse.json({ cases: casesWithCounts });
  } catch (error) {
    console.error("Error en GET /api/cases:", error);
    return NextResponse.json(
      { error: "Error al obtener casos" },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo caso
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { clientName, caseTypeId, description } = body;

    if (!clientName || !caseTypeId) {
      return NextResponse.json(
        { error: "Nombre del cliente y tipo de caso requeridos" },
        { status: 400 }
      );
    }

    // Generar displayLabel único
    const labelBase = `case-${Date.now()}`;
    const displayLabel = labelBase;

    // Crear caso
    const newCase = await db
      .insert(cases)
      .values({
        clientName,
        displayLabel,
        caseTypeId,
        description: description || undefined,
        status: "BITACORA",
        ownerId: session.user.id,
        hasSoportoPago: false,
        hasPoderLegal: false,
      })
      .returning();

    return NextResponse.json({ case: newCase[0] }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/cases:", error);
    return NextResponse.json(
      { error: "Error al crear caso" },
      { status: 500 }
    );
  }
}
