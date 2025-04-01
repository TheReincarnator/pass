'use client'

export function Message(props: { type?: 'ok' | 'warning' | 'error'; text: string }) {
  const { type, text } = props

  let icon
  if (type === 'ok') {
    icon = 'check'
  } else if (type === 'warning' || type === 'error') {
    icon = 'exclamation-triangle'
  } else {
    icon = null
  }

  return (
    <p className={`message ${type ? `message--${type}` : ''}`}>
      {icon && <i className={`fa fa-${icon}`} />}
      <span>{text}</span>
    </p>
  )
}
