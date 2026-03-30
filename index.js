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
  }
}
