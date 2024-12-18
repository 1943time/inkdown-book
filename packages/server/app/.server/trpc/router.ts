import { procedure, router } from '.'
import {z} from 'zod'
import { db } from '../prisma'
import { Prisma } from '@prisma/client'
export const appRouter = router({
  getBookDocs: procedure.input(z.object({
    bookId: z.string()
  })).query(async ({ input }) => {
    const chapters = db.doc.findMany({
      where: {bookId: input.bookId},
      select: {path: true, sha: true, updated: true}
    })
    return {chapters}
  }),
  getBooks: procedure.input(z.object({
    page: z.number(),
    pageSize: z.number(),
    name: z.string().optional(),
    sort: z.tuple([z.enum(['created', 'updated']), z.enum(['ace', 'desc'])])
  })).query(async ({input}) => {
    const where: Prisma.BookWhereInput = {}
    if (input.name) {
      where.OR = [
        {name: {contains: input.name}},
        {id: {contains: input.name}}
      ]
    }
    const books = await db.book.findMany({
      where,
      orderBy: {
        [input.sort[0]]: input.sort[1]
      },
      select: {
        created: true, updated: true, id: true, name: true
      }
    })
    const total = await db.book.count({where})
    return {books, total}
  })
})