# fahhh-sound-effect-for-opencode

An Opencode plugin that plays the **Fahhh** sound effect when an error is encountered.

## Install

### From npm (in your `opencode.json`)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-fahhh"]
}
```

### From local files

Copy `index.js` and `fahhh.mp3` into your OpenCode plugins directory:

```bash
# Global (all projects)
cp index.js fahhh.mp3 ~/.config/opencode/plugins/

# Project-specific
cp index.js fahhh.mp3 .opencode/plugins/
```

## How it works

The plugin listens for errors and plays `fahhh.mp3` using macOS's built-in `afplay` command. The sound plays asynchronously so it never blocks OpenCode.

Triggers on:
- **Session errors** (`session.error`) -- API failures, rate limits, auth issues, etc.
- **Tool errors** (`tool.execute.after`) -- failed bash commands, file not found, permission denied, command not found, and other terminal/tool errors

## Platform support

Currently macOS only (`afplay`). PRs welcome for Linux (`aplay`/`paplay`) and Windows (`powershell`) support.
