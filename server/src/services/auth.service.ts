import { hash, compare } from 'bcrypt'
import { prisma } from '../prisma.js'
import type { User, RegisterInput, Role } from '../types/index.js'
import { signToken } from '../utils/jwt.js'

const toUser = (u: { id: string; name: string; email: string; phone: string | null; role: Role }): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  ...(u.phone !== null ? { phone: u.phone } : {}),
  role: u.role,
})

export async function register(input: RegisterInput): Promise<{ token: string; user: User }> {
  const email = input.email.trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('Un compte existe déjà avec cet email.')

  const passwordHash = await hash(input.password, 10)
  const stored = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      phone: input.phone ?? null,
      password: passwordHash,
      role: input.role,
    },
  })
  return { token: signToken({ sub: stored.id, role: stored.role }), user: toUser(stored) }
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const found = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (!found) throw new Error('Email ou mot de passe incorrect.')
  const ok = await compare(password, found.password)
  if (!ok) throw new Error('Email ou mot de passe incorrect.')
  return { token: signToken({ sub: found.id, role: found.role }), user: toUser(found) }
}