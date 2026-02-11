export interface ElectronAPI {
  generateSSHKey: (type: string, email: string, filePath: string) => Promise<{
    success: boolean;
    publicKey?: string;
    privateKey?: string;
    error?: string;
  }>;
  
  readSSHPublicKey: (filePath: string) => Promise<{
    success: boolean;
    content?: string;
    error?: string;
  }>;
  
  readSSHPrivateKey: (filePath: string) => Promise<{
    success: boolean;
    content?: string;
    error?: string;
  }>;
  
  checkSSHKeyExists: (filePath: string) => Promise<{
    exists: boolean;
    error?: string;
  }>;
  
  scanSSHDirectory: () => Promise<{
    success: boolean;
    keys?: Array<{
      filePath: string;
      name: string;
      type: string;
      email: string;
      publicKey: string;
      privateKey: string;
      isExisting: boolean;
    }>;
    error?: string;
  }>;
  
  executeCommand: (command: string, args: string[]) => Promise<{
    success: boolean;
    output?: string;
    error?: string;
  }>;
  
  scanLocalRepos: (searchPaths: string[]) => Promise<{
    success: boolean;
    repos: Array<{ name: string; path: string }>;
    error?: string;
  }>;

  /** Abre el diálogo nativo para elegir una carpeta. Devuelve la ruta o null si se cancela. */
  selectFolder: () => Promise<{ canceled: boolean; path: string | null }>;

  /** Abre la carpeta en el explorador del sistema (Finder, Explorer, etc.). */
  openFolder: (folderPath: string) => Promise<{ success: boolean; error?: string }>;

  /** Abre la carpeta en un editor (ej. 'cursor', 'code', 'claude'). Si no está instalado, success: false. */
  openInEditor: (editor: string, folderPath: string) => Promise<{ success: boolean; error?: string }>;

  /** Abre una URL en el navegador por defecto. */
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;

  getHomeDirectory: () => Promise<string>;
  getPlatform: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
