import { createCookie } from '@remix-run/node'

const userAccessCookie = createCookie('access', {
  maxAge: 2419200,
  secrets: [process.env.ACCESS_KEY_SECRET || 'inkdown-book-520'],
  sameSite: 'lax'
})

export const getCookie = async (request: Request): Promise<Record<string, string>> => {
  const cookieHeader = request.headers.get('Cookie')
  return await userAccessCookie.parse(cookieHeader) || {}
}

export const addCookieData = async (request: Request, data: Record<string, any>) => {
  const cookie = await getCookie(request)
  return {
    'Set-Cookie': await userAccessCookie.serialize({
      ...cookie,
      ...data
    })
  }
}

export const setCookie = async (
  cookie: Record<string, string>
) => {
  return {
    'Set-Cookie': await userAccessCookie.serialize(cookie)
  }
}