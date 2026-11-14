import jwt from 'jsonwebtoken'
import { env } from '../config/index.js'

export interface TokenPayload {
  sub: string // id de l'utilisateur
  role: Role
}

import type { Role } from '../types/index.js'

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload
}