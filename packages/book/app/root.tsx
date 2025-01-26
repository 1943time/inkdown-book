import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError
} from '@remix-run/react'
import type { LinksFunction, MetaFunction } from '@remix-run/node'
import './styles/index.scss'
import 'react-photo-view/dist/react-photo-view.css'
export const meta: MetaFunction = () => {
  return [{ title: 'Inkdown Book' }]
}

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
  }
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' type='image/png' href='/icon.png' />
        <script
          dangerouslySetInnerHTML={{
            __html: `const theme = localStorage.getItem('theme') 
            const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches 
            if (theme === 'dark' || (theme === 'system' && dark)|| (!theme && dark)) document.documentElement.classList.add('dark')`
          }}
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary() {
  const error = useRouteError()
  if (isRouteErrorResponse(error)) {
    return (
      <div
        className={
          'flex justify-center flex-col items-center h-screen text-black/90 dark:text-white/90 pb-10 px-10'
        }
      >
        <img
          src={'/icon.png'}
          className={
            'w-7 h-7 shadow-sm shadow-gray-300 rounded dark:shadow-none duration-200'
          }
        />
        <span className={'text-lg font-semibold ml-3 mt-0.5'}>Inkdown</span>
        <div className={'font-semibold text-xl mt-6'}>Document not found</div>
        <div
          className={
            'text-sm mt-3 text-center dark:text-white/70 text-black/70'
          }
        >
          Inkdown couldn’t load the document you were trying to open
        </div>
      </div>
    )
  }
  return (
    <div
      className={
        'flex justify-center flex-col items-center h-screen text-black/90 dark:text-white/90 pb-10 px-10'
      }
    >
      <img
        src={'/icon.png'}
        className={
          'w-7 h-7 shadow-sm shadow-gray-300 rounded dark:shadow-none duration-200'
        }
      />
      <span className={'text-lg font-semibold ml-3 mt-0.5'}>Inkdown</span>
      <div className={'font-semibold text-xl mt-6'}>
        <span className={'text-amber-500 mr-1'}>500:</span> Internal Server
        Error
      </div>
      <div
        className={'text-sm mt-3 text-center dark:text-white/70 text-black/70'}
      >
        There was a minor glitch in inkdown, please try again later
      </div>
    </div>
  )
  // throw new Error(error instanceof Error ? error.message : 'Unknown Error')
}
