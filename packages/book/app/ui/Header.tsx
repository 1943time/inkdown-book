import { Fragment, useContext, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Link } from '@remix-run/react'
import { DocCtx } from '../utils/ctx'
import Light from '../ui/icons/Light'
import IDark from './icons/Dark'
import { ICommand } from './icons/Command'
import { isMac } from '../.client/utils'
import { ClientOnly } from './ClientOnly'
import { IMore } from './icons/IMore'
import { useGetSetState } from 'react-use'
export function Header(props: {
  title?: string
  settings: Record<string, any>
}) {
  const ctx = useContext(DocCtx)
  const [state, setState] = useGetSetState({
    openLinksMenu: false
  })
  useEffect(() => {
    window.addEventListener('click', (e) => {
      if (
        state().openLinksMenu &&
        !document
          .querySelector('.m-link-menu')
          ?.contains(e.target as HTMLElement)
      ) {
        setState({ openLinksMenu: false })
      }
    })
  }, [])
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
          {!!props.settings.nav?.length && (
            <>
              <div className={'mr-7 space-x-7 items-center hidden md:flex'}>
                {props.settings.nav.map((n: any, i: number) => (
                  <Fragment key={i}>
                    {!!n.items ? (
                      <div className={'header-link'}>
                        <span
                          className={
                            'flex items-center space-x-2 cursor-pointer link'
                          }
                        >
                          {n.text}{' '}
                          <Icon
                            icon={'ep:arrow-down-bold'}
                            className={'arrow'}
                          />
                        </span>
                        <div className={'link-menu menu'}>
                          {n.items.map((item: any, i: number) => 
                            <Link to={item.link} key={i} target={'_blank'} className={'block'}>
                              {item.text}
                            </Link>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={'header-link'}>
                        <Link to={n.link} className={'link'} target={'_blank'}>
                          {n.text}
                        </Link>
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
              <div
                className={'flex items-center relative m-link-menu md:hidden'}
                onClick={(e) => {
                  e.stopPropagation()
                  setState({ openLinksMenu: !state().openLinksMenu })
                }}
              >
                <IMore className={'text-xl mr-1'} />
                <Icon
                  icon={'ep:arrow-down-bold'}
                  className={`text-xs scale-90 duration-200 ${
                    state().openLinksMenu ? 'rotate-180' : ''
                  }`}
                />
                <div
                  className={`w-52 absolute top-8 -right-5 menu px-2 rounded-lg py-2.5 space-y-1 ${
                    state().openLinksMenu ? '' : 'hidden'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {props.settings.nav.map((n: any, i: number) => (
                    <Fragment key={i}>
                      {!!n.items ? (
                        n.items.map((item: any, j: number) => (
                          <Fragment key={j}>
                            {i !== 0 && j === 0 &&
                              <div className={'h-[1px] w-full bg-gray-200 my-1.5 dark:bg-white/10'}/>
                            }
                            <Link
                            to={item.link}
                            key={j}
                            target={'_blank'}
                            className={`block text-sm py-0.5 pl-2`}
                          >
                            {item.text}
                          </Link>
                          </Fragment>
                        ))
                      ) : (
                        <Link to={n.link} target={'_blank'} className={'block text-sm py-0.5 pl-2'}>
                          {n.text}
                        </Link>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>
            </>
          )}
          <div
            className={
              'hidden lg:block items-center relative w-56 rounded-lg bg-white dark:bg-white/5 h-8 shadow shadow-gray-600/30 duration-200 hover:shadow-md hover:shadow-black/20 dark:shadow-black/20 dark:hover:shadow-black/80 dark:hover:shadow-md'
            }
            onClick={(e) => {
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
              'h-7 w-7 hidden lg:flex items-center justify-center rounded hover:bg-black/5 ml-2 cursor-pointer dark:hover:bg-white/10 duration-200 select-none'
            }
            onClick={() => {
              ctx.setTheme(ctx.theme === 'dark' ? 'light' : 'dark')
            }}
          >
            {ctx.theme === 'dark' ? <IDark /> : <Light />}
          </div>
          <div
            className={
              'flex lg:hidden items-center w-7 h-7 cursor-pointer relative justify-center rounded-lg ml-2 bg-white dark:bg-white/5 shadow shadow-gray-600/30 duration-200 dark:shadow-black/20'
            }
            onClick={() => {
              ctx.setState!({ openSearch: true })
            }}
          >
            <Icon icon={'tdesign:search'} />
          </div>
        </div>
      </div>
    </header>
  )
}
