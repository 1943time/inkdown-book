import { useContext } from "react"
import Dark from './icons/Dark'
import Light from './icons/Light'
import { DocCtx } from '../utils/ctx'

export function ThemeSwitch() {
  const ctx = useContext(DocCtx)
  return (
    <div
      className={
        'border select-none h-[20px] dark:border-gray-100/10 border-black/10 cursor-pointer flex w-9 items-center dark:text-white rounded-full dark:bg-white/10 bg-black/5'
      }
      onClick={() => {
        ctx.setTheme(ctx.theme === 'dark' ? 'light' : 'dark')
      }}
    >
      <div
        className={`theme-switch p-0.5 rounded-full dark:bg-black bg-white duration-200`}
      >
        <Light className={`w-[14px] h-[14px] light-mode`} />
        <Dark className={`w-[14px] h-[14px] dark-mode`} />
      </div>
    </div>
  )
}