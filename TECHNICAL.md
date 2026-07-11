# Ingenierías de Red — Documentación Técnica

## Arquitectura general

Aplicación **Next.js 16.2** con App Router, TypeScript, Tailwind CSS y React Flow para el canvas interactivo. El frontend y el backend corren en el **mismo proceso Node.js** durante desarrollo y en la primera etapa de producción. Cuando se requiera separación, un cambio de variable de entorno es suficiente (ver sección de despliegue).

```
Navegador (React 19)
  └── Next.js 16.2 (App Router + API Routes — mismo proceso)
        ├── Base de datos (PostgreSQL 16+ o MariaDB 10.6+) via Prisma
        ├── Servicio Discovery        (externo, Totalplay)
        ├── Conector CMDB             (externo, Totalplay)
        └── SMC v2                    (externo, solo lectura)
```

---

## Estructura de carpetas

```
src/
├── types/index.ts                       # Todos los tipos TypeScript compartidos
├── store/app.store.ts                   # Estado global (Zustand 5)
├── lib/
│   ├── api.ts                           # Capa de servicio — único punto de llamadas al backend
│   └── utils.ts                         # Helpers, colores, estilos de enlaces
├── data/
│   └── mock.ts                          # Datos de prueba (activos mientras MOCK_MODE = true)
├── components/
│   ├── canvas/
│   │   ├── Canvas.tsx                   # Canvas principal (React Flow)
│   │   ├── DispositivoNode.tsx          # Nodo custom de React Flow
│   │   ├── EnlaceEdge.tsx               # Edge custom de React Flow
│   │   └── FabMenu.tsx                  # Botón flotante con menú radial
│   ├── layout/
│   │   ├── Topbar.tsx                   # Barra superior
│   │   ├── Sidebar.tsx                  # Panel izquierdo (dispositivos + leyendas)
│   │   ├── PropiedadesPanel.tsx         # Panel derecho de propiedades del objeto seleccionado
│   │   ├── ListaIngenierias.tsx         # Pantalla de listado y gestión de ingenierías
│   │   └── EditorIngenieria.tsx         # Pantalla del editor (topbar + sidebar + canvas)
│   └── ui/
│       └── DeviceIcons.tsx              # SVGs de íconos estilo Cisco por tipo de dispositivo
└── app/
    ├── page.tsx                         # Enruta entre lista y editor según estado del store
    ├── layout.tsx                       # Layout raíz con soporte dark/light
    ├── globals.css                      # Tailwind + overrides de React Flow
    └── api/
        ├── ingenierias/
        │   ├── route.ts                 # GET (lista) / POST (crear)
        │   └── [id]/
        │       ├── route.ts             # GET / PATCH (guardar canvas) / DELETE
        │       ├── estado/route.ts      # PATCH — cambia estado, actualiza CMDB si aplica
        │       ├── discovery/route.ts   # POST — genera ingeniería desde Discovery
        │       ├── importar-excel/route.ts   # POST — importa desde Excel
        │       ├── exportar-excel/route.ts   # GET — devuelve .xlsx
        │       └── exportar-pdf/route.ts     # GET — devuelve .pdf
        ├── cmdb/
        │   ├── verificar/route.ts       # GET — verifica si un hostname está en CMDB
        │   └── actualizar/route.ts      # POST — actualiza CMDB con objetos de una ingeniería
        ├── discovery/
        │   └── cuenta/route.ts          # GET — consulta Discovery por número de cuenta
        └── auth/
            └── me/route.ts              # GET — devuelve usuario autenticado (SSO)
```

---

## Separación frontend / backend

### Ahora (mismo servidor)
`NEXT_PUBLIC_API_URL` está vacío. Todas las llamadas van a `/api/...` del mismo origen.

### Con backend separado (sin cambiar código)
```bash
# .env.local en el servidor del frontend
NEXT_PUBLIC_API_URL=https://api.totalplay.internal
```
El archivo `src/lib/api.ts` centraliza el 100% de las llamadas — no hay `fetch` dispersos en los componentes. Un solo cambio de variable y listo.

---

## MOCK_MODE

En `src/store/app.store.ts`:

```ts
const MOCK_MODE = true   // cambiar a false cuando el backend esté listo
```

Con `true`: el store usa los datos de `src/data/mock.ts` y no llama a la API.
Con `false`: el store llama a `src/lib/api.ts` que apunta al backend real.

---

## Estado global — `src/store/app.store.ts`

Zustand 5. Contiene:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `usuario` | `Usuario` | Usuario activo con su `perfil` |
| `temaOscuro` | `boolean` | Tema activo |
| `ingenierias` | `Ingenieria[]` | Lista completa |
| `loading` | `boolean` | Estado de carga |
| `error` | `string \| null` | Error de la última operación |
| `ingenieriaActiva` | `Ingenieria \| null` | Ingeniería abierta en el editor |

Acciones principales: `fetchIngenierias`, `addIngenieria`, `updateIngenieria`, `deleteIngenieria`, `abrirIngenieria`, `cerrarIngenieria`, `guardarCambios`, `cambiarEstado`, `toggleTema`.

---

## Tipos principales — `src/types/index.ts`

### `Ingenieria`
```ts
{
  id, nombre, cliente, cuenta,
  estado: EstadoIngenieria,     // Nueva | Aprovisionada | Modificada | Instalada | Rechazada
  creadaPor, creadaEn, modificadaEn,
  nodes: any[],                 // nodos de React Flow con DispositivoData
  edges: any[],                 // edges de React Flow con EnlaceData
}
```

### `DispositivoData`  (data de cada nodo)
```ts
{
  tipo: TipoDispositivo,        // Router | Switch | Firewall | Server | OLT | ONT | Nube | AccessPoint | Splitter | MediaConverter
  label: string,
  origen: OrigenObjeto,         // Discovery | Excel | Manual
  registradoCMDB: boolean,
  metadatos: MetadatoDispositivo,
}
```

### `MetadatoDispositivo`
```ts
{
  hostname, modelo, ip, serial, ubicacion, fabricante,
  customFields: Record<string, string>   // campos personalizados
}
```

### `EnlaceData`  (data de cada edge)
```ts
{
  tipo: TipoEnlace,             // UTP | Fibra | Microonda | Logico
  origen: OrigenObjeto,
  registradoCMDB: boolean,
  metadatos: MetadatoEnlace,
}
```

### `MetadatoEnlace`
```ts
{
  numeroEnlace, puertoSalida, etiquetaSalida,
  puertoLlegada, etiquetaLlegada, servicios,
  customFields: Record<string, string>
}
```

### `PerfilUsuario`
```ts
'Operativo' | 'Supervisor' | 'Consulta'
```

| Perfil | Crear | Modificar | Aprobar/Rechazar | Solo lectura |
|--------|-------|-----------|------------------|--------------|
| Operativo | ✓ | ✓ | ✗ | ✗ |
| Supervisor | ✓ | ✓ | ✓ | ✗ |
| Consulta | ✗ | ✗ | ✗ | ✓ |

---

## Capa de servicio — `src/lib/api.ts`

Todas las llamadas HTTP al backend pasan por este archivo. Nunca llamar `fetch` directamente desde los componentes.

```ts
ingenieriasApi.list()
ingenieriasApi.get(id)
ingenieriasApi.create(data)
ingenieriasApi.guardar(id, nodes, edges)
ingenieriasApi.cambiarEstado(id, estado)
ingenieriasApi.delete(id)
ingenieriasApi.importarExcel(id, rows)
ingenieriasApi.generarDesdeDiscovery(id, { cuenta })
ingenieriasApi.exportarExcel(id)   // devuelve Blob
ingenieriasApi.exportarPdf(id)     // devuelve Blob

cmdbApi.verificar(hostname)
cmdbApi.actualizar(ingenieriaId)

discoveryApi.consultarCuenta(cuenta)

authApi.me()
```

---

## Canvas — `src/components/canvas/Canvas.tsx`

React Flow maneja internamente el estado visual de nodos y edges. El canvas sincroniza al store de Zustand vía callbacks:

| Callback | Acción |
|----------|--------|
| `onDrop` | Crea nodo en posición del drag, tipo viene de `dataTransfer` |
| `onConnect` | Crea edge con el tipo de enlace activo |
| `onNodeClick` | Selecciona nodo → abre PropiedadesPanel |
| `onPaneClick` | Deselecciona |

---

## Nodo custom — `src/components/canvas/DispositivoNode.tsx`

Renderiza por nodo:
- SVG del ícono del dispositivo (viene de `DeviceIcons.tsx`)
- Punto de color = origen del objeto (naranja=Discovery, azul=Excel, gris=Manual)
- Tilde verde = registrado en CMDB (sin tilde = no registrado)
- Label e IP debajo del ícono
- 8 handles de React Flow (source + target en los 4 lados)

---

## Edge custom — `src/components/canvas/EnlaceEdge.tsx`

Renderiza por enlace:
- Línea con color y estilo según tipo de enlace
- Punto de color de origen en el centro
- Tilde CMDB si aplica
- Número de enlace si tiene

---

## Estilos de enlaces — `src/lib/utils.ts`

| Tipo | Color | Estilo |
|------|-------|--------|
| UTP | `#2563EB` | Sólido |
| Fibra | `#D97706` | Sólido |
| Microonda | `#7C3AED` | Guiones `8 4` |
| Lógico | `#0D9488` | Punteado `3 3` |

---

## Íconos — `src/components/ui/DeviceIcons.tsx`

Cada tipo de dispositivo tiene un componente SVG React propio, con colores distintos para tema oscuro y claro. El export principal es `DeviceIcon` que recibe `tipo` y renderiza el componente correspondiente.

Dispositivos soportados: `Router`, `Switch`, `Firewall`, `Server`, `OLT`, `ONT`, `Nube`, `AccessPoint`, `Splitter`, `MediaConverter`.

---

## FAB — `src/components/canvas/FabMenu.tsx`

Botón flotante en esquina inferior derecha. Al abrirse despliega 4 acciones en cuarto de círculo (ángulos 90°, 120°, 150°, 180° con radio 76px):

| Botón | Color | Acción |
|-------|-------|--------|
| Guardar | Azul | `guardarCambios()` en el store |
| PDF | Rojo | `ingenieriasApi.exportarPdf()` — placeholder |
| Excel | Verde | `ingenieriasApi.exportarExcel()` — placeholder |
| Pantalla | Violeta | `requestFullscreen()` |

---

## Sidebar — `src/components/layout/Sidebar.tsx`

Panel izquierdo fijo. Contiene:
- Grid de dispositivos arrastrables al canvas (drag & drop nativo)
- Selector de tipo de enlace activo (afecta el próximo edge que se dibuje)
- Leyenda de origen (punto de color)
- Leyenda de CMDB (tilde verde = Registrado en CMDB)

---

## Panel de propiedades — `src/components/layout/PropiedadesPanel.tsx`

Panel derecho contextual, visible al seleccionar un nodo. Muestra y permite editar:
- Badge de CMDB (Registrado / No registrado)
- Badge de origen con color
- Campos estándar del dispositivo (hostname, modelo, IP, serial, ubicación, fabricante)
- Campos personalizados (custom fields) — editables y agregables en tiempo real

---

## Variables de entorno — `.env.example`

```bash
NEXT_PUBLIC_API_URL=          # vacío = mismo servidor; URL = backend separado

DATABASE_URL=                 # postgresql://... o mysql://...

DISCOVERY_BASE_URL=
DISCOVERY_API_KEY=

CMDB_BASE_URL=
CMDB_API_KEY=

SMC_BASE_URL=

LDAP_URL=
LDAP_BASE_DN=
LDAP_BIND_USER=
LDAP_BIND_PASSWORD=
```

---

## Próximos pasos cuando lleguen las specs

1. Definir `DATABASE_URL` en `.env.local`
2. Crear `prisma/schema.prisma` con las tablas (cambiar `provider` según el motor elegido)
3. Correr `npx prisma migrate dev`
4. Completar los `TODO` en `src/app/api/` uno por uno
5. Cambiar `MOCK_MODE = false` en `src/store/app.store.ts`
6. Configurar `LDAP_URL` e integrar autenticación en `src/app/api/auth/me/route.ts`
7. Configurar `DISCOVERY_BASE_URL` e implementar `src/app/api/ingenierias/[id]/discovery/route.ts`
8. Configurar `CMDB_BASE_URL` e implementar `src/app/api/cmdb/`
