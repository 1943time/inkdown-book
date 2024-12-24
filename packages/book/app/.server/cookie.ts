import { createCookie } from '@remix-run/node'

const userAccessCookie = createCookie('access', {
  maxAge: 2419200,
  secrets: ['inkdown-secret'],
  sameSite: 'lax'
})

export const getCookie = async (request: Request): Promise<Record<string, string>> => {
  const cookieHeader = request.headers.get('Cookie')
  return await userAccessCookie.parse(cookieHeader) || {}
}

export const addAccess = async (request: Request, data: {space?: string, path: string, password: string, type: string}) => {
  const cookie = await getCookie(request)
  return {
    'Set-Cookie': await userAccessCookie.serialize({
      ...cookie,
      [`${data.space ? `${data.space}-` : ''}${data.type}-${data.path}`]: data.password
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