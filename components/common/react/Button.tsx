"use client"

export default function TextField(props: {
  type?: "button" | "submit"
  text?: string
  leftIcon?: string
  rightIcon?: string
  loading?: boolean
  onClick?: () => void
}) {
  const { type, text, leftIcon, rightIcon, loading, onClick } = props

  return (
    <button type={type || "button"} disabled={loading || undefined} onClick={onClick}>
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
