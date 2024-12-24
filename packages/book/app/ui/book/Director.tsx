import { useCallback, useContext, useEffect, useRef } from 'react'
import ArrowRight from '../icons/ArrowRight'
import { useSetState } from 'react-use'
import { Link, useParams } from '@remix-run/react'
import { Icon } from '@iconify/react'
import { ThemeSwitch } from '../ThemeSwitch'
import { Search } from './Search'
import IBook from '../icons/IBook'
import { DocCtx, TreeContext } from '../../utils/ctx'
import { useClientLayoutEffect } from '../../utils/common'
import { isDark } from '../../.client/utils'
export function DirectoryFrame(props: {
  map: any[]
  name: string
  icon?: string | null
}) {
  const ctx = useContext(DocCtx)
  const tree = useContext(TreeContext)
  const [state, setState] = useSetState({
    visible: false,
    show: false,
    keyword: '',
    searchFocus: false,
    theme: '',
    openDetail: false
  })

  const close = useCallback(() => {
    setState({ show: false })
    ctx.setState!({ openMenu: false })
    setTimeout(() => {
      setState({ visible: false })
    }, 300)
  }, [])

  useEffect(() => {
    if (ctx.openMenu) {
      setState({ visible: true })
      setTimeout(() => {
        setState({ show: true })
      }, 100)
    } else {
      close()
    }
  }, [ctx.openMenu])

  useClientLayoutEffect(() => {
    setState({
      theme: localStorage.getItem('theme') || isDark() ? 'dark' : 'light'
    })
  }, [ctx.theme])
  return (
    <>
      <div className={`director ${ctx.openMenu ? 'open' : ''}`}>
        <div className={'z-10 h-full flex flex-col relative'}>
          <div className={'pb-1'}>
            <div
              onClick={() => {
                tree.toFirstChapter()
              }}
              className={
                'text-lg font-semibold dark:text-white/80 text-black/80 flex align-baseline'
              }
            >
              <IBook className={'h-7'} />
              <div
                className={
                  'cursor-pointer break-words w-0 flex-1 ml-1 text-pretty'
                }
                onClick={() => tree.toFirstChapter()}
              >
                {props.name}
              </div>
            </div>
          </div>
          <div
            className={`my-3 flex justify-between items-center h-6 ${!ctx.preferences?.links?.length ? 'hidden lg:block' : ''}`}
          >
            <div>
              <ThemeSwitch />
            </div>
            {!!ctx.preferences?.links?.length && (
              <div className={'flex items-center space-x-0.5'}>
                {ctx.preferences.links.map((l: any, i: number) => (
                  <Link
                    to={l.url}
                    key={i}
                    target={'_blank'}
                    className={
                      'rounded hover:bg-gray-200/60 dark:hover:bg-gray-100/10 duration-200 p-[3px] text-black/70 dark:text-gray-300'
                    }
                  >
                    <Icon icon={l.icon} className={'text-[18px]'} />
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className={'relative'}>
            <Search mode={'dir'} />
          </div>
          <div
            className={
              'flex-1 overflow-y-auto pt-3 pb-10 hide-scroll dir-container px-1'
            }
          >
            <Directory map={props.map} level={0} />
          </div>
          <div>
            space
          </div>
        </div>
        <div className={'director-cover'} />
      </div>
      {state.visible && (
        <div
          className={`fixed inset-0 z-[210] bg-black/60 duration-300 ${
            state.show ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={close}
        />
      )}
    </>
  )
}

function Directory({ map, level }: { map: any[]; level: number }) {
  const tree = useContext(TreeContext)
  const ctx = useContext(DocCtx)
  const params = useParams()
  const isOpen = useCallback(
    (path: string) => {
      return tree.openKeys.includes(path)
    },
    [tree.openKeys]
  )
  return (
    <>
      {map.map((d, i) => (
        <div className={`d-item ${
          tree.currentPath === d.path ? 'active' : ''
        }`} key={i}>
          {d.folder ? (
            <div
              className={`group flex justify-between items-center select-none d-title dir ${
                d.folder && tree.openKeys.includes(d.path) ? 'open' : ''
              }`}
              onClick={() => {
                tree.togglePath(d.path)
              }}
            >
              <span className={'mr-1'}>{d.name}</span>
              <ArrowRight
                className={`w-[14px] h-[14px] flex-shrink-0 text-gray-400 dark:group-hover:text-gray-100 group-hover:text-gray-600 duration-200 ${
                  isOpen(d.path) ? 'rotate-90' : ''
                }`}
              />
            </div>
          ) : (
            <Link
              className={`select-none d-title`}
              onClick={() => {
                ctx.setState!({ openMenu: false })
                tree.selectPath(d.path)
              }}
              to={{
                pathname: `/${params.name}${d.path}`
              }}
            >
              <span className={'ml-0.5'}>{d.name}</span>
            </Link>
          )}
          {d.folder && !!d.children?.length && isOpen(d.path) && (
            <div className={'d-sub'}>
              <Directory map={d.children} level={level + 1} />
            </div>
          )}
        </div>
      ))}
    </>
  )
}
