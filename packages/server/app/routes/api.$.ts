import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../.server/trpc/router'
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
    createContext: ({ req }) => {
      return {}
    }
  })
}
