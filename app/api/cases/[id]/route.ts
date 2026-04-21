import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { supabase } from "@/lib/supabase";

// GET: Obtener un caso específico
export async function GET(
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

    const caseItem = await db
      .select()
      .from(cases)
      .where(eq(cases.id, id))
      .then((rows) => rows[0]);

    if (!caseItem) {
      return NextResponse.json(
        { error: "Caso no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario sea el dueño
    if (caseItem.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para acceder a este caso" },
        { status: 403 }
      );
    }

    return NextResponse.json({ case: caseItem });
  } catch (error) {
    console.error("Error en GET /api/cases/[id]:", error);
    return NextResponse.json(
      { error: "Error al obtener caso" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar un caso
export async function PUT(
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

    const body = await request.json();
    const { clientName, clientEmail, clientPhone, description, status } = body;

    // Verificar que el usuario sea el dueño
    const caseItem = await db
      .select()
      .from(cases)
      .where(eq(cases.id, id))
      .then((rows) => rows[0]);

    if (!caseItem || caseItem.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para actualizar este caso" },
        { status: 403 }
      );
    }

    // Actualizar caso
    const updated = await db
      .update(cases)
      .set({
        ...(clientName && { clientName }),
        ...(clientEmail && { clientEmail }),
        ...(clientPhone && { clientPhone }),
        ...(description && { description }),
        ...(status && { status: status as any }),
      })
      .where(eq(cases.id, id))
      .returning();

    return NextResponse.json({ case: updated[0] });
  } catch (error) {
    console.error("Error en PUT /api/cases/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar caso" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar un caso (soft delete)
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

    // Verificar que el usuario sea el dueño
    const caseItem = await db
      .select()
      .from(cases)
      .where(eq(cases.id, id))
      .then((rows) => rows[0]);

    if (!caseItem || caseItem.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este caso" },
        { status: 403 }
      );
    }

    // Soft delete
    await db
      .update(cases)
      .set({ deletedAt: new Date() })
      .where(eq(cases.id, id));

    return NextResponse.json({ message: "Caso eliminado" });
  } catch (error) {
    console.error("Error en DELETE /api/cases/[id]:", error);
    return NextResponse.json(
      { error: "Error al eliminar caso" },
      { status: 500 }
    );
  }
}
