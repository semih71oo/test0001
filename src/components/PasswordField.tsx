import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type PasswordFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete?: 'current-password' | 'new-password'
  minLength?: number
}

export function PasswordField({ id, label, value, onChange, autoComplete = 'new-password', minLength = 12 }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input">
        <input id={id} name={id} type={visible ? 'text' : 'password'} value={value} onChange={event => onChange(event.target.value)} autoComplete={autoComplete} required minLength={minLength} maxLength={128} />
        <button type="button" aria-label={visible ? `${label} gizle` : `${label} göster`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button>
      </div>
    </div>
  )
}
