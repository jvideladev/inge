/**
 * Seed de ingenierías demo (solo lectura) desde src/data/mock.ts
 * Uso: npx tsx scripts/seed-demos.ts
 */
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

async function main() {
  const { INGENIERIAS_MOCK } = await import('../src/data/mock')
  const { upsertDemoIngenieria, listIngenierias } = await import('../src/lib/ingenierias.repo')

  console.log(`Sembrando ${INGENIERIAS_MOCK.length} ingenierías demo (editable=0)...`)
  for (const ing of INGENIERIAS_MOCK) {
    await upsertDemoIngenieria(ing)
    console.log(`  ✓ ${ing.id} — ${ing.nombre}`)
  }

  const all = await listIngenierias()
  console.log(`Listo. Total en BD: ${all.length}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
