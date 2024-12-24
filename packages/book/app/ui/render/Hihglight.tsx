import { useCallback, useEffect } from 'react'
import { getKatex } from '../../.client/utils'
import { useParams } from '@remix-run/react'

export function Highlight() {
  const params = useParams()
  const click = useCallback((e: MouseEvent) => {
    const el = e.target as HTMLDivElement
    if (!el) return
    if (el.dataset.fnc) {
      const target = document.querySelector(
        `[data-fnd-name="${el.dataset.fncName}"]`
      ) as HTMLElement
      if (target) {
        window.scroll({
          top:
            target.getBoundingClientRect().top +
            document.documentElement.scrollTop -
            64
        })
      }
    }
    if (el.dataset.fnd) {
      const target = document.querySelector(
        `[data-fnc-name="${el.dataset.fndName}"]`
      ) as HTMLElement
      if (target) {
        window.scroll({
          top:
            target.getBoundingClientRect().top +
            document.documentElement.scrollTop -
            64
        })
      }
    }
  }, [])
  useEffect(() => {
    const inlineMath = document.querySelectorAll('.inline-math')
    if (inlineMath.length) {
      getKatex().then((k) => {
        inlineMath.forEach((el) => {
          k.render((el as HTMLElement).dataset.math || '', el as HTMLElement, {
            strict: false,
            output: 'html',
            throwOnError: false,
            macros: {
              '\\f': '#1f(#2)'
            }
          })
        })
      })
    }
    window.addEventListener('click', click)
    const texts = Array.from(
      document.body.querySelectorAll('.content p span')
    ) as HTMLSpanElement[]
    for (const item of texts) {
      if (item.parentElement?.tagName.toLowerCase() === 'a') {
        continue
      }
      const html = item.innerHTML
      if (html) {
        item.innerHTML = html.replaceAll(
          /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/gi,
          (all) => {
            return `<a href="${all}" target="_blank" class="doc-link" rel="noreferrer">${all}</a>`
          }
        )
      }
    }
  }, [params['*']])
  return null
}
