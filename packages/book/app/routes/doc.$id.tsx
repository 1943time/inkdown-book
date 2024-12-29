import {
  ClientLoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useParams
} from '@remix-run/react'
import { BookContext } from '../ui/book/BookContext'
import { Header } from '../ui/Header'
import { DirectoryFrame } from '../ui/book/Director'
import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Leading } from '../ui/Leading'
import { Search } from '../ui/book/Search'
import { db } from '../.server/prisma'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.name || 'Inkdown' }]
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const book = await db.book.findUnique({
    where: { id: params.id },
    select: { map: true, name: true, settings: true }
  })
  if (!book) {
    throw new Response(null, { status: 404 })
  }
  let settings: Record<string, any> = {}
  try {
    settings = JSON.parse(book.settings)
  } catch(e) {

  }
  return { ...book, settings }
}

export default function () {
  const params = useParams()
  const data = useLoaderData<typeof loader>()
  const map = JSON.parse(data.map || '[]')
  return (
    <BookContext map={map}>
      <Header title={data.name} settings={data.settings}/>
      <div
        className={`doc-container book show-outline`}
      >
        <DirectoryFrame
          map={map}
          name={data.name!}
        />
        {params['*'] && <Outlet />}
        {!params['*'] && (
          <>
            <div className={'content'}></div>
            <Leading schema={[]} book={true} />
          </>
        )}
      </div>
      <Search mode={'window'} />
    </BookContext>
  )
}
