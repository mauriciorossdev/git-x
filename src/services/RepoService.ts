import { LocalRepo, RemoteRepo, RepoDetails, LocalRepoStatus, Commit, CommitDetail, CommitFileChange } from '../types/repo';

const DEFAULT_SEARCH_PATHS = ['~/Desktop', '~/Documents', '~/Projects', '~/Developer'];
const STORAGE_KEY = 'repo-search-paths';

class RepoService {
  getSearchPaths(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_SEARCH_PATHS;
  }

  setSearchPaths(paths: string[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
  }

  async scanLocalRepos(): Promise<LocalRepo[]> {
    if (!window.electronAPI) return [];

    const paths = this.getSearchPaths();
    const result = await window.electronAPI.scanLocalRepos(paths);

    if (!result.success) {
      console.error('Error scanning local repos:', result.error);
      return [];
    }

    return result.repos.map((r) => ({
      type: 'local' as const,
      name: r.name,
      path: r.path,
    }));
  }

  async listRemoteRepos(): Promise<RemoteRepo[]> {
    if (!window.electronAPI) return [];

    const result = await window.electronAPI.executeCommand('gh', [
      'repo', 'list', '--limit', '100',
      '--json', 'name,url,description,updatedAt',
    ]);

    if (!result.success || !result.output) return [];

    try {
      const parsed = JSON.parse(result.output) as Array<{
        name: string;
        url: string;
        description: string;
        updatedAt: string;
      }>;

      return parsed.map((r) => ({
        type: 'remote' as const,
        name: r.name,
        url: r.url,
        description: r.description || '',
        updatedAt: r.updatedAt,
      }));
    } catch {
      console.error('Error parsing remote repos');
      return [];
    }
  }

  async getRepoDetails(repoPath: string): Promise<RepoDetails | null> {
    console.log('[RepoService.getRepoDetails] repoPath:', repoPath);
    if (!window.electronAPI) {
      console.warn('[RepoService.getRepoDetails] window.electronAPI no disponible');
      return null;
    }

    const [branchResult, remoteResult, logResult] = await Promise.all([
      window.electronAPI.executeCommand('git', ['-C', repoPath, 'branch', '--show-current']),
      window.electronAPI.executeCommand('git', ['-C', repoPath, 'config', '--get', 'remote.origin.url']),
      window.electronAPI.executeCommand('git', ['-C', repoPath, 'log', '-1', '--pretty=format:%h - %s (%ar)']),
    ]);

    const details = {
      branch: branchResult.success ? (branchResult.output || 'unknown') : 'unknown',
      remoteUrl: remoteResult.success ? (remoteResult.output || 'none') : 'none',
      lastCommit: logResult.success ? (logResult.output || 'no commits') : 'no commits',
    };
    console.log('[RepoService.getRepoDetails] resultado:', details);
    return details;
  }

  /** Estado del repo local: cambios sin confirmar y cantidad de commits no pusheados. */
  async getLocalRepoStatus(repoPath: string): Promise<LocalRepoStatus> {
    if (!window.electronAPI) {
      return { hasUncommittedChanges: false, statusLines: [], unpushedCount: 0 };
    }

    const [statusResult, unpushedResult] = await Promise.all([
      window.electronAPI.executeCommand('git', ['-C', repoPath, 'status', '--short']),
      window.electronAPI.executeCommand('git', ['-C', repoPath, 'rev-list', '--count', '@{u}..HEAD']),
    ]);

    const statusLines = statusResult.success && statusResult.output?.trim()
      ? statusResult.output.trim().split('\n')
      : [];
    const hasUncommittedChanges = statusLines.length > 0;
    const unpushedCount = unpushedResult.success && unpushedResult.output?.trim()
      ? Math.max(0, parseInt(unpushedResult.output.trim(), 10) || 0)
      : 0;

    return { hasUncommittedChanges, statusLines, unpushedCount };
  }

  /** Crea un commit con todos los cambios actuales (git add -A && git commit -m). */
  async createCommit(repoPath: string, message: string): Promise<{ success: boolean; error?: string }> {
    if (!window.electronAPI || !message.trim()) {
      return { success: false, error: 'Mensaje vacío' };
    }

    const addResult = await window.electronAPI.executeCommand('git', ['-C', repoPath, 'add', '-A']);
    if (!addResult.success) {
      return { success: false, error: addResult.error ?? 'Error al agregar archivos' };
    }

    const commitResult = await window.electronAPI.executeCommand('git', [
      '-C', repoPath, 'commit', '-m', message.trim(),
    ]);
    if (!commitResult.success) {
      return { success: false, error: commitResult.error ?? 'Error al crear commit' };
    }
    return { success: true };
  }

  /** Hace push al remoto (rama actual). */
  async push(repoPath: string): Promise<{ success: boolean; error?: string }> {
    if (!window.electronAPI) {
      return { success: false, error: 'No disponible' };
    }
    const result = await window.electronAPI.executeCommand('git', ['-C', repoPath, 'push']);
    if (!result.success) {
      return { success: false, error: result.error ?? 'Error al hacer push' };
    }
    return { success: true };
  }

  /** Lista commits del repo. Git emite %x1e como delimitador para no romper con mensajes que tengan símbolos. */
  async getCommits(repoPath: string, limit = 80): Promise<Commit[]> {
    console.log('[RepoService.getCommits] repoPath:', repoPath, 'limit:', limit);

    if (!window.electronAPI) {
      console.warn('[RepoService.getCommits] window.electronAPI no disponible');
      return [];
    }

    const fmt = '%h%' + 'x1e%H%' + 'x1e%s%' + 'x1e%an%' + 'x1e%ad%' + 'x1e%ar%n';
    const args = ['-C', repoPath, 'log', `-${limit}`, '--pretty=format:' + fmt, '--date=short'];
    console.log('[RepoService.getCommits] ejecutando git con args:', args);

    const result = await window.electronAPI.executeCommand('git', args);

    console.log('[RepoService.getCommits] result:', {
      success: result.success,
      outputLength: result.output?.length ?? 0,
      outputPreview: result.output ? result.output.slice(0, 200) + (result.output.length > 200 ? '...' : '') : null,
      error: result.error,
    });

    if (!result.success) {
      console.warn('[RepoService.getCommits] comando falló:', result.error);
      return [];
    }
    const raw = result.output?.trim();
    if (!raw) {
      console.log('[RepoService.getCommits] output vacío o solo espacios');
      return [];
    }

    const commits: Commit[] = [];
    const sep = '\x1e';
    const lines = raw.split('\n');
    console.log('[RepoService.getCommits] líneas en output:', lines.length, 'primera línea (preview):', lines[0]?.slice(0, 80));

    for (const line of lines) {
      const parts = line.split(sep);
      if (parts.length >= 6) {
        commits.push({
          shortHash: parts[0].trim(),
          hash: parts[1].trim(),
          subject: parts[2].trim(),
          author: parts[3].trim(),
          date: parts[4].trim(),
          relativeDate: parts[5].trim(),
        });
      } else if (line.trim()) {
        console.warn('[RepoService.getCommits] línea con partes insuficientes:', parts.length, 'line preview:', line.slice(0, 60));
      }
    }
    console.log('[RepoService.getCommits] commits parseados:', commits.length);
    return commits;
  }

  /**
   * Parsea owner y repo de una URL de GitHub (https o git@).
   */
  private parseGitHubOwnerRepo(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com[/:]([^/]+)\/([^/#?.]+?)(?:\.git)?$/i);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  }

  /**
   * Lista commits de un repo remoto en GitHub vía gh api (JSON).
   */
  async getRemoteRepoCommits(repoUrl: string, limit = 80): Promise<Commit[]> {
    console.log('[RepoService.getRemoteRepoCommits] repoUrl:', repoUrl, 'limit:', limit);

    if (!window.electronAPI) {
      console.warn('[RepoService.getRemoteRepoCommits] window.electronAPI no disponible');
      return [];
    }

    const parsed = this.parseGitHubOwnerRepo(repoUrl);
    if (!parsed) {
      console.warn('[RepoService.getRemoteRepoCommits] URL no reconocida como GitHub:', repoUrl);
      return [];
    }

    const { owner, repo } = parsed;
    const result = await window.electronAPI.executeCommand('gh', [
      'api',
      `repos/${owner}/${repo}/commits`,
      '--paginate',
      '--per-page',
      String(Math.min(limit, 100)),
    ]);

    console.log('[RepoService.getRemoteRepoCommits] result:', {
      success: result.success,
      outputLength: result.output?.length ?? 0,
      error: result.error,
    });

    if (!result.success || !result.output?.trim()) {
      if (!result.success) console.warn('[RepoService.getRemoteRepoCommits] comando falló:', result.error);
      return [];
    }

    let raw: Array<{
      sha?: string;
      commit?: { message?: string; author?: { name?: string; date?: string } };
    }>;
    try {
      raw = JSON.parse(result.output) as typeof raw;
    } catch (e) {
      console.error('[RepoService.getRemoteRepoCommits] JSON inválido:', e);
      return [];
    }

    if (!Array.isArray(raw)) {
      console.warn('[RepoService.getRemoteRepoCommits] respuesta no es array:', typeof raw);
      return [];
    }

    const commits: Commit[] = raw.slice(0, limit).map((item) => {
      const sha = item.sha ?? '';
      const msg = item.commit?.message ?? '';
      const subject = msg.split('\n')[0]?.trim() ?? '';
      const author = item.commit?.author?.name ?? '';
      const dateStr = item.commit?.author?.date ?? '';
      const date = dateStr ? new Date(dateStr) : new Date();
      return {
        shortHash: sha.slice(0, 7),
        hash: sha,
        subject,
        author,
        date: dateStr ? date.toISOString().slice(0, 10) : '',
        relativeDate: formatRelativeDate(date),
      };
    });
    console.log('[RepoService.getRemoteRepoCommits] commits parseados:', commits.length);
    return commits;
  }

  /** Detalle de un commit en repo local: mensaje completo y archivos modificados. */
  async getCommitDetailsLocal(repoPath: string, hash: string): Promise<CommitDetail | null> {
    if (!window.electronAPI) return null;

    const [msgResult, nameStatusResult, numstatResult] = await Promise.all([
      window.electronAPI.executeCommand('git', ['-C', repoPath, 'show', hash, '--format=%B', '--no-patch']),
      window.electronAPI.executeCommand('git', ['-C', repoPath, 'diff-tree', '-r', '--no-commit-id', '--name-status', hash]),
      window.electronAPI.executeCommand('git', ['-C', repoPath, 'show', hash, '--numstat', '--format=']),
    ]);

    const fullMessage = msgResult.success && msgResult.output ? msgResult.output.trim() : '';
    const files: CommitFileChange[] = [];

    if (nameStatusResult.success && nameStatusResult.output?.trim()) {
      const statusLines = nameStatusResult.output.trim().split('\n');
      const numstatMap = new Map<string, { add: number; del: number }>();
      if (numstatResult.success && numstatResult.output?.trim()) {
        for (const line of numstatResult.output.trim().split('\n')) {
          const parts = line.split(/\t/);
          if (parts.length >= 3) {
            const path = parts.slice(2).join('\t').trim();
            const add = parseInt(parts[0], 10) || 0;
            const del = parseInt(parts[1], 10) || 0;
            numstatMap.set(path, { add, del });
          }
        }
      }
      for (const line of statusLines) {
        const tab = line.indexOf('\t');
        if (tab < 0) continue;
        const status = line.slice(0, tab).trim().charAt(0) as CommitFileChange['status'];
        const path = line.slice(tab + 1).trim();
        if (!path) continue;
        const stat = numstatMap.get(path);
        const validStatus = ['A', 'M', 'D', 'R', 'C', 'U'].includes(status) ? status : 'M';
        files.push({
          path,
          status: validStatus as CommitFileChange['status'],
          additions: stat?.add,
          deletions: stat?.del,
        });
      }
    }

    return { fullMessage, files };
  }

  /** Obtiene el diff (patch) de un archivo en un commit (repo local). */
  async getCommitFilePatchLocal(repoPath: string, hash: string, filePath: string): Promise<string | null> {
    if (!window.electronAPI) return null;
    const result = await window.electronAPI.executeCommand('git', [
      '-C', repoPath, 'show', hash, '--', filePath,
    ]);
    if (!result.success || result.output == null) return null;
    return result.output.trim() || null;
  }

  /** Diff de un archivo no confirmado (working tree + staged vs HEAD). */
  async getUncommittedFileDiff(repoPath: string, filePath: string): Promise<string | null> {
    if (!window.electronAPI) return null;
    const result = await window.electronAPI.executeCommand('git', [
      '-C', repoPath, 'diff', 'HEAD', '--', filePath,
    ]);
    if (!result.success || result.output == null) return null;
    return result.output.trim() || null;
  }

  /** Detalle de un commit remoto vía GitHub API (incluye patch por archivo cuando la API lo devuelve). */
  async getCommitDetailsRemote(repoUrl: string, hash: string): Promise<CommitDetail | null> {
    if (!window.electronAPI) return null;

    const parsed = this.parseGitHubOwnerRepo(repoUrl);
    if (!parsed) return null;

    const { owner, repo } = parsed;
    const result = await window.electronAPI.executeCommand('gh', [
      'api',
      `repos/${owner}/${repo}/commits/${hash}`,
    ]);

    if (!result.success || !result.output?.trim()) return null;

    try {
      const data = JSON.parse(result.output) as {
        commit?: { message?: string };
        files?: Array<{ filename: string; status: string; additions?: number; deletions?: number; patch?: string }>;
      };
      const fullMessage = data.commit?.message?.trim() ?? '';
      const files: CommitFileChange[] = (data.files ?? []).map((f) => ({
        path: f.filename,
        status: (f.status?.charAt(0) ?? 'M') as CommitFileChange['status'],
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch?.trim() || undefined,
      }));
      return { fullMessage, files };
    } catch {
      return null;
    }
  }
}

function formatRelativeDate(d: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'hoy';
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} sem`;
  if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)} mes`;
  return `hace ${Math.floor(diffDays / 365)} año`;
}

export default new RepoService();
