import { spawn } from "node:child_process"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SOUND_FILE = join(__dirname, "fahhh.mp3")

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

function toStrings(values) {
  return values
    .flat()
    .filter((value) => typeof value === "string" && value.trim().length > 0)
}

function isToolError(input = {}, output = {}) {
  if (
    output?.error ||
    input?.error ||
    output?.ok === false ||
    input?.ok === false ||
    output?.success === false ||
    input?.success === false
  ) {
    return true
  }

  const exitCodeCandidates = [
    output?.exitCode,
    output?.exit_code,
    output?.code,
    output?.metadata?.exitCode,
    output?.metadata?.exit_code,
    output?.metadata?.code,
    input?.exitCode,
    input?.exit_code,
    input?.code,
    input?.metadata?.exitCode,
    input?.metadata?.exit_code,
    input?.metadata?.code,
  ]
  const hasNonZeroExitCode = exitCodeCandidates.some(
    (value) => typeof value === "number" && value !== 0,
  )
  if (hasNonZeroExitCode) {
    return true
  }

  const textCandidates = toStrings([
    output?.result,
    output?.output,
    output?.stderr,
    output?.stdout,
    output?.message,
    output?.title,
    output?.text,
    output?.metadata?.result,
    output?.metadata?.output,
    output?.metadata?.stderr,
    output?.metadata?.stdout,
    output?.metadata?.message,
    output?.metadata?.text,
    input?.result,
    input?.output,
    input?.stderr,
    input?.stdout,
    input?.message,
    input?.text,
    input?.metadata?.result,
    input?.metadata?.output,
    input?.metadata?.stderr,
    input?.metadata?.stdout,
    input?.metadata?.message,
    input?.metadata?.text,
  ])

  return textCandidates.some((text) => ERROR_PATTERN.test(text))
}

export const FahhhPlugin = async () => {
  return {
    event: async ({ event }) => {
      if (!event || typeof event.type !== "string") {
        return
      }

      if (event.type === "session.error") {
        playFahhh()
        return
      }

      if (event.type === "tool.execute.after") {
        const input = event?.input ?? event?.properties?.input ?? {}
        const output =
          event?.output ?? event?.properties?.output ?? event?.result ?? {}

        if (isToolError(input, output)) {
          playFahhh()
        }
      }
    },

    "tool.execute.after": async (input = {}, output = {}) => {
      if (isToolError(input, output)) {
        playFahhh()
      }
    },
  }
}
