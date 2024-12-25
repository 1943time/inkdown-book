import { useContext, useRef } from 'react'
import { Icon } from '@iconify/react'
import { useSetState } from 'react-use'
import { Link, useParams } from '@remix-run/react'
import { DocCtx } from '../utils/ctx'
export function Header(props: {
  title?: string
  siteLogo?: string | null
  siteLogoLink?: string | null
}) {
  const ctx = useContext(DocCtx)
  const params = useParams()
  return (
    <header className={`header`}>
      <div className={`header-content max-w-[1400px]`}>
        <div className='header-name'>
          <div
            className={'lg:hidden p-1'}
            onClick={(e) => {
              e.stopPropagation()
              ctx.setState!({ openMenu: !ctx.openMenu })
            }}
          >
            <Icon icon={'lucide:menu'} className={'text-xl'} />
          </div>
          <span
            className={
              'ml-1 mr-2 dark:text-gray-200/30 font-medium text-black text-xl'
            }
          >
            {props.title}
          </span>
          <Link
            className={'max-w-[calc(100vw_-_170px)] truncate pr-2'}
            to={{ hash: '' }}
          >
            {ctx.chapterName}
          </Link>
        </div>
        <div
          className={
            'items-center flex *:cursor-pointer text-black/80 dark:text-white/80'
          }
        >
          <div
            onClick={() => {
              ctx.setState!({ openSearch: true })
            }}
            className={
              'p-1 rounded hover:bg-gray-200/70 duration-200 text-lg dark:hover:bg-white/10'
            }
          >
            <Icon icon={'ant-design:search-outlined'} />
          </div>
          {/* <div
            ref={popRef}
            onClick={() => setState({ popOpen: true })}
            className={
              'p-1 rounded hover:bg-gray-200/70 duration-200 text-lg ml-2 dark:hover:bg-white/10 relative'
            }
          >
            <Icon icon={'ri:more-fill'} />
          </div> */}
          <div className={'h-5 w-[1px] bg-gray-200 mx-2.5 dark:bg-white/20'} />
          <a
            target={'_blank'}
            href={props.siteLogoLink || 'https://www.inkdown.me'}
          >
            <div className={'p-1 flex items-center text-sm'}>
              <img
                src={props.siteLogo || '/logo.svg'}
                className={`w-[22px] h-[22px] shadow-sm shadow-gray-300 rounded-sm ${
                  !!params.space ? 'dark:grayscale dark:hover:grayscale-0' : ''
                }  dark:shadow-none duration-200`}
              />
            </div>
          </a>
        </div>
      </div>
    </header>
  )
}
