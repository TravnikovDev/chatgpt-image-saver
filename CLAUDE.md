# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Description

ChatGPT Image Saver is a Chrome browser extension that enables users to bulk download all images from ChatGPT conversations with a single click. The extension automatically organizes downloaded images by conversation, making it easy to save and manage AI-generated images from ChatGPT sessions.

**Chrome Web Store**: https://chromewebstore.google.com/detail/pidbeaifkcbphmlmlnglddbfackeeiah?utm_source=item-share-cb

## User Workflow

1. **Installation**: User installs the extension from Chrome Web Store or loads it manually
2. **Navigate to ChatGPT**: User visits https://chat.openai.com/ or https://chatgpt.com/ and opens any conversation
3. **Activate Extension**: User clicks the extension icon in the browser toolbar
4. **Automatic Download**: Extension immediately scans the current conversation for all images in AI responses and downloads them
5. **Organized Storage**: Images are automatically saved to `Downloads/{chat-id}/{index}.png` where:
   - `chat-id` is extracted from the conversation URL and sanitized for filesystem compatibility
   - `index` is the sequential number of the image within that conversation

## Development Commands

- `npm run build` - Build the extension for Chrome and create a ZIP file
- `npm run dev` - Start development server with Chrome browser
- `npm run start` - Start the extension in Chrome browser

## Architecture

The extension follows Chrome Extension Manifest V3 architecture with two main components:

### Background Script (`background.js`)
- Handles the extension button click events
- Manages image download requests via Chrome Downloads API
- Organizes downloaded images into folders named by chat ID
- Sanitizes chat IDs for filesystem compatibility

### Content Script (`contentScript.js`) 
- Injected into ChatGPT pages when extension button is clicked
- Finds all images within `.agent-turn` elements (ChatGPT's response containers)
- Sends download requests to background script with image URLs, indices, and chat IDs

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