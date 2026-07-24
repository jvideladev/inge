# Ingenierías de Red — Documentación Técnica

## Arquitectura general

Aplicación **Next.js 16** (App Router) + TypeScript + Tailwind + React Flow.
Frontend y API Routes en el mismo proceso Node. Persistencia en **MariaDB** (WAMP local puerto **3307**).

```
Navegador (React 19)
  └── Next.js (App Router + /api)
        ├── MariaDB (foto JSON + proyección híbrida + catálogos + auth)
        ├── Sistema RFC / aprovisionamiento (externo — consume nuestras APIs)
        ├── Discovery / CMDB / SMC (externos Totalplay — pendientes)
        └── Neo4j (NO se escribe desde esta app; otro sistema puede hacerlo)
```

Modelo de datos: **híbrido**. La foto del diagrama vive en `ingenierias.nodes_json` / `edges_json`; al guardar se proyecta a tablas `ingenieria_dispositivos`, `ingenieria_interfaces`, `ingenieria_enlaces`, `ingenieria_enlace_miembros`. Ver `modelo-datos-hibrido-cliente.txt`.

---

## Estados de ingeniería y transiciones

| Estado | Cómo se alcanza |
|--------|-----------------|
| **En construcción** | Al crear; el operativo trabaja la topología |
| **En revisión** | Operativo (desde En construcción o Rechazada), con comentario opcional |
| **Aprobada** | Supervisor (desde En revisión) → dispara publicación |
| **Rechazada** | Supervisor (desde En revisión) **con comentario obligatorio**; se edita como construcción |
| **Aprovisionada** | Supervisor (manual por ahora); genera **versión histórica**; futuro: sync tablas externas |
| **Implementada** | Supervisor (manual por ahora); futuro: sync tablas externas |

```
En construcción ──(Operativo + comentario opcional)──► En revisión
                                                          │
                               Supervisor aprueba ────────┼──► Aprobada ──(Supervisor)──► Aprovisionada ──► Implementada
                               Supervisor rechaza ────────┘         │                         │
                               (comentario obligatorio)             │                         │
                                                          ▼         │              (versión histórica)
                                                     Rechazada      │
                                                          │         │
                               Operativo reenvía ─────────┴─────────┘
                               (comentario opcional)
```

Comentarios: conversación persistente (`ingenieria_comentarios`), visible desde el grid.
Discovery: botón en En construcción / Rechazada → aviso de overwrite → IP → mock Discovery (`core=true`).
Versiones: solo al pasar a **Aprovisionada** (no en cada guardado).

Perfil **Consulta**: solo lectura. Demos (`editable=0`): no cambian estado.
Operativo: solo edita en En construcción / Rechazada.

Al pasar a **Aprobada**:
1. `publicacion_estado = pendiente`
2. Webhook opcional (`INTEGRACION_WEBHOOK_URL`)
3. Disponible en API de integración + `vistaUrl` para popup

---

## Integración con sistema RFC / aprovisionamiento

### Flujo de negocio

1. Supervisor **aprueba** la ingeniería en este aplicativo.
2. Este sistema **publica** (lista + detalle JSON + URL de vista HTML).
3. Otro aplicativo levanta esa información para el **RFC (Request for Change)**.
4. Ese aplicativo aprovisiona dispositivos y enlaces visibles en la ingeniería.
5. Este sistema **lee** (cuando exista el contrato) un web service de ingenierías ya aprovisionadas y actualiza el estado a **Aprovisionada**.

```
[Ingenierías] --publica Aprobada--> [Sistema RFC / aprovisionamiento]
       ^                                      |
       |         (WS externo — pendiente)     |
       +--------- Aprovisionada <-------------+
```

### Salida — web services que exponemos

Auth API JSON: header `X-Integration-Key: <INTEGRACION_API_KEY>`  
(En desarrollo, si la key no está definida, se permite el acceso. En production es obligatoria.)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/integracion/ingenierias?pendientes=1` | Lista Aprobadas (filtro pendientes de ACK) |
| `GET` | `/api/integracion/ingenierias/[id]` | Payload completo (metadatos + nodes + edges + **vistaUrl**) |
| `POST` | `/api/integracion/ingenierias/[id]/ack` | ACK del consumidor `{ "ok": true }` / `{ "ok": false, "error": "..." }` |
| `POST` | `/api/integracion/sincronizar-aprovisionadas` | Dispara lectura del WS externo (entrada) |

`schemaVersion` actual del contrato: **1.1** (incluye `vistaUrl`).

#### Payload de detalle (resumen)

```json
{
  "schemaVersion": "1.1",
  "evento": "ingenieria.aprobada",
  "publicadoEn": "2026-07-23T03:00:00.000Z",
  "vistaUrl": "http://localhost:6001/vista/ingenieria/ing-xxx",
  "ingenieria": {
    "id": "ing-xxx",
    "nombre": "...",
    "cliente": "...",
    "cuenta": "...",
    "estado": "Aprobada",
    "version": 3,
    "publicacionEstado": "pendiente"
  },
  "nodes": [ ],
  "edges": [ ]
}
```

#### Vista HTML para popup / iframe

| Campo | Valor |
|-------|--------|
| URL | `{NEXT_PUBLIC_APP_URL}/vista/ingenieria/{id}` |
| Uso | Abrir en popup o iframe del sistema RFC |
| Contenido | Cabecera (nombre, cliente, cuenta, estado) + canvas React Flow **solo lectura** |
| Estados visibles | `Aprobada`, `Aprovisionada`, `Implementada` |
| Autenticación de la página | **Pendiente de definición**. Hoy **sin login**. Se podrá añadir token/SSO sin cambiar la forma de `vistaUrl` en el JSON. |

Ejemplo local: `http://localhost:6001/vista/ingenieria/ing-001`

### Entrada — web service externo (aprovisionadas)

**Estado:** pendiente de especificación Totalplay (URL, auth, formato de respuesta).

Variables previstas:

```bash
APROVISIONAMIENTO_WS_URL=
APROVISIONAMIENTO_API_KEY=
```

Comportamiento implementado (stub listo para enchufar):

- `POST /api/integracion/sincronizar-aprovisionadas` (protegido con `X-Integration-Key`)
- Llama al WS externo (GET)
- Espera una lista de ítems con al menos `id` (acepta `items` / `data` / `ingenierias`)
- Si la ingeniería local está en **Aprobada**, la pasa a **Aprovisionada** (usuario sistema `sistema-aprovisionamiento`)
- Si `APROVISIONAMIENTO_WS_URL` no está definida → `503` con mensaje claro

Cuando llegue el contrato real: ajustar mapper en `src/lib/integracion/aprovisionamiento.ts` y, si hace falta, el método HTTP / headers.

### Variables de entorno (integración)

```bash
INTEGRACION_API_KEY=              # Auth de nuestras APIs de integración
INTEGRACION_WEBHOOK_URL=          # Opcional: push al aprobar
NEXT_PUBLIC_APP_URL=http://localhost:6001   # Base absoluta para vistaUrl

APROVISIONAMIENTO_WS_URL=         # Pendiente — WS remoto de aprovisionadas
APROVISIONAMIENTO_API_KEY=        # Pendiente
```

---

## Persistencia MariaDB (resumen)

| Tabla | Rol |
|-------|-----|
| `ingenierias` | Metadatos + foto JSON + estado + publicación |
| `ingenieria_versiones` | Snapshots históricos |
| `ingenieria_dispositivos` / `_interfaces` / `_enlaces` / `_enlace_miembros` | Proyección híbrida |
| `cfg_*` | Catálogos admin |
| `usuarios` / `auth_sesiones` | Auth local (LDAP/SSO después) |

Scripts: `npm run db:schema-hibrido`, `npm run db:proyectar`.

---

## Auth de aplicación (usuarios humanos)

- Proveedor vía `AUTH_PROVIDER` (`local` hoy; placeholders ldap/oauth/sso).
- APIs: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Distinto de `X-Integration-Key` (máquina a máquina).

---

## Capas de código relevantes

```
src/lib/integracion/
  auth.ts                 # X-Integration-Key
  payload.ts              # buildPublicacionPayload (+ vistaUrl)
  urls.ts                 # buildVistaUrl
  webhook.ts              # push opcional al aprobar
  aprovisionamiento.ts    # sync entrada (stub WS externo)

src/app/api/integracion/...
src/app/vista/ingenieria/[id]/page.tsx   # HTML popup
src/components/vista/VistaCanvas.tsx
```

---

## Separación frontend / backend

`NEXT_PUBLIC_API_URL` vacío = mismo origen (`/api/...`).  
Si se separa el backend: apuntar esa variable; las llamadas pasan por `src/lib/api.ts`.

---

## Próximos pasos de integración (cliente)

1. Confirmar si la **vista HTML** llevará autenticación (token en query, SSO cookie, etc.).
2. Entregar contrato del **WS de aprovisionadas** (URL, auth, schema JSON).
3. Definir si el consumidor usará **pull** (GET lista/detalle) y/o **push** (webhook) y política de **ACK**.
4. Ambientes UAT/Prod: `NEXT_PUBLIC_APP_URL` e `INTEGRACION_API_KEY` por entorno.
