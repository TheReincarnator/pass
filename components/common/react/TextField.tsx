"use client"

export default function TextField(props: {
  type?: "text" | "password"
  label?: string
  value?: string
  cols?: number
  onUpdate?: (newValue: string) => void
}) {
  const { type, label, value, cols, onUpdate } = props

  return (
    <label className={`form__input size${cols || 12}of12`}>
      {label && <span className="label">{label}:</span>}
      <input
        type={type || "text"}
        name="email"
        value={value ?? ""}
        onChange={(e) => onUpdate?.(e.target.value)}
      />
    </label>
  )
}
