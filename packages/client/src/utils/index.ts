import path from 'path-browserify'
import { customAlphabet } from 'nanoid'
import { remove as removeDiacritics } from 'diacritics'
const rControl = /[\u0000-\u001f]/g
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'<>,.?/]+/g

export const isLink = (url: string = '') => /^(?:\w+:)?\/\//i.test(url)

export function convertWindowsToUnixPath(winPath: string) {
  return path.posix.normalize(winPath.replace(/\\/g, '/'))
}


export const nid = customAlphabet(
  '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  15
)

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
      // lowercase
      .toLowerCase()
  )
}

export const sortTree = <T = any>(tree: T[]) => {
  return tree.sort((a: any, b: any) => {
    if (!!a.children !== !!b.children) return a.children ? -1 : 1
    else return a.name > b.name ? 1 : -1
  })
}

export type DataTree = {
  md?: string
  realPath?: string
  name: string
  children?: DataTree[]
}

export const parsePath = (path: string) => {
  const m = path.match(/#([^\n#\/]+)?$/)
  if (m) {
    return { path: path.replace(m[0], ''), hash: m[1] || '' }
  }
  return { path, hash: null }
}

export const bulk = async <T = any>(data: T[], cb: (data: T[]) => any, size = 10) => {
  for (let i = 0; i <= data.length; i += size) {
    const stack = data.slice(i, i + size)
    if (!stack.length) break
    await cb(stack)
    if (stack.length < size) break
  }
}