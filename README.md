# Git X 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron-191970?logo=Electron&logoColor=white)](https://www.electronjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Git Account Manager with complete GitHub CLI integration and SSH key management**

Git X is a modern Electron application that allows you to manage multiple Git accounts, SSH keys, and easily authenticate with GitHub CLI for a smoother and more secure Git experience.

## ✨ Main Features

### 🔐 Git Account Management
- **Multiple accounts**: Manage several Git accounts simultaneously
- **Quick switching**: Activate/deactivate accounts with a single click
- **Automatic configuration**: Git configures automatically when switching accounts
- **Export**: Export your accounts in JSON format

### 🔑 SSH Key Management
- **Automatic generation**: Create 4096-bit RSA SSH keys
- **Multiple keys**: Manage different keys for different services
- **Secure export**: Export public keys to add to GitHub/GitLab
- **Validation**: Verify that keys are valid

### 🚀 GitHub CLI Integration
- **Automatic login**: Web authentication with one-time codes
- **Automatic configuration**: Git configures automatically with your account
- **Multiple account handling**: Easily switch between different GitHub accounts
- **Intuitive interface**: Step-by-step process with visual indicators

## 🎯 Use Cases

- **Developers**: Switch between personal and work accounts
- **Teams**: Manage multiple projects with different configurations
- **Students**: Manage academic and personal projects

## 🚀 Quick Start

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/mauriciorossdev/git-x.git
cd git-x

# Install dependencies
npm install

# Run in development mode
npm start
```

### 2. First Account
1. Click **"🔐 Login with GitHub CLI"** for automatic authentication
2. Or use **"➕ Add New Account"** for manual configuration
3. Complete your Git account information
4. Done! Your account is configured

### 3. Generate SSH Keys
1. Go to the **"SSH Keys"** tab
2. Click **"🔑 Generate New Key"**
3. Choose the key type (4096-bit RSA recommended)
4. Export the public key and add it to GitHub/GitLab

## 🔧 Technologies

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Electron
- **Build**: Vite
- **State management**: React Hooks
- **Storage**: localStorage (configurable for persistence)

## 📱 Screenshots

### Main Dashboard
- Overview of active accounts
- Current Git status
- Quick access to all features

### Account Management
- List of all configured accounts
- Active/inactive status indicators
- Quick actions (activate, delete, export)

### GitHub CLI Login
- Step-by-step authentication process
- One-time code verification
- Automatic Git configuration

### SSH Key Management
- Automatic key generation
- Validation and export
- Multiple key management

## 🛠️ Available Commands

```bash
# Development
npm start            # Run in development mode
npm run package      # Package application
npm run make         # Create distributables
npm run publish      # Publish application

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting errors
```

## 🔐 GitHub CLI Configuration

To use the automatic login functionality, you need to have GitHub CLI installed:

### macOS
```bash
brew install gh
```

### Windows
```bash
winget install GitHub.cli
```

### Linux
```bash
# See complete instructions in README-GitHub-CLI.md
```

## 📚 Documentation

- **[README-GitHub-CLI.md](README-GitHub-CLI.md)**: Complete GitHub CLI guide
- **[README-SSH.md](README-SSH.md)**: SSH key management documentation
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Guide to contribute to the project
- **[SECURITY.md](SECURITY.md)**: Security policy and vulnerability reporting

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details about our code of conduct and the process for submitting pull requests.

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 🙏 Acknowledgments

- **GitHub CLI**: For the excellent command-line tool
- **Electron**: For the desktop application framework
- **React**: For the user interface library
- **Tailwind CSS**: For the utility CSS framework

---

## 💡 Usage Tips

1. **Use GitHub CLI** for the most secure authentication
2. **Generate SSH keys** with 4096 bits for greater security
3. **Export regularly** your configurations as backup
4. **Keep updated** GitHub CLI for the latest features

## 🚨 Troubleshooting

### Common Issues

#### GitHub CLI is not installed
```bash
# Check installation
gh --version

# Install if not present
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
```

#### Permission error on macOS
```bash
# Give accessibility permissions
# Go to: System Preferences > Security & Privacy > Accessibility
# Add Terminal and/or the Git X application
```

#### SSH key issues
```bash
# Check SSH file permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_*

# Check SSH agent
ssh-add -l
```

### Get Help

- 📖 **Documentation**: Review the specific README files
- 🐛 **Report Bugs**: [GitHub Issues](https://github.com/mauriciorossdev/git-x/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/mauriciorossdev/git-x/discussions)
- 🔒 **Security**: [SECURITY.md](SECURITY.md) for security reports

## 📊 Project Statistics

![GitHub stars](https://img.shields.io/github/stars/mauriciorossdev/git-x?style=social)
![GitHub forks](https://img.shields.io/github/forks/mauriciorossdev/git-x?style=social)
![GitHub issues](https://img.shields.io/github/issues/mauriciorossdev/git-x)
![GitHub pull requests](https://img.shields.io/github/issues-pr/mauriciorossdev/git-x)

Enjoy a smoother and more secure Git experience with Git X! 🎉

---

*Developed with ❤️ for the developer community*