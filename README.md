# Git X 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron_37-191970?logo=Electron&logoColor=white)](https://www.electronjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

**Git Account Manager with complete GitHub CLI integration, SSH key management, and repository browser**

Git X is a modern Electron desktop application for managing multiple Git accounts, SSH keys, GitHub CLI authentication, and browsing both local and remote repositories — all from a single interface.

## ✨ Features

### 🔐 Git Account Management
- **Multiple accounts** — Manage several Git accounts simultaneously
- **Quick switching** — Activate/deactivate accounts with a single click
- **Automatic configuration** — Git configures automatically when switching accounts
- **Export** — Export your accounts in JSON format

### 🔑 SSH Key Management
- **Automatic generation** — Create 4096-bit RSA SSH keys
- **Multiple keys** — Manage different keys for different services
- **Secure export** — Export public keys to add to GitHub/GitLab
- **Validation** — Verify that keys are valid

### 🚀 GitHub CLI Integration
- **Automatic login** — Web authentication with one-time codes
- **Automatic configuration** — Git configures with your account automatically
- **Multiple account handling** — Switch between different GitHub accounts easily
- **Intuitive interface** — Step-by-step process with visual indicators

### 📂 Repository Browser
- **Local repo scanning** — Automatically discovers Git repositories in common directories (Desktop, Documents, Projects, Developer)
- **Custom search paths** — Add your own folders to expand repo discovery
- **Remote repos** — Lists your GitHub repositories via `gh` CLI
- **Commit history** — Browse commits with author, date, and full message
- **Uncommitted changes** — View modified/added/deleted files with status indicators
- **Inline diffs** — Color-coded diff viewer for each file (additions in green, deletions in red)
- **Quick commit & push** — Stage, commit, and push changes directly from the app
- **Open in editor** — Launch repos in VS Code, Cursor, or Claude editor
- **Caching** — Repository lists are cached in localStorage for fast startup

### 🎬 Splash Screen
- Matrix-style animated startup screen with GSAP animations

## 🎯 Use Cases

- **Developers** — Switch between personal and work accounts
- **Teams** — Manage multiple projects with different configurations
- **Students** — Manage academic and personal projects

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [GitHub CLI](https://cli.github.com/) (`gh`) — required for GitHub authentication and remote repo listing

### Installation

```bash
# Clone the repository
git clone https://github.com/mauriciorossdev/git-x.git
cd git-x

# Install dependencies
npm install

# Run in development mode
npm start
```

### First Account
1. Click **"🔐 Login with GitHub CLI"** for automatic authentication
2. Or use **"➕ Add New Account"** for manual configuration
3. Complete your Git account information
4. Done! Your account is configured

### Generate SSH Keys
1. Go to the **"SSH Keys"** tab
2. Click **"🔑 Generate New Key"**
3. Choose the key type (4096-bit RSA recommended)
4. Export the public key and add it to GitHub/GitLab

### Browse Repositories
1. Switch to the **"Repos"** tab
2. Local repositories are auto-discovered; click **"Add Folder"** to add custom paths
3. Remote GitHub repositories are fetched via `gh` CLI
4. Select any repo to view commits, changes, and diffs

## 🛠️ Available Commands

```bash
# Development
npm start              # Run in development mode (Electron Forge + Vite)

# Linting
npm run lint           # Run ESLint
npm run lint:fix       # Auto-fix linting errors

# Build
npm run package        # Package application (no installer)
npm run make           # Build distributable for current platform
npm run make:mac       # Build for macOS (DMG + ZIP)
npm run make:win       # Build for Windows (Squirrel + ZIP)
npm run make:linux     # Build for Linux (deb + rpm)

# Release
npm run release        # Build and publish to GitHub Releases
npm run release:beta   # Build and publish as pre-release
```

## 🏗️ Architecture

```
src/
├── main.ts                  # Electron main process (IPC handlers, shell access)
├── preload.ts               # Context bridge (window.electronAPI)
├── renderer.ts              # React entry point
├── App.tsx                  # Root component (tabs: Account Manager / Repos)
├── components/
│   ├── GitAccountManager.tsx  # Account & SSH key management
│   ├── GitAccountList.tsx     # Account list UI
│   ├── GitStatus.tsx          # Current Git config status
│   ├── RepoView.tsx           # Repository browser orchestrator
│   ├── RepoSidebar.tsx        # Local/remote repo navigation sidebar
│   ├── RepoDetail.tsx         # Commit history, diffs, changes viewer
│   └── SplashScreen.tsx       # Animated startup screen
├── services/
│   ├── GitConfigService.ts    # Git config read/write
│   ├── GitHubCLIService.ts    # GitHub CLI wrapper (auth, user info)
│   └── RepoService.ts         # Repo scanning, commits, diffs, push
├── contexts/
│   └── ThemeContext.tsx        # Dark/light theme
└── types/
    ├── electron.d.ts          # IPC API type definitions
    └── repo.ts                # Repository data interfaces
```

All system commands (git, gh, ssh-keygen) flow through:
**React → Service → `window.electronAPI.executeCommand()` → IPC → `main.ts` `execAsync()`**

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | GSAP |
| Desktop | Electron 37 |
| Bundler | Vite 5 |
| Packaging | Electron Forge |
| CI/CD | GitHub Actions (macOS, Windows, Ubuntu) |

## 📦 Releases

Git X builds cross-platform installers via GitHub Actions:

| Platform | Format |
|----------|--------|
| macOS | `.dmg`, `.zip` |
| Windows | `.exe` (Squirrel), `.zip` |
| Linux | `.deb`, `.rpm` |

Releases are triggered automatically when a version tag is pushed (e.g., `v1.0.0`).

## 🔐 GitHub CLI Setup

To use automatic login and remote repo features, install GitHub CLI:

```bash
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Linux (Debian/Ubuntu)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh
```

## 🚨 Troubleshooting

### GitHub CLI not installed
```bash
gh --version  # Check installation
```

### Permission error on macOS
Go to **System Preferences > Security & Privacy > Accessibility** and add Terminal and/or Git X.

### SSH key issues
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_*
ssh-add -l   # Check SSH agent
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📚 Documentation

- [README-GitHub-CLI.md](README-GitHub-CLI.md) — Complete GitHub CLI guide
- [README-SSH.md](README-SSH.md) — SSH key management documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guide
- [SECURITY.md](SECURITY.md) — Security policy and vulnerability reporting

## 📄 License

This project is under the MIT License. See [LICENSE](LICENSE) for details.

## 🔗 Links

- [GitHub Issues](https://github.com/mauriciorossdev/git-x/issues) — Report bugs
- [GitHub Discussions](https://github.com/mauriciorossdev/git-x/discussions) — Ask questions

![GitHub stars](https://img.shields.io/github/stars/mauriciorossdev/git-x?style=social)
![GitHub forks](https://img.shields.io/github/forks/mauriciorossdev/git-x?style=social)
![GitHub issues](https://img.shields.io/github/issues/mauriciorossdev/git-x)
![GitHub pull requests](https://img.shields.io/github/issues-pr/mauriciorossdev/git-x)

---

*Developed with ❤️ for the developer community*
