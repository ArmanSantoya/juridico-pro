// Tipos principales para Juridico Pro

export type CaseWithRelations = {
  id: string;
  clientName: string;
  displayLabel: string;
  status: 'BITACORA' | 'CASO_ACTIVO' | 'CERRADO' | 'ARCHIVADO';
  hasSoportoPago: boolean;
  hasPoderLegal: boolean;
  caseType: {
    name: string;
    color: string;
    icon?: string | null;
  };
  documents?: Document[];
};

export interface CaseTransitionResult {
  success: boolean;
  message: string;
  requiredDocuments?: string[];
  missingDocuments?: string[];
}

export interface CaseTypeConfig {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  order: number;
}
