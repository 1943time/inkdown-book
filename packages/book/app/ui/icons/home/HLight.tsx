import * as React from "react"
import { SVGProps } from "react"
const HLight = (props: SVGProps<SVGSVGElement>) => (
  <svg
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="1em"
    fill={'white'}
    stroke={'rgba(20,184,166,1)'}
    height="1em"
    {...props}
  >
    <path d="M8 12.25A4.25 4.25 0 0 1 12.25 8a4.25 4.25 0 0 1 4.25 4.25 4.25 4.25 0 0 1-4.25 4.25A4.25 4.25 0 0 1 8 12.25Z" />
    <path
      fill="none"
      d="M12.25 3v1.5m9.25 7.75H20m-1.209 6.541-1.06-1.06m1.06-12.022-1.06 1.06M12.25 20v1.5M4.5 12.25H3m3.77-5.48L5.709 5.709M6.77 17.73l-1.061 1.061"
    />
  </svg>
)
export default HLight
