import { PostgresStorageAdapter as BaseAdapter } from "automerge-repo-storage-postgres"
import pg, { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

export class PostgresStorageAdapter extends BaseAdapter {
  constructor(table: string, pool: Pool) {
    super(table, pool)
  }
}