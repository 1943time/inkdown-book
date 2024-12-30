import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../.server/trpc/router'
import { TRPCError } from '@trpc/server'
import { getCookie } from '../.server/cookie'
import jwt from 'jsonwebtoken'
export const loader = async (args: LoaderFunctionArgs) => {
  return handleRequest(args)
}
export const action = async (args: ActionFunctionArgs) => {
  return handleRequest(args)
}
function handleRequest(args: LoaderFunctionArgs | ActionFunctionArgs) {
  return fetchRequestHandler({
    endpoint: '/api',
    req: args.request,
    router: appRouter,
    createContext: async ({ req }) => {
      const url = new URL(req.url)
      const cookie = await getCookie(req)
      if (cookie.logged || ['/api/login', '/api/getBookTexts'].includes(url.pathname)) {
        return {}
      }
      const token = (req.headers.get('authorization') || '').split(' ')[1] || ''
      const {ACCESS_KEY_ID, ACCESS_KEY_SECRET} = process.env
      try {
        jwt.verify(token, `${ACCESS_KEY_ID}:${ACCESS_KEY_SECRET}`) as { exp: number }
      } catch (e) {
        throw new TRPCError({code: 'UNAUTHORIZED'})
      }
      return {}
    }
  })
}
