import { CreateTRPCClient, createTRPCClient, httpBatchLink } from '@trpc/client'
import { AppRouter } from '../../../book/model'
import { sha1 } from 'js-sha1'
import { parseDetail } from '../parser/schema'
import { convertWindowsToUnixPath, isLink, nid } from '../utils'
import { isAbsolute, join, extname } from 'path-browserify'

type Mode = 'vscode' | 'inkdown' | 'manual' | 'github' | 'gitlab'
export class IApi {
  private readonly $t: CreateTRPCClient<AppRouter>
  public fetch?: typeof fetch
  private options: {
    mode: Mode,
    url: string
  }
  uploadFile(data: {
    name: string,
    path: string
    file: File
    bookId: string
  }): Promise<{path: string}> {
    const form = new FormData()
    Object.keys(data).forEach((key) => form.append(key, data[key as keyof typeof data]))
    return (this.fetch || fetch)(this.options.url + '/upload', {
      method: 'POST',
      body: form
    }).then(res => res.json())
  }
  getFileData: (path: string) => Promise<File | null>
  sha1(text: string) {
    const encoder = new TextEncoder()
    const contentBytes = encoder.encode(text)
    const header = `blob ${contentBytes.length}\0`
    const headerBytes = encoder.encode(header)
    const store = new Uint8Array(headerBytes.length + contentBytes.length)
    store.set(headerBytes)
    store.set(contentBytes, headerBytes.length)
    return sha1(store)
  }
  constructor(options: {
    url: string
    getFileData: (path: string) => Promise<File | null>
    mode: Mode
  }) {
    options.url = options.url.replace(/\/+$/, '')
    this.$t = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: options.url + '/api'
        })
      ]
    })
    this.getFileData = options.getFileData
    this.options = {
      mode: options.mode,
      url: options.url
    }
  }
  async syncBook(
    id: string,
    name: string,
    data: { path: string; md: string }[]
  ) {
    const { docs, files } = await this.$t.getBookDetails.query({
      bookId: id,
      mode: this.options.mode,
      name
    })
    const remoteFilesSet = new Set(files.map((f) => f.path))
    const remoteDocsMap = new Map(docs.map((d) => [d.path, d]))
    const remove: string[] = []
    const add: { path: string; schema: string; sha: string }[] = []
    const docsMap = new Map(data.map((f) => [f.path, f]))
    const folder = new Map<string, any>()
    const top: any[] = []
    const textData: {path: string, name: string, texts: any}[] = []
    // prefetch book
    for (const item of data) {
      item.path = convertWindowsToUnixPath(item.path).replace(/\.md$/, '')
      const stack = item.path.split('/')
      let stackPath: string[] = []
      const name = item.path.split('/').pop()!
      while (stack.length) {
        const cur = stack.shift()!
        if (stack.length) {
          const parent = folder.get(stackPath.join('/')) || top
          stackPath.push(cur)
          const data = {
            name: cur,
            children: []
          }
          if (!folder.get(stackPath.join('/'))) {
            folder.set(stackPath.join('/'), data)
          }
          parent.push(data)
        } else {
          const parent = folder.get(stackPath.join('/'))?.children || top
          parent.push({
            name,
            path: item.path
          })
        }
      }
      if (!remoteDocsMap.has(item.path)) {
        remove.push(item.path)
      }
      const remote = remoteDocsMap.get(item.path)
      const sha = this.sha1(item.md)
      if (remote && remote.sha === sha) continue
      const { schema, links, medias, texts } = parseDetail(item.md)
      textData.push({
        path: item.path,
        name,
        texts: JSON.stringify(texts)
      })
      for (const link of links) {
        if (!isLink(link.url) && link.url.endsWith('.md')) {
          if (!isAbsolute(link.url)) {
            const target = join(item.path, '..', link.url).replace(/\.md/, '')
            if (docsMap.get(target)) {
              link.url = target
            }
          }
        }
      }
      for (const file of medias) {
        if (!isLink(file.url)) {
          const path = isAbsolute(file.url)
            ? file.url
            : join(item.path, '..', file.url)
          if (!remoteFilesSet.has(path)) {
            const data = await this.getFileData(path)
            if (data && data.size < 1024 * 1024 * 30) {
              try {
                const res = await this.uploadFile({
                  bookId: id,
                  path: path,
                  name: nid() + extname(path),
                  file: data
                })
                if (res.path) {
                  file.url = res.path
                }
              } catch(e) {
                console.error('upload', e)
              }
            }
          }
        }
      }
      add.push({
        path: item.path,
        schema: JSON.stringify(schema),
        sha
      })
    }
    return this.$t.syncBookData.mutate({
      add, remove,
      bookId: id,
      map: JSON.stringify(top),
      texts: JSON.stringify(textData)
    })
  }
  getBook(id: string) {
    return this.$t.getBook.query({ id })
  }
}