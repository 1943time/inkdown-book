import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dist = join(__dirname, '../dist')
mkdirSync(dist)
cpSync(
  join(__dirname, '../build'),
  join(dist, 'build'),
  {
    recursive: true,
    force: true
  }
)
mkdirSync(join(dist, 'public'))
cpSync(join(__dirname, '../public/icon.png'), join(dist, 'public/icon.png'))
mkdirSync(join(dist, 'prisma'))
cpSync(join(__dirname, '../prisma/schema.prisma'), join(dist, 'prisma/schema.prisma'))
cpSync(join(__dirname, '../ecosystem.config.cjs'), join(dist, 'ecosystem.config.cjs'))
cpSync(join(__dirname, '../Dockerfile'), join(dist, 'Dockerfile'))
cpSync(join(__dirname, '../.dockerignore'), join(dist, '.dockerignore'))
writeFileSync(join(dist, 'package.json'), readFileSync(join(__dirname, 'package.json')))
mkdirSync(join(dist, 'scripts'))
cpSync(join(__dirname, 'startDetection.mjs'), join(dist, 'startDetection.mjs'))