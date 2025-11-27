import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { OllamaService } from './main/ollamaService';
import { claudeService } from './main/claudeService';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;

const ollamaService = new OllamaService();

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ============= OLLAMA IPC HANDLERS =============

ipcMain.handle('ollama:checkConnection', async () => {
  return await ollamaService.checkConnection();
});

ipcMain.handle('ollama:listModels', async () => {
  return await ollamaService.listModels();
});

ipcMain.handle('ollama:setModel', async (_, model: string) => {
  ollamaService.setModel(model);
});

ipcMain.handle('ollama:generateStream', async (_, messages: any[], systemPrompt: string) => {
  try {
    const generator = ollamaService.generateStream(messages, systemPrompt);
    
    for await (const chunk of generator) {
      if (mainWindow) {
        mainWindow.webContents.send('ollama:streamChunk', chunk);
      }
    }
    
    if (mainWindow) {
      mainWindow.webContents.send('ollama:streamDone');
    }
  } catch (error: any) {
    console.error('Stream error:', error);
    if (mainWindow) {
      mainWindow.webContents.send('ollama:streamError', error.message);
    }
  }
});

// ============= CLAUDE API IPC HANDLERS =============

ipcMain.handle('claude:setApiKey', async (_, apiKey: string) => {
  claudeService.setApiKey(apiKey);
  return true;
});

ipcMain.handle('claude:getApiKey', async () => {
  return claudeService.getApiKey();
});

ipcMain.handle('claude:testConnection', async () => {
  return await claudeService.testConnection();
});

ipcMain.handle('claude:setModel', async (_, model: string) => {
  claudeService.setModel(model);
});

ipcMain.handle('claude:getModel', async () => {
  return claudeService.getModel();
});

ipcMain.handle('claude:listModels', async () => {
  return claudeService.getAvailableModels();
});

ipcMain.handle('claude:generateStream', async (_, messages: any[], systemPrompt: string) => {
  try {
    const generator = claudeService.generateStream(messages, systemPrompt);
    
    for await (const chunk of generator) {
      if (mainWindow) {
        mainWindow.webContents.send('claude:streamChunk', chunk);
      }
    }
    
    if (mainWindow) {
      mainWindow.webContents.send('claude:streamDone');
    }
  } catch (error: any) {
    console.error('Claude stream error:', error);
    if (mainWindow) {
      mainWindow.webContents.send('claude:streamError', error.message);
    }
  }
});