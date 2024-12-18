import { parse } from '../parser/worker'

export const parserToSchema = (md: string) => {
  const schema = parse(md)
  const stack = schema.slice()
  const medias:{type: 'media', url: string}[] = []
  const links: {text: string, url: string}[] = []
  while(stack.length) {
    const item = stack.shift()!
    if (item.type === 'media') {
      medias.push(item)
    }
    if (item.children?.length) {
      stack.unshift(...item.children)
    }
  }
  return schema
}