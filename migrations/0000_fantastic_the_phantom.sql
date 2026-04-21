CREATE TYPE "public"."audit_action" AS ENUM('CASE_CREATED', 'CASE_UPDATED', 'CASE_STATUS_CHANGED', 'DOCUMENT_UPLOADED', 'DOCUMENT_DELETED', 'EMAIL_SENT', 'EMAIL_RESPONSE_RECEIVED', 'PERMISSION_CHANGED');--> statement-breakpoint
CREATE TYPE "public"."case_status" AS ENUM('BITACORA', 'CASO_ACTIVO', 'CERRADO', 'ARCHIVADO');--> statement-breakpoint
CREATE TYPE "public"."document_section" AS ENUM('ACTUALIZACION_CASO', 'GESTION_ABOGADO', 'DOCUMENTOS_LEGALES', 'COMUNICACION');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('SOPORTE_PAGO', 'PODER_LEGAL', 'DEMANDA', 'CONTRATO', 'EMAIL', 'INFORME', 'OTRO');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('DRAFT', 'SENT', 'RECEIVED_RESPONSE', 'PARSED', 'VALIDATION_PENDING', 'VALIDATED', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'LAWYER', 'STAFF');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" "audit_action" NOT NULL,
	"performed_by_user_id" text NOT NULL,
	"case_id" uuid,
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"recipient" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" "email_status" DEFAULT 'DRAFT' NOT NULL,
	"sent_at" timestamp with time zone,
	"response_body" text,
	"response_received_at" timestamp with time zone,
	"ai_parsed_data" text,
	"attachment_paths" text[] DEFAULT '{}',
	"validated_by_user_id" text,
	"validated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "case_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"icon" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_name" text NOT NULL,
	"client_email" text,
	"client_phone" text,
	"display_label" text NOT NULL,
	"owner_id" text NOT NULL,
	"case_type_id" uuid NOT NULL,
	"status" "case_status" DEFAULT 'BITACORA' NOT NULL,
	"has_soporte_pago" boolean DEFAULT false NOT NULL,
	"has_poder_legal" boolean DEFAULT false NOT NULL,
	"description" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "cases_display_label_unique" UNIQUE("display_label")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" "document_type" DEFAULT 'OTRO' NOT NULL,
	"section" "document_section" NOT NULL,
	"file_path" text,
	"file_url" text,
	"file_name" text,
	"mime_type" text,
	"file_size" integer,
	"uploaded_by_user_id" text NOT NULL,
	"is_validated" boolean DEFAULT false NOT NULL,
	"extracted_content" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"body_template" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"use_ai_parser" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "role" DEFAULT 'LAWYER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "audit_logs_performed_by_user_id_idx" ON "audit_logs" USING btree ("performed_by_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_case_id_idx" ON "audit_logs" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "case_emails_case_id_idx" ON "case_emails" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "case_emails_status_idx" ON "case_emails" USING btree ("status");--> statement-breakpoint
CREATE INDEX "case_types_created_by_user_id_idx" ON "case_types" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "case_types_name_user_id_idx" ON "case_types" USING btree ("name","created_by_user_id");--> statement-breakpoint
CREATE INDEX "cases_owner_id_idx" ON "cases" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "cases_case_type_id_idx" ON "cases" USING btree ("case_type_id");--> statement-breakpoint
CREATE INDEX "cases_status_idx" ON "cases" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "cases_display_label_idx" ON "cases" USING btree ("display_label");--> statement-breakpoint
CREATE INDEX "documents_case_id_idx" ON "documents" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "documents_section_idx" ON "documents" USING btree ("section");--> statement-breakpoint
CREATE INDEX "documents_type_idx" ON "documents" USING btree ("type");--> statement-breakpoint
CREATE INDEX "documents_uploaded_by_user_id_idx" ON "documents" USING btree ("uploaded_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");