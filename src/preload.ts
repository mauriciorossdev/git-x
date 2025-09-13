import { contextBridge, ipcRenderer } from 'electron';

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

contextBridge.exposeInMainWorld('electronAPI', {
  // Funciones para generar claves SSH
  generateSSHKey: (type: string, email: string, filePath: string) => 
    ipcRenderer.invoke('generate-ssh-key', { type, email, filePath }),
  
  // Funciones para gestionar archivos SSH
  readSSHPublicKey: (filePath: string) => 
    ipcRenderer.invoke('read-ssh-public-key', filePath),
  
  readSSHPrivateKey: (filePath: string) => 
    ipcRenderer.invoke('read-ssh-private-key', filePath),
  
  // Funciones para verificar si existe una clave SSH
  checkSSHKeyExists: (filePath: string) => 
    ipcRenderer.invoke('check-ssh-key-exists', filePath),
  
  // Function to scan SSH directory
  scanSSHDirectory: () => 
    ipcRenderer.invoke('scan-ssh-directory'),
  
  // Funciones para ejecutar comandos del sistema
  executeCommand: (command: string, args: string[]) => 
    ipcRenderer.invoke('execute-command', { command, args }),
  
  // Functions to get system information
  getHomeDirectory: () => ipcRenderer.invoke('get-home-directory'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
});
