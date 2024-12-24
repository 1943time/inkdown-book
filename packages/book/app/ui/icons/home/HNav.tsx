import * as React from 'react'
import { SVGProps } from 'react'
const HNav = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill='none'
    aria-hidden='true'
    viewBox='0 0 16 16'
    width='1em'
    stroke={'currentColor'}
    height='1em'
    {...props}
  >
    <path
      d='M6.75 5.75 9.25 8l-2.5 2.25'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)
export default HNav
