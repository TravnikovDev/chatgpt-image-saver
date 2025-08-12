# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Description

ChatGPT Image Saver is a Chrome browser extension that enables users to bulk download all images from ChatGPT conversations with a single click. The extension automatically organizes downloaded images by conversation, making it easy to save and manage AI-generated images from ChatGPT sessions.

**Chrome Web Store**: https://chromewebstore.google.com/detail/pidbeaifkcbphmlmlnglddbfackeeiah?utm_source=item-share-cb

## User Workflow

### Current Enhanced Workflow (with UI)

1. **Installation**: User installs the extension from Chrome Web Store or loads it manually
2. **Navigate to ChatGPT**: User visits https://chat.openai.com/ or https://chatgpt.com/ and opens any conversation
3. **Floating UI**: A floating rounded square UI appears in the right middle of the screen with:
   - **Save icon**: Main clickable area for quick download
   - **Dropdown chevron**: Small vertical rectangle on the right for accessing options
4. **Quick Download**: Click the save icon to immediately download all images (same as current functionality)
5. **Advanced Options**: Click the dropdown chevron to access:
   - **Custom folder name**: Override default chat-id folder naming
   - **Progress tracking**: View real-time download progress with success/failure counts
   - **Failed downloads**: Future feature to retry failed downloads
6. **Organized Storage**: Images are saved to `Downloads/{folder-name}/{index}.png` where:
   - `folder-name` is either custom name or sanitized chat-id
   - `index` is the sequential number of the image within that conversation

### Legacy Workflow (browser toolbar)

The original browser toolbar extension button still works as before for backward compatibility.

## Development Commands

- `npm run build` - Build the extension for Chrome and create a ZIP file
- `npm run dev` - Start development server with Chrome browser
- `npm run start` - Start the extension in Chrome browser

## Architecture

The extension follows Chrome Extension Manifest V3 architecture with two main components:

### Background Script (`background.js`)
- Handles the extension button click events (legacy functionality)
- Manages image download requests via Chrome Downloads API
- Supports custom folder names from content script
- Organizes downloaded images into folders (custom name or sanitized chat ID)
- Tracks download success/failure status and communicates back to content script
- Sanitizes folder names for filesystem compatibility

### Content Script (`contentScript.js`) 
- Auto-injected into ChatGPT pages via manifest content_scripts
- Creates and manages floating UI with save button and dropdown
- Handles UI interactions (save button clicks, dropdown toggle, custom folder input)
- Finds all images within `.agent-turn` elements (ChatGPT's response containers)
- Sends download requests to background script with image URLs, indices, chat IDs, and custom folder names
- Tracks and displays download progress in real-time

### File Structure
- Main scripts: `background.js`, `contentScript.js`
- Extension configuration: `manifest.json` (Manifest V3)
- TypeScript configuration: `tsconfig.json`
- Build artifacts: `dist/` directory
- Extension icons: `icons/` directory (16px, 48px, 128px)

## Key Technical Details

- Uses Chrome's `scripting` API to inject content scripts
- Requires `downloads`, `scripting`, and `activeTab` permissions
- Downloads are organized by chat ID extracted from URL pathname
- Images are indexed sequentially within each chat folder
- Uses `conflictAction: "uniquify"` to handle filename conflicts