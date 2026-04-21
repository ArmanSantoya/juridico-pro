/**
 * POLÍTICAS RLS PARA SUPABASE
 * 
 * Copiar estas políticas en SQL Editor de Supabase:
 * Supabase Dashboard → SQL Editor → Crear Nueva Query
 */

-- ===================== RLS ENABLE =====================
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "case_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "case_emails" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "email_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- ===================== USERS =====================
-- Cada usuario solo ve su propio perfil, pero los abogados se ven entre sí
CREATE POLICY "Users can view their own profile" ON "users"
  FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Lawyers can view other lawyers" ON "users"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'LAWYER'
    )
    AND role = 'LAWYER'
  );

-- ===================== CASE_TYPES =====================
-- Cada usuario ve solo sus tipos de caso
CREATE POLICY "Case types visible to owner" ON "case_types"
  FOR SELECT
  USING (created_by_user_id = auth.uid()::text);

CREATE POLICY "Case types can be created" ON "case_types"
  FOR INSERT
  WITH CHECK (created_by_user_id = auth.uid()::text);

CREATE POLICY "Case types can be updated by owner" ON "case_types"
  FOR UPDATE
  USING (created_by_user_id = auth.uid()::text);

-- ===================== CASES =====================
-- Lectura: Owner del caso y otros abogados
CREATE POLICY "Cases visible to owner and other lawyers" ON "cases"
  FOR SELECT
  USING (
    owner_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'LAWYER'
    )
  );

-- Inserción: Solo el abogado propietario puede crear
CREATE POLICY "Cases can be created by lawyers" ON "cases"
  FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::text AND role IN ('LAWYER', 'ADMIN')
    )
  );

-- Actualización: Solo el owner puede actualizar
CREATE POLICY "Cases can be updated by owner" ON "cases"
  FOR UPDATE
  USING (owner_id = auth.uid()::text);

-- ===================== DOCUMENTS =====================
-- Lectura: Ver documentos del caso si tienes acceso al caso
CREATE POLICY "Documents visible if case is accessible" ON "documents"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = documents.case_id
      AND (
        cases.owner_id = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'LAWYER'
        )
      )
    )
  );

-- Inserción: Solo el owner del caso puede subir documentos
CREATE POLICY "Documents can be uploaded by case owner" ON "documents"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = documents.case_id
      AND cases.owner_id = auth.uid()::text
    )
  );

-- Actualización: Solo el uploader o el owner del caso
CREATE POLICY "Documents can be updated by uploader or case owner" ON "documents"
  FOR UPDATE
  USING (
    uploaded_by_user_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = documents.case_id
      AND cases.owner_id = auth.uid()::text
    )
  );

-- Eliminación: Soft delete solo por owner del caso
CREATE POLICY "Documents can be deleted by case owner" ON "documents"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = documents.case_id
      AND cases.owner_id = auth.uid()::text
    )
  );

-- ===================== CASE_EMAILS =====================
-- Similar a documentos
CREATE POLICY "Emails visible if case is accessible" ON "case_emails"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_emails.case_id
      AND (
        cases.owner_id = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'LAWYER'
        )
      )
    )
  );

-- ===================== EMAIL_TEMPLATES =====================
-- Cada usuario ve solo sus templates
CREATE POLICY "Email templates visible to creator" ON "email_templates"
  FOR SELECT
  USING (created_by_user_id = auth.uid()::text);

-- ===================== AUDIT_LOGS =====================
-- Lectura: Acceso a logs de casos que puedas ver
CREATE POLICY "Audit logs visible if case is accessible" ON "audit_logs"
  FOR SELECT
  USING (
    case_id IS NULL
    OR EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = audit_logs.case_id
      AND (
        cases.owner_id = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'LAWYER'
        )
      )
    )
  );

-- ===================== STORAGE =====================
-- Crear bucket para documentos
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
ON CONFLICT DO NOTHING;

-- Policy: Solo el owner del caso puede subir a su carpeta
CREATE POLICY "Document uploads restricted to case owner" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
  );

-- Policy: Ver documentos si tienes acceso al caso
CREATE POLICY "Document access based on case ownership" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
  );
