import React from 'react';
import { GitAccount } from './GitAccountManager';

interface GitAccountListProps {
  accounts: GitAccount[];
  onActivate: (account: GitAccount) => void;
  onDelete: (accountId: string) => void;
}

const GitAccountList: React.FC<GitAccountListProps> = ({ accounts, onActivate, onDelete }) => {
  if (accounts.length === 0) {
    return (
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No accounts</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Start by adding your first Git account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Available Git Accounts
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Manage your different Git identities
        </p>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {accounts.map((account) => (
          <div key={account.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">
                        {account.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {account.name}
                      </p>
                      {account.isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {account.email}
                    </p>
                    {account.username && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        @{account.username}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!account.isActive && (
                  <button
                    onClick={() => onActivate(account)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
                  >
                    Activate
                  </button>
                )}
                
                <button
                  onClick={() => onDelete(account.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              Created on {account.createdAt.toLocaleDateString('en-US')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GitAccountList;
