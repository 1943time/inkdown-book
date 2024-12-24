import { ICheck } from './icons/ICheck'

export function Checkbox(props: {
  checked?: boolean
}) {
  return (
    <div className={`at-checkbox ${props.checked ? 'checked' : ''}`}>
      {!!props.checked &&
        <ICheck/>
      }
    </div>
  )
}