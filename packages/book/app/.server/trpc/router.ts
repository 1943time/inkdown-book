import { procedure, router } from '.'
import { z } from 'zod'
import { db } from '../prisma'
import { Prisma } from '@prisma/client'
export const appRouter = router({
  getBookDetails: procedure
    .input(
      z.object({
        bookId: z.string(),
        name: z.string(),
        mode: z.enum(['github', 'gitlab', 'manual', 'vscode', 'inkdown']),
      })
    )
    .query(async ({ input }) => {
      const book = await db.book.findUnique({
        where: {id: input.bookId},
        select: {id: true}
      })
      if (book) {
        const docs = await db.doc.findMany({
          where: { bookId: input.bookId },
          select: { path: true, sha: true, updated: true }
        })
        const files = await db.file.findMany({
          where: {bookId: input.bookId},
          select: {path: true}
        })
        return { docs: docs, files, id: input.bookId}
      } else {
        await db.book.create({
          data: {
            id: input.bookId,
            name: input.name,
            lasteUpdateMode: input.mode
          }
        })
        return { docs: [], files: [], id: input.bookId}
      }
    }),

  getBooks: procedure
    .input(
      z.object({
        page: z.number(),
        pageSize: z.number(),
        name: z.string().optional(),
        sort: z.tuple([z.enum(['created', 'updated']), z.enum(['ace', 'desc'])])
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
        // delete static file later
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
  
  getBookTexts: procedure.input(z.object({
    bookId: z.string(),
    updated: z.string()
  })).query(async ({input}) => {
    const record = await db.book.findUnique({
      where: {id: input.bookId},
      select: {texts: true, updated: true}
    })
    if (record) {
      return {
        texts: record.updated.valueOf() === +input.updated ? null : record.texts
      }
    }
    return {text: null}
  }),
  getBook: procedure.input(z.object({
    id: z.string()
  })).query(({input}) => {
    return db.book.findMany({
      where: {id: input.id},
      select: {id: true, name: true, updated: true, created: true}
    })
  }),
  syncBookData: procedure.input(z.object({
    remove: z.string().array(),
    map: z.string(),
    bookId: z.string(),
    texts: z.string(),
    add: z.object({
      path: z.string(),
      sha: z.string(),
      schema: z.any()
    }).array()
  })).mutation(async ({input}) => {
    return await db.$transaction(async t => {
      if (input.remove.length) {
        await t.doc.deleteMany({
          where: {bookId: input.bookId, path: {in: input.remove}}
        })
      }
      if (input.add.length) {
        for (const item of input.add) {
          await t.doc.upsert({
            where: {
              path_bookId: {path: item.path, bookId: input.bookId}
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
        where: {id: input.bookId},
        data: {
          map: input.map,
          texts: input.texts
        }
      })
      return {ok: true}
    })
  })
})
