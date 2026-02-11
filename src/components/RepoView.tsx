import React, { useEffect, useState, useCallback } from 'react';
import { Repo, LocalRepo, RemoteRepo } from '../types/repo';
import RepoService from '../services/RepoService';
import GitConfigService from '../services/GitConfigService';
import RepoSidebar from './RepoSidebar';
import RepoDetail from './RepoDetail';

const LOCAL_REPOS_KEY = 'cached-local-repos';
const REMOTE_REPOS_KEY = 'cached-remote-repos';
const LAST_UPDATED_KEY = 'repos-last-updated';

function loadCached<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return [];
}

const RepoView: React.FC = () => {
  const [localRepos, setLocalRepos] = useState<LocalRepo[]>(() => loadCached<LocalRepo>(LOCAL_REPOS_KEY));
  const [remoteRepos, setRemoteRepos] = useState<RemoteRepo[]>(() => loadCached<RemoteRepo>(REMOTE_REPOS_KEY));
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeAccount, setActiveAccount] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(() => localStorage.getItem(LAST_UPDATED_KEY));

  const loadRepos = useCallback(async () => {
    setLoading(true);
    try {
      const [local, remote] = await Promise.all([
        RepoService.scanLocalRepos(),
        RepoService.listRemoteRepos(),
      ]);
      setLocalRepos(local);
      setRemoteRepos(remote);
      localStorage.setItem(LOCAL_REPOS_KEY, JSON.stringify(local));
      localStorage.setItem(REMOTE_REPOS_KEY, JSON.stringify(remote));

      const now = new Date().toISOString();
      localStorage.setItem(LAST_UPDATED_KEY, now);
      setLastUpdated(now);
    } catch (error) {
      console.error('Error loading repos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddFolder = useCallback(async () => {
    if (!window.electronAPI?.selectFolder) return;
    const { canceled, path: folderPath } = await window.electronAPI.selectFolder();
    if (canceled || !folderPath) return;
    const current = RepoService.getSearchPaths();
    if (current.includes(folderPath)) return;
    RepoService.setSearchPaths([...current, folderPath]);
    await loadRepos();
  }, [loadRepos]);

  useEffect(() => {
    // Only fetch from network if there's no cached data
    if (localRepos.length === 0 && remoteRepos.length === 0) {
      loadRepos();
    }
    GitConfigService.getCurrentConfig().then((result) => {
      if (result.success && result.data) {
        setActiveAccount(`${result.data.name} <${result.data.email}>`);
      }
    });
  }, [loadRepos]);

  return (
    <div className="flex h-[calc(100vh-14rem)] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <RepoSidebar
        localRepos={localRepos}
        remoteRepos={remoteRepos}
        selectedRepo={selectedRepo}
        onSelect={setSelectedRepo}
        onRefresh={loadRepos}
        onAddFolder={handleAddFolder}
        loading={loading}
        activeAccount={activeAccount}
        lastUpdated={lastUpdated}
      />
      <RepoDetail repo={selectedRepo} />
    </div>
  );
};

export default RepoView;
