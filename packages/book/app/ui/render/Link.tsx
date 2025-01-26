import { Link, useParams } from '@remix-run/react'
import { useMemo } from 'react'
import { isLink, parsePath } from '../../utils/common'
import { slugify } from '@inkdown/client'
export function ALink(props: { url?: string; text: string }) {
  const params = useParams()
  const url = useMemo(() => {
    if (isLink(props.url)) {
      return props.url!
    } else {
      const ps = parsePath(props.url! || '')
      return {
        pathname: ps.path ? `/doc/${params.id}/${ps.path}` : undefined,
        hash: ps.hash ? slugify(ps.hash) : undefined
      }
    }
  }, [])
  return (
    <Link
      to={url}
      target={isLink(props.url) ? '_blank' : ''}
      rel={'noreferrer'}
      className={'doc-link'}
    >
      {props.text}
    </Link>
  )
}
