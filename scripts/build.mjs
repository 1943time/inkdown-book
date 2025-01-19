import { execSync } from 'child_process'
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = join(__dirname, '../packages/book')
const dist = join(root, 'dist')
execSync('npm run build', {cwd: join(__dirname, '../packages/client')})
execSync('npm run build', {cwd: root})
mkdirSync(dist)
cpSync(join(root, 'build'), join(dist, 'build'), {
  recursive: true,
  force: true
})
mkdirSync(join(dist, 'public'))
cpSync(join(root, 'public/icon.png'), join(dist, 'public/icon.png'))
mkdirSync(join(dist, 'prisma'))
cpSync(
  join(root, 'prisma/schema.prisma'),
  join(dist, 'prisma/schema.prisma')
)
cpSync(
  join(root, 'ecosystem.config.cjs'),
  join(dist, 'ecosystem.config.cjs')
)
cpSync(join(root, 'Dockerfile'), join(dist, 'Dockerfile'))
cpSync(join(root, '.dockerignore'), join(dist, '.dockerignore'))
mkdirSync(join(dist, 'scripts'))
cpSync(join(root, 'scripts/startDetection.mjs'), join(dist, 'scripts/startDetection.mjs'))
writeFileSync(
  join(dist, 'package.json'),
  readFileSync(join(root, 'scripts/package.json'))
)
execSync(`tar czvf ${join(__dirname, '../inkdown-book.tar.gz')} dist`, {cwd: root})