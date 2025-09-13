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
  
  getHomeDirectory: () => Promise<string>;
  getPlatform: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
