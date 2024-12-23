import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { AppRouter } from '../../model'
import {message} from 'antd'
export const api = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `/api`,
      async headers() {
        const headers: Record<string, string> = {}
        const token = localStorage.getItem('mn-token')
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        return headers
      },
      fetch(url, options) {
        return fetch(url, {
          ...options
        }).then(async (res) => {
          if (!res.ok) {
            const data = await res.json()
            const error = data instanceof Array ? data?.[0].error : data?.error
            if (error?.message) {
              message.open({
                type: 'error',
                content: error.message
              })
            }
            if (res.status === 401) {
              location.href = '/login'
            }
          }
          return res
        })
      }
    })
  ]
})
