import { procedure, router } from '.'
import { z } from 'zod'
import { db } from '../prisma'
import { Prisma } from '@prisma/client'
import { join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import jwt from 'jsonwebtoken'
import { exec, execSync } from 'node:child_process'
export const appRouter = router({
  getEnv: procedure.query(() => {
    return {
      ACCESS_KEY_ID: process.env.ACCESS_KEY_ID!,
      ACCESS_KEY_SECRET: process.env.ACCESS_KEY_SECRET!
    }
  }),
  login: procedure.input(z.object({
    id: z.string(),
    secret: z.string()
  })).mutation(async ({input}) => {
    if (input.id === process.env.ACCESS_KEY_ID && input.secret === process.env.ACCESS_KEY_SECRET) {
      return {token: jwt.sign({logged: true, id: input.id}, `${input.id}:${input.secret}`, {expiresIn: '365 days'})}
    } else {
      return {token: null}
    }
  }),
  getVersion: procedure.query(() => {
    const code = readFileSync(join(process.cwd(), 'package.json'), {encoding: 'utf-8'})
    return {version: JSON.parse(code).version}
  }),
  upgrade: procedure.mutation(() => {
    execSync('curl -OL https://github.com/1943time/inkdown-book/releases/latest/download/inkdown-book.tar.gz', {cwd: process.cwd()})
    execSync('tar zvxf inkdown-book.tar.gz', {cwd: process.cwd()})
    exec('node dist/scripts/upgrade.mjs', {cwd: process.cwd()})
    return {ok: true}
  }),
  getBookDetails: procedure
    .input(
      z.object({
        bookId: z.string(),
        name: z.string(),
        mode: z.enum(['github', 'gitlab', 'manual', 'vscode', 'inkdown'])
      })
    )
    .query(async ({ input }) => {
      const book = await db.book.findUnique({
        where: { id: input.bookId },
        select: { id: true }
      })
      if (book) {
        const docs = await db.doc.findMany({
          where: { bookId: input.bookId },
          select: { path: true, sha: true, updated: true }
        })
        const files = await db.file.findMany({
          where: { bookId: input.bookId },
          select: { path: true, name: true }
        })
        return { docs: docs, files, id: input.bookId }
      } else {
        await db.book.create({
          data: {
            id: input.bookId,
            name: input.name,
            lasteUpdateMode: input.mode
          }
        })
        return { docs: [], files: [], id: input.bookId }
      }
    }),

  getBooks: procedure
    .input(
      z.object({
        page: z.number(),
        pageSize: z.number(),
        name: z.string().optional(),
        sort: z.tuple([z.enum(['created', 'updated']), z.enum(['asc', 'desc'])])
      })
    )
    .query(async ({ input }) => {
      const where: Prisma.BookWhereInput = {}
      if (input.name) {
        where.OR = [
          { name: { contains: input.name } },
          { id: { contains: input.name } }
        ]
      }
      const books = await db.book.findMany({
        where,
        orderBy: {
          [input.sort[0]]: input.sort[1]
        },
        select: {
          created: true,
          updated: true,
          id: true,
          name: true,
          lasteUpdateMode: true
        }
      })
      const total = await db.book.count({ where })
      return { books, total }
    }),

  deleteBook: procedure
    .input(
      z.object({
        bookId: z.string()
      })
    )
    .mutation(({ input }) => {
      return db.$transaction(async (ctx) => {
        const files = await ctx.file.findMany({
          where: { bookId: input.bookId }
        })
        for (const item of files) {
          const path = join(process.cwd(), 'public/assets', item.name)
          if (existsSync(path)) {
            await unlink(path)
          }
        }
        await ctx.doc.deleteMany({
          where: { bookId: input.bookId }
        })
        await ctx.file.deleteMany({
          where: { bookId: input.bookId }
        })
        await ctx.book.delete({ where: { id: input.bookId } })
        return { ok: true }
      })
    }),

  getBookTexts: procedure
    .input(
      z.object({
        bookId: z.string(),
        updated: z.number()
      })
    )
    .query(async ({ input }) => {
      const record = await db.book.findUnique({
        where: { id: input.bookId },
        select: { texts: true, updated: true }
      })
      if (record) {
        return {
          texts:
            record.updated.valueOf() === input.updated ? null : record.texts,
          updated: record.updated.valueOf()
        }
      }
      return { texts: null }
    }),
  getBook: procedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ input }) => {
      const data = await db.book.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          updated: true,
          created: true,
          settings: true,
          lasteUpdateMode: true
        }
      })
      if (!data) {
        return null
      }
      return {
        ...data,
        settings: JSON.parse(data.settings)
      }
    }),
  syncBookData: procedure
    .input(
      z.object({
        removeDocs: z.string().array(),
        map: z.string(),
        bookId: z.string(),
        texts: z.string(),
        name: z.string(),
        removeFiles: z.string().array(),
        settings: z.string(),
        add: z
          .object({
            path: z.string(),
            sha: z.string(),
            schema: z.any()
          })
          .array()
      })
    )
    .mutation(async ({ input }) => {
      return await db.$transaction(async (t) => {
        if (input.removeDocs.length) {
          await t.doc.deleteMany({
            where: { bookId: input.bookId, path: { in: input.removeDocs } }
          })
        }
        if (input.add.length) {
          for (const item of input.add) {
            await t.doc.upsert({
              where: {
                path_bookId: { path: item.path, bookId: input.bookId }
              },
              create: {
                path: item.path,
                sha: item.sha,
                schema: item.schema,
                bookId: input.bookId
              },
              update: {
                schema: item.schema,
                sha: item.sha
              }
            })
          }
        }
        await t.book.update({
          where: { id: input.bookId },
          data: {
            map: input.map,
            name: input.name,
            texts: input.texts,
            settings: input.settings
          }
        })
        if (input.removeFiles.length) {
          const files = await t.file.findMany({
            where: {
              bookId: input.bookId,
              path: { in: input.removeFiles }
            }
          })
          if (files.length) {
            await t.file.deleteMany({
              where: {
                bookId: input.bookId,
                path: { in: files.map((f) => f.path) }
              }
            })
            for (const item of files) {
              const path = join(process.cwd(), 'public/assets', item.name)
              if (existsSync(path)) {
                await unlink(path)
              }
            }
          }
        }
        return { ok: true }
      })
    })
})
