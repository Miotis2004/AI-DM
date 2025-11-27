import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ollama: {
    checkConnection: () => ipcRenderer.invoke('ollama:checkConnection'),
    listModels: () => ipcRenderer.invoke('ollama:listModels'),
    setModel: (model: string) => ipcRenderer.invoke('ollama:setModel', model),
    generateStream: (messages: any[], systemPrompt: string) =>
      ipcRenderer.invoke('ollama:generateStream', messages, systemPrompt),
    onStreamChunk: (callback: (chunk: string) => void) => {
      ipcRenderer.on('ollama:streamChunk', (_, chunk) => callback(chunk));
    },
    onStreamDone: (callback: () => void) => {
      ipcRenderer.on('ollama:streamDone', () => callback());
    },
    onStreamError: (callback: (error: string) => void) => {
      ipcRenderer.on('ollama:streamError', (_, error) => callback(error));
    },
  },
  claude: {
    setApiKey: (apiKey: string) => ipcRenderer.invoke('claude:setApiKey', apiKey),
    getApiKey: () => ipcRenderer.invoke('claude:getApiKey'),
    testConnection: () => ipcRenderer.invoke('claude:testConnection'),
    setModel: (model: string) => ipcRenderer.invoke('claude:setModel', model),
    getModel: () => ipcRenderer.invoke('claude:getModel'),
    listModels: () => ipcRenderer.invoke('claude:listModels'),
    generateStream: (messages: any[], systemPrompt: string) =>
      ipcRenderer.invoke('claude:generateStream', messages, systemPrompt),
    onStreamChunk: (callback: (chunk: string) => void) => {
      ipcRenderer.on('claude:streamChunk', (_, chunk) => callback(chunk));
    },
    onStreamDone: (callback: () => void) => {
      ipcRenderer.on('claude:streamDone', () => callback());
    },
    onStreamError: (callback: (error: string) => void) => {
      ipcRenderer.on('claude:streamError', (_, error) => callback(error));
    },
  },
});
