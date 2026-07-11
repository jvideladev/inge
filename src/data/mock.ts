import type { Ingenieria, PerfilSistema, Usuario } from '@/types'


export const PERMISOS_MOCK = [
  { id: 'ingenierias.ver', nombre: 'Ver ingenierías', modulo: 'Ingenierías' },
  { id: 'ingenierias.crear', nombre: 'Crear ingenierías', modulo: 'Ingenierías' },
  { id: 'ingenierias.editar', nombre: 'Editar ingenierías', modulo: 'Ingenierías' },
  { id: 'ingenierias.eliminar', nombre: 'Eliminar ingenierías', modulo: 'Ingenierías' },
  { id: 'ingenierias.aprobar', nombre: 'Aprobar / rechazar', modulo: 'Flujo' },
  { id: 'cmdb.validar', nombre: 'Validar contra CMDB', modulo: 'CMDB' },
  { id: 'perfiles.ver', nombre: 'Ver perfiles', modulo: 'Administración' },
  { id: 'perfiles.administrar', nombre: 'Administrar perfiles', modulo: 'Administración' },
]

export const PERFILES_MOCK: PerfilSistema[] = [
  {
    id: 'per-001',
    nombre: 'Operativo',
    descripcion: 'Puede crear, editar y enviar ingenierías a revisión.',
    estado: 'Activo',
    permisos: ['ingenierias.ver', 'ingenierias.crear', 'ingenierias.editar', 'cmdb.validar'],
    usuariosAsignados: 8,
    creadoEn: '2025-01-01T09:00:00Z',
    modificadoEn: '2025-01-12T10:30:00Z',
  },
  {
    id: 'per-002',
    nombre: 'Supervisor',
    descripcion: 'Revisa, aprueba, rechaza y da seguimiento a las ingenierías.',
    estado: 'Activo',
    permisos: ['ingenierias.ver', 'ingenierias.aprobar', 'cmdb.validar', 'perfiles.ver'],
    usuariosAsignados: 3,
    creadoEn: '2025-01-01T09:00:00Z',
    modificadoEn: '2025-01-14T11:15:00Z',
  },
  {
    id: 'per-003',
    nombre: 'Consulta',
    descripcion: 'Acceso de solo lectura para consulta de ingenierías y estados.',
    estado: 'Activo',
    permisos: ['ingenierias.ver'],
    usuariosAsignados: 12,
    creadoEn: '2025-01-01T09:00:00Z',
    modificadoEn: '2025-01-08T16:00:00Z',
  },
]

export const USUARIOS_MOCK: Usuario[] = [
  { id: 'u1', nombre: 'Carlos Méndez',   perfil: 'Operativo',   email: 'operativo@correo.com',  password: '123456' },
  { id: 'u2', nombre: 'Laura Sánchez',   perfil: 'Supervisor',  email: 'supervisor@correo.com', password: '123456' },
  { id: 'u3', nombre: 'Roberto Pérez',   perfil: 'Consulta',    email: 'consulta@correo.com',   password: '123456' },
]

export const INGENIERIAS_MOCK: Ingenieria[] = [
  {
    id: 'ing-001',
    nombre: 'Ingeniería IMSS Cuenta 1000023500',
    cliente: 'IMSS',
    cuenta:  '1000023500',
    estado:  'Nueva',
    creadaPor:    'Carlos Méndez',
    creadaEn:     '2025-01-10T10:00:00Z',
    modificadaEn: '2025-01-15T14:30:00Z',
    nodes: [
      {
        id: 'rout-0032',
        type: 'dispositivo',
        position: { x: 180, y: 80 },
        data: {
          tipo: 'Router',
          label: 'ROUT-0032',
          origen: 'Discovery',
          registradoCMDB: true,
          metadatos: {
            hostname: 'ROUT-0032', modelo: 'KIDUI-32',
            ip: '10.23.23.1', serial: 'SN-20230415-A',
            ubicacion: 'Rack A-03', fabricante: 'Cisco',
            customFields: { Rack: 'A-03', VLAN: '100' }
          }
        }
      },
      {
        id: 'swt-003',
        type: 'dispositivo',
        position: { x: 480, y: 80 },
        data: {
          tipo: 'Switch',
          label: 'SWT-003',
          origen: 'Excel',
          registradoCMDB: true,
          metadatos: {
            hostname: 'SWT-003', modelo: 'C2960X',
            ip: '10.34.32.123', serial: 'SN-20220101-B',
            ubicacion: 'Rack A-04', fabricante: 'Cisco',
            customFields: {}
          }
        }
      },
      {
        id: 'drd-09',
        type: 'dispositivo',
        position: { x: 180, y: 260 },
        data: {
          tipo: 'OLT',
          label: 'DRD-09',
          origen: 'Manual',
          registradoCMDB: false,
          metadatos: {
            hostname: 'DRD-09', modelo: 'ZTE C300',
            ip: '10.23.23.50', serial: 'SN-20210301-C',
            ubicacion: 'Rack B-01', fabricante: 'ZTE',
            customFields: {}
          }
        }
      },
      {
        id: 'ont-0032',
        type: 'dispositivo',
        position: { x: 180, y: 430 },
        data: {
          tipo: 'ONT',
          label: 'ONT-0032',
          origen: 'Discovery',
          registradoCMDB: true,
          metadatos: {
            hostname: 'ONT-0032', modelo: 'HG8245H',
            ip: '10.23.98.193', serial: 'SN-20230501-D',
            ubicacion: 'Cliente', fabricante: 'Huawei',
            customFields: {}
          }
        }
      },
      {
        id: 'frt-033',
        type: 'dispositivo',
        position: { x: 480, y: 260 },
        data: {
          tipo: 'Firewall',
          label: 'FRT-033',
          origen: 'Excel',
          registradoCMDB: false,
          metadatos: {
            hostname: 'FRT-033', modelo: 'ASA 5505',
            ip: '10.34.32.1', serial: 'SN-20200601-E',
            ubicacion: 'Rack A-05', fabricante: 'Cisco',
            customFields: {}
          }
        }
      }
    ],
    edges: [
      {
        id: 'e1', type: 'enlace', source: 'rout-0032', target: 'swt-003',
        style: { stroke: '#2563EB', strokeWidth: 2 },
        data: {
          tipo: 'UTP', origen: 'Excel', registradoCMDB: true,
          metadatos: {
            numeroEnlace: '3IE0R', puertoSalida: 'Gi0/0',
            etiquetaSalida: 'ETQ-001', puertoLlegada: 'Fa0/1',
            etiquetaLlegada: 'ETQ-002', servicios: 'DATOS',
            customFields: {}
          }
        }
      },
      {
        id: 'e2', type: 'enlace', source: 'rout-0032', target: 'drd-09',
        style: { stroke: '#0D9488', strokeWidth: 1.5, strokeDasharray: '3 3' },
        data: {
          tipo: 'Logico', origen: 'Manual', registradoCMDB: false,
          metadatos: {
            numeroEnlace: '', puertoSalida: 'Gi0/1',
            etiquetaSalida: '', puertoLlegada: 'PON0',
            etiquetaLlegada: '', servicios: '',
            customFields: {}
          }
        }
      },
      {
        id: 'e3', type: 'enlace', source: 'drd-09', target: 'ont-0032',
        style: { stroke: '#D97706', strokeWidth: 2 },
        data: {
          tipo: 'Fibra', origen: 'Discovery', registradoCMDB: false,
          metadatos: {
            numeroEnlace: '', puertoSalida: '', etiquetaSalida: '',
            puertoLlegada: '', etiquetaLlegada: '', servicios: 'FTTH',
            customFields: {}
          }
        }
      }
    ]
  },
  {
    id: 'ing-002',
    nombre: 'Ingeniería Pemex Refinería Tula',
    cliente: 'Pemex',
    cuenta:  '2000045100',
    estado:  'En revisión',
    creadaPor:    'Carlos Méndez',
    creadaEn:     '2025-01-05T09:00:00Z',
    modificadaEn: '2025-01-12T11:00:00Z',
    nodes: [],
    edges: []
  },
  {
    id: 'ing-003',
    nombre: 'Ingeniería HSBC Corporativo',
    cliente: 'HSBC',
    cuenta:  '3000012300',
    estado:  'Implementada',
    creadaPor:    'Carlos Méndez',
    creadaEn:     '2024-12-01T08:00:00Z',
    modificadaEn: '2024-12-20T17:00:00Z',
    nodes: [],
    edges: []
  },
  {
    id: 'ing-004',
    nombre: 'Ingeniería CDMX Aeropuerto T1',
    cliente: 'AICM',
    cuenta:  '4000078900',
    estado:  'Rechazada',
    creadaPor:    'Carlos Méndez',
    creadaEn:     '2025-01-08T14:00:00Z',
    modificadaEn: '2025-01-09T10:00:00Z',
    nodes: [],
    edges: []
  },
  {
    id: 'ing-005',
    nombre: 'Ingeniería Banorte Monterrey',
    cliente: 'Banorte',
    cuenta:  '5000034500',
    estado:  'Aprobada',
    creadaPor:    'Laura Sánchez',
    creadaEn:     '2025-01-11T11:00:00Z',
    modificadaEn: '2025-01-14T09:30:00Z',
    nodes: [],
    edges: []
  }
]
