/**
 * ch57x-keyboard-tool actions for dropdowns.
 * Value = string sent in YAML. Label = display in UI.
 * See https://github.com/kriomant/ch57x-keyboard-tool doc/actions.md
 */

export type ActionOption = { value: string; label: string }

const COMMON_KEYS: ActionOption[] = [
  { value: 'enter', label: 'Enter' },
  { value: 'space', label: 'Space' },
  { value: 'backspace', label: 'Backspace' },
  { value: 'tab', label: 'Tab' },
  { value: 'esc', label: 'Escape' },
  { value: 'delete', label: 'Delete' },
]

const LETTERS: ActionOption[] = 'abcdefghijklmnopqrstuvwxyz'
  .split('')
  .map((c) => ({ value: c, label: c.toUpperCase() }))

const NUMBERS: ActionOption[] = '0123456789'.split('').map((c) => ({ value: c, label: c }))

const PUNCTUATION: ActionOption[] = [
  { value: 'slash', label: '/' },
  { value: 'comma', label: ',' },
  { value: 'period', label: '.' },
  { value: 'semicolon', label: ';' },
  { value: 'quote', label: "'" },
  { value: 'bracketleft', label: '[' },
  { value: 'bracketright', label: ']' },
  { value: 'backslash', label: '\\' },
  { value: 'minus', label: '-' },
  { value: 'equal', label: '=' },
  { value: 'grave', label: '`' },
]

const MAC_SHORTCUTS: ActionOption[] = [
  { value: 'cmd-a', label: 'Cmd+A (Select All)' },
  { value: 'cmd-c', label: 'Cmd+C (Copy)' },
  { value: 'cmd-n', label: 'Cmd+N (New)' },
  { value: 'cmd-s', label: 'Cmd+S (Save)' },
  { value: 'cmd-t', label: 'Cmd+T (New Tab)' },
  { value: 'cmd-tab', label: 'Cmd+Tab (Next Tab)' },
  { value: 'cmd-v', label: 'Cmd+V (Paste)' },
  { value: 'cmd-w', label: 'Cmd+W (Close)' },
  { value: 'cmd-x', label: 'Cmd+X (Cut)' },
  { value: 'cmd-z', label: 'Cmd+Z (Undo)' },
  { value: 'opt-tab', label: 'Option+Tab' },
]

const CTRL_SHORTCUTS: ActionOption[] = [
  { value: 'ctrl-a', label: 'Ctrl+A (Select All)' },
  { value: 'ctrl-c', label: 'Ctrl+C (Copy)' },
  { value: 'ctrl-f', label: 'Ctrl+F (Find)' },
  { value: 'ctrl-n', label: 'Ctrl+N (New)' },
  { value: 'ctrl-o', label: 'Ctrl+O (Open)' },
  { value: 'ctrl-p', label: 'Ctrl+P (Print)' },
  { value: 'ctrl-s', label: 'Ctrl+S (Save)' },
  { value: 'ctrl-t', label: 'Ctrl+T (New Tab)' },
  { value: 'ctrl-tab', label: 'Ctrl+Tab (Next Tab)' },
  { value: 'ctrl-shift-tab', label: 'Ctrl+Shift+Tab (Previous Tab)' },
  { value: 'ctrl-v', label: 'Ctrl+V (Paste)' },
  { value: 'ctrl-w', label: 'Ctrl+W (Close)' },
  { value: 'ctrl-x', label: 'Ctrl+X (Cut)' },
  { value: 'ctrl-z', label: 'Ctrl+Z (Undo)' },
  { value: 'ctrl-shift-t', label: 'Ctrl+Shift+T (Reopen Tab)' },
  { value: 'alt-tab', label: 'Alt+Tab' },
  { value: 'ctrl-alt-del', label: 'Ctrl+Alt+Del' },
]

const FUNCTION_KEYS: ActionOption[] = [
  { value: 'f1', label: 'F1' },
  { value: 'f2', label: 'F2' },
  { value: 'f3', label: 'F3' },
  { value: 'f4', label: 'F4' },
  { value: 'f5', label: 'F5' },
  { value: 'f6', label: 'F6' },
  { value: 'f7', label: 'F7' },
  { value: 'f8', label: 'F8' },
  { value: 'f9', label: 'F9' },
  { value: 'f10', label: 'F10' },
  { value: 'f11', label: 'F11' },
  { value: 'f12', label: 'F12' },
]

const NAVIGATION: ActionOption[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'up', label: 'Up' },
  { value: 'down', label: 'Down' },
  { value: 'home', label: 'Home' },
  { value: 'end', label: 'End' },
  { value: 'pageup', label: 'Page Up' },
  { value: 'pagedown', label: 'Page Down' },
  { value: 'insert', label: 'Insert' },
]

const MEDIA: ActionOption[] = [
  { value: 'play', label: 'Play / Pause' },
  { value: 'prev', label: 'Previous' },
  { value: 'next', label: 'Next' },
  { value: 'stop', label: 'Stop' },
  { value: 'mute', label: 'Mute' },
  { value: 'volumeup', label: 'Volume Up' },
  { value: 'volumedown', label: 'Volume Down' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'calculator', label: 'Calculator' },
  { value: 'screenlock', label: 'Screen Lock' },
]

const MOUSE: ActionOption[] = [
  { value: 'click', label: 'Mouse Click (Left)' },
  { value: 'rclick', label: 'Right Click' },
  { value: 'mclick', label: 'Middle Click' },
  { value: 'wheelup', label: 'Scroll Up' },
  { value: 'wheeldown', label: 'Scroll Down' },
  { value: 'move(0,-10)', label: 'Mouse Move Up' },
  { value: 'move(0,10)', label: 'Mouse Move Down' },
  { value: 'move(-10,0)', label: 'Mouse Move Left' },
  { value: 'move(10,0)', label: 'Mouse Move Right' },
  { value: 'wheel(1)', label: 'Wheel Up (1)' },
  { value: 'wheel(-1)', label: 'Wheel Down (1)' },
]

/** Mac list: Cmd/Option shortcuts only (no Ctrl). Use when running on macOS. */
export const ACTION_OPTIONS_MAC: ActionOption[] = [
  ...MAC_SHORTCUTS,
  ...COMMON_KEYS,
  ...LETTERS,
  ...NUMBERS,
  ...PUNCTUATION,
  ...FUNCTION_KEYS,
  ...NAVIGATION,
  ...MEDIA,
  ...MOUSE,
]

/** Windows/Linux list: Ctrl/Alt shortcuts at top. Use when not on Mac. */
export const ACTION_OPTIONS_WINDOWS: ActionOption[] = [
  ...CTRL_SHORTCUTS,
  ...COMMON_KEYS,
  ...LETTERS,
  ...NUMBERS,
  ...PUNCTUATION,
  ...MAC_SHORTCUTS,
  ...FUNCTION_KEYS,
  ...NAVIGATION,
  ...MEDIA,
  ...MOUSE,
]

/** All action values (for “is value valid” checks). Same set on Mac and Windows. */
export const ACTION_OPTIONS: ActionOption[] = ACTION_OPTIONS_WINDOWS

/** Returns the action list for the current platform. Call only on client (uses navigator). */
export function getActionOptions(): ActionOption[] {
  if (typeof navigator === 'undefined') return ACTION_OPTIONS_WINDOWS
  const isMac = /Mac|iPhone|iPad/i.test(navigator.platform)
  return isMac ? ACTION_OPTIONS_MAC : ACTION_OPTIONS_WINDOWS
}
