# 🏛️ Juridico Pro - Sistema de Gestión Jurídica

## 📋 Descripción

Plataforma web moderna para gestión de casos jurídicos en oficinas de 4 abogados. Implementa un flujo estricto Colombia-compliant con categorización dinámica por colores.

### Stack Tecnológico
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **DB**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage

---

## 🚀 Instalación Rápida

### 1️⃣ Configurar Supabase

**Tu lado:**
1. Ve a [Supabase](https://supabase.com)
2. Usa el proyecto vacío que ya tienes
3. Obtén las credenciales:
   - URL de la base de datos (Settings → Database → Connection String → URI)
   - Keys: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - SERVICE_ROLE_KEY para servidor

### 2️⃣ Configurar Variables de Entorno

Edita `.env.local` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?schema=public"
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3️⃣ Crear Tablas en Supabase

**Desde tu terminal:**

```bash
cd juridico-pro

# Generar migrations
npx prisma migrate dev --name init

# Esto te pedirá confirmación y creará las tablas
```

### 4️⃣ Aplicar Políticas RLS (Seguridad)

1. Abre [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Crea una Nueva Query
4. Copia todo el contenido de `SUPABASE_RLS_POLICIES.sql`
5. Ejecuta (Cmd+Enter)

### 5️⃣ Instalar Dependencias Faltantes

```bash
npm install
```

### 6️⃣ Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) ✅

---

## 📁 Estructura de Carpetas

```
juridico-pro/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # Server Actions & Routes
│   │   └── (auth)/         # Grupo de rutas de autenticación
│   ├── components/         # Componentes React reutilizables
│   ├── lib/
│   │   ├── db/            # Prisma & Supabase clients
│   │   ├── services/      # Lógica de negocio (cases, documents)
│   │   └── utils/         # State machine, helpers
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript interfaces
├── prisma/
│   └── schema.prisma      # Schema de BD
├── SUPABASE_RLS_POLICIES.sql  # Políticas de seguridad
└── .env.local             # Variables de entorno
```

---

## 🔄 Flujo de Casos (State Machine)

```
BITACORA (Entrada)
    ↓ [requiere: Soporte de Pago + Poder Legal]
CASO_ACTIVO
    ↓
    ├─→ CERRADO → ARCHIVADO
    └─→ ARCHIVADO directamente
```

**Validación:**
- Solo el propietario del caso puede gestionar
- Lectura global para todos los abogados
- Soft delete implementado

---

## 🎨 Sistema de Tipos de Caso (Configurable)

Cada tipo de caso tiene:
- **Nombre**: Civil, Penal, Familia, Laboral, etc.
- **Color**: Código Hex (#FF5733)
- **Icono**: Opcional (emoji o ícono)
- **Orden**: Para sorting en UI

---

## 📄 4 Secciones Virtuales

Los documentos se organizan en 4 categorías por metadatos (no carpetas físicas):

1. **ACTUALIZACION_CASO** - Cambios en el estado del caso
2. **GESTION_ABOGADO** - Notas y acciones del abogado
3. **DOCUMENTOS_LEGALES** - Demandas, contratos, poderes
4. **COMUNICACION** - Emails y correspondencia

---

## 🤖 Módulo de IA (Email)

Estructura lista para agente que:
- Envía emails con templates dinámicos
- Procesa respuestas con LLM
- Extrae adjuntos automáticamente
- Presenta para validación manual

---

## 🔐 Seguridad

### Implementado:
- ✅ Soft Delete (`deleted_at`)
- ✅ Row Level Security (RLS) en Supabase
- ✅ Permisos por rol (ADMIN, LAWYER, STAFF)
- ✅ Auditoría de cambios

+++

## ✍️ Próximos Pasos

1. Configurar el `.env.local` con credenciales de Supabase
2. Ejecutar `npx prisma migrate dev --name init`
3. Aplicar políticas RLS desde SQL Editor
4. Comenzar con autenticación y UI

---

**App Name**: Juridico Pro  
**Version**: 0.1.0  
**Last Updated**: April 16, 2026
