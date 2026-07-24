import { getPool, type RowDataPacket } from '@/lib/db'
import { hashPassword, newSessionToken, verifyPassword } from '@/lib/auth/password'
import type { AuthProvider, AuthSession, AuthUser, LoginCredentials } from '@/lib/auth/types'

interface UsuarioRow extends RowDataPacket {
  id: string
  nombre: string
  email: string
  password_hash: string | null
  perfil: string
  activo: number
}

const SESSION_HOURS = Number(process.env.AUTH_SESSION_HOURS ?? '12')

function mapUser(row: UsuarioRow): AuthUser {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    perfil: row.perfil,
  }
}

/**
 * Auth local: email + password en MariaDB + sesiones en auth_sesiones.
 * Sustituible por LdapAuthProvider / OAuthAuthProvider sin cambiar las rutas API.
 */
export class LocalAuthProvider implements AuthProvider {
  readonly name = 'local' as const

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const email = credentials.email.trim().toLowerCase()
    const password = credentials.password

    if (!email || !password) {
      throw Object.assign(new Error('Captura usuario y contraseña.'), { status: 400 })
    }

    const pool = getPool()
    const [rows] = await pool.query<UsuarioRow[]>(
      `SELECT id, nombre, email, password_hash, perfil, activo
       FROM usuarios
       WHERE LOWER(email) = :email
       LIMIT 1`,
      { email },
    )

    const row = rows[0]
    if (!row || !row.activo) {
      throw Object.assign(new Error('Usuario o contraseña incorrectos.'), { status: 401 })
    }
    if (!row.password_hash || !verifyPassword(password, row.password_hash)) {
      throw Object.assign(new Error('Usuario o contraseña incorrectos.'), { status: 401 })
    }

    const token = newSessionToken()
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000)

    await pool.execute(
      `INSERT INTO auth_sesiones (token, usuario_id, provider, creada_en, expira_en, revocada)
       VALUES (:token, :usuarioId, 'local', UTC_TIMESTAMP(3), :expiraEn, 0)`,
      { token, usuarioId: row.id, expiraEn: expiresAt },
    )

    return {
      token,
      provider: 'local',
      expiresAt: expiresAt.toISOString(),
      user: mapUser(row),
    }
  }

  async validateToken(token: string): Promise<AuthUser | null> {
    if (!token) return null
    const pool = getPool()
    const [rows] = await pool.query<(UsuarioRow & { expira_en: Date; revocada: number })[]>(
      `SELECT u.id, u.nombre, u.email, u.password_hash, u.perfil, u.activo,
              s.expira_en, s.revocada
       FROM auth_sesiones s
       INNER JOIN usuarios u ON u.id = s.usuario_id
       WHERE s.token = :token
       LIMIT 1`,
      { token },
    )

    const row = rows[0]
    if (!row || row.revocada || !row.activo) return null
    if (new Date(row.expira_en).getTime() < Date.now()) return null
    return mapUser(row)
  }

  async logout(token: string): Promise<void> {
    if (!token) return
    const pool = getPool()
    await pool.execute(
      `UPDATE auth_sesiones SET revocada = 1 WHERE token = :token`,
      { token },
    )
  }
}

/** Utilidad de seed / alta de usuarios locales */
export async function upsertLocalUser(params: {
  id: string
  nombre: string
  email: string
  password: string
  perfil: string
}) {
  const pool = getPool()
  const passwordHash = hashPassword(params.password)
  await pool.execute(
    `INSERT INTO usuarios (id, nombre, email, password_hash, perfil, activo)
     VALUES (:id, :nombre, :email, :passwordHash, :perfil, 1)
     ON DUPLICATE KEY UPDATE
       nombre = VALUES(nombre),
       email = VALUES(email),
       password_hash = VALUES(password_hash),
       perfil = VALUES(perfil),
       activo = 1,
       modificado_en = UTC_TIMESTAMP(3)`,
    {
      id: params.id,
      nombre: params.nombre,
      email: params.email.toLowerCase(),
      passwordHash,
      perfil: params.perfil,
    },
  )
}
