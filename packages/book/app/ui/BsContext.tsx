import React, { useCallback, useMemo } from 'react'
import { useSetState } from 'react-use'
import { PhotoSlider } from 'react-photo-view'
import { useClientLayoutEffect } from '../utils/common'
import { DocCtx } from '../utils/ctx'
import { isDark } from '../.client/utils'
import { ClientOnly } from './ClientOnly'

export function BsContext(props: {
  children: React.ReactNode
  preferences?: Record<string, any>
}) {
  const [state, setState] = useSetState({
    theme: '',
    openMenu: false,
    openSearch: false,
    showOutLine: !!props.preferences?.showOutline,
    showReport: false,
    chapterName: '',
    openViewImage: false,
    viewImages: [] as string[],
    viewImageIndex: 0
  })
  useClientLayoutEffect(() => {
    setState({
      theme: localStorage.getItem('theme') || (isDark() ? 'dark' : 'light')
    })
  }, [])

  const setTheme = useCallback((theme: string) => {
    setState({ theme })
    localStorage.setItem('theme', theme)
    theme === 'dark'
      ? document.documentElement.classList.add('dark')
      : document.documentElement.classList.remove('dark')
  }, [])
  const openViewImages = useCallback((images: string[], index: number) => {
    setState({
      openViewImage: true,
      viewImages: images,
      viewImageIndex: index
    })
  }, [])
  return (
    <DocCtx.Provider
      value={{
        ...state,
        setState,
        setTheme,
        openSearch: state.openSearch,
        preferences: {
          ...props.preferences
        },
        openViewImages
      }}
    >
      {props.children}
      <ClientOnly>
        <PhotoSlider
          maskOpacity={0.5}
          images={state.viewImages.map((src) => ({ src, key: src }))}
          visible={state.openViewImage}
          onClose={() =>
            setState({
              openViewImage: false,
              viewImages: [],
              viewImageIndex: 0
            })
          }
          index={state.viewImageIndex}
          onIndexChange={(i) => setState({ viewImageIndex: i })}
        />
      </ClientOnly>
    </DocCtx.Provider>
  )
}
