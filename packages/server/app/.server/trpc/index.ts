import { initTRPC } from '@trpc/server'
export const trpc = initTRPC
  .context<{ }>()
  .create()
export const procedure = trpc.procedure
export const router = trpc.router
export const mergeRouters = trpc.mergeRouters
