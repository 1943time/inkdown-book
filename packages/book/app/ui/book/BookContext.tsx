import { useSetState } from 'react-use'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from '@remix-run/react'
import { BsContext } from '../BsContext'
import { TreeContext } from '../../utils/ctx'
import { api } from '../../.client/api'
export const getOffsetBody = (el: HTMLElement) => {
  let top = 0
  while (el.offsetParent) {
    top += el.offsetTop
    el = el.offsetParent as HTMLElement
  }
  return top
}

const getFirstPath = (map: any[]) => {
  const stack = map.slice()
  while (stack.length) {
    const item = stack.shift()!
    if (!item.folder) {
      return item.path
    } else {
      stack.unshift(...(item.children || []))
    }
  }
}

const readMap = (
  map: any[],
  parentPath: string = '',
  parentMap = new Map<string, string>(),
  pathMap = new Map<string, any>()
) => {
  for (const d of map) {
    pathMap.set(d.path, d)
    parentMap.set(d.path, parentPath)
    if (d.folder) {
      readMap(d.children || [], d.path, parentMap, pathMap)
    }
  }
  return { parentMap, pathMap }
}

export function BookContext(props: {
  map: any[]
  children: React.ReactNode
  preferences?: Record<string, any>
}) {
  const params = useParams()
  const path = params['*']
  const parentMap = useRef(new Map<string, string>())
  const pathMap = useRef(new Map<string, any>())
  const [state, setState] = useSetState({
    openKeys: [] as string[],
    currentPath: path || '',
    position: '',
    textMap: [] as any[]
  })
  useEffect(() => {
    let cacheData = {
      texts: '',
      time: 0
    }
    const path = decodeURIComponent(params.path as string)
    const cacheKey = `book-${params.space ? `${params.space}-` : ''}${path}`
    const cache = localStorage.getItem(cacheKey)
    if (cache) {
      cacheData = JSON.parse(cache)
    }
    api.getBookTexts.query({
      bookId: params.id as string,
      updated: cacheData.time
    }).then(async (res) => {
      if (res.texts) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            texts: res.texts || [],
            time: res.updated
          })
        )
        setState({ textMap: JSON.parse(res.texts || '[]') })
      } else {
        setState({ textMap: JSON.parse(cacheData.texts || '[]') })
      }
    })
  }, [])
  
  const docs = useMemo(() => {
    let docs: any[] = []
    const stack = props.map.slice()
    while (stack.length) {
      const item = stack.shift()!
      if (!item.folder) {
        docs.push(item)
      } else {
        stack.unshift(...(item.children || []))
      }
    }
    return docs
  }, [])
  const curDom = useRef<HTMLElement>()
  const timer = useRef(0)
  const navagate = useNavigate()
  useEffect(() => {
    if (!params['*']?.length) {
      toFirstPath()
    }
    const map = readMap(props.map)
    parentMap.current = map.parentMap
    pathMap.current = map.pathMap
  }, [])

  const toFirstPath = useCallback(() => {
    const path = getFirstPath(props.map)
    if (path) {
      selectPath(path)
      navagate({
        pathname: `/doc/${params.id}/${path}`
      }, {
        replace: true
      })
    }
  }, [params.path, params.space])

  const toPosition = useCallback((position?: string) => {
    curDom.current?.classList.remove('high-block')
    clearTimeout(timer.current)
    if (position) {
      const target = document.querySelector(
        `[data-index="${position}"]`
      ) as HTMLElement
      if (target) {
        curDom.current = target
        const top = getOffsetBody(target) - 100
        window.scroll({
          top,
          behavior: 'auto'
        })
        target.classList.add('high-block')
        timer.current = window.setTimeout(() => {
          target.classList.remove('high-block')
        }, 2000)
      }
      setState({ position: '' })
    }
  }, [])

  useEffect(() => {
    selectPath(path)
  }, [path])

  const selectPath = useCallback(
    (path: string = '') => {
      const keys: string[] = []
      let curPath = path
      while (parentMap.current.get(curPath)) {
        keys.push(parentMap.current.get(curPath)!)
        curPath = parentMap.current.get(curPath)!
      }
      setState({
        currentPath: path
      })
      setTimeout(() => {
        setState({
          openKeys: Array.from(new Set([...keys, ...state.openKeys]))
        })
      }, 100)
    },
    [state.openKeys]
  )

  return (
    <BsContext
      preferences={props.preferences}
    >
      <TreeContext.Provider
        value={{
          ...state,
          map: props.map,
          docs: docs,
          toPosition,
          setState,
          textMap: state.textMap,
          toFirstChapter: toFirstPath,
          selectPath: (path) => {
            selectPath(path)
          },
          togglePath: (key) => {
            if (state.openKeys.includes(key)) {
              setState({ openKeys: state.openKeys.filter((k) => k !== key) })
            } else {
              setState({ openKeys: [...state.openKeys, key] })
            }
          }
        }}
      >
        {props.children}
      </TreeContext.Provider>
    </BsContext>
  )
}
