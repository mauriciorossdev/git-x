# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Git X is an Electron desktop app for managing multiple Git accounts, SSH keys, and GitHub CLI authentication. Built with Electron + React + TypeScript + Tailwind CSS, bundled via Vite and packaged with Electron Forge.

## Commands

```bash
npm start              # Run in development mode (electron-forge + vite dev server)
npm run lint           # ESLint for .ts/.tsx files
npm run lint:fix       # Auto-fix lint errors
npm run make           # Build distributable for current platform
npm run make:mac       # Build for macOS (DMG + ZIP)
npm run make:win       # Build for Windows (Squirrel + ZIP)
npm run make:linux     # Build for Linux (deb + rpm)
npm run package        # Package without creating installers
```

There are no tests configured in this project.

## Architecture

### Electron Process Model

The app uses Electron's context-isolated architecture with three entry points configured in `forge.config.ts`:

- **Main process** (`src/main.ts`): Handles IPC for SSH key operations (generate, read, scan `~/.ssh/`), system commands via `child_process.exec`, and OS info. All filesystem and shell access goes through IPC handlers here.
- **Preload** (`src/preload.ts`): Exposes `window.electronAPI` via `contextBridge` — the only bridge between renderer and main process. The API surface is typed in `src/types/electron.d.ts`.
- **Renderer** (`src/renderer.ts` / `src/renderer.tsx`): React app entry point, loaded from `index.html`.

### Renderer (React) Layer

- `src/App.tsx` — Root component wrapped in `ThemeProvider`
- `src/components/GitAccountManager.tsx` — Main orchestrator component with tab navigation (Accounts / SSH Keys). Manages account state in `localStorage` under key `git-accounts`.
- `src/services/GitConfigService.ts` — Reads/writes global git config (`user.name`, `user.email`) via `window.electronAPI.executeCommand`
- `src/services/GitHubCLIService.ts` — Wraps `gh` CLI commands (auth login/logout/status, `gh api user`) via the same IPC bridge
- `src/contexts/ThemeContext.tsx` — Dark/light theme context

### Key Pattern: Command Execution

All system commands (git, gh, ssh-keygen) flow through: **React component → service → `window.electronAPI.executeCommand()` → IPC → `main.ts` `execAsync()`**. The `execute-command` IPC handler in main.ts accepts arbitrary command + args.

### Build Configuration

- Three Vite configs: `vite.main.config.ts`, `vite.preload.config.ts`, `vite.renderer.config.ts`
- Electron Forge config in `forge.config.ts` with makers for Squirrel (Windows), DMG/ZIP (macOS), deb/rpm (Linux)
- GitHub releases configured via `@electron-forge/publisher-github` (owner: `mauriciorossdev`, repo: `git-x`)
- Tailwind CSS v4 with `@tailwindcss/postcss` plugin
