/**
 * Juridico Pro Database Schema - Drizzle ORM
 * 
 * Schema en TypeScript para mejor integración con Next.js y Zod
 */

import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  index,
  primaryKey,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ===================== ENUMS =====================
export const roleEnum = pgEnum('role', ['ADMIN', 'LAWYER', 'STAFF']);

export const caseStatusEnum = pgEnum('case_status', [
  'BITACORA',
  'CASO_ACTIVO',
  'CERRADO',
  'ARCHIVADO',
]);

export const documentSectionEnum = pgEnum('document_section', [
  'ACTUALIZACION_CASO',
  'GESTION_ABOGADO',
  'DOCUMENTOS_LEGALES',
  'COMUNICACION',
]);

export const documentTypeEnum = pgEnum('document_type', [
  'SOPORTE_PAGO',
  'PODER_LEGAL',
  'DEMANDA',
  'CONTRATO',
  'EMAIL',
  'INFORME',
  'OTRO',
]);

export const emailStatusEnum = pgEnum('email_status', [
  'DRAFT',
  'SENT',
  'RECEIVED_RESPONSE',
  'PARSED',
  'VALIDATION_PENDING',
  'VALIDATED',
  'ERROR',
]);

export const auditActionEnum = pgEnum('audit_action', [
  'CASE_CREATED',
  'CASE_UPDATED',
  'CASE_STATUS_CHANGED',
  'DOCUMENT_UPLOADED',
  'DOCUMENT_DELETED',
  'EMAIL_SENT',
  'EMAIL_RESPONSE_RECEIVED',
  'PERMISSION_CHANGED',
]);

// ===================== USUARIOS =====================
export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    role: roleEnum('role').notNull().default('LAWYER'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  })
);

// ===================== TIPOS DE CASO (CONFIGURABLE) =====================
export const caseTypes = pgTable(
  'case_types',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    color: text('color').notNull(), // Hex: #FF5733
    icon: text('icon'), // Opcional
    order: integer('order').default(0).notNull(),

    createdByUserId: text('created_by_user_id').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index('case_types_created_by_user_id_idx').on(table.createdByUserId),
    nameUserIdx: uniqueIndex('case_types_name_user_id_idx').on(
      table.name,
      table.createdByUserId
    ),
  })
);

// ===================== CASOS =====================
export const cases = pgTable(
  'cases',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Cliente info
    clientName: text('client_name').notNull(),
    clientEmail: text('client_email'),
    clientPhone: text('client_phone'),

    // Label único (NombreAbogado-NombreCliente)
    displayLabel: text('display_label').notNull().unique(),

    // Owner y tipo
    ownerId: text('owner_id').notNull(),
    caseTypeId: uuid('case_type_id').notNull(),

    // Estado
    status: caseStatusEnum('status').default('BITACORA').notNull(),

    /**
     * ✅ AUTOMATICOS: Se actualizan cuando se suben documentos
     * ReadOnly en la interfaz - NO son checkboxes manuales
     */
    hasSoportoPago: boolean('has_soporte_pago').default(false).notNull(),
    hasPoderLegal: boolean('has_poder_legal').default(false).notNull(),

    // Metadata
    description: text('description'),
    notes: text('notes'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    ownerIdIdx: index('cases_owner_id_idx').on(table.ownerId),
    caseTypeIdIdx: index('cases_case_type_id_idx').on(table.caseTypeId),
    statusIdx: index('cases_status_idx').on(table.status),
    displayLabelIdx: uniqueIndex('cases_display_label_idx').on(table.displayLabel),
  })
);

// ===================== DOCUMENTOS (4 SECCIONES) =====================
export const documents = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Referencia
    caseId: uuid('case_id').notNull(),

    // Propiedades
    title: text('title').notNull(),
    description: text('description'),
    type: documentTypeEnum('type').default('OTRO').notNull(),
    section: documentSectionEnum('section').notNull(),

    // Almacenamiento en Supabase Storage
    filePath: text('file_path'), // ruta en storage
    fileUrl: text('file_url'),
    fileName: text('file_name'),
    mimeType: text('mime_type'),
    fileSize: integer('file_size'),

    // Metadata
    uploadedByUserId: text('uploaded_by_user_id').notNull(),

    // IA
    isValidated: boolean('is_validated').default(false).notNull(),
    extractedContent: text('extracted_content'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    caseIdIdx: index('documents_case_id_idx').on(table.caseId),
    sectionIdx: index('documents_section_idx').on(table.section),
    typeIdx: index('documents_type_idx').on(table.type),
    uploadedByIdx: index('documents_uploaded_by_user_id_idx').on(table.uploadedByUserId),
  })
);

// ===================== MÓDULO DE IA (EMAIL) =====================
export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: text('name').notNull(),
  subject: text('subject').notNull(),
  bodyTemplate: text('body_template').notNull(),

  createdByUserId: text('created_by_user_id').notNull(),

  isActive: boolean('is_active').default(true).notNull(),
  useAIParser: boolean('use_ai_parser').default(true).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const caseEmails = pgTable(
  'case_emails',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    caseId: uuid('case_id').notNull(),
    templateId: uuid('template_id').notNull(),

    recipient: text('recipient').notNull(),
    subject: text('subject').notNull(),
    body: text('body').notNull(),

    status: emailStatusEnum('status').default('DRAFT').notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }),

    responseBody: text('response_body'),
    responseReceivedAt: timestamp('response_received_at', { withTimezone: true }),

    aiParsedData: text('ai_parsed_data'),
    attachmentPaths: text('attachment_paths').array().default([]),

    validatedByUserId: text('validated_by_user_id'),
    validatedAt: timestamp('validated_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    caseIdIdx: index('case_emails_case_id_idx').on(table.caseId),
    statusIdx: index('case_emails_status_idx').on(table.status),
  })
);

// ===================== AUDITORÍA =====================
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    action: auditActionEnum('action').notNull(),
    performedByUserId: text('performed_by_user_id').notNull(),

    caseId: uuid('case_id'),

    details: text('details'), // JSON

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    performedByIdx: index('audit_logs_performed_by_user_id_idx').on(table.performedByUserId),
    caseIdIdx: index('audit_logs_case_id_idx').on(table.caseId),
    actionIdx: index('audit_logs_action_idx').on(table.action),
  })
);

// ===================== RELACIONES =====================
export const usersRelations = relations(users, ({ many }) => ({
  cases: many(cases),
  documents: many(documents),
  emailTemplates: many(emailTemplates),
  caseTypes: many(caseTypes),
  auditLogs: many(auditLogs),
}));

export const caseTypesRelations = relations(caseTypes, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [caseTypes.createdByUserId],
    references: [users.id],
  }),
  cases: many(cases),
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
  owner: one(users, {
    fields: [cases.ownerId],
    references: [users.id],
  }),
  caseType: one(caseTypes, {
    fields: [cases.caseTypeId],
    references: [caseTypes.id],
  }),
  documents: many(documents),
  emails: many(caseEmails),
  auditLogs: many(auditLogs),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  case: one(cases, {
    fields: [documents.caseId],
    references: [cases.id],
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedByUserId],
    references: [users.id],
  }),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [emailTemplates.createdByUserId],
    references: [users.id],
  }),
  emails: many(caseEmails),
}));

export const caseEmailsRelations = relations(caseEmails, ({ one }) => ({
  case: one(cases, {
    fields: [caseEmails.caseId],
    references: [cases.id],
  }),
  template: one(emailTemplates, {
    fields: [caseEmails.templateId],
    references: [emailTemplates.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  performedBy: one(users, {
    fields: [auditLogs.performedByUserId],
    references: [users.id],
  }),
  case: one(cases, {
    fields: [auditLogs.caseId],
    references: [cases.id],
  }),
}));
