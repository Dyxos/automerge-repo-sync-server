import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.SYNC_JWT_SECRET ?? "dev-secret"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`➡️  Incoming request: ${req.method} ${req.url}`)

  const authHeader = req.headers["authorization"]
  if (!authHeader) {
    console.log("❌ Missing Authorization header")
    return res.status(401).end("Missing Authorization header")
  }

  const [scheme, token] = authHeader.split(" ")
  if (scheme !== "Bearer" || !token) {
    console.log("❌ Invalid Authorization header")
    return res.status(401).end("Invalid Authorization header")
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    console.log("🔐 Auth OK:", payload)
    ;(req as any).user = payload
    next()
  } catch (err) {
    console.log("❌ Auth failed:", err)
    return res.status(401).end("Invalid or expired token")
  }
}