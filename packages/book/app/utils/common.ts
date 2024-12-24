import { remove as removeDiacritics } from 'diacritics'
import React from 'react'
const rControl = /[\u0000-\u001f]/g
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'<>,.?/]+/g
export const getId = (node: any) => slugify(getNodeString(node))
export const getNodeString = (node: any) =>
  (node.children || []).map((c: any) => c.text).join('')

export const slugify = (str: string): string => {
  return (
    removeDiacritics(str)
      // Remove control characters
      .replace(rControl, '')
      // Replace special characters
      .replace(rSpecial, '-')
      // Remove continuous separators
      .replace(/\-{2,}/g, '-')

      // Remove prefixing and trailing separators
      .replace(/^\-+|\-+$/g, '')
      // ensure it doesn't start with a number (#121)
      .replace(/^(\d)/, '_$1')
      // lowercase
      .toLowerCase()
  )
}

export const encodeHtml = (str: string) => {
  const encodeHTMLRules = {
      '&': '&#38;',
      '<': '&#60;',
      '>': '&#62;',
      '"': '&#34;',
      "'": '&#39;',
      '/': '&#47;'
    },
    matchHTML = /&(?!#?\w+;)|<|>|\//g
  // @ts-ignore
  return str.replace(matchHTML, function (m) {
    // @ts-ignore
    return encodeHTMLRules[m] || m
  })
}

export const escapeScript = (str: string) => {
  return str
    .replace(/<script|<\/script/gi, function (c) {
      return '&lt;' + c.substring(1)
    })
    .replace(/<([\sa-zA-Z="';:-_]*)on[a-zA-Z]+=/g, '<$1')
}

export const mediaType = (name: string = '') => {
  const ext = name.match(/\.\w+$/)?.[0] || ''
  if (['.png', '.jpg', '.gif', '.svg', '.jpeg', '.webp'].includes(ext))
    return 'image'
  if (['.mp3', '.ogg', '.aac', '.wav', '.oga', '.m4a'].includes(ext))
    return 'audio'
  if (['.mpg', '.mp4', '.webm', '.mpeg', '.ogv', '.wmv', '.m4v'].includes(ext))
    return 'video'
  return 'other'
}

export const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
)

export const getHost = (req: Request) => {
  return req.headers.get('x-forwarded-host') || req.headers.get('host') || undefined
}

export const findFirstChildNote = (folder: any) => {
  const stack = folder.children?.slice() || []
  let path: string | undefined = undefined
  while(stack.length) {
    const item = stack.shift()!
    if (!item.folder) {
      path = item.path
      break
    } else if (item.children?.length) {
      stack.unshift(...item.children)
    }
  }
  return path
}

export const useClientLayoutEffect = canUseDOM
  ? React.useLayoutEffect
  : () => {}

export const clientWindow = canUseDOM ? window : null

export const sleep = (time: number) =>  {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

export const apiUrl = import.meta.env.DEV ? 'http://localhost:3000/data' : 'https://api.inkdown.me/data'

export const isLink = (url: string = '') => /^(?:\w+:)?\/\//i.test(url)
