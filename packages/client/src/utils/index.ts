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