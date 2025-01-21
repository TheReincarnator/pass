import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Pass. Deine Passwörter.",
  description: "Pass. Für deine Passwörter und sensiblen Daten.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-w-xl mt-4 mx-auto`}
      >
        <div className="flex flex-col">{children}</div>
      </body>
    </html>
  )
}
