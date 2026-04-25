#!/usr/bin/env node

import { spawn } from "node:child_process"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SOUND_FILE = process.env.FAHHH_SOUND_FILE || join(__dirname, "fahhh.mp3")

const ERROR_PATTERN =
  /error:|enoent|no such file|not found|command not found|permission denied|eacces|cannot find|fatal:|failed to|exception|timed out|timeout/i

function spawnDetached(command, args) {
  try {
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
    })
    child.unref()
    return true
  } catch {
    return false
  }
}

function playFahhh(soundFile = SOUND_FILE) {
  if (process.platform === "darwin") {
    return spawnDetached("afplay", [soundFile])
  }

  if (process.platform === "linux") {
    return (
      spawnDetached("paplay", [soundFile]) || spawnDetached("aplay", [soundFile])
    )
  }

  if (process.platform === "win32") {
    const escapedPath = soundFile.replace(/'/g, "''")
    return spawnDetached("powershell", [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      `(New-Object Media.SoundPlayer '${escapedPath}').PlaySync();`,
    ])
  }

  return false
}

function readStdin() {
  return new Promise((resolve) => {
    let raw = ""
    process.stdin.setEncoding("utf8")
    process.stdin.on("data", (chunk) => {
      raw += chunk
    })
    process.stdin.on("end", () => {
      resolve(raw)
    })
    process.stdin.on("error", () => {
      resolve("")
    })
  })
}

function parsePayload(raw) {
  if (!raw || !raw.trim()) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function hasNonZeroExitCode(payload) {
  const exitCodes = [
    payload?.exit_code,
    payload?.exitCode,
    payload?.code,
    payload?.tool_response?.exit_code,
    payload?.tool_response?.exitCode,
    payload?.tool_response?.code,
    payload?.tool_output?.exit_code,
    payload?.tool_output?.exitCode,
    payload?.tool_output?.code,
  ]

  return exitCodes.some((value) => typeof value === "number" && value !== 0)
}

function hasErrorFlag(payload) {
  return Boolean(
    payload?.error ||
      payload?.is_error ||
      payload?.success === false ||
      payload?.ok === false ||
      payload?.tool_response?.error ||
      payload?.tool_response?.success === false ||
      payload?.tool_response?.ok === false,
  )
}

function hasErrorText(payload) {
  const textCandidates = [
    payload?.message,
    payload?.stderr,
    payload?.stdout,
    payload?.result,
    payload?.tool_output,
    payload?.tool_result,
    payload?.tool_response?.message,
    payload?.tool_response?.stderr,
    payload?.tool_response?.stdout,
    payload?.tool_response?.result,
  ].filter((value) => typeof value === "string" && value.trim().length > 0)

  return textCandidates.some((text) => ERROR_PATTERN.test(text))
}

function payloadIndicatesError(payload) {
  if (!payload || typeof payload !== "object") {
    return false
  }

  return hasErrorFlag(payload) || hasNonZeroExitCode(payload) || hasErrorText(payload)
}

async function main() {
  const raw = await readStdin()
  const payload = parsePayload(raw)

  if (payloadIndicatesError(payload)) {
    playFahhh()
  }

  process.exit(0)
}

main()
