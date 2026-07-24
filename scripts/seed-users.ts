/**
 * Seed de usuarios locales (password hasheada).
 * Uso: npx tsx scripts/seed-users.ts
 *
 * Credenciales demo:
 *   operativo@correo.com  / 123456  (Operativo)
 *   supervisor@correo.com / 123456  (Supervisor)
 *   consulta@correo.com   / 123456  (Consulta)
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { spawnSync } from 'child_process'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const USERS = [
  { id: 'u1', nombre: 'Carlos Méndez', email: 'operativo@correo.com', password: '123456', perfil: 'Operativo' },
  { id: 'u2', nombre: 'Laura Sánchez', email: 'supervisor@correo.com', password: '123456', perfil: 'Supervisor' },
  { id: 'u3', nombre: 'Roberto Pérez', email: 'consulta@correo.com', password: '123456', perfil: 'Consulta' },
]

async function main() {
  // Aplicar schema auth si hace falta
  const mysql = process.env.MYSQL_CLI ?? 'C:/wamp64/bin/mariadb/mariadb11.5.2/bin/mysql.exe'
  const schema = readFileSync(resolve(process.cwd(), 'sql/schema-auth.sql'), 'utf8')
  spawnSync(mysql, ['-u', 'root', '-P', '3307', '--default-character-set=utf8mb4'], {
    input: schema,
    encoding: 'utf8',
  })

  const { upsertLocalUser } = await import('../src/lib/auth/local.provider')
  const { getPool } = await import('../src/lib/db')

  for (const u of USERS) {
    await upsertLocalUser(u)
    console.log(`  ✓ ${u.email} (${u.perfil})`)
  }

  const pool = getPool()
  const [[{ c }]]: any = await pool.query('SELECT COUNT(*) c FROM usuarios')
  console.log(`OK — ${c} usuarios en BD`)
  await pool.end()
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
