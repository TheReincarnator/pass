"use client"

import { loadSafe } from "@/actions/safe"
import type { FormEventHandler } from "react"
import { useState } from "react"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    console.log(await loadSafe(email, password))
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input type="text" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>

      <label>
        Password:
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <button>Login</button>
    </form>
  )
}
