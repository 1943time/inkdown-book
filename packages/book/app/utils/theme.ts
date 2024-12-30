import { theme } from 'antd'
import { useMemo } from 'react'
import { useGetSetState } from 'react-use'
import { useClientLayoutEffect } from './common'

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
    setState({ theme: theme || '' })
  }, [])
  return themeObject as any
}
