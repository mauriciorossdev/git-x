import React, { useEffect, useState } from 'react';
import { GitAccount } from './GitAccountManager';

const EVALUATION_DELAY_MS = 500;

interface GitStatusProps {
  currentAccount: GitAccount | null;
}

const GitStatus: React.FC<GitStatusProps> = ({ currentAccount }) => {
  const [hasEvaluated, setHasEvaluated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHasEvaluated(true), EVALUATION_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  if (!currentAccount) {
    if (!hasEvaluated) return null;
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 ">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              Git configuration not detected
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              Could not detect current Git configuration. Add an account to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Active Git Account
          </h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">Name:</span>
              <span className="text-sm text-gray-900 dark:text-white">{currentAccount.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">Email:</span>
              <span className="text-sm text-gray-900 dark:text-white">{currentAccount.email}</span>
            </div>
            {currentAccount.username && (
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">User:</span>
                <span className="text-sm text-gray-900 dark:text-white">{currentAccount.username}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-green-700 dark:text-green-400 font-medium">Active</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Configured on {currentAccount.createdAt.toLocaleDateString('en-US')}
        </div>
      </div>
    </div>
  );
};

export default GitStatus;
