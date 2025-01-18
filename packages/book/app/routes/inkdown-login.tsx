import { LoaderFunctionArgs } from '@remix-run/node'
import { Login } from '../manage/Login'
import jwt from 'jsonwebtoken'
import { useLoaderData } from '@remix-run/react'
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const ticket = url.searchParams.get('ticket')
  if (ticket) {
    const id = process.env.ACCESS_KEY_ID
    const secret = process.env.ACCESS_KEY_SECRET
    try {
      const decode = jwt.verify(ticket, `${id}:${secret}`) as {id: string}
      if (decode.id !== id) {
        return {token: null}
      }
      return {
        token: jwt.sign({logged: true, id}, `${id}:${secret}`, {expiresIn: '365 days'})
      }
    } catch(e) {}
  }
  return {token: null}
}

export default function() {
  const data = useLoaderData<typeof loader>()
  return <Login token={data.token}/>
}