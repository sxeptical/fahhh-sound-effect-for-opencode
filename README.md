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

The plugin listens for `session.error` events and plays `fahhh.mp3` using macOS's built-in `afplay` command. The sound plays asynchronously so it never blocks OpenCode.

## Platform support

Currently macOS only (`afplay`). PRs welcome for Linux (`aplay`/`paplay`) and Windows (`powershell`) support.
