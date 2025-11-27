export interface ElectronAPI {
  ollama: {
    checkConnection: () => Promise<boolean>;
    listModels: () => Promise<string[]>;
    setModel: (model: string) => Promise<void>;
    generateStream: (messages: any[], systemPrompt: string) => Promise<void>;
    onStreamChunk: (callback: (chunk: string) => void) => void;
    onStreamDone: (callback: () => void) => void;
    onStreamError: (callback: (error: string) => void) => void;
  };
  claude: {
    setApiKey: (apiKey: string) => Promise<boolean>;
    getApiKey: () => Promise<string>;
    testConnection: () => Promise<boolean>;
    setModel: (model: string) => Promise<void>;
    getModel: () => Promise<string>;
    listModels: () => Promise<string[]>;
    generateStream: (messages: any[], systemPrompt: string) => Promise<void>;
    onStreamChunk: (callback: (chunk: string) => void) => void;
    onStreamDone: (callback: () => void) => void;
    onStreamError: (callback: (error: string) => void) => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
