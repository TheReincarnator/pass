'use client'

import classNames from 'classnames'

type Props = {
  type: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'critical'
  text?: string
  leftIcon?: string
  rightIcon?: string
  loading?: boolean
  className?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export function Button({
  type,
  variant,
  text,
  leftIcon,
  rightIcon,
  loading,
  className,
  onClick,
}: Props) {
  return (
    <button
      type={type || 'button'}
      disabled={loading || undefined}
      className={classNames(
        {
          [`button-${variant}`]: variant && variant !== 'primary',
          'button-icon-only': (leftIcon || rightIcon) && !text,
        },
        className,
      )}
      onClick={onClick}
    >
      {leftIcon && <i className={`fa fa-${leftIcon}`} />}
      {leftIcon && Boolean(text) && <>&nbsp;</>}

      {text}

      {(loading || rightIcon) && Boolean(text) && <>&nbsp;</>}
      {loading && <i className="fa fa-cog fa-spin" />}
      {!loading && rightIcon && <i className={`fa fa-${rightIcon}`} />}
    </button>
  )
}
