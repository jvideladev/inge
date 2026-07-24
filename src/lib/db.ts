import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise'

let pool: Pool | null = null

export function getPool(): Pool {
  if (pool) return pool

  const host = process.env.DB_HOST ?? '127.0.0.1'
  const port = Number(process.env.DB_PORT ?? '3307')
  const user = process.env.DB_USER ?? 'inge'
  const password = process.env.DB_PASSWORD ?? 'inge_dev'
  const database = process.env.DB_NAME ?? 'ingenierias'

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    dateStrings: false,
  })

  return pool
}

export type { ResultSetHeader, RowDataPacket }
