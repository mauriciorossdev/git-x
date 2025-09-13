import React, { useState, useEffect } from 'react';
import GitHubCLIService, { GitHubAccountInfo } from '../services/GitHubCLIService';
import GitHubCLIInfo from './GitHubCLIInfo';

interface GitHubCLILoginProps {
  onLoginSuccess: (accountInfo: {
    username: string;
    email: string;
    name: string;
  }) => void;
  onCancel: () => void;
}

const GitHubCLILogin: React.FC<GitHubCLILoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [step, setStep] = useState<'init' | 'browser' | 'code' | 'configuring' | 'success' | 'error'>('init');
  const [oneTimeCode, setOneTimeCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [accountInfo, setAccountInfo] = useState<GitHubAccountInfo | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Check authentication status when loading the component
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const result = await GitHubCLIService.checkAuthStatus();
        if (result.success && result.data.authenticated) {
          // If already authenticated, get account information
          const accountResult = await GitHubCLIService.getAccountInfo();
          console.log('Account information:', accountResult);
          if (accountResult.success) {
            console.log('Account information:', accountResult.data);
            setAccountInfo(accountResult.data);
            setStep('success');
          }
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  const startLogin = async () => {
    try {
      setStep('browser');
      setErrorMessage('');
      
      // Check if GitHub CLI is installed
      const isInstalled = await GitHubCLIService.isInstalled();
      if (!isInstalled) {
        setErrorMessage('GitHub CLI is not installed. Please install it first.');
        setStep('error');
        return;
      }
      
      // Start login process
      const result = await GitHubCLIService.startLogin();
      if (!result.success) {
        setErrorMessage(result.error || 'Error starting login process');
        setStep('error');
        return;
      }
      
      // Simulate getting the one-time code
      setTimeout(() => {
        setStep('code');
      }, 2000);
      
    } catch (error) {
      console.error('Error iniciando login:', error);
      setErrorMessage('Error starting login process');
      setStep('error');
    }
  };

  const openBrowser = () => {
    // Open browser for authentication
    window.open('https://github.com/login/device', '_blank');
    setStep('code');
  };

  const submitCode = async () => {
    if (!oneTimeCode.trim()) {
      setErrorMessage('Please enter the one-time code');
      return;
    }

    try {
      setStep('configuring');
      setErrorMessage('');
      
      // Use the service to complete login
      const result = await GitHubCLIService.completeLogin(oneTimeCode);
      
      if (!result.success) {
        setErrorMessage(result.error || 'Error during authentication');
        setStep('error');
        return;
      }
      
      // Get account information
      const accountInfo = result.data.accountInfo as GitHubAccountInfo;
      setAccountInfo(accountInfo);
      setStep('success');
      
      // Notify success after a brief delay
      setTimeout(() => {
        onLoginSuccess(accountInfo);
      }, 1500);
      
    } catch (error) {
      console.error('Error during authentication:', error);
      setErrorMessage('Error during authentication. Please try again.');
      setStep('error');
    }
  };

  const resetProcess = () => {
    setStep('init');
    setOneTimeCode('');
    setErrorMessage('');
    setAccountInfo(null);
  };

  const renderStep = () => {
    switch (step) {
      case 'init':
        return (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-gray-900">
              Login with GitHub CLI
            </h3>
            <p className="text-gray-600">
              Authenticate using GitHub CLI to automatically configure your Git account
            </p>
            <button
              onClick={startLogin}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              🚀 Start Login
            </button>
          </div>
        );

      case 'browser':
        return (
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-lg font-semibold text-gray-900">
              Opening browser...
            </h3>
            <p className="text-gray-600">
              Preparing web authentication with GitHub
            </p>
            <button
              onClick={openBrowser}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📱 Open Browser
            </button>
          </div>
        );

      case 'code':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🔑</div>
              <h3 className="text-lg font-semibold text-gray-900">
                Enter the one-time code
              </h3>
              <p className="text-gray-600 mb-4">
                Copy the code that appears in your terminal and paste it here
              </p>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-600 mb-2">Code example:</p>
              <code className="text-lg font-mono bg-white px-3 py-1 rounded border">
                11C2-0326
              </code>
            </div>
            
            <div>
              <label htmlFor="oneTimeCode" className="block text-sm font-medium text-gray-700 mb-2">
                One-time code:
              </label>
              <input
                type="text"
                id="oneTimeCode"
                value={oneTimeCode}
                onChange={(e) => setOneTimeCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-center text-lg"
                placeholder="XXXX-XXXX"
                maxLength={9}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={submitCode}
                disabled={!oneTimeCode.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ✅ Verify Code
              </button>
              <button
                onClick={resetProcess}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                🔄 Restart
              </button>
            </div>
          </div>
        );

      case 'configuring':
        return (
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4 animate-spin">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-900">
              Configuring Git...
            </h3>
            <p className="text-gray-600">
              Configuring Git protocol and authenticating with GitHub
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div>✓ Authentication completed</div>
              <div>⚙️ Configuring Git protocol...</div>
              <div>⚙️ Configuring credentials...</div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-green-900">
              Login successful!
            </h3>
            {accountInfo && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800">
                  <strong>User:</strong> {accountInfo.username}
                </p>
                <p className="text-green-800">
                  <strong>Email:</strong> {accountInfo.email}
                </p>
                <p className="text-green-800">
                  <strong>Name:</strong> {accountInfo.name}
                </p>
              </div>
            )}
            <p className="text-green-700">
              Your Git account has been configured automatically
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-900">
              Error during login
            </h3>
            <p className="text-red-700">
              {errorMessage}
            </p>
            <button
              onClick={resetProcess}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🔄 Try Again
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            GitHub CLI Login
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInfo(true)}
              className="text-blue-600 hover:text-blue-800 text-sm"
              title="Information about GitHub CLI"
            >
              ℹ️
            </button>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {renderStep()}
      </div>
      
      {/* GitHub CLI information modal */}
      {showInfo && (
        <GitHubCLIInfo onClose={() => setShowInfo(false)} />
      )}
    </div>
  );
};

export default GitHubCLILogin;
