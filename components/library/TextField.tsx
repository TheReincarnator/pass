"use client"

export default function TextField(props: {
  label?: string
  value?: string
  className?: string
  onUpdate?: (newValue: string) => void
}) {
  const { label, value, className, onUpdate } = props

  return (
    <label className={`flex border border-gray-400 my-2 py-1 ${className}`}>
      {label && <span className="ml-2 mr-1 min-w-20">{label}:</span>}
      <input
        type="text"
        name="email"
        value={value ?? ""}
        className="flex-1 mx-1 px-1"
        onChange={(e) => onUpdate?.(e.target.value)}
      />
    </label>
  )
}
