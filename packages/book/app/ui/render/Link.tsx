import { Icon } from '@iconify/react'
import { Link, useParams } from '@remix-run/react'
import { useMemo } from 'react'
import { isLink } from '../../utils/common'
export function ALink(props: { url?: string; text: string }) {
  const params = useParams()
  const url = useMemo(() => {
    if (isLink(props.url)) {
      return props.url!
    } else {
      return {
        pathname: `${params.id}${props.url}`
      }
    }
  }, [])
  return (
    <Link
      to={url}
      target={props.url ? '_blank' : ''}
      rel={'noreferrer'}
      className={'doc-link'}
    >
      {props.text}
    </Link>
  )
}
