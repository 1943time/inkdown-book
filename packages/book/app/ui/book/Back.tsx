import { useContext } from 'react'
import { TreeContext } from '../../utils/ctx'

export function BackToFirst() {
  const tree = useContext(TreeContext)
  return (
    <div className={'flex justify-center mt-20 flex-col items-center'}>
      <div className={'flex items-center'}>
        <img src={'/logo.svg'} className={'w-5 h-5 mr-2'}/>
        <span className={'text-lg font-semibold'}>Document not found</span>
      </div>
      <span
        className={'mt-3 text-sm text-blue-500 duration-200 dark:hover:text-blue-600 cursor-pointer hover:text-blue-400'}
        onClick={tree.toFirstChapter}
      >
        Back to first chapter
      </span>
    </div>
  )
}
