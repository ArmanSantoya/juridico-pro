# 🎯 SETUP FINAL - Drizzle + Supabase

## ✅ Lo Que Ya Hizo el Sistema

1. ✅ Instaló Drizzle ORM y herramientas
2. ✅ Creó schema TypeScript (`src/db/schema.ts`)
3. ✅ Generó migración SQL (`migrations/0000_fantastic_the_phantom.sql`)
4. ✅ Actualizó servicios (case.service.ts + document.service.ts)
5. ✅ Tu `.env.local` ya tiene credenciales de Supabase

---

## 📋 PASO A PASO: Lo Que Debes Hacer

### **PASO 1: Abrir el archivo de migración**

En tu VS Code, abre:
```
migrations/0000_fantastic_the_phantom.sql
```

**Deberías ver:** ~100 líneas de SQL con CREATE TABLE, CREATE TYPE, etc.

---

### **PASO 2: Copiar el contenido**

Selecciona TODO (Ctrl+A) y copia (Ctrl+C)

---

### **PASO 3: Ir a Supabase Dashboard**

1. Abre [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. En la izquierda, busca: **SQL Editor** (está en el menú, arriba)
4. Click en **"New query"** o **"New SQL file"**

---

### **PASO 4: Pegar y Ejecutar**

En el editor SQL que se abrió:
1. Pega el contenido (Ctrl+V)
2. Presiona **Cmd+Enter** (Mac) o **Ctrl+Enter** (Windows)
3. Espera a que aparezca ✅ **Success**

**Qué esperar:**
- Sin errores en rojo
- Mensaje de éxito

---

### **PASO 5: Aplicar Políticas RLS (Seguridad)**

Repite el mismo proceso con:
```
SUPABASE_RLS_POLICIES.sql
```

1. Abre el archivo
2. Selecciona TODO
3. Nueva Query en Supabase SQL Editor
4. Pega y ejecuta

⚠️ **Nota:** Ambos archivos SQL tienen muchas líneas. Si te sale un error, revisa que TODA la migración se haya copiado (a veces el último comando falta).

---

### **PASO 6: Validar Tablas Creadas**

En Supabase:
1. Ve a **Table Editor** (en el menú izquierdo, abajo)
2. Deberías ver estas tablas:
   - ✅ users
   - ✅ case_types  
   - ✅ cases
   - ✅ documents
   - ✅ email_templates
   - ✅ case_emails
   - ✅ audit_logs

---

### **PASO 7: Prueba Local**

En terminal (en la carpeta del proyecto):

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

**Deberías ver:** Página de Next.js sin errores en consola

---

## 🎯 Cuando Termines

Di en el chat:

> "Tablas creadas en Supabase, RLS aplicado, npm run dev funciona ✅"

Y continuaremos con:
- Autenticación (Supabase Auth)
- Dashboard de casos
- Upload de documentos

---

## ⚠️ Errores Comunes

### "Syntax error near ..."
→ El SQL no se copió completo. Verifica que termina con `statement-breakpoint` y ejecuta de nuevo

### "Role does not exist"
→ Normal en Supabase. Ignora ese warning si ve ✅ Success

### "Jest is not installed"
→ Seguro. No se usa en este proyecto ahora

---

## 📞 Ayuda

Si algo no funciona, avísame con una captura del error!

Tiempo estimado: **10-15 minutos**

🚀 ¡Adelante!
