import { useContext, useMemo, useRef } from 'react'
import Copy from '../icons/Copy'
import { useSetState } from 'react-use'
import { getCodeTheme, highlight } from '../../.client/shiki'
import { ICheck } from '../icons/ICheck'
import { DocCtx } from '../../utils/ctx'
import { useClientLayoutEffect } from '../../utils/common'
import { copyToClipboard } from '../../.client/utils'

export function Code(props: {
  node: any
  path: number[]
}) {
  const ref = useRef<HTMLPreElement>(null)
  const timer = useRef(0)
  const [state, setState] = useSetState({
    copied: false,
    ready: false,
    codeBg: '',
    codeDark: false as boolean | null
  })

  const ctx = useContext(DocCtx)

  useClientLayoutEffect(() => {
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      let theme = ctx.theme === 'dark' ? 'plastic' : 'slack-ochin'
      getCodeTheme(theme).then((res) => {
        setState({ codeBg: res.codeBg, codeDark: res.codeDark })
      })
      highlight(
        props.node.code,
        props.node.language?.toLowerCase(),
        theme
      ).then((res) => {
        if (res) {
          ref.current!.innerHTML = res.replace(/<\/?pre[^>]*>/g, '')
        } else {
          ref.current!.innerHTML = `<code>${props.node.code}</code>`
        }
      })
      setState({ ready: true }) 
    }, 16)
  }, [props.node.code, ctx.theme])

  const lines = useMemo(() => {
    return props.node.code.split('\n') as string[]
  }, [props.node])
  return (
    <div className={'code-container'}>
      <div
        className={`group ${state.codeDark ? 'dark' : 'light'} tab-${
          ctx.preferences?.codeTabSize || 2
        } code-highlight num`}
        style={{background: !state.ready ? '' : ctx.theme === 'dark' ? 'rgba(33, 37, 43,.4)': 'rgb(246, 246, 246)'}}
      >
        <div
          className={`absolute z-10 right-2 top-1 flex items-center select-none group-hover:hidden`}
        >
          <div
            className={
              'duration-200 hover:text-blue-500 cursor-pointer text-gray-400 text-xs'
            }
          >
            {props.node.language ? (
              <span>{props.node.katex ? 'formula' : props.node.language}</span>
            ) : (
              <span>{''}</span>
            )}
          </div>
        </div>
        {state.ready && (
          <div
            className={
              'absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 duration-200'
            }
          >
            <div
              onClick={() => {
                if (state.copied) return
                setState({ copied: true })
                copyToClipboard(props.node.code)
                setTimeout(() => {
                  setState({ copied: false })
                }, 2000)
              }}
              className={`duration-200 dark:border-white/20 text-black/50 dark:text-white/50 border-black/20
          flex items-center justify-center w-7 h-7 border rounded cursor-pointer`}
            >
              <div
                className={`duration-200 absolute -translate-x-full top-1/2 -translate-y-1/2 text-sm pointer-events-none ${
                  state.copied ? '' : 'opacity-0'
                }`}
              >
                Copied
              </div>
              {state.copied ? (
                <ICheck className={'text-base'} />
              ) : (
                <Copy className={'w-4 h-4'} />
              )}
            </div>
          </div>
        )}
        <div className={'code-line-list'}>
          {Array.from(new Array(props.node.code.split('\n').length)).map(
            (c, i) => (
              <div key={i} />
            )
          )}
        </div>
        <pre ref={ref}>
          <code>{props.node.code}</code>
        </pre>
        <div
          className={'absolute top-[10px] w-full left-0 pointer-events-none'}
        >
          {lines.map((l, i) => (
            <figure
              key={i}
              className={'h-[23px]'}
              data-index={[...props.path, i].join('-')}
              data-text={l}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
