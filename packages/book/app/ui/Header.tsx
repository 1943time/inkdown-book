import { useContext } from 'react'
import { Icon } from '@iconify/react'
import { Link } from '@remix-run/react'
import { DocCtx } from '../utils/ctx'
import Light from '../ui/icons/Light'
import IDark from './icons/Dark'
import { ICommand } from './icons/Command'
import { isMac } from '../.client/utils'
import { ClientOnly } from './ClientOnly'
export function Header(props: {
  title?: string
  siteLogo?: string | null
  siteLogoLink?: string | null
}) {
  const ctx = useContext(DocCtx)
  return (
    <header className={`header`}>
      <div className={`header-content max-w-[1440px]`}>
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
              'ml-1 mr-2 font-medium text-black text-xl dark:text-white'
            }
          >
            {props.title}
          </span>
        </div>
        <div className={'flex items-center'}>
          <div className={'flex mr-7 space-x-7'}>
            {/* <div className={'header-link'}>
              <span className={'flex items-center space-x-2 cursor-pointer link'}>Support <Icon icon={'ep:arrow-down-bold'} className={'arrow'}/></span>
              <div className={'link-menu'}>
                <Link to={''}>Blog</Link>
                <Link to={''}>Product</Link>
              </div>
            </div> */}
            <div className={'header-link'}>
              <Link to={''} className={'link'}>
                Vs Code
              </Link>
            </div>
            <div className={'header-link'}>
              <Link to={''} className={'link'}>
                Inkdown Editor
              </Link>
            </div>
            <div className={'header-link'}>
              <Link to={''} className={'link'}>
                Github
              </Link>
            </div>
          </div>
          <div
            className={
              'relative w-56 rounded-lg bg-white dark:bg-white/5 h-8 shadow shadow-gray-600/30 duration-200 hover:shadow-md hover:shadow-black/20 dark:shadow-black/20 dark:hover:shadow-black/80 dark:hover:shadow-md'
            }
            onClick={() => {
              ctx.setState!({ openSearch: true })
            }}
          >
            <div
              className={
                'p-1 rounded  text-lg absolute left-1 top-1/2 -translate-y-1/2 z-10 text-black/70 cursor-pointer dark:text-white/70'
              }
            >
              <Icon icon={'tdesign:search'} />
            </div>
            <input
              className={
                'w-full pl-8 h-full bg-transparent outline-none cursor-pointer text-sm'
              }
              placeholder={'Search'}
              readOnly={true}
            />
            <ClientOnly>
              <div
                className={
                  'absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-xs text-black/60 dark:text-white/60'
                }
              >
                {!isMac ? 'Ctrl + ' : <ICommand />}
                <span className={`ml-1  ${isMac ? 'scale-90' : ''}`}>K</span>
              </div>
            </ClientOnly>
          </div>
          <div
            className={
              'p-1.5 rounded hover:bg-black/5 ml-2 cursor-pointer dark:hover:bg-white/10 duration-200 select-none'
            }
            onClick={() => {
              ctx.setTheme(ctx.theme === 'dark' ? 'light' : 'dark')
            }}
          >
            {ctx.theme === 'dark' ? <IDark /> : <Light />}
          </div>
        </div>
      </div>
    </header>
  )
}
