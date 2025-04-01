'use client'

export function Button(props: {
  type: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'critical'
  text?: string
  leftIcon?: string
  rightIcon?: string
  loading?: boolean
  onClick?: () => void
}) {
  const { type, variant, text, leftIcon, rightIcon, loading, onClick } = props

  const className = variant && variant !== 'primary' ? `button-${variant}` : undefined

  return (
    <button
      type={type || 'button'}
      disabled={loading || undefined}
      className={className}
      onClick={onClick}
    >
      {leftIcon && <i className={leftIcon} />}
      {text}
      {loading && (
        <>
          &nbsp;
          <i className="fa fa-cog fa-spin" />
        </>
      )}
      {!loading && rightIcon && (
        <>
          &nbsp;
          <i className={rightIcon} />
        </>
      )}
    </button>
  )
}
