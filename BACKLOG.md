# IngeNet — Backlog de Desarrollo

> Estado al 24/06/2026. Todos los endpoints de la API devuelven datos mock
> (`src/data/mock.ts`) o responden `501 Not Implemented`. El frontend está funcional
> como prototipo. Los tres bloques siguientes son los prerequisitos para pasar a producción.

---

## 1. Base de datos

**Situación actual:** Todos los routes bajo `src/app/api/` usan `INGENIERIAS_MOCK`.
Los `TODO` en el código ya anticipan Prisma como ORM.

### 1.1 Decisiones pendientes del cliente

- [ ] **Motor de BD:** PostgreSQL 16+ (recomendado) o SQL Server según infraestructura de Totalplay.
  Impacta en una sola línea del `schema.prisma` pero hay que decidirlo antes de empezar.
- [ ] **¿BD nueva o adaptación?** Si existe una BD productiva del aplicativo anterior,
  definir si se reutiliza el esquema o se crea uno nuevo y se migran los datos.
- [ ] **Servidor de BD en producción:** instancia dedicada, RDS/cloud, o servidor existente de Totalplay.
- [ ] **Acceso del equipo de desarrollo** a la BD (o a un ambiente de QA que la replique).

### 1.2 Setup de Prisma

- [ ] Instalar `prisma` y `@prisma/client`
- [ ] Crear `prisma/schema.prisma` con los modelos:
  - `Ingenieria` — id, nombre, cliente, cuenta, estado, creadaPor, creadaEn, modificadaEn, activa
  - `Topologia` — id, ingenieriaId, nodes: JSON, edges: JSON (separado para no cargar el grafo en el listado)
  - `Usuario` — id, nombre, email, perfil
  - `AuditLog` — id, ingenieriaId, accion, detalle, realizadoPor, fecha
- [ ] Agregar `DATABASE_URL` a `.env` y `.env.example`
- [ ] Crear `src/lib/prisma.ts` con el singleton del cliente
- [ ] Correr primera migración (`prisma migrate dev`)

### 1.3 Reemplazar mocks en los routes

Cada archivo ya tiene el código Prisma comentado listo para descomentar:

- [ ] `src/app/api/ingenierias/route.ts` — `GET` (lista) y `POST` (crear)
- [ ] `src/app/api/ingenierias/[id]/route.ts` — `GET`, `PATCH` (guardar canvas), `DELETE` (baja lógica)
- [ ] `src/app/api/ingenierias/[id]/estado/route.ts` — `PATCH` con escritura a `AuditLog`
  y disparo al Conector CMDB cuando el estado pasa a `Aprovisionada`
- [ ] `src/app/api/auth/me/route.ts` — reemplazar usuario hardcodeado por lectura desde sesión SSO

### 1.4 Migración de datos (si aplica)

- [ ] Relevar el esquema de la BD existente (tablas, relaciones, stored procedures)
- [ ] Mapear las tablas actuales a los nuevos modelos Prisma
- [ ] Script de importación de datos históricos
- [ ] Seed inicial de usuarios con sus perfiles (Operativo / Supervisor / Consulta)

**Variable de entorno a completar:**
```
DATABASE_URL=postgresql://usuario:pass@host:5432/ingenierias
```

---

## 2. Servicio de Discovery

**Situación actual:** `POST /api/ingenierias/[id]/discovery` existe pero devuelve `501`.
El route tiene el esqueleto comentado con las variables necesarias.
Lo mismo para `GET /api/cmdb/verificar` y la actualización CMDB al aprovisionar.

### 2.1 Información a obtener del cliente (bloqueante)

- [ ] URL base del servicio de Discovery (`DISCOVERY_BASE_URL`)
- [ ] Mecanismo de autenticación (Bearer token, API key, certificado mutuo)
- [ ] Formato de la respuesta del Discovery: qué campos devuelve para dispositivos y enlaces
- [ ] Protocolo de descubrimiento que usa internamente (SNMP, CDP, LLDP, combinación)
- [ ] ¿Existe un ambiente de QA/sandbox del Discovery para no impactar producción durante el desarrollo?
- [ ] Política de conflictos: si el Discovery encuentra un dispositivo ya cargado en el canvas,
  ¿sobreescribe, sugiere, o ignora?

### 2.2 Implementación del conector Discovery

- [ ] Crear `src/lib/connectors/discovery.ts` con la llamada HTTP al servicio real
- [ ] Implementar `mapDiscoveryToCanvas(data)` — convierte la respuesta al formato
  `{ nodes: DispositivoNode[], edges: EnlaceEdge[] }` de React Flow:
  - Mapeo de tipos de dispositivo del Discovery → `TipoDispositivo` (`src/types/index.ts`)
  - Mapeo de tipos de enlace → `TipoEnlace`
  - Asignar `origen: 'Discovery'` y `registradoCMDB: false` por defecto
- [ ] Completar `src/app/api/ingenierias/[id]/discovery/route.ts`:
  1. Llamar al conector
  2. Ejecutar el mapeo
  3. Guardar en BD (requiere ítem 1.2)
  4. Devolver la ingeniería actualizada
- [ ] Agregar `DISCOVERY_BASE_URL` y `DISCOVERY_API_KEY` a `.env` y `.env.example`

### 2.3 Integración CMDB (relacionada, mismo bloque)

El campo `registradoCMDB` existe en todos los nodos y edges del canvas.
El ícono de verificación verde en el panel de propiedades ya lo consume.

- [ ] Información a obtener del cliente: URL, credenciales y documentación del Conector CMDB
  (ServiceNow, iTop, desarrollo propio — confirmar cuál)
- [ ] Definir si la CMDB tiene API de escritura disponible
- [ ] Definir en qué momento se consulta: ¿al agregar un dispositivo, en batch al cargar el canvas?
- [ ] Crear `src/lib/connectors/cmdb.ts` con los métodos `verificar(hostname)` y `actualizar(ingenieria)`
- [ ] Completar `src/app/api/cmdb/verificar/route.ts`
- [ ] Completar el disparo a CMDB en `[id]/estado/route.ts` cuando el estado pasa a `Aprovisionada`

### 2.4 Autenticación SSO/LDAP (relacionada)

El route `auth/me` devuelve un usuario hardcodeado. Todas las acciones en BD
deben llevar el ID del usuario real.

- [ ] Obtener del cliente: documentación del sistema de autenticación corporativo (SSO, SAML, LDAP/AD)
- [ ] Confirmar si hay otras apps ya integradas al SSO de Totalplay para tomar como referencia
- [ ] Definir librería (NextAuth.js con provider LDAP/SAML es el camino natural para Next.js)
- [ ] Mapeo de grupos/roles del directorio corporativo → perfiles de la app (Operativo / Supervisor / Consulta)
- [ ] Definir política de sesiones: timeout, renovación de tokens, ¿se requiere 2FA?
- [ ] Completar `src/app/api/auth/me/route.ts` reemplazando el mock por validación de sesión real

**Variables de entorno a completar:**
```
DISCOVERY_BASE_URL=
DISCOVERY_API_KEY=
CMDB_BASE_URL=
CMDB_API_KEY=
LDAP_URL=
LDAP_BASE_DN=
LDAP_BIND_USER=
LDAP_BIND_PASSWORD=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

---

## 3. Ambiente de Desarrollo en el cliente

Para desarrollar con acceso real a los servicios internos (Discovery, CMDB, LDAP, BD),
el equipo necesita un ambiente dentro de la red de Totalplay.

### 3.1 Acceso a la red

- [ ] **VPN o acceso directo** a la red interna de Totalplay para los desarrolladores
- [ ] Confirmar si hay restricciones de firewall para el puerto 6001 (Next.js dev)
  y el puerto de BD (5432 PostgreSQL / 1433 SQL Server)
- [ ] Acceso SSH o RDP al servidor donde correrá la aplicación
- [ ] Confirmar rutas de red desde el servidor hacia los servicios: Discovery, CMDB, LDAP

### 3.2 Servidor o VM de desarrollo

- [ ] Provisionar un servidor o VM en la red interna con:
  - **Node.js ≥ 24** (requisito declarado en `package.json → engines.node`)
  - Git
  - Acceso al repositorio de código (GitHub / GitLab / servidor Git corporativo)
- [ ] Clonar el repositorio y correr `npm install`
- [ ] Crear el archivo `.env` con las credenciales reales de los servicios internos
  (ver variables listadas en §2.4 y §1.2)
- [ ] Verificar que `npm run dev` arranca correctamente en el puerto 6001

### 3.3 Ambiente de QA / staging

- [ ] Definir si habrá un servidor de QA separado del de desarrollo
- [ ] Definir si ese servidor se conecta a los mismos servicios que producción
  o a ambientes de sandbox (recomendado para Discovery y CMDB)
- [ ] Definir el proceso de deploy: rama `main` → build → ¿deploy manual o CI/CD?

### 3.4 Proceso de build y deploy en producción

- [ ] Confirmar si hay un proceso de CI/CD existente en Totalplay que deba integrarse
- [ ] Comando de build: `npm run build` → `next build`
- [ ] Comando de arranque en producción: `next start --port 6001`
- [ ] Aplicar migraciones en cada deploy: `prisma migrate deploy`
- [ ] Definir gestión de variables de entorno en producción (secrets manager, archivo protegido, etc.)

---

## Mapa de dependencias

```
[D1] Motor de BD (decisión del cliente)
  └─► [1.2] Setup Prisma schema
        └─► [1.3] Reemplazar mocks en routes

[D2] Acceso a red interna / VPN              ← 3.1
  └─► [D3] Servidor/VM aprovisionado         ← 3.2
        ├─► [1.2] Conectar BD real
        ├─► [2.2] Conectar Discovery real
        └─► [2.3] Conectar CMDB real

[D4] Documentación Discovery + credenciales  ← 2.1
  └─► [2.2] Implementar conector Discovery

[D5] Documentación CMDB + credenciales       ← 2.3
  └─► [2.3] Implementar conector CMDB

[D6] Documentación SSO/LDAP                  ← 2.4
  └─► [auth/me] Reemplazar usuario mock
```

El frontend puede seguir avanzando en UX sobre los mocks mientras se resuelven
las dependencias de infraestructura.

---

## Tabla de definiciones bloqueantes

| # | Definición | Responsable | Bloquea |
|---|-----------|-------------|---------|
| D1 | Motor de BD (PostgreSQL vs SQL Server) | Totalplay IT | §1.2, §3 |
| D2 | Acceso a red interna / VPN | Totalplay IT | §3.1 |
| D3 | Servidor o VM de desarrollo | Totalplay IT | §3.2 |
| D4 | URL y credenciales del servicio Discovery | Totalplay Redes | §2.1, §2.2 |
| D5 | URL y credenciales del Conector CMDB | Totalplay IT | §2.3 |
| D6 | Documentación del SSO/LDAP corporativo | Totalplay IT | §2.4 |
| D7 | ¿BD nueva o adaptación del esquema existente? | Totalplay + Equipo | §1.4 |
| D8 | Formato definitivo del Excel/PDF de exportación | Totalplay usuarios | §2 exportaciones |
