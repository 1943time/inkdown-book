import Dexie, { Table } from 'dexie'

export interface IFolder {
  bookId: string
  handle: FileSystemDirectoryHandle
}


class Db extends Dexie {
  public book!: Table<IFolder, string>
  public constructor() {
    super('db')
    this.version(10).stores({
      book: '&bookId',
    })
  }
}

export const localdb = new Db()
