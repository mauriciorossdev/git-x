import React, { useState, useEffect } from 'react';
import GitAccountList from './GitAccountList';
import GitAccountForm from './GitAccountForm';
import GitStatus from './GitStatus';
import SSHKeyManager from './SSHKeyManager';
import GitHubCLILogin from './GitHubCLILogin';
import GitConfigService from '../services/GitConfigService';

export interface GitAccount {
  id: string;
  name: string;
  email: string;
  username?: string;
  isActive: boolean;
  createdAt: Date;
}

const GitAccountManager: React.FC = () => {
  const [accounts, setAccounts] = useState<GitAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showGitHubCLILogin, setShowGitHubCLILogin] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<GitAccount | null>(null);
  const [activeTab, setActiveTab] = useState<'accounts' | 'ssh'>('accounts');

  useEffect(() => {
    loadAccounts();
    loadCurrentGitConfig();
  }, []);

  const loadAccounts = async () => {
    try {
      // Here we would load saved accounts
      const savedAccounts = localStorage.getItem('git-accounts');
      console.log('Loading accounts from localStorage:', savedAccounts);
      
      if (savedAccounts) {
        const parsedAccounts = JSON.parse(savedAccounts);
        console.log('Parsed accounts:', parsedAccounts);
        
        // Convertir las fechas de string a Date
        const accountsWithDates = parsedAccounts.map((acc: any) => ({
          ...acc,
          createdAt: new Date(acc.createdAt)
        }));
        
        setAccounts(accountsWithDates);
        console.log('Accounts loaded successfully:', accountsWithDates);
      } else {
        console.log('No saved accounts found in localStorage');
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadCurrentGitConfig = async () => {
    try {
      console.log('Loading current Git configuration...');
      
      // Get real Git configuration
      const configResult = await GitConfigService.getCurrentConfig();
      
      if (configResult.success && configResult.data) {
        const currentAccount: GitAccount = {
          id: 'current',
          name: configResult.data.name,
          email: configResult.data.email,
          username: configResult.data.username,
          isActive: true,
          createdAt: new Date()
        };
        
        console.log('Git configuration loaded:', currentAccount);
        setCurrentAccount(currentAccount);
      } else {
        console.warn('Could not get Git configuration:', configResult.error);
        
        // Use default data if configuration cannot be obtained
        const defaultAccount: GitAccount = {
          id: 'current',
          name: 'Not configured',
          email: 'Not configured',
          username: 'user',
          isActive: true,
          createdAt: new Date()
        };
        setCurrentAccount(defaultAccount);
      }
    } catch (error) {
      console.error('Error loading current Git configuration:', error);
      
      // In case of error, use default data
      const errorAccount: GitAccount = {
        id: 'current',
        name: 'Error loading',
        email: 'Error loading',
        username: 'user',
        isActive: true,
        createdAt: new Date()
      };
      setCurrentAccount(errorAccount);
    }
  };

  const addAccount = (account: Omit<GitAccount, 'id' | 'createdAt'>) => {
    console.log('Adding new account:', account);
    
    const newAccount: GitAccount = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    console.log('New account with metadata:', newAccount);
    
    const updatedAccounts = [...accounts, newAccount];
    console.log('Updated accounts array:', updatedAccounts);
    
    setAccounts(updatedAccounts);
    
    // Save to localStorage
    const accountsJson = JSON.stringify(updatedAccounts);
    console.log('Saving to localStorage:', accountsJson);
    localStorage.setItem('git-accounts', accountsJson);
    
    // Verificar que se guardó correctamente
    const savedAccounts = localStorage.getItem('git-accounts');
    console.log('Verified saved accounts:', savedAccounts);
    
    setShowForm(false);
  };

  const activateAccount = async (account: GitAccount) => {
    try {
      console.log(`Activating account: ${account.name} (${account.email})`);
      
      // Configure Git with account information
      const configResult = await GitConfigService.setConfig(account.name, account.email);
      
      if (configResult.success) {
        console.log('Git configured successfully with account:', account);
        
        // Update local state
        const updatedAccounts = accounts.map(acc => ({
          ...acc,
          isActive: acc.id === account.id
        }));
        setAccounts(updatedAccounts);
        setCurrentAccount(account);
        
        // Save to localStorage
        localStorage.setItem('git-accounts', JSON.stringify(updatedAccounts));
        
        // Reload current configuration to verify it was applied
        await loadCurrentGitConfig();
        
        console.log('Account activated successfully');
      } else {
        console.error('Error configuring Git:', configResult.error);
        // Still update local state to maintain consistency
        const updatedAccounts = accounts.map(acc => ({
          ...acc,
          isActive: acc.id === account.id
        }));
        setAccounts(updatedAccounts);
        setCurrentAccount(account);
        localStorage.setItem('git-accounts', JSON.stringify(updatedAccounts));
      }
    } catch (error) {
      console.error('Error activating account:', error);
      // In case of error, still update local state
      const updatedAccounts = accounts.map(acc => ({
        ...acc,
        isActive: acc.id === account.id
      }));
      setAccounts(updatedAccounts);
      setCurrentAccount(account);
      localStorage.setItem('git-accounts', JSON.stringify(updatedAccounts));
    }
  };

  const deleteAccount = (accountId: string) => {
    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    setAccounts(updatedAccounts);
    localStorage.setItem('git-accounts', JSON.stringify(updatedAccounts));
  };

  const handleGitHubCLILoginSuccess = (accountInfo: {
    username: string;
    email: string;
    name: string;
  }) => {
    // Create a new account based on GitHub CLI information
    const newAccount: GitAccount = {
      id: Date.now().toString(),
      name: accountInfo.name,
      email: accountInfo.email,
      username: accountInfo.username,
      isActive: true,
      createdAt: new Date()
    };

    // Add account and activate it
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    setCurrentAccount(newAccount);
    
    // Save to localStorage
    localStorage.setItem('git-accounts', JSON.stringify(updatedAccounts));
    
    // Close modal
    setShowGitHubCLILogin(false);
    
    console.log('Account created successfully from GitHub CLI:', newAccount);
  };

  return (
    <div className="space-y-6">
      {/* Current Git Status */}
      <GitStatus currentAccount={currentAccount} />
      
      {/* Navigation tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'accounts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Git Accounts
          </button>
          <button
            onClick={() => setActiveTab('ssh')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ssh'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            SSH Keys
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      {activeTab === 'accounts' ? (
        <div className="space-y-6">
          {/* Account information */}
          <div className="bg-white dark:bg-black rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Git Accounts ({accounts.length})
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {accounts.length === 0 
                    ? 'No saved accounts' 
                    : `${accounts.filter(acc => acc.isActive).length} active account(s)`
                  }
                </p>
              </div>
              {accounts.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete all accounts? This action cannot be undone.')) {
                      localStorage.removeItem('git-accounts');
                      setAccounts([]);
                      console.log('All accounts cleared');
                    }
                  }}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                >
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>
          
          {/* Account list */}
          <GitAccountList
            accounts={accounts}
            onActivate={activateAccount}
            onDelete={deleteAccount}
          />
          
          {/* Action buttons */}
          <div className="flex items-center justify-center space-x-4">
            {accounts.length > 0 && (
              <button
                onClick={() => {
                  try {
                    const dataStr = JSON.stringify(accounts, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'git-accounts.json';
                    link.click();
                    URL.revokeObjectURL(url);
                    console.log('Git accounts exported successfully');
                  } catch (error) {
                    console.error('Error exporting accounts:', error);
                  }
                }}
                className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                📥 Export Accounts JSON
              </button>
            )}
            <button
              onClick={() => setShowGitHubCLILogin(true)}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🔐 Login with GitHub CLI
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              ➕ Add New Account
            </button>
          </div>
          
          {/* Form for new account */}
          {showForm && (
            <GitAccountForm
              onSubmit={addAccount}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      ) : (
        <SSHKeyManager />
      )}
      
      {/* GitHub CLI Login Modal */}
      {showGitHubCLILogin && (
        <GitHubCLILogin
          onLoginSuccess={handleGitHubCLILoginSuccess}
          onCancel={() => setShowGitHubCLILogin(false)}
        />
      )}
    </div>
  );
};

export default GitAccountManager;
