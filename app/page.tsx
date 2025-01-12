"use client"

import { createSafe, loadSafe } from "@/actions/safe"
import type { FormEventHandler } from "react"
import { useState } from "react"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleLogin: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    setLoading(true)
    try {
      const safe = await loadSafe(email, password)
      setSuccessMessage(safe)
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  const handleCreate: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    setLoading(true)
    try {
      await createSafe(email, password)
      setSuccessMessage("Safe created")
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <form className="block max-w-md mt-4 mx-auto" onSubmit={handleLogin}>
        <label className="flex border border-gray-400 mb-4">
          <span className="mx-2">Email:</span>
          <input
            type="text"
            name="email"
            value={email}
            className="flex-1 px-2"
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="flex border border-gray-400 mb-4">
          <span className="mx-2">Password:</span>
          <input
            type="password"
            name="password"
            value={password}
            className="flex-1 px-2"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {loading && <div className="text-blue-700 mb-2">Loading...</div>}
        {Boolean(errorMessage) && <div className="text-red-700 mb-2">{errorMessage}</div>}
        {Boolean(successMessage) && <div className="text-green-700 mb-2">{successMessage}</div>}

        <button className="block bg-gray-200 border border-gray-400 ml-auto mb-4 px-8">
          Login
        </button>
      </form>

      <form className="block max-w-md mt-4 mx-auto" onSubmit={handleCreate}>
        <label className="flex border border-gray-400 mb-4">
          <span className="mx-2">Email:</span>
          <input
            type="text"
            name="email"
            value={email}
            className="flex-1 px-2"
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="flex border border-gray-400 mb-4">
          <span className="mx-2">Password:</span>
          <input
            type="password"
            name="password"
            value={password}
            className="flex-1 px-2"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {loading && <div className="text-blue-700 mb-2">Creating...</div>}
        {Boolean(errorMessage) && <div className="text-red-700 mb-2">{errorMessage}</div>}
        {Boolean(successMessage) && <div className="text-green-700 mb-2">{successMessage}</div>}

        <button className="block bg-gray-200 border border-gray-400 ml-auto mb-4 px-8">
          Create
        </button>
      </form>
    </div>
  )
}
