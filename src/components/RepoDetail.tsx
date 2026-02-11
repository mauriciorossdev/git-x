import React, { useEffect, useState, useCallback } from 'react';
import { Repo, isLocalRepo, isRemoteRepo, RepoDetails, LocalRepoStatus, Commit, CommitDetail } from '../types/repo';
import type { ElectronAPI } from '../types/electron';
import RepoService from '../services/RepoService';

interface RepoDetailProps {
  repo: Repo | null;
}

const FILE_STATUS_LABEL: Record<string, string> = { A: 'Added', M: 'Modified', D: 'Deleted', R: 'Renamed', C: 'Copied', U: 'Updated' };

/** Visor de diff estilo GitLens: líneas + en verde, - en rojo, resto neutro. Colapsable con chevron. */
function DiffViewer({ content, path, loading }: { content: string | null; path: string; loading: boolean }) {
  const [collapsed, setCollapsed] = useState(false);

  const header = (
    <button
      type="button"
      onClick={() => setCollapsed((c) => !c)}
      className="w-full flex items-center gap-1.5 px-2 py-1 border-b border-gray-700 bg-gray-800/80 font-mono text-[10px] text-gray-400 truncate text-left hover:bg-gray-700/80"
    >
      <span className={`shrink-0 transition-transform ${collapsed ? '' : 'rotate-90'}`} aria-hidden>
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </span>
      <span className="truncate">{path}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="rounded border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-900/95">
        {header}
        {!collapsed && <p className="text-[11px] text-gray-500 py-2 px-2">Cargando diff...</p>}
      </div>
    );
  }
  if (!content) {
    return (
      <div className="rounded border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-900/95">
        {header}
        {!collapsed && <p className="text-[11px] text-gray-500 py-2 px-2">No hay diff disponible para este archivo.</p>}
      </div>
    );
  }
  const lines = content.split('\n');
  return (
    <div className="rounded border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-900/95">
      {header}
      {!collapsed && (
        <div className="max-h-64 overflow-auto font-mono text-[11px] leading-tight">
          {lines.map((line, i) => {
            const isAdd = line.startsWith('+') && !line.startsWith('+++');
            const isDel = line.startsWith('-') && !line.startsWith('---');
            return (
              <div
                key={i}
                className={`px-2 py-0.5 whitespace-pre overflow-x-auto ${
                  isAdd ? 'bg-green-900/40 text-green-200' : isDel ? 'bg-red-900/40 text-red-200' : 'text-gray-300'
                }`}
              >
                {line || ' '}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const RepoDetail: React.FC<RepoDetailProps> = ({ repo }) => {
  const [details, setDetails] = useState<RepoDetails | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [localStatus, setLocalStatus] = useState<LocalRepoStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [expandedCommit, setExpandedCommit] = useState<string | null>(null);
  const [commitDetailCache, setCommitDetailCache] = useState<Record<string, CommitDetail>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [pushing, setPushing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ commitHash: string; path: string } | null>(null);
  const [filePatchContent, setFilePatchContent] = useState<string | null>(null);
  const [filePatchLoading, setFilePatchLoading] = useState(false);
  const [selectedUncommittedPath, setSelectedUncommittedPath] = useState<string | null>(null);
  const [uncommittedDiffContent, setUncommittedDiffContent] = useState<string | null>(null);
  const [uncommittedDiffLoading, setUncommittedDiffLoading] = useState(false);

  const fetchCommitDetail = useCallback(
    async (hash: string) => {
      if (!repo) return;
      setDetailLoading(hash);
      try {
        const detail = isLocalRepo(repo)
          ? await RepoService.getCommitDetailsLocal(repo.path, hash)
          : isRemoteRepo(repo)
            ? await RepoService.getCommitDetailsRemote(repo.url, hash)
            : null;
        if (detail) setCommitDetailCache((c) => ({ ...c, [hash]: detail }));
      } finally {
        setDetailLoading(null);
      }
    },
    [repo]
  );

  const toggleExpand = useCallback(
    (hash: string) => {
      setExpandedCommit((prev) => {
        if (prev === hash) return null;
        if (!commitDetailCache[hash]) fetchCommitDetail(hash);
        return hash;
      });
      setSelectedFile(null);
      setFilePatchContent(null);
    },
    [commitDetailCache, fetchCommitDetail]
  );

  const handleFileClick = useCallback(
    async (commitHash: string, path: string, existingPatch?: string) => {
      const key = `${commitHash}:${path}`;
      if (selectedFile?.commitHash === commitHash && selectedFile?.path === path) {
        setSelectedFile(null);
        setFilePatchContent(null);
        return;
      }
      setSelectedFile({ commitHash, path });
      if (existingPatch) {
        setFilePatchContent(existingPatch);
        return;
      }
      if (repo && isLocalRepo(repo)) {
        setFilePatchLoading(true);
        setFilePatchContent(null);
        try {
          const patch = await RepoService.getCommitFilePatchLocal(repo.path, commitHash, path);
          setFilePatchContent(patch ?? null);
        } finally {
          setFilePatchLoading(false);
        }
      } else {
        setFilePatchContent(null);
      }
    },
    [repo, selectedFile]
  );

  /** Parsea path desde una línea de git status --short (XY path o R  old\tnew). */
  const parseStatusLinePath = useCallback((line: string): string => {
    const rest = line.trim().slice(2).trim();
    if (rest.includes('\t')) return rest.split('\t').pop()!.trim();
    return rest;
  }, []);

  const handleUncommittedFileClick = useCallback(
    async (path: string) => {
      if (selectedUncommittedPath === path) {
        setSelectedUncommittedPath(null);
        setUncommittedDiffContent(null);
        return;
      }
      setSelectedUncommittedPath(path);
      if (!repo || !isLocalRepo(repo)) return;
      setUncommittedDiffLoading(true);
      setUncommittedDiffContent(null);
      try {
        const diff = await RepoService.getUncommittedFileDiff(repo.path, path);
        setUncommittedDiffContent(diff ?? null);
      } finally {
        setUncommittedDiffLoading(false);
      }
    },
    [repo, selectedUncommittedPath]
  );

  useEffect(() => {
    setExpandedCommit(null);
    setCommitDetailCache({});
    setCommitMessage('');
    setCommitError(null);
    setSelectedFile(null);
    setFilePatchContent(null);
    setSelectedUncommittedPath(null);
    setUncommittedDiffContent(null);

    if (repo && isLocalRepo(repo)) {
      console.log('[RepoDetail] cargando repo local:', repo.name, 'path:', repo.path);
      setLoading(true);
      setCommitsLoading(true);
      setDetails(null);
      setLocalStatus(null);
      Promise.all([
        RepoService.getRepoDetails(repo.path),
        RepoService.getCommits(repo.path),
        RepoService.getLocalRepoStatus(repo.path),
      ])
        .then(([d, c, status]) => {
          console.log('[RepoDetail] recibido details:', d, 'commits count:', c?.length ?? 0);
          setDetails(d ?? null);
          setCommits(c ?? []);
          setLocalStatus(status ?? null);
        })
        .catch((err) => {
          console.error('[RepoDetail] error al cargar:', err);
        })
        .finally(() => {
          setLoading(false);
          setCommitsLoading(false);
        });
    } else if (repo && isRemoteRepo(repo)) {
      console.log('[RepoDetail] cargando repo remoto:', repo.name, 'url:', repo.url);
      setCommitsLoading(true);
      setDetails(null);
      RepoService.getRemoteRepoCommits(repo.url)
        .then((c) => {
          console.log('[RepoDetail] recibido commits remotos:', c?.length ?? 0);
          setCommits(c ?? []);
        })
        .catch((err) => {
          console.error('[RepoDetail] error al cargar commits remotos:', err);
        })
        .finally(() => {
          setCommitsLoading(false);
        });
    } else {
      console.log('[RepoDetail] repo no local/remoto o null');
      setDetails(null);
      setCommits([]);
      setLocalStatus(null);
    }
  }, [repo]);

  const refreshLocalData = useCallback(async () => {
    if (!repo || !isLocalRepo(repo)) return;
    const [d, c, status] = await Promise.all([
      RepoService.getRepoDetails(repo.path),
      RepoService.getCommits(repo.path),
      RepoService.getLocalRepoStatus(repo.path),
    ]);
    setDetails(d ?? null);
    setCommits(c ?? []);
    setLocalStatus(status ?? null);
  }, [repo]);

  const handleCreateCommit = useCallback(async () => {
    if (!repo || !isLocalRepo(repo) || !commitMessage.trim()) return;
    setCommitError(null);
    setCommitting(true);
    try {
      const result = await RepoService.createCommit(repo.path, commitMessage);
      if (result.success) {
        setCommitMessage('');
        await refreshLocalData();
      } else {
        setCommitError(result.error ?? 'Error al crear commit');
      }
    } finally {
      setCommitting(false);
    }
  }, [repo, commitMessage, refreshLocalData]);

  const handlePush = useCallback(async () => {
    if (!repo || !isLocalRepo(repo)) return;
    setPushing(true);
    try {
      const result = await RepoService.push(repo.path);
      if (result.success) {
        await refreshLocalData();
      } else {
        window.alert(result.error ?? 'Error al hacer push');
      }
    } finally {
      setPushing(false);
    }
  }, [repo, refreshLocalData]);

  const api = typeof window !== 'undefined' ? (window.electronAPI as ElectronAPI | undefined) : undefined;

  const handleOpenFolder = useCallback(async () => {
    if (!repo || !isLocalRepo(repo) || !api?.openFolder) return;
    const r = await api.openFolder(repo.path);
    if (!r.success) window.alert(r.error ?? 'No se pudo abrir la carpeta');
  }, [repo, api]);

  const handleOpenInEditor = useCallback(async (editor: string, label: string) => {
    if (!repo || !isLocalRepo(repo) || !api?.openInEditor) return;
    const r = await api.openInEditor(editor, repo.path);
    if (!r.success) window.alert(`${label} not available: ${r.error ?? 'not found'}`);
  }, [repo, api]);

  /** Convierte URL remota (git@... o https...) a URL para el navegador. */
  const remoteUrlToBrowserUrl = useCallback((remote: string | undefined): string | null => {
    if (!remote?.trim()) return null;
    const u = remote.trim();
    if (u.startsWith('https://') || u.startsWith('http://')) return u.replace(/\.git$/i, '');
    const m = u.match(/^git@([^:]+):(.+)$/);
    if (m) return `https://${m[1]}/${m[2].replace(/\.git$/i, '')}`;
    return null;
  }, []);

  const handleOpenRepoInBrowser = useCallback(async () => {
    if (!repo || !api?.openExternal) return;
    const url = isLocalRepo(repo)
      ? remoteUrlToBrowserUrl(details?.remoteUrl ?? '')
      : (isRemoteRepo(repo) ? repo.url : null);
    if (!url) {
      window.alert('No hay URL del repositorio. Comprueba el remote o espera a que carguen los detalles.');
      return;
    }
    const r = await api.openExternal(url);
    if (!r.success) window.alert(r.error ?? 'No se pudo abrir el enlace');
  }, [repo, details, api, remoteUrlToBrowserUrl]);

  if (!repo) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p className="text-lg">Select a repository to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{repo.name}</h2>
        {(isLocalRepo(repo) || isRemoteRepo(repo)) && (
          <div className="flex items-center gap-1">
            {isLocalRepo(repo) && (
              <>
            <button
              type="button"
              onClick={handleOpenFolder}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
              title="Abrir carpeta"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleOpenInEditor('cursor', 'Cursor')}
              className="px-2 py-1 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-600"
              title="Abrir en Cursor"
            >
              Cursor
            </button>
            <button
              type="button"
              onClick={() => handleOpenInEditor('code', 'VS Code')}
              className="px-2 py-1 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-600"
              title="Abrir en VS Code"
            >
              VS Code
            </button>
            <button
              type="button"
              onClick={() => handleOpenInEditor('claude', 'Claude')}
              className="px-2 py-1 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-600"
              title="Abrir en Claude"
            >
              Claude
            </button>
              </>
            )}
            <button
              type="button"
              onClick={handleOpenRepoInBrowser}
              className="px-2 py-1 rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-600"
              title="Abrir repo en el navegador"
            >
              Git
            </button>
          </div>
        )}
      </div>

      {isLocalRepo(repo) ? (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-mono break-all">{repo.path}</p>

          {(loading || commitsLoading) ? (
            <p className="text-gray-400 dark:text-gray-500">Cargando detalle y commits...</p>
          ) : (
            <div className="space-y-6">
              {/* Commits no pusheados */}
              {localStatus && localStatus.unpushedCount > 0 && (
                <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-900/20 px-3 py-2 flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <span className="font-medium">{localStatus.unpushedCount}</span>{' '}
                    {localStatus.unpushedCount === 1 ? 'commit no pusheado' : 'commits no pusheados'}
                  </p>
                  <button
                    type="button"
                    onClick={handlePush}
                    disabled={pushing}
                    className="px-3 py-1.5 text-xs font-medium rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {pushing ? 'Haciendo push…' : 'Push'}
                  </button>
                </div>
              )}

              {/* Crear commit si hay cambios sin confirmar */}
              {localStatus?.hasUncommittedChanges && (
                <section className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-0.5">
                  {/* <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Cambios no confirmados — clic en archivo para ver diff
                  </h3> */}
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2 p-0.5">
                    <span className="font-mono">??</span> = sin seguimiento (nuevo) · <span className="font-mono">M</span> = modificado · <span className="font-mono">A</span> = añadido · <span className="font-mono">D</span> = eliminado
                  </p>
                  {localStatus.statusLines.length > 0 && (
                    <ul className="mb-2 max-h-24 overflow-y-auto font-mono text-[11px] text-gray-600 dark:text-gray-400 space-y-0.5 p-0.5">
                      {localStatus.statusLines.slice(0, 20).map((line, i) => {
                        const path = parseStatusLinePath(line);
                        const isSelected = selectedUncommittedPath === path;
                        return (
                          <li key={i} className="min-w-0">
                            <button
                              type="button"
                              onClick={() => handleUncommittedFileClick(path)}
                              className={`w-full text-left truncate rounded px-1 py-0.5 hover:bg-gray-200/80 dark:hover:bg-gray-700/50 hover:cursor-pointer ${
                                isSelected ? 'bg-blue-100 dark:bg-blue-900/30 ring-1 ring-blue-300 dark:ring-blue-700' : ''
                              }`}
                            >
                              {line}
                            </button>
                          </li>
                        );
                      })}
                      {localStatus.statusLines.length > 20 && (
                        <li className="text-gray-400">… y {localStatus.statusLines.length - 20} más</li>
                      )}
                    </ul>
                  )}
                  {selectedUncommittedPath && (
                    <div className="mb-2">
                      <DiffViewer
                        path={selectedUncommittedPath}
                        content={uncommittedDiffContent}
                        loading={uncommittedDiffLoading}
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => { setCommitMessage(e.target.value); setCommitError(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateCommit()}
                      placeholder="Mensaje del commit"
                      className="w-full px-2 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={committing}
                    />
                    {commitError && (
                      <p className="text-[11px] text-red-600 dark:text-red-400">{commitError}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleCreateCommit}
                      disabled={committing || !commitMessage.trim()}
                      className="self-start px-3 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {committing ? 'Confirmando…' : 'Confirmar'}
                    </button>
                  </div>
                </section>
              )}

              {/* Historial minimalista tipo GitKraken — filas expandibles */}
              <section>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Commits
                </h3>
                {commits.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-xs py-2">
                    No hay commits o no se pudieron cargar.
                  </p>
                ) : (
                  <ul className="border border-gray-200/80 dark:border-gray-700/80 rounded-md overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/80">
                    {commits.map((commit) => {
                      const isExpanded = expandedCommit === commit.hash;
                      const detail = commitDetailCache[commit.hash];
                      const loadingDetail = detailLoading === commit.hash;
                      return (
                        <li key={commit.hash} className="min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleExpand(commit.hash)}
                            className="w-full flex items-center gap-3 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 min-w-0 text-left"
                          >
                            <span className={`shrink-0 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} aria-hidden>
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500 shrink-0 w-14 tabular-nums" title={commit.hash}>
                              {commit.shortHash}
                            </span>
                            <span className="text-xs text-gray-900 dark:text-gray-100 truncate min-w-0 flex-1">
                              {commit.subject}
                            </span>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0 truncate max-w-[8rem]" title={commit.author}>
                              {commit.author}
                            </span>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0" title={commit.date}>
                              {commit.relativeDate}
                            </span>
                          </button>
                          {isExpanded && (
                            <div className="bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/80 px-3 py-2 pl-9">
                              {loadingDetail ? (
                                <p className="text-[11px] text-gray-400 dark:text-gray-500">Cargando...</p>
                              ) : detail ? (
                                <div className="space-y-2 text-xs">
                                  {detail.fullMessage && detail.fullMessage.trim() !== commit.subject && (
                                    <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-400 font-sans text-[11px] leading-relaxed border-b border-gray-200 dark:border-gray-700 pb-2">
                                      {detail.fullMessage.trim()}
                                    </pre>
                                  )}
                                  {detail.files.length > 0 ? (
                                    <div>
                                      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Archivos ({detail.files.length}) — clic para ver diff
                                      </p>
                                      <ul className="space-y-0.5">
                                        {detail.files.map((f) => (
                                          <li key={f.path} className="min-w-0">
                                            <button
                                              type="button"
                                              onClick={() => handleFileClick(commit.hash, f.path, f.patch)}
                                              className={`w-full flex items-center gap-2 font-mono text-[11px] min-w-0 text-left rounded px-1 py-0.5 hover:bg-gray-200/80 dark:hover:bg-gray-700/50 ${
                                                selectedFile?.commitHash === commit.hash && selectedFile?.path === f.path
                                                  ? 'bg-blue-100 dark:bg-blue-900/30 ring-1 ring-blue-300 dark:ring-blue-700'
                                                  : ''
                                              }`}
                                            >
                                              <span
                                                className={`shrink-0 w-12 text-right ${
                                                  f.status === 'A' ? 'text-green-600 dark:text-green-400' : f.status === 'D' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                                                }`}
                                              >
                                                {FILE_STATUS_LABEL[f.status] ?? f.status}
                                              </span>
                                              {(f.additions != null || f.deletions != null) && (
                                                <span className="text-gray-400 dark:text-gray-500 shrink-0">
                                                  +{f.additions ?? 0} -{f.deletions ?? 0}
                                                </span>
                                              )}
                                              <span className="truncate text-gray-700 dark:text-gray-300">{f.path}</span>
                                            </button>
                                          </li>
                                        ))}
                                      </ul>
                                      {selectedFile?.commitHash === commit.hash && selectedFile?.path && (
                                        <div className="mt-2">
                                          <DiffViewer
                                            path={selectedFile.path}
                                            content={filePatchContent}
                                            loading={filePatchLoading}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500">Sin archivos modificados</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-[11px] text-gray-400 dark:text-gray-500">No se pudieron cargar los detalles</p>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Resumen del repo (branch, remote, etc.) */}
              {details && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Branch</span>
                    <p className="text-gray-900 dark:text-white font-mono text-sm">{details.branch}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Remote URL</span>
                    <p className="text-gray-900 dark:text-white font-mono text-sm break-all">{details.remoteUrl}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Commit</span>
                    <p className="text-gray-900 dark:text-white font-mono text-sm">{details.lastCommit}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : isRemoteRepo(repo) ? (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{repo.description || 'No description'}</p>

          {commitsLoading ? (
            <p className="text-gray-400 dark:text-gray-500">Cargando commits...</p>
          ) : (
            <div className="space-y-6">
              {/* Mismo historial minimalista — filas expandibles */}
              <section>
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Commits
                </h3>
                {commits.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-xs py-2">
                    No se pudieron cargar. Comprueba gh y acceso al repo.
                  </p>
                ) : (
                  <ul className="border border-gray-200/80 dark:border-gray-700/80 rounded-md overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/80">
                    {commits.map((commit) => {
                      const isExpanded = expandedCommit === commit.hash;
                      const detail = commitDetailCache[commit.hash];
                      const loadingDetail = detailLoading === commit.hash;
                      return (
                        <li key={commit.hash} className="min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleExpand(commit.hash)}
                            className="w-full flex items-center gap-3 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 min-w-0 text-left"
                          >
                            <span className={`shrink-0 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} aria-hidden>
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500 shrink-0 w-14 tabular-nums" title={commit.hash}>
                              {commit.shortHash}
                            </span>
                            <span className="text-xs text-gray-900 dark:text-gray-100 truncate min-w-0 flex-1">
                              {commit.subject}
                            </span>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0 truncate max-w-[8rem]" title={commit.author}>
                              {commit.author}
                            </span>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0" title={commit.date}>
                              {commit.relativeDate}
                            </span>
                          </button>
                          {isExpanded && (
                            <div className="bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/80 px-3 py-2 pl-9">
                              {loadingDetail ? (
                                <p className="text-[11px] text-gray-400 dark:text-gray-500">Cargando...</p>
                              ) : detail ? (
                                <div className="space-y-2 text-xs">
                                  {detail.fullMessage && detail.fullMessage.trim() !== commit.subject && (
                                    <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-400 font-sans text-[11px] leading-relaxed border-b border-gray-200 dark:border-gray-700 pb-2">
                                      {detail.fullMessage.trim()}
                                    </pre>
                                  )}
                                  {detail.files.length > 0 ? (
                                    <div>
                                      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        Archivos ({detail.files.length}) — clic para ver diff
                                      </p>
                                      <ul className="space-y-0.5">
                                        {detail.files.map((f) => (
                                          <li key={f.path} className="min-w-0">
                                            <button
                                              type="button"
                                              onClick={() => handleFileClick(commit.hash, f.path, f.patch)}
                                              className={`w-full flex items-center gap-2 font-mono text-[11px] min-w-0 text-left rounded px-1 py-0.5 hover:bg-gray-200/80 dark:hover:bg-gray-700/50 ${
                                                selectedFile?.commitHash === commit.hash && selectedFile?.path === f.path
                                                  ? 'bg-blue-100 dark:bg-blue-900/30 ring-1 ring-blue-300 dark:ring-blue-700'
                                                  : ''
                                              }`}
                                            >
                                              <span
                                                className={`shrink-0 w-12 text-right ${
                                                  f.status === 'A' ? 'text-green-600 dark:text-green-400' : f.status === 'D' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                                                }`}
                                              >
                                                {FILE_STATUS_LABEL[f.status] ?? f.status}
                                              </span>
                                              {(f.additions != null || f.deletions != null) && (
                                                <span className="text-gray-400 dark:text-gray-500 shrink-0">
                                                  +{f.additions ?? 0} -{f.deletions ?? 0}
                                                </span>
                                              )}
                                              <span className="truncate text-gray-700 dark:text-gray-300">{f.path}</span>
                                            </button>
                                          </li>
                                        ))}
                                      </ul>
                                      {selectedFile?.commitHash === commit.hash && selectedFile?.path && (
                                        <div className="mt-2">
                                          <DiffViewer
                                            path={selectedFile.path}
                                            content={filePatchContent}
                                            loading={filePatchLoading}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500">Sin archivos modificados</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-[11px] text-gray-400 dark:text-gray-500">No se pudieron cargar los detalles</p>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">URL</span>
                  <p className="text-gray-900 dark:text-white font-mono text-sm break-all">{repo.url}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Updated</span>
                  <p className="text-gray-900 dark:text-white text-sm">
                    {new Date(repo.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default RepoDetail;
