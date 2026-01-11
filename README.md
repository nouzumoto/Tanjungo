# Tanjungo

Browser extension for **https://translations.telegram.org/** with dark theme, advanced hotkeys, emoji autocomplete, and auto-replace features.

## 🚀 Features

### 1. **Dark Theme Toggle**
- Popup with ON/OFF switch
- Preferences saved in `browser.storage.sync`
- Complete dark theme CSS using Telegram Desktop colors
- Automatic removal of white lines and borders

### 2. **Advanced Hotkeys**

**Translation Shortcuts:**
- `Ctrl+Enter` (or `y`) → Apply 1st suggestion & move to next
- `Ctrl+Enter` (in text field) → Submit suggestion & move down to next one
- `Ctrl+A` (or `i`) → Add a new translation
- `Ctrl+E` (or `c`) → Edit the first suggestion
- `Esc` (in field) → Cancel current action

**Text Manipulation:**
- `Ctrl+K` → Quick search selected text
- `Ctrl+Shift+X` → Cut & wrap text in `[text]()`
- `Ctrl+M` → Remove all asterisks (*) from selected text
- `Ctrl+I` → Convert selected text to uppercase (ALL CAPS)
- `Ctrl+*` → Insert token wrapped in `**token**`

**Navigation:**
- `/` → Focus search field

### 3. **Emoji Autocomplete**
- Type `:` to open emoji popup
- Filter by typing after `:` (e.g., `:sm` → shows `:smile:` 😊)
- Navigate with ↑↓ arrows, select with Enter, close with Escape
- 100+ common emojis (Slack-style)
- Maintains focus on input field after selection

## 📦 Installation

### Firefox

//

### Chrome/Edge (Manifest V3)

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `Tanjungo` folder

## How to use

- Press on the browser extension icon

## 📄 License

MIT License - Free to use for personal and commercial projects.
