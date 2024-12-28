import { useCallback, useContext, useEffect, useRef } from 'react'
import ArrowRight from '../icons/ArrowRight'
import { useSetState } from 'react-use'
import { Link, useParams } from '@remix-run/react'
import { Icon } from '@iconify/react'
import { ThemeSwitch } from '../ThemeSwitch'
import { DocCtx, TreeContext } from '../../utils/ctx'
import { useClientLayoutEffect } from '../../utils/common'
import { isDark } from '../../.client/utils'
import IDark from '../icons/Dark'
import ILight from '../icons/Light'
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
          <div
            className={
              'flex-1 overflow-y-auto pt-3 pb-10 hide-scroll dir-container px-1'
            }
          >
            <Directory map={props.map} level={0} />
          </div>
          <div className={'flex justify-end items-center h-12'}>
          <div
            className={
              'h-7 w-7 flex lg:hidden items-center justify-center rounded hover:bg-black/5 ml-2 cursor-pointer dark:hover:bg-white/10 duration-200 select-none'
            }
            onClick={() => {
              ctx.setTheme(ctx.theme === 'dark' ? 'light' : 'dark')
            }}
          >
            {ctx.theme === 'dark' ? <IDark /> : <ILight />}
          </div>
          </div>
        </div>
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
                className={`w-[12px] h-[12px] flex-shrink-0 text-gray-400 dark:group-hover:text-gray-100 group-hover:text-gray-600 duration-200 ${
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
                pathname: `/doc/${params.id}/${d.path}`
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
