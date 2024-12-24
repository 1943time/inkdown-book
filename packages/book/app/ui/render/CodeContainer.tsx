import { escapeScript } from '../../utils/common'
import {Code} from './Code'
import { Suspense, lazy } from 'react'
import Katex from './Katex'
import Mermaid from './Mermaid'
export function CodeContainer({node, path}: {node: any, path: number[]}) {
  return (
    <>
      {node.language === 'mermaid' && (
        <Mermaid node={node} />
      )}
      {node.language !== 'mermaid' && !node.katex && !node.render && (
        <Code node={node} path={path} />
      )}
      {node.language === 'html' && node.render && (
        <div
          dangerouslySetInnerHTML={{
            __html: node.code
          }}
          className={'mb-3'}
        ></div>
      )}
      {node.katex && (
        <Katex node={node} />
      )}
    </>
  )
}
