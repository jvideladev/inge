# Ingenierías de Red — Documentación Técnica

Mockup funcional para el applicativo de gestión de ingenierías de red de Totalplay. Corre íntegramente en el browser con datos en memoria (`MOCK_MODE = true`). Sin conexión a base de datos ni servicios externos.

---

## Stack

| Capa        | Tecnología                              | Versión   |
|-------------|-----------------------------------------|-----------|
| Framework   | Next.js (App Router + Turbopack)        | 16.2.9    |
| UI          | React                                   | 19.0      |
| Canvas      | React Flow                              | 11.11.4   |
| Estado      | Zustand                                 | 5.x       |
| Estilos     | Tailwind CSS (`darkMode: 'class'`)      | 3.x       |
| Lenguaje    | TypeScript                              | 5.x       |
| Node mínimo | Node.js LTS                             | 24+       |
| Paquetes    | xlsx, clsx, tailwind-merge              | —         |

El servidor de desarrollo escucha en el **puerto 6001** (definido en `package.json`).

---

## Estructura de archivos

```
src/
├── app/
│   ├── layout.tsx                  ← Layout raíz (aplica clase dark, fuente)
│   ├── page.tsx                    ← Punto de entrada: Lista o Editor según estado
│   └── api/
│       ├── ingenierias/
│       │   ├── route.ts            ← GET lista / POST crear
│       │   ├── [id]/route.ts       ← GET detalle / PUT guardar / DELETE
│       │   ├── [id]/estado/route.ts← PATCH cambiar estado
│       │   └── [id]/discovery/route.ts ← POST trigger discovery
│       ├── cmdb/verificar/route.ts ← POST verificar dispositivo en CMDB
│       └── auth/me/route.ts        ← GET usuario actual
│
├── components/
│   ├── canvas/
│   │   ├── Canvas.tsx              ← ReactFlow + lógica de interacción
│   │   ├── DispositivoNode.tsx     ← Nodo dispositivo con handles e indicadores
│   │   ├── EnlaceEdge.tsx          ← Edge personalizado con marcadores CMDB/origen
│   │   └── FabMenu.tsx             ← FAB radial animado (guardar, PDF, Excel, pantalla)
│   ├── layout/
│   │   ├── Topbar.tsx              ← Barra superior: estado, perfil, tema, guardar
│   │   ├── Sidebar.tsx             ← Sidebar izq: paleta dispositivos, tipo enlace, auto-ajuste
│   │   ├── PropiedadesPanel.tsx    ← Panel derecho: propiedades de nodo o enlace seleccionado
│   │   ├── ListaIngenierias.tsx    ← Vista listado con búsqueda y filtros
│   │   └── EditorIngenieria.tsx    ← Vista editor: Topbar + Sidebar + Canvas + Panel
│   └── ui/
│       └── DeviceIcons.tsx         ← 18 íconos SVG estilo Cisco + colores por tema
│
├── config/
│   └── dispositivos.ts             ← Catálogo de los 18 tipos de dispositivo
│
├── data/
│   └── mock.ts                     ← Datos de prueba: ingenierías y usuarios
│
├── lib/
│   ├── api.ts                      ← Capa de servicio (único punto de contacto con backend)
│   └── utils.ts                    ← Helpers: cn(), estadoColor(), ENLACE_STYLE, generarId()
│
├── store/
│   └── app.store.ts                ← Estado global Zustand: auth, ingenierías, editor, tema
│
└── types/
    └── index.ts                    ← Tipos TypeScript compartidos
```

---

## Modelo de dominio

### Ingeniería

Unidad central del sistema. Contiene metadatos de gestión y la topología de red.

```ts
interface Ingenieria {
  id:           string
  nombre:       string
  cliente:      string
  cuenta:       string
  estado:       EstadoIngenieria
  creadaPor:    string
  creadaEn:     string        // ISO 8601
  modificadaEn: string        // ISO 8601
  nodes:        Node[]        // Nodos de ReactFlow (dispositivos)
  edges:        Edge[]        // Edges de ReactFlow (enlaces)
}
```

### Estados y transiciones

```
Nueva → En revisión → Aprobada ──→ Aprovisionada → Implementada
                    ↘ Rechazada
```

Las transiciones disponibles dependen del perfil del usuario y del estado actual. El Topbar muestra únicamente los botones válidos para el estado + perfil activo.

### Perfiles de usuario

| Perfil     | Crear/editar topología | Enviar a revisión | Aprobar / Rechazar | Solo lectura |
|------------|------------------------|-------------------|--------------------|--------------|
| Operativo  | ✓                      | ✓                 | ✗                  | ✗            |
| Supervisor | ✓                      | ✓                 | ✓                  | ✗            |
| Consulta   | ✗                      | ✗                 | ✗                  | ✓            |

---

## Topología de red

### Dispositivos (18 tipos)

Router, OLT, Proveedor, Firewall, Medidor, Nube Terceros, CPE, LAN, Setup, Switch, ONT, POP, Colector, Nube TP, Radiobase, Access Point, Server, Splitter.

Cada dispositivo en el canvas es un `DispositivoNode` con:
- **4 handles source** visibles (6 px, gris) en los 4 costados
- **4 handles target** invisibles (20 px) superpuestos, para zona de drop generosa
- Indicador CMDB (top-left): tilde verde si registrado, gris si no
- Indicador de origen (top-right): punto de color según origen

### Tipos de enlace

| Tipo      | Color   | Línea      |
|-----------|---------|------------|
| UTP       | Azul    | Continua   |
| Fibra     | Ámbar   | Continua   |
| Microonda | Violeta | Guiones    |
| Lógico    | Verde   | Puntos     |

### Origen de objetos

| Origen    | Color  | Significado                            |
|-----------|--------|----------------------------------------|
| Discovery | Verde  | Detectado automáticamente por el sistema de discovery |
| Excel     | Azul   | Importado desde planilla               |
| Manual    | Ámbar  | Ingresado a mano por el usuario        |

---

## Componentes clave

### Canvas (`canvas/Canvas.tsx`)

Wrapper de ReactFlow. Responsabilidades:
- Drag & drop de dispositivos desde la sidebar (`onDrop` + `onDragOver`)
- Creación de enlaces al arrastrar entre handles
- Reconexión de enlaces: solo el enlace **seleccionado** puede reconectarse (prop `updatable` por edge), evitando confusión cuando hay múltiples edges en el mismo handle
- Auto-layout con dagre (4 modos: árbol horizontal, árbol vertical, cuadrícula, optimizar conexiones)
- `connectionRadius={40}` y `edgeUpdaterRadius={12}` para snap generoso

### DispositivoNode (`canvas/DispositivoNode.tsx`)

Nodo de ReactFlow. Selección visual estilo Excalidraw: `outline: 1.5px dashed #3b82f6` con fondo levemente azulado, sin ampliar el bounding box.

### PropiedadesPanel (`layout/PropiedadesPanel.tsx`)

Panel derecho configurable en 3 modos: fijo, flotante (draggable) u oculto. Muestra campos del nodo o enlace seleccionado. Permite agregar campos personalizados con toast de confirmación "Campo agregado".

### FabMenu (`canvas/FabMenu.tsx`)

Botón flotante rojo en esquina inferior derecha. Al hacer click despliega 4 acciones con animación radial spring (`cubic-bezier(0.34,1.56,0.64,1)`): Guardar, exportar PDF, exportar Excel, pantalla completa.

### Sidebar (`layout/Sidebar.tsx`)

- Paleta de dispositivos con drag & drop
- Selector de tipo de enlace activo
- Botón "Auto ajuste" que despliega un flyout con 4 modos de layout (renderizado via `createPortal` para evitar clipping del overflow del sidebar)

---

## Estado global (`store/app.store.ts`)

Zustand store único con los siguientes segmentos:

| Segmento            | Responsabilidad                                     |
|---------------------|-----------------------------------------------------|
| `usuario`           | Usuario activo y perfil                             |
| `temaOscuro`        | Toggle claro/oscuro (persiste clase en `<html>`)    |
| `ingenierias`       | Lista de ingenierías + loading/error                |
| `ingenieriaActiva`  | Ingeniería abierta en el editor + flag de cambios   |
| Acciones            | `guardarCambios`, `cambiarEstado`, `deleteIngenieria`, etc. |

---

## Variables de entorno

El archivo `.env.local` se crea copiando `.env.example`.

| Variable              | Descripción                                          | Valor en mock |
|-----------------------|------------------------------------------------------|---------------|
| `NEXT_PUBLIC_API_URL` | URL base del backend. Vacío = mismo origen (`/api/`) | *(vacío)*     |
| `DISCOVERY_BASE_URL`  | URL del servicio de discovery de red                 | *(vacío)*     |
| `CMDB_BASE_URL`       | URL del conector CMDB                                | *(vacío)*     |
| `LDAP_URL`            | URL del servidor LDAP/SSO                            | *(vacío)*     |
| `DATABASE_URL`        | Cadena de conexión PostgreSQL/MariaDB (Prisma)       | *(vacío)*     |

---

## Flag MOCK_MODE

En `src/store/app.store.ts`:

```ts
const MOCK_MODE = true   // datos en memoria, sin llamadas HTTP
```

Cuando el backend esté disponible, cambiar a `false`. El store empieza a llamar a `src/lib/api.ts`, que a su vez llama a los endpoints de `src/app/api/`.

---

## Separación frontend / backend

### Estado actual (mismo servidor)

```
Navegador → Next.js (frontend + backend en el mismo proceso)
```

### Cuando se separen (sin cambiar código)

Cambiar una sola variable de entorno en el servidor del frontend:

```bash
NEXT_PUBLIC_API_URL=https://api.totalplay.internal
```

`src/lib/api.ts` es el único punto de contacto con el backend — no hay `fetch` dispersos en componentes.

```
Navegador → Servidor Frontend (Next.js) → Servidor Backend (Node.js) → BD / Servicios externos
```

---

## Base de datos (pendiente)

Prisma ORM, compatible con PostgreSQL 16+ y MariaDB 10.6+. Cambiar proveedor con una línea en `prisma/schema.prisma`:

```prisma
provider = "postgresql"   // PostgreSQL 16+
provider = "mysql"        // MariaDB 10.6+
```

---

## Pendiente de implementar

| Ítem                                    | Bloqueante                     |
|-----------------------------------------|--------------------------------|
| Prisma schema + migraciones             | Acceso a BD del cliente        |
| API Routes con BD real                  | Schema de BD                   |
| Autenticación SSO/LDAP                  | Specs del IdP del cliente      |
| Integración Servicio Discovery          | Specs de la API                |
| Integración lectura/escritura CMDB      | Specs del conector             |
| Exportación real Excel y PDF            | Layout definitivo del cliente  |
| Integración SMC v2                      | Specs de la API                |
