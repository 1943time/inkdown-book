import { parse } from '../parser/worker'

const getTexts = (schema: any[], parentPath: number[] = []) => {
  let texts: { type: string; text: string; path: number[] }[] = []
  for (let i = 0; i < schema.length; i++) {
    const s = schema[i]
    if (
      ['head', 'paragraph', 'table-cell', 'code'].includes(s.type)
    ) {
      if (
        s.type === 'code' &&
        !s.render &&
        !s.katex &&
        s.language !== 'mermaid'
      ) {
        const code: string = s.code || ''
        code.split('\n').map((c, j) => {
          texts.push({
            type: 'code-line',
            text: c,
            path: [...parentPath, i, j]
          })
        })
      } else {
        const text = s.children?.map((c: any) => (c.text || '')).join('')
        if (text) {
          texts.push({
            type: s.type,
            text,
            path: [...parentPath, i]
          }) 
        }
      }
    } else if (s.children?.length) {
      if (
        s.type === 'code' &&
        (s.language === 'mermaid' || s.katex || s.render)
      )
        continue
      texts.push(...getTexts(s.children, [...parentPath, i]))
    }
  }
  return texts
}
export const parseDetail = (md: string) => {
  const schema = parse(md)
  const stack = schema.slice()
  const medias: { type: 'media'; url: string }[] = []
  const links: { text: string; url: string }[] = []
  while (stack.length) {
    const item = stack.shift()!
    if (item.type === 'media') {
      medias.push(item)
    }
    if (item.text && item.url) {
      links.push(item)
    }
    if (item.children?.length) {
      stack.unshift(...item.children)
    }
  }
  return { schema, links, medias, texts: getTexts(schema) }
}
