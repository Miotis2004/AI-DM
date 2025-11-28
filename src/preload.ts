import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // Add any needed IPC bridges here for the new logic
  // For now, we might not need any if everything is local logic
});
