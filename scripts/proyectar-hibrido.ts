/**
 * Aplica proyección híbrida a todas las ingenierías activas (backfill).
 * Uso: npx tsx scripts/proyectar-hibrido.ts
 */
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const { proyectarTodasLasIngenierias } = await import('../src/lib/proyeccion')
  const results = await proyectarTodasLasIngenierias()
  const ok = results.filter((r) => r.ok).length
  const fail = results.filter((r) => !r.ok)
  console.log(`Proyectadas: ${ok}/${results.length}`)
  for (const f of fail) {
    console.error(`  FAIL ${f.id}: ${f.error}`)
  }
  if (fail.length) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
