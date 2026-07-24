'use client'
import type { TipoDispositivo } from '@/types'

interface IconProps { size?: number; color?: string; strokeColor?: string }

export function RouterIcon({ size = 40, color = '#1E3A5F', strokeColor = '#2563EB' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      <circle cx="20" cy="20" r="9" fill="none" stroke={strokeColor} strokeWidth="1.4"/>
      <line x1="20" y1="11" x2="20" y2="5" stroke={strokeColor} strokeWidth="1.4"/>
      <polygon points="20,2 17.5,6 22.5,6" fill={strokeColor}/>
      <line x1="20" y1="29" x2="20" y2="35" stroke={strokeColor} strokeWidth="1.4"/>
      <polygon points="20,38 17.5,34 22.5,34" fill={strokeColor}/>
      <line x1="11" y1="20" x2="5" y2="20" stroke={strokeColor} strokeWidth="1.4"/>
      <polygon points="2,20 6,17.5 6,22.5" fill={strokeColor}/>
      <line x1="29" y1="20" x2="35" y2="20" stroke={strokeColor} strokeWidth="1.4"/>
      <polygon points="38,20 34,17.5 34,22.5" fill={strokeColor}/>
      <circle cx="20" cy="20" r="2.2" fill={strokeColor} opacity="0.9"/>
    </svg>
  )
}

export function SwitchIcon({ size = 40, color = '#052018', strokeColor = '#0D9488' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      <rect x="6" y="14" width="28" height="12" rx="2.5" fill="none" stroke={strokeColor} strokeWidth="1.2"/>
      <rect x="9" y="17" width="2.5" height="6" rx="1" fill={strokeColor} opacity="0.6"/>
      <rect x="13" y="17" width="2.5" height="6" rx="1" fill={strokeColor} opacity="0.6"/>
      <rect x="17" y="17" width="2.5" height="6" rx="1" fill={strokeColor} opacity="0.6"/>
      <rect x="21" y="17" width="2.5" height="6" rx="1" fill={strokeColor} opacity="0.6"/>
      <circle cx="30" cy="19" r="1.8" fill={strokeColor}/>
      <circle cx="30" cy="25" r="1.8" fill={strokeColor} opacity="0.4"/>
      <line x1="11" y1="13" x2="11" y2="9" stroke={strokeColor} strokeWidth="1.2"/>
      <polygon points="11,7 9,11 13,11" fill={strokeColor}/>
      <line x1="22" y1="27" x2="22" y2="31" stroke={strokeColor} strokeWidth="1.2"/>
      <polygon points="22,34 20,30 24,30" fill={strokeColor}/>
    </svg>
  )
}

export function FirewallIcon({ size = 40, color = '#2A0A0A', strokeColor = '#DC2626' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      <path d="M20,5 L34,10 L34,22 Q34,34 20,37 Q6,34 6,22 L6,10 Z" fill="none" stroke={strokeColor} strokeWidth="1.3"/>
      <line x1="6" y1="19" x2="34" y2="19" stroke={strokeColor} strokeWidth="1" opacity="0.4"/>
      <line x1="20" y1="10" x2="20" y2="37" stroke={strokeColor} strokeWidth="1" opacity="0.3"/>
      <circle cx="14" cy="26" r="2.5" fill={strokeColor} opacity="0.45"/>
      <circle cx="26" cy="26" r="2.5" fill="#0D9488" opacity="0.45"/>
    </svg>
  )
}

export function ServerIcon({ size = 40, color = '#0A1F10', strokeColor = '#16A34A' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      <rect x="7" y="7"  width="26" height="7" rx="2" fill="none" stroke={strokeColor} strokeWidth="1.2"/>
      <rect x="7" y="17" width="26" height="7" rx="2" fill="none" stroke={strokeColor} strokeWidth="1.2"/>
      <rect x="7" y="27" width="26" height="7" rx="2" fill="none" stroke={strokeColor} strokeWidth="1.2"/>
      <circle cx="29" cy="10.5" r="1.6" fill={strokeColor}/>
      <circle cx="29" cy="20.5" r="1.6" fill={strokeColor} opacity="0.5"/>
      <circle cx="29" cy="30.5" r="1.6" fill={strokeColor} opacity="0.3"/>
      <rect x="9" y="9"  width="14" height="2" rx="1" fill={strokeColor} opacity="0.4"/>
      <rect x="9" y="19" width="14" height="2" rx="1" fill={strokeColor} opacity="0.4"/>
      <rect x="9" y="29" width="14" height="2" rx="1" fill={strokeColor} opacity="0.4"/>
    </svg>
  )
}

export function OLTIcon({ size = 40, color = '#180D36', strokeColor = '#7C3AED' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      <rect x="14" y="4" width="12" height="32" rx="2.5" fill="none" stroke={strokeColor} strokeWidth="1.2"/>
      <rect x="17" y="8"  width="6" height="1.5" rx="1" fill={strokeColor} opacity="0.6"/>
      <rect x="17" y="12" width="6" height="1.5" rx="1" fill={strokeColor} opacity="0.6"/>
      <rect x="17" y="16" width="6" height="1.5" rx="1" fill={strokeColor} opacity="0.6"/>
      <rect x="17" y="20" width="6" height="1.5" rx="1" fill={strokeColor} opacity="0.6"/>
      <circle cx="20" cy="29" r="3" fill={strokeColor} opacity="0.2" stroke={strokeColor} strokeWidth="1"/>
      <circle cx="20" cy="29" r="1.2" fill={strokeColor}/>
      <line x1="20" y1="1" x2="20" y2="4" stroke={strokeColor} strokeWidth="1.5"/>
    </svg>
  )
}

export function ONTIcon({ size = 40, color = '#2A1800', strokeColor = '#D97706' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      <rect x="6" y="22" width="28" height="14" rx="2.5" fill="none" stroke={strokeColor} strokeWidth="1.2"/>
      <line x1="20" y1="9" x2="12" y2="22" stroke={strokeColor} strokeWidth="1.4"/>
      <line x1="20" y1="9" x2="20" y2="22" stroke={strokeColor} strokeWidth="1.4"/>
      <line x1="20" y1="9" x2="28" y2="22" stroke={strokeColor} strokeWidth="1.4"/>
      <circle cx="20" cy="8" r="2.5" fill={strokeColor} opacity="0.9"/>
      <circle cx="12" cy="30" r="1.8" fill={strokeColor} opacity="0.6"/>
      <circle cx="18" cy="30" r="1.8" fill={strokeColor} opacity="0.6"/>
      <circle cx="24" cy="30" r="1.8" fill={strokeColor} opacity="0.6"/>
      <circle cx="30" cy="30" r="1.8" fill={strokeColor} opacity="0.3"/>
    </svg>
  )
}

export function AccessPointIcon({ size = 40, color = '#2A1200', strokeColor = '#E07830' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      <circle cx="20" cy="22" r="5" fill="none" stroke={strokeColor} strokeWidth="1.3"/>
      <path d="M12,14 Q20,6 28,14" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8,10 Q20,1 32,10" fill="none" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      <line x1="20" y1="27" x2="20" y2="33" stroke={strokeColor} strokeWidth="1.5"/>
      <line x1="15" y1="33" x2="25" y2="33" stroke={strokeColor} strokeWidth="1.5"/>
    </svg>
  )
}

export function SplitterIcon({ size = 40, color = '#1A0A2E', strokeColor = '#A855F7' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      <line x1="8" y1="20" x2="20" y2="20" stroke={strokeColor} strokeWidth="1.5"/>
      <line x1="20" y1="20" x2="32" y2="12" stroke={strokeColor} strokeWidth="1.5"/>
      <line x1="20" y1="20" x2="32" y2="20" stroke={strokeColor} strokeWidth="1.5"/>
      <line x1="20" y1="20" x2="32" y2="28" stroke={strokeColor} strokeWidth="1.5"/>
      <circle cx="20" cy="20" r="3" fill={strokeColor} opacity="0.3" stroke={strokeColor} strokeWidth="1"/>
    </svg>
  )
}

// ── New Cisco-style icons ──────────────────────────────────────────────────────

export function ProveedorIcon({ size = 40, color = '#0C1E38', strokeColor = '#4B9EE8' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      {/* Building */}
      <rect x="9" y="22" width="22" height="14" rx="1.5" fill="none" stroke={strokeColor} strokeWidth="1.2"/>
      <rect x="13" y="26" width="4" height="4" rx="0.5" fill={strokeColor} opacity="0.4"/>
      <rect x="23" y="26" width="4" height="4" rx="0.5" fill={strokeColor} opacity="0.4"/>
      <rect x="18" y="29" width="4" height="7" rx="0.5" fill={strokeColor} opacity="0.3"/>
      {/* Cloud above building */}
      <path d="M8,23 Q6,16 11,13 Q12,7 19,7 Q26,7 27,13 Q33,13 33,19 Q33,23 28,23Z"
        fill="none" stroke={strokeColor} strokeWidth="1.2"/>
    </svg>
  )
}

export function MedidorIcon({ size = 40, color = '#0A2010', strokeColor = '#22C55E' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      {/* Gauge arc background */}
      <path d="M8,30 A14,14 0 0,1 32,30" fill="none" stroke={strokeColor} strokeWidth="1" opacity="0.2"/>
      {/* Gauge segments (low / mid / high) */}
      <path d="M9,30 A13,13 0 0,1 14,18" fill="none" stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round" opacity="0.25"/>
      <path d="M14,18 A13,13 0 0,1 26,18" fill="none" stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round" opacity="0.55"/>
      <path d="M26,18 A13,13 0 0,1 31,30" fill="none" stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round" opacity="0.9"/>
      {/* Needle */}
      <line x1="20" y1="30" x2="27" y2="17" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="20" cy="30" r="2.5" fill={strokeColor}/>
      {/* Tick marks */}
      <line x1="8" y1="30" x2="10.5" y2="30" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="32" y1="30" x2="29.5" y2="30" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="20" y1="9" x2="20" y2="11.5" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export function NubeTercerosIcon({ size = 40, color = '#1A2030', strokeColor = '#94A3B8' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      {/* Cloud */}
      <path d="M5,29 Q3,22 9,18 Q10,10 18,10 Q26,10 27,17 Q34,17 34,24 Q34,31 27,31 L9,31 Q4,31 5,29Z"
        fill="none" stroke={strokeColor} strokeWidth="1.3"/>
      {/* External link arrow */}
      <line x1="21" y1="23" x2="28" y2="16" stroke={strokeColor} strokeWidth="1.3" strokeLinecap="round"/>
      <polyline points="24.5,15 28.5,15 28.5,19" fill="none" stroke={strokeColor} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function CPEIcon({ size = 40, color = '#1C0E00', strokeColor = '#F59E0B' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      {/* House */}
      <polygon points="20,7 8,17 10,17 10,24 30,24 30,17 32,17"
        fill="none" stroke={strokeColor} strokeWidth="1.3" strokeLinejoin="round"/>
      <rect x="16" y="17" width="8" height="7" rx="0.5" fill={strokeColor} opacity="0.35"/>
      {/* Device ports strip */}
      <rect x="7" y="27" width="26" height="8" rx="2" fill="none" stroke={strokeColor} strokeWidth="1.2"/>
      <circle cx="12" cy="31" r="1.5" fill={strokeColor} opacity="0.8"/>
      <circle cx="18" cy="31" r="1.5" fill={strokeColor} opacity="0.8"/>
      <circle cx="24" cy="31" r="1.5" fill={strokeColor} opacity="0.8"/>
      <circle cx="30" cy="31" r="1.5" fill={strokeColor} opacity="0.35"/>
    </svg>
  )
}

export function LANIcon({ size = 40, color = '#0A1830', strokeColor = '#3B82F6' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      {/* Central hub */}
      <circle cx="20" cy="20" r="4" fill="none" stroke={strokeColor} strokeWidth="1.3"/>
      <circle cx="20" cy="20" r="1.5" fill={strokeColor} opacity="0.7"/>
      {/* Spokes + endpoint nodes */}
      <line x1="20" y1="16" x2="20" y2="10" stroke={strokeColor} strokeWidth="1.1"/>
      <rect x="17" y="7" width="6" height="4" rx="1" fill="none" stroke={strokeColor} strokeWidth="1"/>
      <line x1="23.8" y1="17" x2="29" y2="12" stroke={strokeColor} strokeWidth="1.1"/>
      <rect x="27" y="9" width="5" height="4" rx="1" fill="none" stroke={strokeColor} strokeWidth="1"/>
      <line x1="24" y1="20" x2="31" y2="20" stroke={strokeColor} strokeWidth="1.1"/>
      <rect x="30" y="18" width="5" height="4" rx="1" fill="none" stroke={strokeColor} strokeWidth="1"/>
      <line x1="16" y1="20" x2="9" y2="20" stroke={strokeColor} strokeWidth="1.1"/>
      <rect x="5" y="18" width="5" height="4" rx="1" fill="none" stroke={strokeColor} strokeWidth="1"/>
      <line x1="16.2" y1="23" x2="11" y2="28" stroke={strokeColor} strokeWidth="1.1"/>
      <rect x="8" y="27" width="5" height="4" rx="1" fill="none" stroke={strokeColor} strokeWidth="1"/>
      <line x1="20" y1="24" x2="20" y2="30" stroke={strokeColor} strokeWidth="1.1"/>
      <rect x="17" y="29" width="6" height="4" rx="1" fill="none" stroke={strokeColor} strokeWidth="1"/>
    </svg>
  )
}

export function SetupIcon({ size = 40, color = '#1E0A40', strokeColor = '#9333EA' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      {/* Gear ring + hole */}
      <circle cx="20" cy="20" r="9" fill="none" stroke={strokeColor} strokeWidth="1.3"/>
      <circle cx="20" cy="20" r="3.5" fill="none" stroke={strokeColor} strokeWidth="1.3"/>
      <circle cx="20" cy="20" r="1.2" fill={strokeColor}/>
      {/* 8 teeth */}
      <line x1="20" y1="29" x2="20" y2="32.5" stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round"/>
      <line x1="20" y1="11" x2="20" y2="7.5"  stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round"/>
      <line x1="29" y1="20" x2="32.5" y2="20"  stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round"/>
      <line x1="11" y1="20" x2="7.5"  y2="20"  stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round"/>
      <line x1="26.4" y1="26.4" x2="28.7" y2="28.7" stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round" opacity="0.7"/>
      <line x1="13.6" y1="13.6" x2="11.3" y2="11.3" stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round" opacity="0.7"/>
      <line x1="26.4" y1="13.6" x2="28.7" y2="11.3" stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round" opacity="0.7"/>
      <line x1="13.6" y1="26.4" x2="11.3" y2="28.7" stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round" opacity="0.7"/>
    </svg>
  )
}

export function POPIcon({ size = 40, color = '#0A2020', strokeColor = '#06B6D4' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      {/* Router/switch chassis */}
      <rect x="5" y="18" width="22" height="12" rx="2" fill="none" stroke={strokeColor} strokeWidth="1.2"/>
      <circle cx="10" cy="24" r="1.5" fill={strokeColor} opacity="0.8"/>
      <circle cx="15" cy="24" r="1.5" fill={strokeColor} opacity="0.6"/>
      <circle cx="20" cy="24" r="1.5" fill={strokeColor} opacity="0.4"/>
      <line x1="8"  y1="18" x2="8"  y2="14" stroke={strokeColor} strokeWidth="1.2"/>
      <line x1="16" y1="18" x2="16" y2="14" stroke={strokeColor} strokeWidth="1.2"/>
      <line x1="8"  y1="30" x2="8"  y2="34" stroke={strokeColor} strokeWidth="1.2"/>
      {/* Location drop-pin top-right */}
      <circle cx="32" cy="14" r="6" fill="none" stroke={strokeColor} strokeWidth="1.2"/>
      <circle cx="32" cy="13" r="2.5" fill={strokeColor} opacity="0.5"/>
      <line x1="32" y1="20" x2="32" y2="24" stroke={strokeColor} strokeWidth="1.2"/>
      <polygon points="32,27 30,24 34,24" fill={strokeColor} opacity="0.7"/>
    </svg>
  )
}

export function ColectorIcon({ size = 40, color = '#0A1820', strokeColor = '#10B981' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      {/* Source nodes */}
      <rect x="5"  y="5" width="6" height="4" rx="1" fill="none" stroke={strokeColor} strokeWidth="1" opacity="0.7"/>
      <rect x="17" y="3" width="6" height="4" rx="1" fill="none" stroke={strokeColor} strokeWidth="1" opacity="0.7"/>
      <rect x="29" y="5" width="6" height="4" rx="1" fill="none" stroke={strokeColor} strokeWidth="1" opacity="0.7"/>
      {/* Converging lines */}
      <line x1="8"  y1="9" x2="18" y2="20" stroke={strokeColor} strokeWidth="1.2" opacity="0.6"/>
      <line x1="20" y1="7" x2="20" y2="20" stroke={strokeColor} strokeWidth="1.2" opacity="0.6"/>
      <line x1="32" y1="9" x2="22" y2="20" stroke={strokeColor} strokeWidth="1.2" opacity="0.6"/>
      {/* Central aggregator */}
      <circle cx="20" cy="22" r="5.5" fill="none" stroke={strokeColor} strokeWidth="1.3"/>
      <circle cx="20" cy="22" r="2" fill={strokeColor} opacity="0.6"/>
      {/* Output arrow */}
      <line x1="20" y1="27.5" x2="20" y2="33" stroke={strokeColor} strokeWidth="1.3"/>
      <polygon points="20,36 17.5,33 22.5,33" fill={strokeColor} opacity="0.7"/>
    </svg>
  )
}

export function NubeTPIcon({ size = 40, color = '#071830', strokeColor = '#2563EB' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      {/* Cloud */}
      <path d="M5,29 Q3,22 9,18 Q10,10 18,10 Q26,10 27,17 Q34,17 34,24 Q34,31 27,31 L9,31 Q4,31 5,29Z"
        fill="none" stroke={strokeColor} strokeWidth="1.3"/>
      {/* T = Totalplay */}
      <line x1="13" y1="18" x2="27" y2="18" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="20" y1="18" x2="20" y2="27" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function RadiobaseIcon({ size = 40, color = '#1A1020', strokeColor = '#C084FC' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="7" fill={color} stroke={strokeColor} strokeWidth="1.5"/>
      {/* Tower mast */}
      <line x1="20" y1="8" x2="20" y2="36" stroke={strokeColor} strokeWidth="1.5"/>
      {/* Tower legs */}
      <line x1="11" y1="36" x2="20" y2="22" stroke={strokeColor} strokeWidth="1.2" opacity="0.6"/>
      <line x1="29" y1="36" x2="20" y2="22" stroke={strokeColor} strokeWidth="1.2" opacity="0.6"/>
      {/* Cross braces */}
      <line x1="13" y1="30" x2="27" y2="30" stroke={strokeColor} strokeWidth="0.9" opacity="0.4"/>
      <line x1="15" y1="25" x2="25" y2="25" stroke={strokeColor} strokeWidth="0.9" opacity="0.4"/>
      {/* Signal arcs */}
      <path d="M13,14 Q20,7 27,14" fill="none" stroke={strokeColor} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M9,10 Q20,2 31,10" fill="none" stroke={strokeColor} strokeWidth="1.1" strokeLinecap="round" opacity="0.5"/>
      {/* Antenna cap */}
      <circle cx="20" cy="7.5" r="1.8" fill={strokeColor}/>
    </svg>
  )
}

// ── Map ───────────────────────────────────────────────────────────────────────

const ICON_MAP: Record<TipoDispositivo, React.FC<IconProps>> = {
  Router:       RouterIcon,
  OLT:          OLTIcon,
  Proveedor:    ProveedorIcon,
  Firewall:     FirewallIcon,
  Medidor:      MedidorIcon,
  NubeTerceros: NubeTercerosIcon,
  CPE:          CPEIcon,
  LAN:          LANIcon,
  Setup:        SetupIcon,
  Switch:       SwitchIcon,
  ONT:          ONTIcon,
  POP:          POPIcon,
  Colector:     ColectorIcon,
  NubeTP:       NubeTPIcon,
  Radiobase:    RadiobaseIcon,
  AccessPoint:  AccessPointIcon,
  Server:       ServerIcon,
  Splitter:     SplitterIcon,
}

export function DeviceIcon({ tipo, size, color, strokeColor }: { tipo: string } & IconProps) {
  const Comp = ICON_MAP[tipo as TipoDispositivo]
  return Comp ? <Comp size={size} color={color} strokeColor={strokeColor} /> : null
}

// ── Light variants ─────────────────────────────────────────────────────────────

export const LIGHT_COLORS: Partial<Record<TipoDispositivo, { color: string; strokeColor: string }>> = {
  Router:       { color: '#EFF6FF', strokeColor: '#2563EB' },
  OLT:          { color: '#F5F3FF', strokeColor: '#7C3AED' },
  Proveedor:    { color: '#EFF6FF', strokeColor: '#3B82F6' },
  Firewall:     { color: '#FEF2F2', strokeColor: '#DC2626' },
  Medidor:      { color: '#F0FDF4', strokeColor: '#16A34A' },
  NubeTerceros: { color: '#F8FAFC', strokeColor: '#64748B' },
  CPE:          { color: '#FFFBEB', strokeColor: '#D97706' },
  LAN:          { color: '#EFF6FF', strokeColor: '#2563EB' },
  Setup:        { color: '#FAF5FF', strokeColor: '#7C3AED' },
  Switch:       { color: '#F0FDFA', strokeColor: '#0D9488' },
  ONT:          { color: '#FFFBEB', strokeColor: '#D97706' },
  POP:          { color: '#ECFEFF', strokeColor: '#0891B2' },
  Colector:     { color: '#F0FDF4', strokeColor: '#059669' },
  NubeTP:       { color: '#EFF6FF', strokeColor: '#1D4ED8' },
  Radiobase:    { color: '#FAF5FF', strokeColor: '#9333EA' },
  AccessPoint:  { color: '#FFF7ED', strokeColor: '#EA580C' },
  Server:       { color: '#F0FDF4', strokeColor: '#16A34A' },
  Splitter:     { color: '#FAF5FF', strokeColor: '#A855F7' },
}
