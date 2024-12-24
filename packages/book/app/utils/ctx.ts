import { createContext } from 'react'
import { ISearchText } from '../ui/book/Search'

export const DocCtx = createContext<{
  context?: {
    secret: ''
  }
  theme?: string
  openMenu: boolean
  openSearch: boolean
  showOutLine?: boolean
  chapterName?: string
  setTheme: (theme: string) => void
  openViewImages: (images: string[], index: number) => void
  setState: (state: {
    theme?: string
    openMenu?: boolean
    openSearch?: boolean
    showOutLine?: boolean
  }) => void
  preferences?: Record<any, any>
}>({
  openMenu: false,
  openSearch: false,
  setState: () => {},
  openViewImages: (images: string[], index: number) => {},
  setTheme: (theme: string) => {}
})

export const EnvCtx = createContext({
  ['home-site']: '',
  ['favicon']: ''
})

export const TreeContext = createContext({
  openKeys: [] as string[],
  currentPath: '',
  map: [] as any[],
  docs: [] as any[],
  position: '',
  textMap: [] as {
    path: string
    texts: ISearchText[]
  }[],
  setState: (state: { position?: string; openSearch?: boolean }) => {},
  toPosition: (position?: string) => {},
  selectPath: (path: string) => {},
  togglePath: (path: string) => {},
  toFirstChapter: () => {}
})
