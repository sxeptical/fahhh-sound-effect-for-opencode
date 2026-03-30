import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SOUND_FILE = join(__dirname, "fahhh.mp3")

export const FahhhPlugin = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type === "session.error") {
        $`afplay ${SOUND_FILE}`.catch(() => {})
      }
    },

    "tool.execute.after": async (input, output) => {
      const result = typeof output.result === "string" ? output.result : ""
      const isError =
        output.error ||
        /error:|ENOENT|no such file|not found|command not found|permission denied|EACCES|cannot find|fatal:|failed to/i.test(
          result,
        )

      if (isError) {
        $`afplay ${SOUND_FILE}`.catch(() => {})
      }
    },
  }
}
