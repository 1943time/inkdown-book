import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../.client/api'
import {compareVersions} from 'compare-versions'
export const useUpdate = () => {
  const [update, setUpdate] = useState(true)
  const version = useRef('')
  const check = useCallback(async () => {
    if (!version.current) {
      const v = await api.getVersion.query()
      version.current = v.version!
    }
    // const data:{tag_name: string} = await fetch('https://api.github.com/repos/1943time/inkdown-book/releases/latest').then(res => res.json())
    // if (data?.tag_name) {
    //   const remote = data.tag_name.slice(1)
    //   if (compareVersions(version.current, remote)) {
    //     setUpdate(true)
    //   }
    // }
    setTimeout(() => {
      check()
    }, 1000 * 600)
  }, [])
  useEffect(() => {
    check()
  }, [])
  return update
}