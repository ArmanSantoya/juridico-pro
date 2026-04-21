/**
 * Document Service - Lógica de subida y gestión de documentos
 * 
 * ✅ Automáticamente actualiza hasSoportoPago y hasPoderLegal 
 * cuando se suben documentos de esos tipos
 */

import { db } from '@/db';
import { documents, cases } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { updateCaseDocumentFlags } from './case.service';

export interface UploadDocumentInput {
  caseId: string;
  title: string;
  description?: string;
  type: 'SOPORTE_PAGO' | 'PODER_LEGAL' | 'DEMANDA' | 'CONTRATO' | 'EMAIL' | 'INFORME' | 'OTRO';
  section: 'ACTUALIZACION_CASO' | 'GESTION_ABOGADO' | 'DOCUMENTOS_LEGALES' | 'COMUNICACION';
  filePath?: string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedByUserId: string;
}

/**
 * Sube un documento y actualiza automáticamente los flags del caso
 */
export async function uploadDocument(input: UploadDocumentInput) {
  // 1. Crear el documento
  const newDocument = await db
    .insert(documents)
    .values({
      caseId: input.caseId as any,
      title: input.title,
      description: input.description,
      type: input.type,
      section: input.section,
      filePath: input.filePath,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      uploadedByUserId: input.uploadedByUserId,
    })
    .returning();

  // 2. ✅ Actualizar automáticamente los flags del caso
  await updateCaseDocumentFlags(input.caseId, input.type);

  return newDocument[0];
}

/**
 * Obtiene todos los documentos de un caso, opcionalmente filtrados por sección
 */
export async function getCaseDocuments(
  caseId: string,
  section?: string
) {
  const query = db
    .select()
    .from(documents)
    .where(
      section
        ? eq(documents.caseId, caseId as any) && eq(documents.section, section as any)
        : eq(documents.caseId, caseId as any)
    );

  return query;
}

/**
 * Obtiene documentos por sección (para las 4 vistas)
 */
export async function getDocumentsBySection(
  caseId: string,
  section: 'ACTUALIZACION_CASO' | 'GESTION_ABOGADO' | 'DOCUMENTOS_LEGALES' | 'COMUNICACION'
) {
  return db
    .select()
    .from(documents)
    .where(
      eq(documents.caseId, caseId as any) &&
      eq(documents.section, section)
    );
}

/**
 * Obtiene un documento específico
 */
export async function getDocument(documentId: string) {
  return db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId as any))
    .limit(1);
}

/**
 * Valida si existen los documentos requeridos para transición a CASO_ACTIVO
 */
export async function checkRequiredDocuments(caseId: string) {
  const requiredDocs = await db
    .select({
      type: documents.type,
    })
    .from(documents)
    .where(eq(documents.caseId, caseId as any));

  const hasSoportoPago = requiredDocs.some(d => d.type === 'SOPORTE_PAGO');
  const hasPoderLegal = requiredDocs.some(d => d.type === 'PODER_LEGAL');

  return {
    hasSoportoPago,
    hasPoderLegal,
    canTransition: hasSoportoPago && hasPoderLegal,
  };
}
