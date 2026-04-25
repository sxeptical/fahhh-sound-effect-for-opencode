# fahhh-sound-effect-for-opencode

An OpenCode plugin that plays the **Fahhh** sound effect when errors happen.

This repo now also includes a Claude Code hook script so you can reuse the same sound in both tools.

## OpenCode

### Install from npm (in `opencode.json`)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-fahhh"]
}
```

### Install from local files

Copy `index.js` and `fahhh.mp3` into one of these plugin directories:

```bash
# Global (all projects)
cp index.js fahhh.mp3 ~/.config/opencode/plugins/

# Project-specific
mkdir -p .opencode/plugins
cp index.js fahhh.mp3 .opencode/plugins/
```

## Claude Code

Claude Code hooks run shell commands with JSON on stdin. Use `claude-hook.js` as the command handler.

### Example (`~/.claude/settings.json` or `.claude/settings.json`)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node /absolute/path/to/fahhh-sound-effect-for-opencode/claude-hook.js"
          }
        ]
      }
    ]
  }
}
```

Optional override:

```bash
export FAHHH_SOUND_FILE="/absolute/path/to/fahhh.mp3"
```

## Trigger behavior

### OpenCode

The plugin plays sound on:

- `session.error`
- `tool.execute.after` when it detects:
  - explicit error flags (`error`, `ok: false`, `success: false`)
  - non-zero exit codes (`exitCode`, `exit_code`, `code`)
  - known error text (`ENOENT`, `command not found`, `permission denied`, `fatal:`, etc.)

### Claude Code

The hook script reads the event payload from stdin and plays sound when it detects:

- error flags
- non-zero exit codes
- known error text in stderr/result/message fields

## Platform support

- macOS: `afplay`
- Linux: `paplay` fallback to `aplay`
- Windows: PowerShell `Media.SoundPlayer`

## Quick local checks

```bash
npm run check
```
