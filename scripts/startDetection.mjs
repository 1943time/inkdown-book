import fs from 'fs'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { execSync } from 'child_process'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
execSync('prisma db push', {cwd: join(__dirname, '../')})
const envPath = join(__dirname, '../.env')
const env = dotenv.configDotenv({ path: path.join(__dirname, '../.env') })
function generateRandomString(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}
if (!env.parsed?.ACCESS_KEY_ID) {
  fs.appendFileSync(envPath, `\nACCESS_KEY_ID="${generateRandomString(24)}"`, {
    encoding: 'utf-8'
  })
}
if (!env.parsed?.ACCESS_KEY_SECRET) {
  fs.appendFileSync(
    envPath,
    `\nACCESS_KEY_SECRET="${generateRandomString(32)}"`,
    { encoding: 'utf-8' }
  )
}