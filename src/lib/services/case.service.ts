/**
 * Case Service - Lógica de negocio con Drizzle ORM
 * 
 * ✅ hasSoportoPago y hasPoderLegal se actualizan AUTOMÁTICAMENTE
 * cuando se suben documentos del tipo correspondiente
 */

import { db } from '@/db';
import {
  cases,
  documents,
  auditLogs,
  users,
} from '@/db/schema';
import { eq, and, count, isNull } from 'drizzle-orm';
import {
  validateTransition,
} from '@/lib/utils/state-machine';

export interface CreateCaseInput {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  description?: string;
  caseTypeId: string;
  ownerId: string;
}

/**
 * Genera un label único para el caso: NombreAbogado-NombreCliente
 */
async function generateDisplayLabel(
  ownerId: string,
  clientName: string
): Promise<string> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, ownerId),
  });

  if (!user) throw new Error('Usuario no encontrado');

  let label = `${user.name.split(' ')[0]}-${clientName.substring(0, 15)}`;
  let suffix = 1;

  while (true) {
    const existing = await db.query.cases.findFirst({
      where: eq(cases.displayLabel, label),
    });

    if (!existing) break;
    label = `${user.name.split(' ')[0]}-${clientName.substring(0, 15)}-${suffix}`;
    suffix++;
  }

  return label;
}

/**
 * Crea un nuevo caso (inicialmente en estado BITACORA)
 */
export async function createCase(input: CreateCaseInput) {
  const displayLabel = await generateDisplayLabel(input.ownerId, input.clientName);

  const newCase = await db
    .insert(cases)
    .values({
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone,
      description: input.description,
      displayLabel,
      ownerId: input.ownerId,
      caseTypeId: input.caseTypeId,
      status: 'BITACORA',
    })
    .returning();

  // Log en auditoría
  await db.insert(auditLogs).values({
    action: 'CASE_CREATED',
    performedByUserId: input.ownerId,
    caseId: newCase[0].id,
    details: JSON.stringify({
      clientName: input.clientName,
      caseTypeId: input.caseTypeId,
    }),
  });

  return newCase[0];
}

/**
 * Obtiene todos los casos con opción de filtrado
 * ✅ Cuenta documentos en tiempo real (no usa contadores redundantes)
 */
export async function getCases(filters?: {
  ownerId?: string;
  status?: string;
  caseTypeId?: string;
}) {
  const whereConditions = [
    filters?.ownerId ? eq(cases.ownerId, filters.ownerId) : undefined,
    filters?.status ? eq(cases.status, filters.status as "BITACORA" | "CASO_ACTIVO" | "CERRADO" | "ARCHIVADO") : undefined,
    filters?.caseTypeId ? eq(cases.caseTypeId, filters.caseTypeId) : undefined,
    isNull(cases.deletedAt)
  ];

  return db.query.cases.findMany({
    where: and(...whereConditions),
    with: {
      caseType: true,
      owner: true,
      documents: {
        where: isNull(documents.deletedAt),
      },
    },
    orderBy: cases.createdAt,
  });
}

/**
 * Obtiene un caso específico
 */
export async function getCase(caseId: string) {
  return db.query.cases.findFirst({
    where: eq(cases.id, caseId),
    with: {
      caseType: true,
      owner: true,
      documents: {
        where: isNull(documents.deletedAt),
      },
      emails: {
        where: isNull(documents.deletedAt),
      },
    },
  });
}

/**
 * ✅ AUTOMÁTICO: Actualiza hasSoportoPago cuando se sube documento SOPORTE_PAGO
 * ✅ AUTOMÁTICO: Actualiza hasPoderLegal cuando se sube documento PODER_LEGAL
 * 
 * Llamar esta función después de subir un documento para actualizar los flags
 */
export async function updateCaseDocumentFlags(
  caseId: string,
  documentType: string
) {
  const updateData: Record<string, boolean> = {};

  if (documentType === 'SOPORTE_PAGO') {
    updateData.hasSoportoPago = true;
  } else if (documentType === 'PODER_LEGAL') {
    updateData.hasPoderLegal = true;
  }

  if (Object.keys(updateData).length > 0) {
    await db.update(cases).set(updateData).where(eq(cases.id, caseId));
  }
}

/**
 * Valida si un caso puede hacer transición a un nuevo estado
 */
export async function canTransitionCase(
  caseId: string,
  toStatus: string
) {
  const caseData = await getCase(caseId);

  if (!caseData) throw new Error('Caso no encontrado');

  const currentStatus = caseData.status as "BITACORA" | "CASO_ACTIVO" | "CERRADO" | "ARCHIVADO";
  const nextStatus = toStatus as "BITACORA" | "CASO_ACTIVO" | "CERRADO" | "ARCHIVADO";

  return validateTransition(currentStatus, nextStatus, {
    currentStatus: currentStatus,
    hasSoportoPago: caseData.hasSoportoPago,
    hasPoderLegal: caseData.hasPoderLegal,
  });
}

/**
 * Realiza la transición de estado del caso
 */
export async function transitionCase(
  caseId: string,
  toStatus: string,
  performedByUserId: string
) {
  const caseData = await getCase(caseId);

  if (!caseData) throw new Error('Caso no encontrado');

  // Validar transición
  const validation = await canTransitionCase(caseId, toStatus);

  if (!validation.isValid) {
    throw new Error(validation.reason || 'Transición no permitida');
  }

  // Actualizar estado
  const nextStatus = toStatus as "BITACORA" | "CASO_ACTIVO" | "CERRADO" | "ARCHIVADO";
  const updated = await db
    .update(cases)
    .set({
      status: nextStatus,
    })
    .where(eq(cases.id, caseId))
    .returning();

  // Log en auditoría
  await db.insert(auditLogs).values({
    action: 'CASE_STATUS_CHANGED',
    performedByUserId,
    caseId: caseId,
    details: JSON.stringify({
      fromStatus: caseData.status,
      toStatus: toStatus,
    }),
  });

  return updated[0];
}

/**
 * Obtiene estadísticas en tiempo real de un caso
 * - Conteo de documentos por sección (SIN contadores redundantes)
 */
export async function getCaseStats(caseId: string) {
  const stats = await db
    .select({
      section: documents.section,
      count: count().as('count'),
    })
    .from(documents)
    .where(
      and(
        eq(documents.caseId, caseId),
        isNull(documents.deletedAt)
      )
    )
    .groupBy(documents.section);

  return {
    section1: stats.find(s => s.section === 'ACTUALIZACION_CASO')?.count || 0,
    section2: stats.find(s => s.section === 'GESTION_ABOGADO')?.count || 0,
    section3: stats.find(s => s.section === 'DOCUMENTOS_LEGALES')?.count || 0,
    section4: stats.find(s => s.section === 'COMUNICACION')?.count || 0,
    total: stats.reduce((acc, s) => acc + s.count, 0),
  };
}

/**
 * Soft delete de un caso
 */
export async function softDeleteCase(caseId: string, userId: string) {
  const deleted = await db
    .update(cases)
    .set({ deletedAt: new Date() })
    .where(eq(cases.id, caseId))
    .returning();

  await db.insert(auditLogs).values({
    action: 'CASE_UPDATED',
    performedByUserId: userId,
    caseId: caseId,
    details: JSON.stringify({ action: 'soft_delete' }),
  });

  return deleted[0];
}
