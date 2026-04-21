/**
 * State Machine para transiciones de casos en Juridico Pro
 * 
 * Flujo permitido:
 * BITACORA → CASO_ACTIVO (requiere Soporte de Pago + Poder Legal)
 * CASO_ACTIVO → CERRADO
 * CASO_ACTIVO → ARCHIVADO
 * CERRADO → ARCHIVADO
 */

type CaseStatusType = 'BITACORA' | 'CASO_ACTIVO' | 'CERRADO' | 'ARCHIVADO';

interface TransitionValidationResult {
  isValid: boolean;
  reason?: string;
  requiredConditions?: string[];
}

interface CaseState {
  currentStatus: CaseStatusType;
  hasSoportoPago: boolean;
  hasPoderLegal: boolean;
}

/**
 * Define las transiciones permitidas
 */
const ALLOWED_TRANSITIONS: Record<CaseStatusType, CaseStatusType[]> = {
  BITACORA: ['CASO_ACTIVO'],
  CASO_ACTIVO: ['CERRADO', 'ARCHIVADO'],
  CERRADO: ['ARCHIVADO'],
  ARCHIVADO: [],
};

/**
 * Define requisitos para cada transición
 */
interface TransitionRequirements {
  [key: string]: {
    documentTypes: string[];
    conditions: (state: CaseState) => boolean;
  };
}

const TRANSITION_REQUIREMENTS: TransitionRequirements = {
  'BITACORA->CASO_ACTIVO': {
    documentTypes: ['SOPORTE_PAGO', 'PODER_LEGAL'],
    conditions: (state: CaseState) => state.hasSoportoPago && state.hasPoderLegal,
  },
};

/**
 * Valida si una transición es permitida
 */
export function validateTransition(
  fromStatus: CaseStatusType,
  toStatus: CaseStatusType,
  caseState: CaseState
): TransitionValidationResult {
  const allowedTransitions = ALLOWED_TRANSITIONS[fromStatus];

  if (!allowedTransitions || !allowedTransitions.includes(toStatus)) {
    return {
      isValid: false,
      reason: `No se puede pasar de ${fromStatus} a ${toStatus}`,
    };
  }

  const key = `${fromStatus}->${toStatus}`;
  const requirements = TRANSITION_REQUIREMENTS[key];

  if (requirements) {
    if (!requirements.conditions(caseState)) {
      return {
        isValid: false,
        reason: `No se cumplen los requisitos para cambiar de ${fromStatus} a ${toStatus}`,
        requiredConditions: requirements.documentTypes,
      };
    }
  }

  return { isValid: true };
}

/**
 * Obtiene las transiciones posibles desde un estado
 */
export function getPossibleTransitions(
  currentStatus: CaseStatusType
): CaseStatusType[] {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
}

/**
 * Obtiene los requisitos para una transición específica
 */
export function getTransitionRequirements(
  fromStatus: CaseStatusType,
  toStatus: CaseStatusType
): string[] {
  const key = `${fromStatus}->${toStatus}`;
  return TRANSITION_REQUIREMENTS[key]?.documentTypes || [];
}
