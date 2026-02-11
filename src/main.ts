import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from 'electron';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

// En versión empaquetada / producción solo se muestran logs de error
if (app.isPackaged || process.env.NODE_ENV === 'production') {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  console.warn = noop;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (process.platform === 'win32') {
  try {
    if (require('electron-squirrel-startup')) {
      app.quit();
    }
  } catch (error) {
    // electron-squirrel-startup is only available on Windows
    console.log('electron-squirrel-startup not available on this platform');
  }
}

const createApplicationMenu = (mainWindow: BrowserWindow): void => {
  const isMac = process.platform === 'darwin';
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [{
          label: 'Git X',
          submenu: [
            { role: 'about' as const },
            { type: 'separator' as const },
            { role: 'services' as const },
            { type: 'separator' as const },
            { role: 'hide' as const },
            { role: 'hideOthers' as const },
            { role: 'unhide' as const },
            { type: 'separator' as const },
            { role: 'quit' as const },
          ],
        }]
      : []),
    {
      label: 'File',
      submenu: [
        ...(isMac ? [] : [{ role: 'quit' as const }]),
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        ...(isMac ? [{ role: 'pasteAndMatchStyle' as const }] : []),
        { role: 'selectAll' as const },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { role: 'toggleDevTools' as const },
        { type: 'separator' as const },
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        ...(isMac
          ? [{ type: 'separator' as const }, { role: 'front' as const }, { type: 'separator' as const }, { role: 'window' as const }]
          : [{ role: 'close' as const }]),
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: 'Git X',
    height: 800,
    width: 1200,
    backgroundColor: '#0f0f0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Menú de aplicación (barra de cabecera)
  createApplicationMenu(mainWindow);

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers para funciones SSH

// Obtener directorio home del usuario
ipcMain.handle('get-home-directory', async () => {
  try {
    return os.homedir();
  } catch (error) {
    console.error('Error getting home directory:', error);
    throw error;
  }
});

// Obtener plataforma del sistema
ipcMain.handle('get-platform', async () => {
  try {
    return process.platform;
  } catch (error) {
    console.error('Error getting platform:', error);
    throw error;
  }
});

// Generar clave SSH
ipcMain.handle('generate-ssh-key', async (event, { type, email, filePath }) => {
  try {
    // Verificar que el directorio .ssh existe
    const sshDir = path.dirname(filePath);
    if (!fs.existsSync(sshDir)) {
      fs.mkdirSync(sshDir, { recursive: true, mode: 0o700 });
    }

    // Comando ssh-keygen
    const command = 'ssh-keygen';
    const args = [
      '-t', type,
      '-C', email,
      '-f', filePath,
      '-N', '', // No password
      '-q'     // Modo silencioso
    ];

    console.log(`Executing: ${command} ${args.join(' ')}`);
    
    const { stdout, stderr } = await execAsync(`${command} ${args.join(' ')}`);
    
    if (stderr && !stderr.includes('Your identification has been saved')) {
      throw new Error(String(stderr));
    }

    // Leer las claves generadas
    const publicKeyPath = `${filePath}.pub`;
    
    if (!fs.existsSync(filePath) || !fs.existsSync(publicKeyPath)) {
      throw new Error('Las claves SSH no se generaron correctamente');
    }

    const privateKey = fs.readFileSync(filePath, 'utf8');
    const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

    return {
      success: true,
      publicKey: publicKey.trim(),
      privateKey: privateKey.trim()
    };

  } catch (error) {
    console.error('Error generating SSH key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al generar la clave SSH'
    };
  }
});

// Read SSH public key
ipcMain.handle('read-ssh-public-key', async (event, filePath) => {
  try {
    const publicKeyPath = `${filePath}.pub`;
    
    if (!fs.existsSync(publicKeyPath)) {
      return {
        success: false,
        error: 'Public key file not found'
      };
    }

    const content = fs.readFileSync(publicKeyPath, 'utf8');
    
    return {
      success: true,
      content: content.trim()
    };

  } catch (error) {
    console.error('Error reading SSH public key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error reading public key'
    };
  }
});

// Leer clave privada SSH
ipcMain.handle('read-ssh-private-key', async (event, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: 'Archivo de clave privada no encontrado'
      };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    return {
      success: true,
      content: content.trim()
    };

  } catch (error) {
    console.error('Error reading SSH private key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al leer la clave privada'
    };
  }
});

// Verificar si existe una clave SSH
ipcMain.handle('check-ssh-key-exists', async (event, filePath) => {
  try {
    const exists = fs.existsSync(filePath) && fs.existsSync(`${filePath}.pub`);
    
    return {
      exists,
      error: null
    };

  } catch (error) {
    console.error('Error checking SSH key existence:', error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Error al verificar la existencia de la clave'
    };
  }
});

// Escanear directorio SSH para encontrar claves existentes
ipcMain.handle('scan-ssh-directory', async () => {
  try {
    const sshDir = path.join(os.homedir(), '.ssh');
    
    if (!fs.existsSync(sshDir)) {
      return {
        success: true,
        keys: []
      };
    }

    const files = fs.readdirSync(sshDir);
    const sshKeys = [];

    for (const file of files) {
      // Only process private key files (without .pub extension)
      if (!file.endsWith('.pub') && !file.includes('.') && file !== 'known_hosts' && file !== 'config') {
        const privateKeyPath = path.join(sshDir, file);
        const publicKeyPath = `${privateKeyPath}.pub`;

        // Verify that both private and public keys exist
        if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
          try {
            // Leer las claves
            const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
            const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

            // Extract information from public key
            const publicKeyLines = publicKey.trim().split(' ');
            const keyType = publicKeyLines[0].replace('ssh-', '');
            const keyContent = publicKeyLines[1];
            
            // Intentar extraer email del comentario si existe
            const comment = publicKeyLines[2] || '';
            const email = comment.includes('@') ? comment : '';

            // Generar nombre basado en el nombre del archivo
            const fileName = path.basename(file);
            const name = fileName.replace(/^id_/, '').replace(/[-_]/g, ' ');

            sshKeys.push({
              filePath: privateKeyPath,
              name: name.charAt(0).toUpperCase() + name.slice(1),
              type: keyType,
              email: email,
              publicKey: publicKey.trim(),
              privateKey: privateKey.trim(),
              isExisting: true
            });
          } catch (readError) {
            console.warn(`Error reading SSH key ${file}:`, readError);
          }
        }
      }
    }

    return {
      success: true,
      keys: sshKeys
    };

  } catch (error) {
    console.error('Error scanning SSH directory:', error);
    return {
      success: false,
      keys: [],
      error: error instanceof Error ? error.message : 'Error al escanear el directorio SSH'
    };
  }
});

// Abrir diálogo para seleccionar una carpeta (para agregar a rutas de búsqueda)
ipcMain.handle('select-folder', async () => {
  const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
  if (!win) return { canceled: true, path: null };
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
    title: 'Seleccionar carpeta para buscar repositorios',
  });
  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true, path: null };
  }
  return { canceled: false, path: result.filePaths[0] };
});

// Abrir URL en el navegador por defecto
ipcMain.handle('open-external', async (event, url: string) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'No se pudo abrir el enlace' };
  }
});

// Abrir carpeta en el explorador del sistema
ipcMain.handle('open-folder', async (event, folderPath: string) => {
  try {
    const resolved = folderPath.replace(/^~/, os.homedir());
    const err = await shell.openPath(resolved);
    if (err) return { success: false, error: err };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'No se pudo abrir la carpeta' };
  }
});

// Abrir carpeta en un editor (cursor, code). Para 'claude' abre la terminal en esa carpeta para usar la CLI.
ipcMain.handle('open-in-editor', async (event, editor: string, folderPath: string) => {
  const resolved = folderPath.replace(/^~/, os.homedir());

  if (editor === 'claude') {
    // Abrir terminal en la carpeta del repo y ejecutar claude
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      const platform = process.platform;
      let child;
      if (platform === 'darwin') {
        const escaped = resolved.replace(/'/g, "'\"'\"'");
        child = spawn('osascript', [
          '-e',
          `tell application "Terminal" to activate`,
          '-e',
          `tell application "Terminal" to do script "cd '${escaped}' && claude"`,
        ], { detached: true, stdio: 'ignore' });
      } else if (platform === 'win32') {
        child = spawn('cmd.exe', ['/c', 'start', 'cmd', '/k', `cd /d "${resolved}" && claude`], { detached: true, stdio: 'ignore' });
      } else {
        const term = process.env.COLORTERM || process.env.TERM_PROGRAM || 'gnome-terminal';
        if (term.includes('gnome') || term === 'gnome-terminal') {
          child = spawn('gnome-terminal', ['--', 'bash', '-c', `cd "${resolved}" && claude; exec bash`], { detached: true, stdio: 'ignore' });
        } else {
          child = spawn('xterm', ['-e', `cd "${resolved}" && claude; exec $SHELL`], { detached: true, stdio: 'ignore' });
        }
      }
      child.on('error', (err) => resolve({ success: false, error: err.message || 'No se pudo abrir la terminal' }));
      child.unref();
      process.nextTick(() => resolve({ success: true }));
    });
  }

  return new Promise<{ success: boolean; error?: string }>((resolve) => {
    let resolved_ = false;
    const child = spawn(editor, [resolved], { detached: true, stdio: 'ignore' });
    child.on('error', (err) => {
      if (!resolved_) {
        resolved_ = true;
        resolve({ success: false, error: err.message || 'Aplicación no encontrada' });
      }
    });
    child.unref();
    process.nextTick(() => {
      if (!resolved_) {
        resolved_ = true;
        resolve({ success: true });
      }
    });
  });
});

// Scan directories for local git repos (incluye la carpeta misma si es repo, y 1 nivel de hijos)
ipcMain.handle('scan-local-repos', async (event, searchPaths: string[]) => {
  try {
    const repos: { name: string; path: string }[] = [];
    const seenPaths = new Set<string>();

    for (const searchPath of searchPaths) {
      const resolvedPath = path.normalize(searchPath.replace(/^~/, os.homedir()));
      if (!fs.existsSync(resolvedPath)) continue;

      // Si la carpeta seleccionada es un repo, agregarla
      const gitDirHere = path.join(resolvedPath, '.git');
      try {
        if (fs.existsSync(gitDirHere)) {
          const name = path.basename(resolvedPath);
          if (!seenPaths.has(resolvedPath)) {
            seenPaths.add(resolvedPath);
            repos.push({ name, path: resolvedPath });
          }
        }
      } catch {
        // skip
      }

      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(resolvedPath, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const fullPath = path.join(resolvedPath, entry.name);
        const gitDir = path.join(fullPath, '.git');
        try {
          if (fs.existsSync(gitDir) && !seenPaths.has(fullPath)) {
            seenPaths.add(fullPath);
            repos.push({ name: entry.name, path: fullPath });
          }
        } catch {
          // skip inaccessible dirs
        }
      }
    }

    return { success: true, repos };
  } catch (error) {
    console.error('Error scanning local repos:', error);
    return {
      success: false,
      repos: [],
      error: error instanceof Error ? error.message : 'Error scanning local repos'
    };
  }
});

// Ejecutar comando del sistema (spawn sin shell para rutas con espacios y argumentos especiales)
ipcMain.handle('execute-command', async (event, { command, args }) => {
  console.log('[main] execute-command:', command, 'args:', args?.length, args?.slice(0, 5));
  return new Promise((resolve) => {
    try {
      const child = spawn(command, args, {
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => { stdout += data.toString(); });
      child.stderr?.on('data', (data) => { stderr += data.toString(); });

      child.on('error', (err) => {
        console.error('[main] execute-command error:', err);
        resolve({
          success: false,
          output: null,
          error: err instanceof Error ? err.message : 'Error al ejecutar el comando',
        });
      });

      child.on('close', (code) => {
        const output = stdout.trim();
        const errMsg = code !== 0 ? (stderr.trim() || `Exit code ${code}`) : null;
        if (stderr && stderr.trim()) {
          console.warn('[main] execute-command stderr:', stderr.slice(0, 300));
        }
        console.log('[main] execute-command result:', { command, code, outputLength: output.length, error: errMsg });
        resolve({
          success: code === 0,
          output,
          error: errMsg,
        });
      });
    } catch (error) {
      console.error('[main] execute-command exception:', error);
      resolve({
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Error al ejecutar el comando',
      });
    }
  });
});
