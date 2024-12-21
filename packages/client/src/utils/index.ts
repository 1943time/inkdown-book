import { posix } from 'path-browserify'
import { customAlphabet } from 'nanoid'

export const isLink = (url: string = '') => /^(?:\w+:)?\/\//i.test(url)

export function convertWindowsToUnixPath(winPath: string) {
  return posix.normalize(winPath.replace(/\\/g, '/'))
}


export const nid = customAlphabet(
  '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  15
)