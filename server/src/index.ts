import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import { env } from './config/index.js'
import { prisma } from './prisma.js'
import routes from './routes/index.js'

const app = express()

app.use(cors({ origin: env.CORS_ORIGINS.split(',').map((s: string) => s.trim()) }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api', routes)

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route introuvable.' }))

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Erreur interne du serveur.' })
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

app.listen(env.PORT, () => {
  console.log(`Serveur Fi-thnity sur http://localhost:${env.PORT}`)
})

export default app