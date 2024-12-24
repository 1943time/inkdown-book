import * as Katex from 'katex'
// import hash from 'js-sha1'

export const isDark = () =>
  window.matchMedia &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches


// export const getSign = async () => {
//     const time = Date.now()
//     const s = btoa(String(time)).slice(2, -1)
//     const ua = navigator.userAgent || ''
//     const sign = hash.sha1(s + ua.split('').reverse().join(''))
//     return { sign, time }
//   }

export const getOffsetBody = (el: HTMLElement) => {
  let top = 0
  while (el.offsetParent) {
    top += el.offsetTop
    el = el.offsetParent as HTMLElement
  }
  return top
}

export const isMac = /macintosh|mac os x/i.test(navigator.userAgent)

export const isWindows = /windows|win32/i.test(navigator.userAgent)

export async function copyToClipboard(text: string) {
  try {
    return window.navigator.clipboard.writeText(text)
  } catch {
    const element = document.createElement('textarea')
    const previouslyFocusedElement = document.activeElement

    element.value = text
    // Prevent keyboard from showing on mobile
    element.setAttribute('readonly', '')

    element.style.contain = 'strict'
    element.style.position = 'absolute'
    element.style.left = '-9999px'
    element.style.fontSize = '12pt' // Prevent zooming on iOS

    const selection = document.getSelection()
    const originalRange = selection
      ? selection.rangeCount > 0 && selection.getRangeAt(0)
      : null

    document.body.appendChild(element)
    element.select()
    // Explicit selection workaround for iOS
    element.selectionStart = 0
    element.selectionEnd = text.length

    document.execCommand('copy')
    document.body.removeChild(element)

    if (originalRange) {
      selection!.removeAllRanges() // originalRange can't be truthy when selection is falsy
      selection!.addRange(originalRange)
    }
    // Get the focus back on the previously focused element, if any
    if (previouslyFocusedElement) {
      ;(previouslyFocusedElement as HTMLElement).focus()
    }
  }
}

let k: typeof Katex.default
export const getKatex = async () => {
  if (k) return k
  k = await import('../ui/render/loadKatex').then((res) => {
    // @ts-ignore
    return res.Katex.default
  })
  return k
}

export const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  )
