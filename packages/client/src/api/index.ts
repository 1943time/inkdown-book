import { CreateTRPCClient, createTRPCClient, httpBatchLink } from '@trpc/client'
import { AppRouter } from '../../../book/model'
import { parseDetail } from '../parser/schema'
import { bulk, DataTree, isLink, nid, parsePath, slugify } from '../utils'
import pathPkg from 'path-browserify'

type Mode = 'vscode' | 'inkdown' | 'manual' | 'github' | 'gitlab'
type Tree = {
  name: string
  folder?: true
  md?: string
  path?: string
  children?: Tree[]
}
export class IApi {
  private readonly $t: CreateTRPCClient<AppRouter>
  private docMap = new Map<
    string,
    {
      name: string
      sha: string
      schema: any[]
      realPath?: string
      texts: any[]
      links: { text: string; url: string }[]
      medias: { type: 'media'; url: string }[]
    }
  >()
  private realPathMap = new Map<string, string>()
  options: {
    mode: Mode
    url: string
    token: string
    fetch: typeof window.fetch
    sha1: (data: any) => string
  }
  uploadFile(data: {
    name: string
    path: string
    file: File
    bookId: string
  }): Promise<{ path: string }> {
    const form = new FormData()
    Object.keys(data).forEach((key) =>
      form.append(key, data[key as keyof typeof data])
    )
    return this.options.fetch(this.options.url + '/upload', {
      method: 'POST',
      body: form,
      headers: {
        Authorization: `Bearer ${this.options.token}`
      }
    }).then((res) => res.json())
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
    return this.options.sha1(store)
  }
  constructor(options: {
    url: string
    getFileData: (path: string) => Promise<File | null>
    mode: Mode
    token: string
    fetch: typeof window.fetch
    sha1: (data: any) => string
  }) {
    options.url = options.url.replace(/\/+$/, '')
    this.$t = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          fetch: (url, options) => {
            return this.options.fetch(url, {
              ...options,
              headers: {
                ...options?.headers,
                Authorization: `Bearer ${this.options.token}`
              }
            })
          },
          url: options.url + '/api'
        })
      ]
    })
    this.getFileData = options.getFileData
    this.options = {
      mode: options.mode,
      url: options.url,
      token: options.token,
      sha1: options.sha1,
      fetch: options.fetch
    }
  }
  private transformTree(data: DataTree[], parentPath: string[] = []) {
    const docs: Tree[] = []
    for (const item of data) {
      if (item.name.startsWith('.')) {
        continue
      }
      if (item.children) {
        docs.push({
          name: item.name,
          folder: true,
          path: [...parentPath, item.name].map(p => slugify(p)).join('/'),
          children: this.transformTree(item.children, [
            ...parentPath,
            item.name
          ])
        })
      } else {
        const name = item.name.replace(/\.(md|markdown)$/, '')
        const path = [...parentPath, name].map(p => slugify(p)).join('/')
        const { schema, links, medias, texts } = parseDetail(item.md!)
        this.docMap.set(path, {
          links,
          medias,
          realPath: item.realPath,
          texts,
          schema,
          name,
          sha: this.sha1(item.md!)
        })
        this.realPathMap.set(item.realPath!, path)
        docs.push({
          name,
          path
        })
      }
    }
    return docs
  }
  async syncBook({id, name, data, settings}: {id: string, name: string, data: DataTree[], settings: Record<string, any>}) {
    this.docMap.clear()
    this.realPathMap.clear()
    id = slugify(id)
    const { docs, files } = await this.$t.getBookDetails.query({
      bookId: id,
      mode: this.options.mode,
      name
    })
    
    const remoteFilesMap = new Map(files.map((f) => [f.path, f.name]))
    const add: { path: string; schema: string; sha: string }[] = []
    const addFiles = new Set<string>()
    const textData: { path: string; name: string; texts: any }[] = []
    const map = this.transformTree(data)
    for (const [path, item] of this.docMap) {
      const sha = this.sha1(item.sha)
      textData.push({
        path: path,
        name,
        texts: item.texts
      })
      
      for (const file of item.medias) {
        if (!isLink(file.url)) {
          const filePath = pathPkg.isAbsolute(file.url)
            ? file.url
            : pathPkg.join(item.realPath || path, '..', file.url)
          addFiles.add(filePath)
          if (!remoteFilesMap.has(filePath)) {
            const data = await this.getFileData(filePath)
            if (data && data.size < 1024 * 1024 * 30) {
              try {
                const res = await this.uploadFile({
                  bookId: id,
                  path: filePath,
                  name: nid() + pathPkg.extname(filePath),
                  file: data
                })
                if (res.path) {
                  file.url = res.path
                }
              } catch (e) {
                console.error('upload', e)
              }
            }
          } else {
            file.url = `/assets/${remoteFilesMap.get(filePath)!}`
          }
        }
      }
      for (const link of item.links) {
        if (link.url && !isLink(link.url) && link.url.endsWith('.md')) {
          const ps = parsePath(link.url)
          const target = !pathPkg.isAbsolute(ps.path)
            ? pathPkg.join(item.realPath!, '..', ps.path)
            : '/' + ps.path
          console.log('url', link.url, target, this.realPathMap)
          if (this.realPathMap.get(target)) {
            link.url = this.realPathMap.get(target)! + (ps.hash ? `#${ps.hash}` : '')
          }
        }
      }
      add.push({
        path: path,
        schema: JSON.stringify(item.schema),
        sha
      })
    }

    const removeFiles = Array.from(remoteFilesMap.keys()).filter(
      (p) => !addFiles.has(p)
    )

    const removeDocs = docs.filter(d => !this.docMap.get(d.path)).map(d => d.path)
    await this.$t.syncBookData.mutate({
      removeDocs: removeDocs,
      removeFiles: removeFiles,
      bookId: id,
      name,
      map: JSON.stringify(map),
      texts: JSON.stringify(textData),
      settings: JSON.stringify(settings)
    })
    await bulk(add, docs => {
      return this.$t.insertDocs.mutate({
        add: docs,
        bookId: id
      })
    })
    return id
  }
  getBook(id: string) {
    return this.$t.getBook.query({ id: slugify(id) })
  }
  getAllBookId():Promise<{id: string}[]> {
    return this.$t.getAllBookId.query()
  }
  getBooks(data: {
    page: number
    pageSize: number
    name?: string
    sort: ['created' | 'updated', 'asc' | 'desc']
  }):Promise<{
    total: number
    books: {
      created: string
      updated: string
      id: string
      name: string
      lasteUpdateMode: string
    }[]
  }> {
    return this.$t.getBooks.query(data)
  }
  deleteBook(id: string) {
    return this.$t.deleteBook.mutate({bookId: slugify(id)})
  }
  getEnv():Promise<{ACCESS_KEY_ID: string, ACCESS_KEY_SECRET:string}> {
    return this.$t.getEnv.query()
  }
}
