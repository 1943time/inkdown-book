import { ReactNode, useCallback, useEffect } from 'react'
import { useGetSetState } from 'react-use'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'

export function Dialog(props: {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string | ReactNode
  manualClose?: boolean
}) {
  const [state, setState] = useGetSetState({
    visible: false,
    open: false
  })
  const close = useCallback(() => {
    setState({ visible: false })
    setTimeout(() => {
      props.onClose()
      setState({ open: false })
    }, 230)
  }, [props.onClose])

  const keydown = useCallback((e: KeyboardEvent) => {
    if (e.key.toLowerCase() === 'escape') {
      close()
    }
  }, [])

  useEffect(() => {
    if (props.open) {
      setState({ open: true })
      setTimeout(() => {
        setState({ visible: true })
      }, 30)
    } else {
      close()
    }

    if (props.open) {
      window.addEventListener('keydown', keydown)
    } else {
      window.removeEventListener('keydown', keydown)
    }
  }, [props.open])
  return createPortal(
    <div
      className={`${props.open ? '' : 'hidden'} fixed inset-0 z-[300] dark:bg-black/30 bg-black/20 duration-150 ${
        state().visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`w-full h-full flex items-center justify-center overflow-auto py-10 flex-wrap`}
        onClick={() => {
          if (!props.manualClose) {
            close()
          }
        }}
      >
        <div
          className={`dialog-content ${
            state().visible ? 'scale-100' : 'scale-90'
          } duration-150`}
          onClick={(e) => e.stopPropagation()}
        >
          {props.title && (
            <div
              className={
                'flex items-center justify-between h-10 px-3 border-b b1'
              }
            >
              <div className={'text-sm dark:text-gray-300 text-gray-600 font-medium'}>
                {props.title}
              </div>
              <div
                className={
                  'p-1 dark:text-gray-400 text-gray-500 duration-200 cursor-pointer hover:bg-gray-200/80 rounded dark:hover:bg-gray-500/30 flex items-center justify-center'
                }
                onClick={close}
              >
                <Icon icon={'gg:close-o'} className={'text-lg'}/>
              </div>
            </div>
          )}
          {props.children}
        </div>
      </div>
    </div>
  , document.body)
}
