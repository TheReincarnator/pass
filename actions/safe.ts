"use server"

import prisma from "@/lib/prisma"
import { Safe } from "@prisma/client"
import crypto from "node:crypto"

export async function createSafe(email: string, password: string): Promise<void> {
  if (await prisma.safe.findFirst({ where: { email } })) {
    throw new Error("Safe already exists")
  }

  const content = { type: "pass-safe", entries: [] }
  const contentString = JSON.stringify(content)

  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(password, "utf8"), iv)
  const encrypted = cipher.update(contentString, "utf8", "base64") + cipher.final("base64")

  const safe: Omit<Safe, "id"> = {
    version: 1,
    email,
    iv: iv.toString("base64"),
    content: encrypted,
  }
  prisma.safe.create({ data: safe })
}

export async function loadSafe(email: string, password: string): Promise<string> {
  const safe = await prisma.safe.findUniqueOrThrow({ where: { email } })
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(password, "utf8"),
    Buffer.from(safe.iv, "base64"),
  )

  let content = undefined
  let contentString: string | undefined = undefined
  try {
    contentString = decipher.update(safe.content, "utf8", "base64") + decipher.final("base64")
    content = JSON.parse(contentString)
  } catch (error) {
    // Errors are typically just wrong passwords
    console.warn(error)
  }

  if (!contentString || typeof content !== "object" || content?.meta?.type !== "pass-safe") {
    throw new Error("Cannot decrypt safe, probably wrong password")
  }

  return contentString
}

export async function updateSafe(
  email: string,
  password: string,
  newContent: string,
): Promise<void> {
  // Ensure the safe exists and the password is correct
  await loadSafe(email, password)

  const safe = await prisma.safe.findUniqueOrThrow({ where: { email } })
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(password, "utf8"),
    Buffer.from(safe.iv, "base64"),
  )
  const encrypted = cipher.update(newContent, "utf8", "base64") + cipher.final("base64")

  prisma.safe.update({
    where: { email, version: safe.version },
    data: { content: encrypted, version: safe.version + 1 },
  })
}
