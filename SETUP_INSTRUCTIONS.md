# 🚀 SETUP INSTRUCTIONS - Juridico Pro

## ✅ Estado Actual

Tu proyecto está **100% listo localmente**. Ahora debes conectarlo a Supabase.

---

## ⚡ PASO 1: Obtener Credenciales de Supabase (5 min)

1. **Abre**: [Supabase Dashboard](https://supabase.com/dashboard)
2. **Selecciona** tu proyecto vacío "juridico-pro" o similar
3. **Ve a**: Settings → Database (en la izquierda, abajo)
4. **Busca**: "Connection String" → Selecciona "URI" (no "PSQL" ni "JDBC")
5. **Copia** el string completo que parece:
   ```
   postgresql://postgres:[PASSWORD]@[PROJECT_ID].supabase.co:5432/postgres?schema=public
   ```

---

## ⚡ PASO 2: Obtener Keys de Supabase (2 min)

1. **Ve a**: Settings → API (en la izquierda)
2. **Copia estas dos:**
   - `Project URL` → Pega como `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → Pega como `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Copia también:**
   - `service_role secret` → Pega como `SUPABASE_SERVICE_ROLE_KEY`

---

## ⚡ PASO 3: Configurar `.env.local` (2 min)

Abre el archivo `c:\Users\arman\proyectos\abogados\juridico-pro\.env.local` y reemplaza:

```env
# Solo reemplaza lo que está entre comillas
DATABASE_URL="postgresql://postgres:TUCONTRASENA@TU_PROJECT_ID.supabase.co:5432/postgres?schema=public"
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (tu anon key completa)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (tu service role key completa)
```

**Válida tu `.env.local`:** Las variables no deben tener espacios alrededor del `=`

---

## ⚡ PASO 4: Crear Tablas en Supabase (3 min)

Abre terminal en `c:\Users\arman\proyectos\abogados\juridico-pro`:

```bash
npx prisma migrate dev --name init
```

**Qué pasará:**
1. Te pedirá confirmar la migración (escribe `y` + Enter)
2. Creará todas las tablas en Supabase automáticamente
3. Generará el cliente Prisma

Si todo funciona, verás: ✓ Success! Database migrations applied.

---

## ⚡ PASO 5: Aplicar Políticas RLS de Seguridad (3 min)

1. **Abre**: [Supabase Dashboard](https://supabase.com/dashboard)
2. **Ve a**: SQL Editor (en la izquierda, arriba)
3. **Crea Nueva Query** (botón "New Query")
4. **Abre el archivo**: `c:\Users\arman\proyectos\abogados\juridico-pro\SUPABASE_RLS_POLICIES.sql`
5. **Copia TODO el contenido** (Ctrl+A, Ctrl+C)
6. **Pega** en el SQL Editor de Supabase
7. **Ejecuta** (Cmd+Enter o botón "Run")

**Qué validar:**
- No debe haber errores en rojo
- Las políticas aparecerán en la tabla correspondiente

---

## ⚡ PASO 6: Prueba Local (1 min)

Desde terminal en `c:\Users\arman\proyectos\abogados\juridico-pro`:

```bash
npm run dev
```

Abre: http://localhost:3000

**Deberías ver**: Una página con Next.js (sin errores en consola)

---

## ✅ Validación Final

**Checklist de setup:**

- [ ] `.env.local` tiene las 4 variables con valores reales
- [ ] `npx prisma migrate dev` ejecutó sin errores
- [ ] Las políticas RLS se aplicaron en Supabase
- [ ] `npm run dev` corre en puerto 3000 sin errores
- [ ] Puedes abrir Prisma Studio: `npx prisma studio` (ve a http://localhost:5555 para explorar las tablas)

---

## 🎯 ¿Qué sigue?

Una vez completados estos 6 pasos, procederemos con:

1. **Autenticación** - Sistema de login con Supabase
2. **Dashboard** - Página principal de casos
3. **UI de Casos** - Crear, listar, actualizar casos
4. **Upload de Documentos** - Sistema de subida a Storage
5. **Módulo de IA** - Agente de emails

---

## ⚠️ Errores Comunes

### "DATABASE_URL is not set"
→ Verifica que `.env.local` existe en la raíz del proyecto y tiene el valor

### "Error: FATAL: all configured authentication methods failed"
→ La contraseña o host en DATABASE_URL es incorrecta. Cópia de nuevo desde Supabase Settings

### "P1002: Could not connect to the database server"
→ Supabase está caído o no esta accesible. Espera 1-2 minutos e intenta de nuevo

### "Column does not exist"
→ La migración no se ejecutó. Intenta: `npx prisma db push`

---

## 📞 Cuando Termines, Avísame

Una vez hayas completado estos 6 pasos, di:

> "Setup completado, listo para autenticación y UI"

Y continuaremos con la siguiente fase 🚀

---

**Tiempo Total Estimado**: 20-30 minutos
