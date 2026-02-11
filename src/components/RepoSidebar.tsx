import React, { useState } from 'react';
import { Repo, LocalRepo, RemoteRepo, isLocalRepo } from '../types/repo';

interface RepoSidebarProps {
  localRepos: LocalRepo[];
  remoteRepos: RemoteRepo[];
  selectedRepo: Repo | null;
  onSelect: (repo: Repo) => void;
  onRefresh: () => void;
  onAddFolder?: () => void;
  loading: boolean;
  activeAccount: string;
  lastUpdated: string | null;
}

function formatLastUpdated(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const RepoSidebar: React.FC<RepoSidebarProps> = ({
  localRepos,
  remoteRepos,
  selectedRepo,
  onSelect,
  onRefresh,
  onAddFolder,
  loading,
  activeAccount,
  lastUpdated,
}) => {
  const [localExpanded, setLocalExpanded] = useState(true);
  const [remoteExpanded, setRemoteExpanded] = useState(true);

  const isSelected = (repo: Repo) => {
    if (!selectedRepo) return false;
    if (isLocalRepo(repo) && isLocalRepo(selectedRepo)) return repo.path === selectedRepo.path;
    if (!isLocalRepo(repo) && !isLocalRepo(selectedRepo)) return repo.url === selectedRepo.url;
    return false;
  };

  return (
    <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">Repositories</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activeAccount}</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-50"
            title="Refresh"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        {lastUpdated && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
            Updated: {formatLastUpdated(lastUpdated)}
          </p>
        )}
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {/* Local Repos — colapsable */}
        <div className="py-2">
          <div className="flex items-center gap-1.5 px-4 py-1">
            <button
              type="button"
              onClick={() => setLocalExpanded((e) => !e)}
              className="flex items-center gap-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded min-w-0 flex-1"
            >
              <span
                className={`shrink-0 transition-transform ${localExpanded ? 'rotate-90' : ''}`}
                aria-hidden
              >
                <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">
                Local Repos ({localRepos.length})
              </h4>
            </button>
            {onAddFolder && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAddFolder(); }}
                disabled={loading}
                className="shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                title="Agregar carpeta para buscar repositorios"
              >
                + Agregar carpeta
              </button>
            )}
          </div>
          {localExpanded && (
            <>
              {localRepos.length === 0 && (
                <p className="px-4 py-2 pl-8 text-xs text-gray-400 dark:text-gray-500">No local repos found</p>
              )}
              {localRepos.map((repo) => (
                <button
                  key={repo.path}
                  onClick={() => onSelect(repo)}
                  className={`w-full text-left px-4 py-2 pl-8 text-sm transition-colors ${
                    isSelected(repo)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="truncate">{repo.name}</span>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Remote Repos — colapsable */}
        <div className="py-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setRemoteExpanded((e) => !e)}
            className="w-full flex items-center gap-1.5 px-4 py-1 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded"
          >
            <span
              className={`shrink-0 transition-transform ${remoteExpanded ? 'rotate-90' : ''}`}
              aria-hidden
            >
              <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Remote Repos ({remoteRepos.length})
            </h4>
          </button>
          {remoteExpanded && (
            <>
              {remoteRepos.length === 0 && (
                <p className="px-4 py-2 pl-8 text-xs text-gray-400 dark:text-gray-500">No remote repos found</p>
              )}
              {remoteRepos.map((repo) => (
                <button
                  key={repo.url}
                  onClick={() => onSelect(repo)}
                  className={`w-full text-left px-4 py-2 pl-8 text-sm transition-colors ${
                    isSelected(repo)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="truncate">{repo.name}</span>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepoSidebar;
