import { Fragment, useCallback, useContext, useEffect, useRef } from 'react'
import { useGetSetState } from 'react-use'
// import { apiUrl, encodeHtml } from '../../utils/common'
import { useNavigate, useParams } from '@remix-run/react'
import { Icon } from '@iconify/react'
import { ISearch } from '../icons/ISearch'
import { encodeHtml } from '../../utils/common'
import { DocCtx, TreeContext } from '../../utils/ctx'
import {isHotkey} from 'is-hotkey'

const highlight = (text: string, key: RegExp) => {
  text = encodeHtml(text)
  // @ts-ignore
  return `${text.replace(
    key,
    '<span class="font-semibold text-blue-500">$&</span>'
  )}`
}

export type ISearchText = {
  path: number[]
  text: string
  type: string
  html?: string
}
export type Result = {
  doc: string
  text: ISearchText[]
  showText: ISearchText[]
}
const symbolMap = new Map([
  ['head', '#'],
  ['paragraph', 'P'],
  ['table-cell', 'TD'],
  ['code-line', '< >']
])

export function Search({ mode }: { mode: 'dir' | 'window' }) {
  const tree = useContext(TreeContext)
  const ctx = useContext(DocCtx)
  const timer = useRef(0)
  const searchContainer = useRef<HTMLDivElement>(null)
  const [state, setState] = useGetSetState({
    keyword: '',
    result: [] as Result[],
    searching: false,
    searchFocus: false
  })

  const navagate = useNavigate()
  const params = useParams()
  const paramsRef = useRef(params)
  paramsRef.current = params
  const search = useCallback(() => {
    const key = state().keyword.toLowerCase()
    const reg = new RegExp(
      state().keyword.replace(/[*.?+$^\[]\(\)\{}\|\/]/g, '\\$&'),
      'gi'
    )
    
    const result = tree.textMap.filter((d) => {
        return d.texts.some((t) => t.text.toLowerCase().includes(key))
      })
      .map((t) => {
        const text = t.texts
          .filter((t) => {
            return t.text.toLowerCase().includes(key)
          })
          .map((st) => {
            return {
              path: st.path,
              type: st.type,
              text: st.text,
              html: highlight(st.text, reg)
            }
          })
        return {
          doc: t.path,
          text: text,
          showText: text.slice(0, 5)
        }
      })
    setState({ result, searching: false })
  }, [tree.textMap])

  const showMore = useCallback((index: number) => {
    const item = state().result[index]
    item.showText = item.text
    setState({
      result: state().result.slice()
    })
  }, [])

  useEffect(() => {
    window.addEventListener('click', (e) => {
      if (!searchContainer.current?.contains(e.target as HTMLElement)) {
        setState({ searchFocus: false })
      }
    })
  }, [])

  const selectResult = useCallback(
    (
      path: string,
      options: {
        position?: string
      }
    ) => {
      if (document.body.clientWidth < 1024) {
        ctx.setState({ openMenu: false })
        setState({ searchFocus: false })
      }
      if (paramsRef.current['*'] === path) {
        tree.toPosition(options.position)
      } else {
        navagate(`/doc/${params.id}/${path}`)
        tree.selectPath(path)
        tree.setState({
          position: options.position
        })
      }
      ctx.setState!({ openSearch: false })
    },
    []
  )
  useEffect(() => {
    if (ctx.openSearch) {
      setTimeout(() => {
        searchContainer.current?.querySelector('input')?.focus()
      }, 30)
    }
  }, [ctx.openSearch])
  useEffect(() => {
    window.addEventListener('keydown', e => {
      if (isHotkey('mod+k', e)) {
        ctx.setState({openSearch: true})
      }
      if (isHotkey('esc', e)) {
        ctx.setState!({ openSearch: false })
      }
    })
  }, [])
  if (!ctx.openSearch && mode === 'window') return null
  return (
    <div
      className={`z-[200] ${mode === 'window' ? 'fixed inset-0 dark:bg-black/30 bg-black/10 overflow-hidden' : 'relative hidden lg:block'}`}
      ref={searchContainer}
      onClick={() => {
        if (mode === 'window') {
          ctx.setState({
            openSearch: false
          })
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          mode === 'window'
            ? 'w-[600px] min-h-[100px] mt-20 in-modal rounded mx-auto max-w-[calc(100vw_-_40px)]'
            : ''
        }
      >
        <div
          className={`text-sm relative h-10 ${mode === 'window' ? '' : 'border rounded-lg duration-200'} ${
            state().searchFocus
              ? 'dark:border-gray-200/50 border-gray-400'
              : 'dark:border-gray-200/20 border-gray-300'
          }`}
        >
          <ISearch
            className={`dark:text-gray-200/30 text-gray-400 w-5 h-5 -mt-2.5 absolute left-1.5 top-1/2`}
          />
          <input
            onFocus={() => setState({ searchFocus: true })}
            value={state().keyword}
            onChange={(e) => {
              const query = e.target.value
              clearTimeout(timer.current)
              if (!query) {
                setState({ result: [], searching: false, keyword: query })
              } else {
                setState({ keyword: query, searching: true })
                timer.current = window.setTimeout(() => {
                  search()
                }, 300)
              }
            }}
            className={
              'dark:text-gray-200 pr-6 outline-none pl-8 lg:pr-2 h-full w-full border-none bg-transparent dark:placeholder:text-gray-200/30 placeholder:text-gray-400'
            }
            placeholder={'Search'}
          />
          <div
            className={
              'p-1 flex lg:hidden dark:text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 duration-200 cursor-pointer rounded items-center justify-center'
            }
            onClick={() => {
              ctx.setState({
                openSearch: false
              })
            }}
          >
            <Icon icon={'gg:close-o'} className={'text-lg'} />
          </div>
        </div>
        <div
          className={`${
            (!state().keyword || !state().searchFocus) && mode === 'dir'
              ? 'hidden'
              : ''
          } ${mode === 'window' ? 'max-h-[calc(100vh_-_200px)] border-t dark:border-gray-100/10 border-gray-200' : 'max-w-[400px] max-h-[calc(100vh_-_180px)] absolute in-modal rounded-lg mx-auto w-[calc(100vw_-_40px)]'} overflow-y-auto min-h-10 left-0 top-10`}
          onClick={(e) => e.stopPropagation()}
        >
          {!state().keyword &&
            !state().result.length &&
            !state().searching &&
            mode === 'window' && (
              <div
                className={
                  'text-center text-black/50 dark:text-white/50 text-sm pt-5'
                }
              >
                Enter keywords to search content
              </div>
            )}
          {state().keyword && !state().result.length && !state().searching && (
            <div className={'text-sm text-center py-3 text-gray-400 px-5 '}>
              No results for "
              <span className={'dark:text-gray-300 text-gray-500'}>
                {state().keyword}
              </span>
              "
            </div>
          )}
          {state().keyword && !state().result.length && state().searching && (
            <div className={'text-sm text-center py-3 text-gray-400 px-5 '}>
              Searching...
            </div>
          )}
          <div
            className={`p-2 break-all relative dark:text-white/70 text-gray-600 ${
              state().keyword && !state().result.length ? 'hidden' : ''
            }`}
          >
            <div>
              {state().keyword && !!state().result.length && (
                <>
                  {state().result.map((d, index) => (
                    <Fragment key={d.doc}>
                      <div
                        className={
                          'flex text-sm items-center py-1 dark:hover:bg-white/5 rounded cursor-pointer dark:hover:text-white/90 hover:text-gray-700 hover:bg-black/5'
                        }
                        onClick={() => selectResult(d.doc, {})}
                      >
                        <span className={'ml-2 font-semibold'}>
                          {d.doc!.split('/').pop()}
                        </span>
                      </div>
                      <>
                        {d.showText?.map((t, i) => (
                          <div
                            className={
                              'pr-2 pl-3 dark:hover:bg-white/5 rounded cursor-pointer dark:hover:text-gray-300 hover:text-gray-700 hover:bg-black/5'
                            }
                            key={i}
                            onClick={() => {
                              if (t.type === 'head') {
                                selectResult(d.doc, {
                                  position: t.path.join('-')
                                })
                              } else {
                                selectResult(d.doc, {
                                  position: t.path.join('-')
                                })
                              }
                            }}
                          >
                            <div
                              className={
                                'flex leading-6 pl-2 border-gray-400/30 py-1'
                              }
                            >
                              <span
                                className={
                                  'w-7 h-5 scale-90 relative top-0.5 mr-2 flex-shrink-0 flex items-center justify-center rounded dark:border-gray-200/10 border text-xs border-gray-200'
                                }
                              >
                                {t.type === 'code-line' ? (
                                  <Icon
                                    icon={'lucide:code'}
                                    className={'text-base'}
                                  />
                                ) : (
                                  symbolMap.get(t.type)
                                )}
                              </span>
                              <span
                                className={'flex-1 text-[13px] leading-6'}
                                dangerouslySetInnerHTML={{
                                  __html: t.html || ''
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        {d.text?.length > 5 && d.showText?.length < 6 && (
                          <div
                            className={'pr-2 pl-3'}
                            onClick={() => {
                              showMore(index)
                            }}
                          >
                            <span
                              className={
                                'leading-6 pl-[45px] py-1 text-blue-500 cursor-pointer text-sm duration-200 dark:hover:text-blue-600 hover:text-blue-400'
                              }
                            >
                              show more...
                            </span>
                          </div>
                        )}
                      </>
                    </Fragment>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
