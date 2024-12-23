import { ActionFunctionArgs } from '@remix-run/node'
import {join} from 'path'
import {mkdir, writeFile} from 'fs/promises'
import {existsSync} from 'fs'
import { db } from '../.server/prisma'

export const action = async (args: ActionFunctionArgs) => {
  const form = await args.request.formData()
  const bookId = form.get('bookId') as string
  const file = form.get('file') as File
  const name = form.get('name') as string
  const path = form.get('path') as string
  if (bookId && file && name) {
    const assets = join(process.cwd(), 'public', 'assets')
    if (!existsSync(assets)) {
      await mkdir(assets, {recursive: true})
    }
    await db.file.create({
      data: {
        path, bookId, name
      }
    })
    await writeFile(join(assets, name), Buffer.from(await file.arrayBuffer()))
    return {path: `/assets/${name}`}
  }
  return {path: null}
}