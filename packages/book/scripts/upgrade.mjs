import { fileURLToPath } from 'url'
import {dirname, join} from 'path'
import { cpSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { exec, execSync } from 'child_process'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = join(__dirname, '../..')
const json = JSON.parse(readFileSync(join(__dirname, '../package.json'), {encoding: 'utf-8'}))
const oldJson = JSON.parse(readFileSync(join(root, 'package.json'), {encoding: 'utf-8'}))
oldJson.version = json.version
oldJson.dependencies = json.dependencies
writeFileSync(join(root, 'package.json'), JSON.stringify(oldJson, null, 2), {encoding: 'utf-8'})
execSync('pnpm i', {cwd: root})
rmSync(join(root, 'build'), {force: true, recursive: true})
cpSync(join(__dirname, '../build'), join(root, 'build'), {recursive: true, force: true})
cpSync(join(__dirname, '../prisma/schema.prisma'), join(root, 'prisma/schema.prisma'), {force: true})
cpSync(__dirname, join(root, 'scripts'), {force: true, recursive: true})
cpSync(join(__dirname, '../ecosystem.config.cjs'), join(root, 'ecosystem.config.cjs'), {force: true})
rmSync(join(root, 'inkdown-book.tar.gz'), {force: true})
rmSync(join(root, 'dist'), {force: true, recursive: true})