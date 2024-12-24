import { useContext, useMemo, useRef, useState } from 'react'
import { DocCtx } from '../../utils/ctx'
import { useUpdateEffect } from 'react-use'

export default function Mermaid(props: {
  node: any
}) {
  const id = useMemo(() => 'm' + Math.floor(Math.random() * 1000), [])
  const ctx = useContext(DocCtx)
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef(0)
  const [ready, setReady] = useState(false)
  const initial = async () => {
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      if (ref.current) {
        import('mermaid').then(async ({ default: me }) => {
          me.initialize({
            theme: ctx.theme! || localStorage.getItem('theme')!
          })
          const res = await me.render(id, props.node.code)
          setReady(true)
          ref.current!.innerHTML = res.svg
        })
      }
    }, 16)
  }
  useUpdateEffect(() => {
    initial()
  }, [ctx.theme, props.node])
  
  return (
    <div className={`mermaid-container pre ${!ready ? 'hide' : ''}`} ref={ref}></div>
  )
}
