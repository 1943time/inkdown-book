import { Article } from '../ui/render/Article'
import { Leading } from '../ui/Leading'
import { Highlight } from '../ui/render/Hihglight'
import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import {
  useLoaderData, useParams
} from '@remix-run/react'
import { BackToFirst } from '../ui/book/Back'
import { Pagination } from '../ui/book/Pagination'
import { useContext, useEffect } from 'react'
import { DocCtx, TreeContext } from '../utils/ctx'
import { db } from '../.server/prisma'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: '' }]
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const doc = await db.doc.findUnique({
    where: {path_bookId: {bookId: params.id!, path: params['*']!}},
    select: {schema: true, path: true}
  })
  return doc
}


export default function () {
  const res = useLoaderData<typeof loader>()
  const params = useParams()
  const schema = JSON.parse(res?.schema || '[]')
  const tree = useContext(TreeContext)
  useEffect(() => {
    if (tree.position || tree.position === 'top') {
      setTimeout(() => {
        tree.toPosition(tree.position)
      }, 100)
    }
  }, [params['*']])
  return (
    <>
      <div className={'content'}>
        {!!res?.schema && (
          <>
            <Article schema={schema} key={params['*']} />
            <Pagination />
            <Highlight />
          </>
        )}
        {!res?.schema && <BackToFirst />}
      </div>
      <Leading schema={schema} book={true} />
    </>
  )
}
