import { theme } from 'antd'
import { useMemo } from 'react'
import { useGetSetState } from 'react-use'
import { useClientLayoutEffect } from './common'

export const isDark = () =>
  window.matchMedia &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches

export const useAntdTheme = () => {
  const [state, setState] = useGetSetState({
    theme: ''
  })
  const themeObject = useMemo(() => {
    return state().theme === 'dark'
      ? theme.darkAlgorithm
      : theme.defaultAlgorithm
  }, [state().theme])
  useClientLayoutEffect(() => {
    const theme = localStorage.getItem('theme')
    setState({ theme: theme ? theme : (isDark() ? 'dark' : 'light') })
  }, [])
  return themeObject as any
}
