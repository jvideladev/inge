/**
 * Mock del servicio Discovery (mientras Totalplay no entrega el endpoint real).
 * Genera una topología mínima; todos los objetos vienen con origen Discovery y core=true.
 */
import { generarId } from '@/lib/utils'
import { crearEnlaceSimple } from '@/lib/enlace'
import type { DispositivoData } from '@/types'

export function mockDiscoveryPorIp(ip: string): { nodes: any[]; edges: any[] } {
  const base = ip.replace(/\./g, '-')
  const idRouter = generarId('disc-rt')
  const idSwitch = generarId('disc-sw')
  const idCpe = generarId('disc-cpe')

  const mkDisp = (
    id: string,
    tipo: DispositivoData['tipo'],
    label: string,
    hostIp: string,
    x: number,
    y: number,
  ) => ({
    id,
    type: 'dispositivo',
    position: { x, y },
    data: {
      tipo,
      label,
      origen: 'Discovery' as const,
      registradoCMDB: false,
      core: true,
      metadatos: {
        hostname: label,
        modelo: 'Discovery-mock',
        ip: hostIp,
        serial: `SN-${base}`,
        ubicacion: '',
        fabricante: '',
        customFields: { discoveryIpSeed: ip },
      },
    } satisfies DispositivoData,
  })

  const nodes = [
    mkDisp(idRouter, 'Router', `RT-${base}`, ip, 120, 80),
    mkDisp(idSwitch, 'Switch', `SW-${base}`, sugIp(ip, 2), 320, 180),
    mkDisp(idCpe, 'CPE', `CPE-${base}`, sugIp(ip, 10), 520, 280),
  ]

  const edges = [
    {
      id: generarId('disc-e'),
      type: 'enlace',
      source: idRouter,
      target: idSwitch,
      sourceHandle: 'right',
      targetHandle: 'left-t',
      data: {
        ...crearEnlaceSimple({
          tipo: 'Fibra',
          origen: 'Discovery',
          metadatos: { numeroEnlace: `ENL-${base}-01`, puertoSalida: 'Gi0/0', puertoLlegada: 'Gi1/0/1' },
        }),
        core: true,
      },
    },
    {
      id: generarId('disc-e'),
      type: 'enlace',
      source: idSwitch,
      target: idCpe,
      sourceHandle: 'right',
      targetHandle: 'left-t',
      data: {
        ...crearEnlaceSimple({
          tipo: 'UTP',
          origen: 'Discovery',
          metadatos: { numeroEnlace: `ENL-${base}-02`, puertoSalida: 'Gi1/0/24', puertoLlegada: 'eth0' },
        }),
        core: true,
      },
    },
  ]

  return { nodes, edges }
}

function sugIp(ip: string, lastOctet: number): string {
  const parts = ip.split('.')
  if (parts.length !== 4) return ip
  parts[3] = String(lastOctet)
  return parts.join('.')
}
