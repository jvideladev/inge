import type { TipoDispositivo } from '@/types'

export interface DispositivoConfig {
  tipo:    TipoDispositivo
  label:   string
  columna: 1 | 2
  /**
   * Identifica el ícono. Actualmente mapea al componente en DeviceIcons.tsx.
   * Al integrar la BD, este valor vendrá como ruta al archivo de imagen del ícono.
   */
  iconKey: string
}

export const DISPOSITIVOS_CONFIG: readonly DispositivoConfig[] = [
  // ── Columna 1 ──────────────────────────────────────────────────────────────
  { tipo: 'Router',       label: 'Router',        columna: 1, iconKey: 'Router'       },
  { tipo: 'OLT',          label: 'OLT',           columna: 1, iconKey: 'OLT'          },
  { tipo: 'Proveedor',    label: 'Proveedor',     columna: 1, iconKey: 'Proveedor'    },
  { tipo: 'Firewall',     label: 'Firewall',      columna: 1, iconKey: 'Firewall'     },
  { tipo: 'Medidor',      label: 'Medidor',       columna: 1, iconKey: 'Medidor'      },
  { tipo: 'NubeTerceros', label: 'Nube terceros', columna: 1, iconKey: 'NubeTerceros' },
  { tipo: 'CPE',          label: 'CPE',           columna: 1, iconKey: 'CPE'          },
  { tipo: 'LAN',          label: 'LAN',           columna: 1, iconKey: 'LAN'          },
  { tipo: 'Setup',        label: 'Setup',         columna: 1, iconKey: 'Setup'        },
  // ── Columna 2 ──────────────────────────────────────────────────────────────
  { tipo: 'Switch',       label: 'Switch',        columna: 2, iconKey: 'Switch'       },
  { tipo: 'ONT',          label: 'ONT',           columna: 2, iconKey: 'ONT'          },
  { tipo: 'POP',          label: 'POP',           columna: 2, iconKey: 'POP'          },
  { tipo: 'Colector',     label: 'Colector',      columna: 2, iconKey: 'Colector'     },
  { tipo: 'NubeTP',       label: 'Nube TP',       columna: 2, iconKey: 'NubeTP'       },
  { tipo: 'Radiobase',    label: 'Radiobase',     columna: 2, iconKey: 'Radiobase'    },
  { tipo: 'AccessPoint',  label: 'Access point',  columna: 2, iconKey: 'AccessPoint'  },
  { tipo: 'Server',       label: 'Server',        columna: 2, iconKey: 'Server'       },
  { tipo: 'Splitter',     label: 'Splitter',      columna: 2, iconKey: 'Splitter'     },
] as const
