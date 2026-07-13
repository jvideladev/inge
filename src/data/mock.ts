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
        sourceHandle: 'right', targetHandle: 'left-t',
        style: { stroke: '#2563EB', strokeWidth: 2 },
        data: {
          tipo: 'UTP', origen: 'Excel', registradoCMDB: true,
          metadatos: {
            uuid: '', numeroEnlace: '3IE0R', puertoSalida: 'Gi0/0',
            etiquetaSalida: 'ETQ-001', puertoLlegada: 'Fa0/1',
            etiquetaLlegada: 'ETQ-002', servicios: 'DATOS',
            customFields: {}
          }
        }
      },
      {
        id: 'e2', type: 'enlace', source: 'rout-0032', target: 'drd-09',
        sourceHandle: 'bottom', targetHandle: 'top-t',
        style: { stroke: '#0D9488', strokeWidth: 1.5, strokeDasharray: '3 3' },
        data: {
          tipo: 'Logico', origen: 'Manual', registradoCMDB: false,
          metadatos: {
            uuid: '', numeroEnlace: 'LOG-100', puertoSalida: 'Gi0/1',
            etiquetaSalida: '', puertoLlegada: 'PON0',
            etiquetaLlegada: '', servicios: 'GESTION',
            customFields: {}
          }
        }
      },
      {
        id: 'e3', type: 'enlace', source: 'drd-09', target: 'ont-0032',
        sourceHandle: 'bottom', targetHandle: 'top-t',
        style: { stroke: '#D97706', strokeWidth: 2 },
        data: {
          tipo: 'Fibra', origen: 'Discovery', registradoCMDB: false,
          metadatos: {
            uuid: '', numeroEnlace: 'FTTH-201', puertoSalida: 'PON1', etiquetaSalida: 'ETQ-003',
            puertoLlegada: 'GPON', etiquetaLlegada: 'ETQ-004', servicios: 'FTTH',
            customFields: {}
          }
        }
      },
      {
        id: 'e4', type: 'enlace', source: 'swt-003', target: 'frt-033',
        sourceHandle: 'bottom', targetHandle: 'top-t',
        style: { stroke: '#2563EB', strokeWidth: 2 },
        data: {
          tipo: 'UTP', origen: 'Excel', registradoCMDB: false,
          metadatos: {
            uuid: '', numeroEnlace: 'UTP-305', puertoSalida: 'Gi0/2', etiquetaSalida: 'ETQ-005',
            puertoLlegada: 'E0/0', etiquetaLlegada: 'ETQ-006', servicios: 'DATOS',
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
    nodes: [
      {
        id: 'pmx-prov', type: 'dispositivo', position: { x: 60, y: 300 },
        data: {
          tipo: 'Proveedor', label: 'PROV-TELMEX', origen: 'Manual', registradoCMDB: true,
          metadatos: { hostname: 'PROV-TELMEX', modelo: 'MPLS', ip: '189.203.10.1', serial: 'SN-PMX-PRV', ubicacion: 'Enlace WAN', fabricante: 'Telmex', customFields: {} }
        }
      },
      {
        id: 'pmx-rt', type: 'dispositivo', position: { x: 280, y: 300 },
        data: {
          tipo: 'Router', label: 'RT-TULA-01', origen: 'Discovery', registradoCMDB: true,
          metadatos: { hostname: 'RT-TULA-01', modelo: 'ISR 4331', ip: '10.50.1.1', serial: 'SN-PMX-RT1', ubicacion: 'Site Tula', fabricante: 'Cisco', customFields: {} }
        }
      },
      {
        id: 'pmx-sw', type: 'dispositivo', position: { x: 500, y: 300 },
        data: {
          tipo: 'Switch', label: 'SW-TULA-01', origen: 'Excel', registradoCMDB: true,
          metadatos: { hostname: 'SW-TULA-01', modelo: 'C9200', ip: '10.50.1.2', serial: 'SN-PMX-SW1', ubicacion: 'Site Tula', fabricante: 'Cisco', customFields: {} }
        }
      },
      {
        id: 'pmx-srv', type: 'dispositivo', position: { x: 720, y: 220 },
        data: {
          tipo: 'Server', label: 'SRV-SCADA', origen: 'Manual', registradoCMDB: false,
          metadatos: { hostname: 'SRV-SCADA', modelo: 'PowerEdge R650', ip: '10.50.1.20', serial: 'SN-PMX-SRV', ubicacion: 'Site Tula', fabricante: 'Dell', customFields: {} }
        }
      },
      {
        id: 'pmx-ap', type: 'dispositivo', position: { x: 720, y: 380 },
        data: {
          tipo: 'AccessPoint', label: 'AP-PLANTA-01', origen: 'Excel', registradoCMDB: false,
          metadatos: { hostname: 'AP-PLANTA-01', modelo: 'AIR-AP2802', ip: '10.50.1.30', serial: 'SN-PMX-AP1', ubicacion: 'Planta', fabricante: 'Cisco', customFields: {} }
        }
      }
    ],
    edges: [
      {
        id: 'pmx-e1', type: 'enlace', source: 'pmx-prov', target: 'pmx-rt',
        sourceHandle: 'right', targetHandle: 'left-t',
        style: { stroke: '#D97706', strokeWidth: 2 },
        data: { tipo: 'Fibra', origen: 'Manual', registradoCMDB: true,
          metadatos: { uuid: '', numeroEnlace: 'ENL-PMX-01', puertoSalida: 'WAN', etiquetaSalida: 'MPLS', puertoLlegada: 'Gi0/0', etiquetaLlegada: 'WAN', servicios: 'INTERNET', customFields: {} } }
      },
      {
        id: 'pmx-e2', type: 'enlace', source: 'pmx-rt', target: 'pmx-sw',
        sourceHandle: 'right', targetHandle: 'left-t',
        style: { stroke: '#2563EB', strokeWidth: 2 },
        data: { tipo: 'UTP', origen: 'Discovery', registradoCMDB: true,
          metadatos: { uuid: '', numeroEnlace: 'ENL-PMX-02', puertoSalida: 'Gi0/1', etiquetaSalida: 'LAN', puertoLlegada: 'Gi1/0/1', etiquetaLlegada: 'UPLINK', servicios: 'DATOS', customFields: {} } }
      },
      {
        id: 'pmx-e3', type: 'enlace', source: 'pmx-sw', target: 'pmx-srv',
        sourceHandle: 'right', targetHandle: 'left-t',
        style: { stroke: '#2563EB', strokeWidth: 2 },
        data: { tipo: 'UTP', origen: 'Manual', registradoCMDB: false,
          metadatos: { uuid: '', numeroEnlace: 'ENL-PMX-03', puertoSalida: 'Gi1/0/10', etiquetaSalida: 'SCADA', puertoLlegada: 'NIC0', etiquetaLlegada: 'SRV', servicios: 'SCADA', customFields: {} } }
      },
      {
        id: 'pmx-e4', type: 'enlace', source: 'pmx-sw', target: 'pmx-ap',
        sourceHandle: 'right', targetHandle: 'left-t',
        style: { stroke: '#7C3AED', strokeWidth: 2, strokeDasharray: '8 4' },
        data: { tipo: 'Microonda', origen: 'Excel', registradoCMDB: false,
          metadatos: { uuid: '', numeroEnlace: 'ENL-PMX-04', puertoSalida: 'Gi1/0/24', etiquetaSalida: 'WIFI', puertoLlegada: 'ETH', etiquetaLlegada: 'AP', servicios: 'WIFI', customFields: {} } }
      }
    ]
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
    nodes: [
      {
        id: 'hsbc-nube', type: 'dispositivo', position: { x: 320, y: 60 },
        data: {
          tipo: 'NubeTP', label: 'NUBE-TOTALPLAY', origen: 'Manual', registradoCMDB: true,
          metadatos: { hostname: 'NUBE-TP', modelo: 'Internet', ip: '200.52.1.1', serial: 'SN-HSBC-NUBE', ubicacion: 'WAN', fabricante: 'TotalPlay', customFields: {} }
        }
      },
      {
        id: 'hsbc-fw', type: 'dispositivo', position: { x: 320, y: 220 },
        data: {
          tipo: 'Firewall', label: 'FW-CORP-01', origen: 'Discovery', registradoCMDB: true,
          metadatos: { hostname: 'FW-CORP-01', modelo: 'FortiGate 100F', ip: '172.16.0.1', serial: 'SN-HSBC-FW1', ubicacion: 'DC Reforma', fabricante: 'Fortinet', customFields: {} }
        }
      },
      {
        id: 'hsbc-core', type: 'dispositivo', position: { x: 320, y: 380 },
        data: {
          tipo: 'Router', label: 'CORE-01', origen: 'Discovery', registradoCMDB: true,
          metadatos: { hostname: 'CORE-01', modelo: 'ASR 1001-X', ip: '172.16.0.2', serial: 'SN-HSBC-CORE', ubicacion: 'DC Reforma', fabricante: 'Cisco', customFields: {} }
        }
      },
      {
        id: 'hsbc-sw1', type: 'dispositivo', position: { x: 140, y: 540 },
        data: {
          tipo: 'Switch', label: 'SW-PISO2', origen: 'Excel', registradoCMDB: false,
          metadatos: { hostname: 'SW-PISO2', modelo: 'C9300', ip: '172.16.2.1', serial: 'SN-HSBC-SW2', ubicacion: 'Piso 2', fabricante: 'Cisco', customFields: {} }
        }
      },
      {
        id: 'hsbc-sw2', type: 'dispositivo', position: { x: 500, y: 540 },
        data: {
          tipo: 'Switch', label: 'SW-PISO3', origen: 'Excel', registradoCMDB: false,
          metadatos: { hostname: 'SW-PISO3', modelo: 'C9300', ip: '172.16.3.1', serial: 'SN-HSBC-SW3', ubicacion: 'Piso 3', fabricante: 'Cisco', customFields: {} }
        }
      }
    ],
    edges: [
      {
        id: 'hsbc-e1', type: 'enlace', source: 'hsbc-nube', target: 'hsbc-fw',
        sourceHandle: 'bottom', targetHandle: 'top-t',
        style: { stroke: '#D97706', strokeWidth: 2 },
        data: { tipo: 'Fibra', origen: 'Manual', registradoCMDB: true,
          metadatos: { uuid: '', numeroEnlace: 'HSBC-01', puertoSalida: 'INET', etiquetaSalida: 'WAN', puertoLlegada: 'wan1', etiquetaLlegada: 'ISP', servicios: 'INTERNET', customFields: {} } }
      },
      {
        id: 'hsbc-e2', type: 'enlace', source: 'hsbc-fw', target: 'hsbc-core',
        sourceHandle: 'bottom', targetHandle: 'top-t',
        style: { stroke: '#2563EB', strokeWidth: 2 },
        data: { tipo: 'UTP', origen: 'Discovery', registradoCMDB: true,
          metadatos: { uuid: '', numeroEnlace: 'HSBC-02', puertoSalida: 'lan1', etiquetaSalida: 'LAN', puertoLlegada: 'Gi0/0', etiquetaLlegada: 'CORE', servicios: 'DATOS', customFields: {} } }
      },
      {
        id: 'hsbc-e3', type: 'enlace', source: 'hsbc-core', target: 'hsbc-sw1',
        sourceHandle: 'bottom', targetHandle: 'top-t',
        style: { stroke: '#2563EB', strokeWidth: 2 },
        data: { tipo: 'UTP', origen: 'Excel', registradoCMDB: false,
          metadatos: { uuid: '', numeroEnlace: 'HSBC-03', puertoSalida: 'Gi0/1', etiquetaSalida: 'PISO2', puertoLlegada: 'Gi1/0/1', etiquetaLlegada: 'UP', servicios: 'DATOS', customFields: {} } }
      },
      {
        id: 'hsbc-e4', type: 'enlace', source: 'hsbc-core', target: 'hsbc-sw2',
        sourceHandle: 'bottom', targetHandle: 'top-t',
        style: { stroke: '#2563EB', strokeWidth: 2 },
        data: { tipo: 'UTP', origen: 'Excel', registradoCMDB: false,
          metadatos: { uuid: '', numeroEnlace: 'HSBC-04', puertoSalida: 'Gi0/2', etiquetaSalida: 'PISO3', puertoLlegada: 'Gi1/0/1', etiquetaLlegada: 'UP', servicios: 'DATOS', customFields: {} } }
      }
    ]
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
    nodes: [
      {
        id: 'aicm-rb', type: 'dispositivo', position: { x: 60, y: 60 },
        data: {
          tipo: 'Radiobase', label: 'RB-T1-01', origen: 'Manual', registradoCMDB: true,
          metadatos: { hostname: 'RB-T1-01', modelo: 'RTN 950', ip: '10.80.0.1', serial: 'SN-AICM-RB', ubicacion: 'Torre T1', fabricante: 'Huawei', customFields: {} }
        }
      },
      {
        id: 'aicm-pop', type: 'dispositivo', position: { x: 260, y: 60 },
        data: {
          tipo: 'POP', label: 'POP-T1', origen: 'Discovery', registradoCMDB: true,
          metadatos: { hostname: 'POP-T1', modelo: 'Rack POP', ip: '10.80.0.2', serial: 'SN-AICM-POP', ubicacion: 'Terminal 1', fabricante: 'Nokia', customFields: {} }
        }
      },
      {
        id: 'aicm-olt', type: 'dispositivo', position: { x: 460, y: 60 },
        data: {
          tipo: 'OLT', label: 'OLT-T1-01', origen: 'Discovery', registradoCMDB: true,
          metadatos: { hostname: 'OLT-T1-01', modelo: 'MA5800', ip: '10.80.0.3', serial: 'SN-AICM-OLT', ubicacion: 'Terminal 1', fabricante: 'Huawei', customFields: {} }
        }
      },
      {
        id: 'aicm-splt', type: 'dispositivo', position: { x: 260, y: 220 },
        data: {
          tipo: 'Splitter', label: 'SPL-T1-01', origen: 'Manual', registradoCMDB: false,
          metadatos: { hostname: 'SPL-T1-01', modelo: '1:8', ip: '', serial: 'SN-AICM-SPL', ubicacion: 'Ducto T1', fabricante: 'Furukawa', customFields: {} }
        }
      },
      {
        id: 'aicm-ont1', type: 'dispositivo', position: { x: 60, y: 220 },
        data: {
          tipo: 'ONT', label: 'ONT-SALA-A', origen: 'Excel', registradoCMDB: false,
          metadatos: { hostname: 'ONT-SALA-A', modelo: 'HG8010', ip: '10.80.1.10', serial: 'SN-AICM-ON1', ubicacion: 'Sala A', fabricante: 'Huawei', customFields: {} }
        }
      },
      {
        id: 'aicm-ont2', type: 'dispositivo', position: { x: 460, y: 220 },
        data: {
          tipo: 'ONT', label: 'ONT-SALA-B', origen: 'Excel', registradoCMDB: false,
          metadatos: { hostname: 'ONT-SALA-B', modelo: 'HG8010', ip: '10.80.1.11', serial: 'SN-AICM-ON2', ubicacion: 'Sala B', fabricante: 'Huawei', customFields: {} }
        }
      }
    ],
    edges: [
      {
        id: 'aicm-e1', type: 'enlace', source: 'aicm-rb', target: 'aicm-pop',
        sourceHandle: 'right', targetHandle: 'left-t',
        style: { stroke: '#7C3AED', strokeWidth: 2, strokeDasharray: '8 4' },
        data: { tipo: 'Microonda', origen: 'Manual', registradoCMDB: true,
          metadatos: { uuid: '', numeroEnlace: 'AICM-01', puertoSalida: 'RF1', etiquetaSalida: 'MW', puertoLlegada: 'Gi0/0', etiquetaLlegada: 'POP', servicios: 'BACKHAUL', customFields: {} } }
      },
      {
        id: 'aicm-e2', type: 'enlace', source: 'aicm-pop', target: 'aicm-olt',
        sourceHandle: 'right', targetHandle: 'left-t',
        style: { stroke: '#D97706', strokeWidth: 2 },
        data: { tipo: 'Fibra', origen: 'Discovery', registradoCMDB: true,
          metadatos: { uuid: '', numeroEnlace: 'AICM-02', puertoSalida: 'P1', etiquetaSalida: 'OLT', puertoLlegada: 'UP', etiquetaLlegada: 'POP', servicios: 'GPON', customFields: {} } }
      },
      {
        id: 'aicm-e3', type: 'enlace', source: 'aicm-olt', target: 'aicm-splt',
        sourceHandle: 'bottom', targetHandle: 'top-t',
        style: { stroke: '#D97706', strokeWidth: 2 },
        data: { tipo: 'Fibra', origen: 'Discovery', registradoCMDB: false,
          metadatos: { uuid: '', numeroEnlace: 'AICM-03', puertoSalida: 'PON0', etiquetaSalida: 'FEED', puertoLlegada: 'IN', etiquetaLlegada: 'SPL', servicios: 'GPON', customFields: {} } }
      },
      {
        id: 'aicm-e4', type: 'enlace', source: 'aicm-splt', target: 'aicm-ont1',
        sourceHandle: 'left', targetHandle: 'right-t',
        style: { stroke: '#D97706', strokeWidth: 2 },
        data: { tipo: 'Fibra', origen: 'Excel', registradoCMDB: false,
          metadatos: { uuid: '', numeroEnlace: 'AICM-04', puertoSalida: 'OUT1', etiquetaSalida: 'DROP', puertoLlegada: 'PON', etiquetaLlegada: 'ONT', servicios: 'FTTH', customFields: {} } }
      },
      {
        id: 'aicm-e5', type: 'enlace', source: 'aicm-splt', target: 'aicm-ont2',
        sourceHandle: 'right', targetHandle: 'left-t',
        style: { stroke: '#D97706', strokeWidth: 2 },
        data: { tipo: 'Fibra', origen: 'Excel', registradoCMDB: false,
          metadatos: { uuid: '', numeroEnlace: 'AICM-05', puertoSalida: 'OUT2', etiquetaSalida: 'DROP', puertoLlegada: 'PON', etiquetaLlegada: 'ONT', servicios: 'FTTH', customFields: {} } }
      }
    ]
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
    nodes: [
      {
        id: 'bnt-prov', type: 'dispositivo', position: { x: 60, y: 300 },
        data: {
          tipo: 'Proveedor', label: 'PROV-AXTEL', origen: 'Manual', registradoCMDB: true,
          metadatos: { hostname: 'PROV-AXTEL', modelo: 'Metro-E', ip: '201.99.1.1', serial: 'SN-BNT-PRV', ubicacion: 'WAN', fabricante: 'Axtel', customFields: {} }
        }
      },
      {
        id: 'bnt-rt', type: 'dispositivo', position: { x: 280, y: 300 },
        data: {
          tipo: 'Router', label: 'RT-MTY-01', origen: 'Discovery', registradoCMDB: true,
          metadatos: { hostname: 'RT-MTY-01', modelo: 'ISR 4451', ip: '10.90.1.1', serial: 'SN-BNT-RT1', ubicacion: 'Sucursal MTY', fabricante: 'Cisco', customFields: {} }
        }
      },
      {
        id: 'bnt-sw', type: 'dispositivo', position: { x: 500, y: 300 },
        data: {
          tipo: 'Switch', label: 'SW-MTY-01', origen: 'Excel', registradoCMDB: true,
          metadatos: { hostname: 'SW-MTY-01', modelo: 'C9200', ip: '10.90.1.2', serial: 'SN-BNT-SW1', ubicacion: 'Sucursal MTY', fabricante: 'Cisco', customFields: {} }
        }
      },
      {
        id: 'bnt-cpe', type: 'dispositivo', position: { x: 720, y: 220 },
        data: {
          tipo: 'CPE', label: 'CPE-CAJERO-01', origen: 'Manual', registradoCMDB: false,
          metadatos: { hostname: 'CPE-CAJERO-01', modelo: 'RV340', ip: '10.90.2.10', serial: 'SN-BNT-CPE', ubicacion: 'ATM Lobby', fabricante: 'Cisco', customFields: {} }
        }
      },
      {
        id: 'bnt-med', type: 'dispositivo', position: { x: 720, y: 380 },
        data: {
          tipo: 'Medidor', label: 'MED-ENERGIA-01', origen: 'Excel', registradoCMDB: false,
          metadatos: { hostname: 'MED-ENERGIA-01', modelo: 'ION 7400', ip: '10.90.2.20', serial: 'SN-BNT-MED', ubicacion: 'Site MTY', fabricante: 'Schneider', customFields: {} }
        }
      }
    ],
    edges: [
      {
        id: 'bnt-e1', type: 'enlace', source: 'bnt-prov', target: 'bnt-rt',
        sourceHandle: 'right', targetHandle: 'left-t',
        style: { stroke: '#D97706', strokeWidth: 2 },
        data: { tipo: 'Fibra', origen: 'Manual', registradoCMDB: true,
          metadatos: { uuid: '', numeroEnlace: 'BNT-01', puertoSalida: 'WAN', etiquetaSalida: 'METRO', puertoLlegada: 'Gi0/0', etiquetaLlegada: 'WAN', servicios: 'INTERNET', customFields: {} } }
      },
      {
        id: 'bnt-e2', type: 'enlace', source: 'bnt-rt', target: 'bnt-sw',
        sourceHandle: 'right', targetHandle: 'left-t',
        style: { stroke: '#2563EB', strokeWidth: 2 },
        data: { tipo: 'UTP', origen: 'Discovery', registradoCMDB: true,
          metadatos: { uuid: '', numeroEnlace: 'BNT-02', puertoSalida: 'Gi0/1', etiquetaSalida: 'LAN', puertoLlegada: 'Gi1/0/1', etiquetaLlegada: 'UP', servicios: 'DATOS', customFields: {} } }
      },
      {
        id: 'bnt-e3', type: 'enlace', source: 'bnt-sw', target: 'bnt-cpe',
        sourceHandle: 'right', targetHandle: 'left-t',
        style: { stroke: '#2563EB', strokeWidth: 2 },
        data: { tipo: 'UTP', origen: 'Manual', registradoCMDB: false,
          metadatos: { uuid: '', numeroEnlace: 'BNT-03', puertoSalida: 'Gi1/0/5', etiquetaSalida: 'ATM', puertoLlegada: 'LAN', etiquetaLlegada: 'CPE', servicios: 'ATM', customFields: {} } }
      },
      {
        id: 'bnt-e4', type: 'enlace', source: 'bnt-sw', target: 'bnt-med',
        sourceHandle: 'right', targetHandle: 'left-t',
        style: { stroke: '#0D9488', strokeWidth: 1.5, strokeDasharray: '3 3' },
        data: { tipo: 'Logico', origen: 'Excel', registradoCMDB: false,
          metadatos: { uuid: '', numeroEnlace: 'BNT-04', puertoSalida: 'Gi1/0/6', etiquetaSalida: 'MON', puertoLlegada: 'ETH', etiquetaLlegada: 'MED', servicios: 'MONITOREO', customFields: {} } }
      }
    ]
  }
]
