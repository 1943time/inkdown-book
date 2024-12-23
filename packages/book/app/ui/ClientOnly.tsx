import { ReactNode, useEffect, useState } from 'react'

let isHydrating = true

export function ClientOnly(props: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const [isHydrated, setIsHydrated] = useState(!isHydrating)

  useEffect(() => {
    isHydrating = false
    setIsHydrated(true)
  }, [])

  if (isHydrated) {
    return <>{props.children}</>
  } else {
    return <>{props.fallback}</>
  }
}
