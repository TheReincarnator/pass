"use client"

export default function TextField(props: {
  children: React.ReactNode
  type?: "button" | "submit"
  className?: string
  onClick?: () => void
}) {
  const { children, type, className, onClick } = props

  return (
    <button
      type={type || "button"}
      className={`block bg-gray-200 border border-gray-400 ml-auto mb-4 py-2 px-8 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
