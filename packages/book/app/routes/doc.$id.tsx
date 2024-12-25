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
  return [{ title: data?.book.name || 'Inkdown' }]
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const book = await db.book.findUnique({
    where: { id: params.id },
    select: { map: true, name: true }
  })
  if (!book) {
    throw new Response(null, { status: 404 })
  }
  return { book }
}

export default function () {
  const params = useParams()
  const data = useLoaderData<typeof loader>()
  const map = JSON.parse(data.book?.map || '[]')
  return (
    <BookContext map={map}>
      <Header title={data.book.name}/>
      <div
        className={`doc-container book show-outline`}
      >
        <DirectoryFrame
          map={map}
          name={data.book?.name!}
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
