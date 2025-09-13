import React from 'react';

interface GitHubCLIInfoProps {
  onClose: () => void;
}

const GitHubCLIInfo: React.FC<GitHubCLIInfoProps> = ({ onClose }) => {
  const installationSteps = [
    {
      platform: 'macOS',
      commands: [
        'brew install gh',
        'gh auth login'
      ]
    },
    {
      platform: 'Windows',
      commands: [
        'winget install GitHub.cli',
        'gh auth login'
      ]
    },
    {
      platform: 'Linux (Ubuntu/Debian)',
      commands: [
        'curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg',
        'echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null',
        'sudo apt update',
        'sudo apt install gh',
        'gh auth login'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-4xl max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            📚 Information about GitHub CLI
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* What is GitHub CLI? */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              🤔 What is GitHub CLI?
            </h4>
            <p className="text-gray-700 leading-relaxed">
              GitHub CLI is a command-line tool that allows you to use GitHub directly from your terminal. 
              It allows you to authenticate, create repositories, make pull requests, and much more, all from the comfort of your terminal.
            </p>
          </div>

          {/* Beneficios */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              ✨ Benefits of using GitHub CLI
            </h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Secure authentication:</strong> Web login with one-time codes</li>
              <li><strong>Automatic configuration:</strong> Automatically configure Git with your account</li>
              <li><strong>Native integration:</strong> Works perfectly with Git and your terminal</li>
              <li><strong>Multiple accounts:</strong> Easily manage multiple GitHub accounts</li>
              <li><strong>Automation:</strong> Ideal for scripts and workflows</li>
            </ul>
          </div>

          {/* Installation */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              📥 Installation
            </h4>
            <div className="space-y-4">
              {installationSteps.map((platform, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">
                    {platform.platform}
                  </h5>
                  <div className="space-y-2">
                    {platform.commands.map((command, cmdIndex) => (
                      <div key={cmdIndex} className="flex items-center space-x-2">
                        <span className="text-gray-500">$</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {command}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(command)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          📋
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proceso de login */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              🔐 Login Process
            </h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Run <code className="bg-blue-100 px-2 py-1 rounded">gh auth login</code></li>
                <li>Select <strong>GitHub.com</strong> as host</li>
                <li>Choose <strong>HTTPS</strong> as preferred protocol</li>
                <li>Confirm that you want to authenticate Git with your credentials</li>
                <li>Select <strong>Login with a web browser</strong></li>
                <li>Copy the one-time code that appears in the terminal</li>
                <li>Paste the code in the browser when it opens</li>
                <li>Done! Your account is configured automatically</li>
              </ol>
            </div>
          </div>

          {/* Useful commands */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              🛠️ Useful Commands
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <code className="text-sm font-mono">gh auth status</code>
                <p className="text-xs text-gray-600 mt-1">Check authentication status</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <code className="text-sm font-mono">gh auth logout</code>
                <p className="text-xs text-gray-600 mt-1">Log out</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <code className="text-sm font-mono">gh repo create</code>
                <p className="text-xs text-gray-600 mt-1">Create new repository</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <code className="text-sm font-mono">gh pr create</code>
                <p className="text-xs text-gray-600 mt-1">Create pull request</p>
              </div>
            </div>
          </div>

          {/* Useful links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              🔗 Useful Links
            </h4>
            <div className="space-y-2">
              <a
                href="https://cli.github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 hover:underline"
              >
                🌐 Official GitHub CLI website
              </a>
              <a
                href="https://cli.github.com/manual/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 hover:underline"
              >
                📖 Complete manual
              </a>
              <a
                href="https://github.com/cli/cli"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 hover:underline"
              >
                💻 Repository on GitHub
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            ✅ Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default GitHubCLIInfo;
