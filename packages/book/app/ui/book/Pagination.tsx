import {useContext, useMemo} from 'react'
import ArrowRight from '../icons/ArrowRight'
import { Link, useParams } from '@remix-run/react'
import { TreeContext } from '../../utils/ctx'

export function Pagination() {
  const tree = useContext(TreeContext)
  const params = useParams()
  const index = useMemo(() => {
    return tree.docs.findIndex(t => t.path === params['*'])
  }, [params['*']])
  const paths = useMemo(() => {
    return {
      prev: {
        url: tree.docs[index - 1]?.path,
        name: tree.docs[index - 1]?.name
      },
      next: {
        url: tree.docs[index + 1]?.path,
        name: tree.docs[index + 1]?.name
      }
    }
  }, [index])
  if (tree.docs.length < 2) return null
  return (
    <div className='mt-10'>
      <div className='h-[1px] w-full dark:bg-gray-600/30 bg-gray-200'></div>
      <div className='flex justify-between items-start mt-6 md:space-x-10'>
        {index > 0 ? (
          <Link
            className={'paging-item group'}
            to={paths.prev.url}
            onClick={() => {
              tree.selectPath(tree.docs[index - 1]?.path)
            }}
          >
            <span
              className={
                'tip group-hover:text-gray-600 dark:group-hover:text-gray-200 pl-5'
              }
            >
              Previous
            </span>
            <div className={'name flex'}>
              <ArrowRight className={`w-[14px] h-[14px] mr-1 rotate-180 flex-shrink-0`} />
              <span>{paths.prev.name}</span>
            </div>
          </Link>
        ) : (
          <div></div>
        )}
        {index < tree.docs.length - 1 ? (
          <Link
            className={'paging-item group'}
            to={paths.next.url}
            onClick={() => {
              tree.selectPath(tree.docs[index + 1]?.path)
            }}
          >
            <span
              className={
                'tip group-hover:text-gray-600 dark:group-hover:text-gray-200 pr-5'
              }
            >
              Next
            </span>
            <div className={'name'}>
              <span>{paths.next.name}</span>
              <ArrowRight className={`w-[14px] h-[14px] ml-1`} />
            </div>
          </Link>
        ) : (
          <div className={'flex-1'}></div>
        )}
      </div>
    </div>
  )
}
