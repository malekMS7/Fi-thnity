import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  // Prisma 7 : l'URL de la base n'est plus dans schema.prisma mais ici.
  datasource: { url: env('DATABASE_URL') },
})
