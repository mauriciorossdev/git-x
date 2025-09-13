import { app, BrowserWindow, ipcMain } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
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
      '-N', '', // Sin contraseña
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

// Leer clave pública SSH
ipcMain.handle('read-ssh-public-key', async (event, filePath) => {
  try {
    const publicKeyPath = `${filePath}.pub`;
    
    if (!fs.existsSync(publicKeyPath)) {
      return {
        success: false,
        error: 'Archivo de clave pública no encontrado'
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
      error: error instanceof Error ? error.message : 'Error al leer la clave pública'
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
      // Solo procesar archivos de claves privadas (sin extensión .pub)
      if (!file.endsWith('.pub') && !file.includes('.') && file !== 'known_hosts' && file !== 'config') {
        const privateKeyPath = path.join(sshDir, file);
        const publicKeyPath = `${privateKeyPath}.pub`;

        // Verificar que existe tanto la clave privada como la pública
        if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
          try {
            // Leer las claves
            const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
            const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

            // Extraer información de la clave pública
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

// Ejecutar comando del sistema
ipcMain.handle('execute-command', async (event, { command, args }) => {
  try {
    const fullCommand = `${command} ${args.join(' ')}`;
    console.log(`Executing command: ${fullCommand}`);
    
    const { stdout, stderr } = await execAsync(fullCommand);
    
    if (stderr && stderr.trim()) {
      console.warn('Command stderr:', stderr);
    }
    
    return {
      success: true,
      output: stdout.trim(),
      error: null
    };

  } catch (error) {
    console.error('Error executing command:', error);
    return {
      success: false,
      output: null,
      error: error instanceof Error ? error.message : 'Error al ejecutar el comando'
    };
  }
});
