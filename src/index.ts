import express from "express"
import http from "http"
import { WebSocketServer } from "ws"
import { Repo } from "@automerge/automerge-repo"
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket"
import { PostgresStorageAdapter } from "automerge-repo-storage-postgres"
import { Pool } from "pg"
import { authMiddleware } from "./auth-middleware.js"

const PORT = Number(process.env.PORT ?? 3030)
const POSTGRES_TABLE = process.env.POSTGRES_TABLE ?? "automerge_store"

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

const storage = new PostgresStorageAdapter(POSTGRES_TABLE, pool)

const app = express()
app.use(authMiddleware)

// Create HTTP server (cast to any so TS stops complaining about Express vs RequestListener)
const server = http.createServer(app as any)

// WebSocket server
const wss = new WebSocketServer({ noServer: true })

server.on("upgrade", (request, socket, head) => {
  console.log("⬆️ HTTP -> WebSocket upgrade")
  wss.handleUpgrade(request, socket, head, (ws) => {
    console.log("🔌 WS connection established")
    wss.emit("connection", ws, request)
  })
})

// Basic WS logging
wss.on("connection", (socket, request) => {
  console.log("🔌 WebSocket connected:", request.socket.remoteAddress)

  socket.on("close", () => console.log("❌ WebSocket disconnected"))
  socket.on("error", (err) => console.error("⚠️ WebSocket error:", err))

  socket.on("message", (msg) => {
    // msg is usually a Buffer here
    const len =
      typeof msg === "string"
        ? msg.length
        : (msg as Buffer)?.byteLength ?? 0

    console.log("📥 WS message received, length:", len)
  })
})

// Adapter from WS server to Automerge Repo
const wsAdapter: any = new NodeWSServerAdapter(wss)

// This Repo *is* your sync server
const repo = new Repo({
  network: [wsAdapter],
  storage,
  sharePolicy: async () => true,
})

server.listen(PORT, () => {
  console.log(`🚀 Sync server listening on port ${PORT}`)
})

export { repo }