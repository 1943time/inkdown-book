import { useContext } from 'react'
import { DocCtx } from '../../utils/ctx'
import { mediaType } from '../../utils/common'

const alignType = new Map([
  ['left', 'justify-start'],
  ['right', 'justify-end']
])

export function Media({ node }: { node: any }) {
  const ctx = useContext(DocCtx)
  const type = mediaType(node.url || '')
  return (
    <div className={'my-2'}>
      <div
        className={`group cursor-default relative  rounded`}
        data-be={'media'}
      >
        <div
          className={`w-full flex ${node.align ? alignType.get(node.align) || 'justify-center' : 'justify-center'}`}
        >
          {type === 'video' && (
            <video
              src={node.url}
              controls={true}
              className={'rounded h-full'}
              style={{ maxHeight: node.height }}
            />
          )}
          {type === 'audio' && <audio controls={true} src={node.url} />}
          {type === 'other' && (
            <iframe
              src={node.url}
              className={`w-full h-full border-none rounded`}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              referrerPolicy={'strict-origin-when-cross-origin'}
              allowFullScreen={true}
              style={{ height: node.height || 260 }}
            />
          )}
          {type === 'image' && (
            <img
              src={node.url}
              alt={'image'}
              data-be={'img'}
              style={{ maxHeight: node.height }}
              onClick={() => {
                const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('[data-be="img"]'))
                ctx.openViewImages(imgs.map(img => img.src), imgs.findIndex(m => m.src === `${location.origin}${node.url}`) || 0)
              }}
              referrerPolicy={'no-referrer'}
              // @ts-ignore
              className={
                'align-text-bottom h-full cursor-zoom-in rounded border border-transparent min-w-[20px] min-h-[20px] block object-contain'
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
