import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import {useSetState} from 'react-use'
import { Link, useParams } from '@remix-run/react'
import { DocCtx } from '../utils/ctx'

export function Leading(props: {
  schema: any[]
  book?: boolean
}) {
  const ctx = useContext(DocCtx)
  const params = useParams()
  const timer = useRef(0)
  const [state, setState] = useSetState({
    index: -1
  })
  const heads = useMemo(() => {
    setState({index: -1})
    const heads = props.schema.filter(n => n.type === 'head').map(h => {
      return {id: h.id, title: h.title, level: h.level}
    })
    return heads
  }, [params['*']])
  const reverseHeads = useMemo(() => heads.slice().reverse(), [heads])

  useEffect(() => {
    const scroll = (e: Event) => {
      if (!heads.length) return
      const top = document.documentElement.scrollTop
      const find = reverseHeads.some((h, i) => {
        if (!h.id) return false
        const dom = document.querySelector(`#${h.id}`) as HTMLElement
        if (dom && top > dom.parentElement!.offsetTop - 66) {
          setState({index: heads.length - 1 - i})
          return true
        }
      })
      if (!find) setState({index: -1})
    }
    window.addEventListener('scroll', scroll, {passive: true})
    return () => {
      window.removeEventListener('scroll', scroll)
    }
  }, [props.schema])
  if (!ctx.showOutLine) {
    return null
  }
  return (
    <div
      className={`leading-container ${props.book ? 'xl:block' : 'lg:block doc'}`}
    >
      <div className={`leading`}>
        <div className='leading-list'>
          {heads.map((h, i) => (
            <Link
              className={`leading-item ${
                i === state.index ? 'active' : ''
              } block`}
              style={{ paddingLeft: (h.level - 1) * 16 }}
              key={i}
              to={{hash: h.id}}
              preventScrollReset
              onClick={() => {
                if (h.id) {
                  document.documentElement.classList.add('scroll-smooth')
                  clearTimeout(timer.current)
                  timer.current = window.setTimeout(() => {
                    document.documentElement.classList.remove('scroll-smooth')
                  }, 300) 
                } else {
                  document.documentElement.scroll({
                    top: 0,
                    behavior: 'smooth'
                  })
                }
              }}
            >
              {h.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
