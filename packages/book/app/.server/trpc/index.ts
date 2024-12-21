import { initTRPC } from '@trpc/server'
import { appRouter } from './router'
export const trpc = initTRPC
  .context<{ }>()
  .create()
export const procedure = trpc.procedure
export const router = trpc.router
export const mergeRouters = trpc.mergeRouters