import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/jwt.js'
import type { Role } from '../types/index.js'

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: Role }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise.' })
  }
  try {
    const payload = verifyToken(auth.slice(7))
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré.' })
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Authentification requise.' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé.' })
    }
    next()
  }
}