import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useGetSetState, useSetState } from 'react-use'
import { Link, useParams } from '@remix-run/react'

export function Leading(props: { schema: any[]; book?: boolean }) {
  const params = useParams()
  const timer = useRef(0)
  const [state, setState] = useGetSetState({
    index: -1,
    markTop: 0,
    markHeight: 0
  })
  const heads = useMemo(() => {
    setState({ index: -1 })
    const heads = props.schema
      .filter((n) => n.type === 'head')
      .map((h) => {
        return { id: h.id, title: h.title, level: h.level }
      })
    return heads
  }, [params['*']])

  const reverseHeads = useMemo(() => heads.slice().reverse(), [heads])
  const moveMark = useCallback((i: number) => {
    const dom = document.querySelectorAll<HTMLDivElement>('.leading-item')?.[i]
    if (dom) {
      setState({
        markHeight: dom.clientHeight,
        markTop: dom.offsetTop
      })
    }
  }, [])
  const scroll = useCallback(() => {
    if (!heads.length) return
    const top = document.documentElement.scrollTop
    const find = reverseHeads.some((h, i) => {
      if (!h.id) return false
      const dom = document.querySelector(`#${h.id}`) as HTMLElement
      if (dom && top > dom.parentElement!.offsetTop - 70) {
        const index = heads.length - 1 - i
        moveMark(index)
        setState({index})
        return true
      }
    })
    if (!find) setState({ index: -1, markHeight: 0, markTop: 0 })
  }, [])
  useEffect(() => {
    window.addEventListener('scroll', scroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', scroll)
    }
  }, [])
  return (
    <div
      className={`leading-container ${
        props.book ? 'xl:block' : 'lg:block doc'
      }`}
    >
      <div className={`leading`}>
        <div className='leading-list'>
          {heads.map((h, i) => (
            <Link
              className={`leading-item ${
                i === state().index ? 'active' : ''
              } block`}
              style={{ paddingLeft: (h.level - 1) * 12 }}
              key={i}
              to={{ hash: h.id }}
              onClick={() => {
                setTimeout(() => {
                  moveMark(i)
                }, 30)
              }}
              preventScrollReset
            >
              {h.title}
            </Link>
          ))}
          {!!heads.length && (
            <div
              className={
                'absolute -left-[1px] top-0 bg-black/80 dark:bg-white/80 duration-150 w-[1px]'
              }
              style={{
                height: state().markHeight,
                transform: `translateY(${state().markTop}px)`
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
