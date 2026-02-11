export interface LocalRepo {
  type: 'local';
  name: string;
  path: string;
}

export interface RemoteRepo {
  type: 'remote';
  name: string;
  url: string;
  description: string;
  updatedAt: string;
}

export interface RepoDetails {
  branch: string;
  remoteUrl: string;
  lastCommit: string;
}

/** Estado del repo local: cambios sin confirmar y commits no pusheados. */
export interface LocalRepoStatus {
  hasUncommittedChanges: boolean;
  statusLines: string[];
  unpushedCount: number;
}

export interface Commit {
  shortHash: string;
  hash: string;
  subject: string;
  author: string;
  date: string;
  relativeDate: string;
}

export type FileChangeStatus = 'A' | 'M' | 'D' | 'R' | 'C' | 'U';

export interface CommitFileChange {
  path: string;
  status: FileChangeStatus;
  additions?: number;
  deletions?: number;
  /** Diff en formato unified (patch); opcional, puede venir al expandir o al hacer clic. */
  patch?: string;
}

export interface CommitDetail {
  fullMessage: string;
  files: CommitFileChange[];
}

export type Repo = LocalRepo | RemoteRepo;

export function isLocalRepo(repo: Repo): repo is LocalRepo {
  return repo.type === 'local';
}

export function isRemoteRepo(repo: Repo): repo is RemoteRepo {
  return repo.type === 'remote';
}
