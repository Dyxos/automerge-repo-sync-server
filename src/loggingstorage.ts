import { PostgresStorageAdapter } from "automerge-repo-storage-postgres"
import { Pool } from "pg"

// ...

class LoggingPostgresStorage extends PostgresStorageAdapter {
  async get(key: Uint8Array[]) {
    console.log("📥 STORAGE GET:", key)
    return await super.get(key)
  }

  async put(key: Uint8Array[], value: Uint8Array) {
    console.log("📤 STORAGE PUT:", key, "size:", value.length)
    return await super.put(key, value)
  }

  async remove(key: Uint8Array[]) {
    console.log("🗑️ STORAGE DELETE:", key)
    return await super.remove(key)
  }
}

export { LoggingPostgresStorage }