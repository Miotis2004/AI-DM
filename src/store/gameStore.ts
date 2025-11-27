import { create } from 'zustand';
import { Character } from '../types/character';
import { AdventureModule, ModuleProgress, Room } from '../types/module';

export type AIProvider = 'ollama' | 'claude';

interface GameStore {
  // Existing state
  characters: Character[];
  currentCharacterId: string | null;
  conversationHistory: Array<{ role: 'user' | 'dm'; message: string }>;
  lastRoll: {
    sides: number;
    result: number;
    modifier?: number;
    total: number;
    timestamp: number;
  } | null;
  rollRequest: string | null;
  pendingRollRequest: string | null;
  currentModel: string;
  availableModels: string[];
  currentModule: AdventureModule | null;
  moduleProgress: ModuleProgress | null;
  
  // New AI provider state
  aiProvider: AIProvider;
  claudeApiKey: string;
  
  // Actions
  addCharacter: (character: Character) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => void;
  setCurrentCharacter: (id: string | null) => void;
  selectCharacter: (id: string | null) => void;
  getCurrentCharacter: () => Character | null;
  addMessage: (role: 'user' | 'dm', message: string) => void;
  clearMessages: () => void;
  setLastRoll: (roll: {
    sides: number;
    result: number;
    modifier?: number;
    total: number;
    timestamp: number;
  }) => void;
  rollDice: (sides: number, modifier?: number) => void;
  requestRoll: (type: string) => void;
  clearRollRequest: () => void;
  setCurrentModel: (model: string) => void;
  setAvailableModels: (models: string[]) => void;
  loadModule: (module: AdventureModule) => void;
  setCurrentRoom: (roomId: string) => void;
  markRoomVisited: (roomId: string) => void;
  completeObjective: (objective: string) => void;
  defeatEncounter: (encounterId: string) => void;
  getCurrentRoom: () => Room | null;
  
  // New AI provider actions
  setAIProvider: (provider: AIProvider) => void;
  setClaudeApiKey: (apiKey: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  characters: [],
  currentCharacterId: null,
  conversationHistory: [
    { role: 'dm', message: 'Welcome, adventurer! Create or select a character to begin your quest.' },
  ],
  lastRoll: null,
  rollRequest: null,
  pendingRollRequest: null,
  currentModel: 'mistral',
  availableModels: [],
  currentModule: null,
  moduleProgress: null,
  
  // New AI provider initial state
  aiProvider: 'ollama',
  claudeApiKey: '',

  // Actions
  addCharacter: (character) =>
    set((state) => ({
      characters: [...state.characters, character],
    })),

  updateCharacter: (character) =>
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === character.id ? character : c
      ),
    })),

  deleteCharacter: (id) =>
    set((state) => ({
      characters: state.characters.filter((c) => c.id !== id),
      currentCharacterId: state.currentCharacterId === id ? null : state.currentCharacterId,
    })),

  setCurrentCharacter: (id) => set({ currentCharacterId: id }),
  
  selectCharacter: (id) => set({ currentCharacterId: id }),

  getCurrentCharacter: () => {
    const state = get();
    return state.characters.find((c) => c.id === state.currentCharacterId) || null;
  },

  addMessage: (role, message) =>
    set((state) => ({
      conversationHistory: [...state.conversationHistory, { role, message }],
    })),

  clearMessages: () =>
    set({
      conversationHistory: [
        { role: 'dm', message: 'Welcome, adventurer! Create or select a character to begin your quest.' },
      ],
    }),

  setLastRoll: (roll) => set({ lastRoll: roll }),
  
  rollDice: (sides, modifier = 0) => {
    const result = Math.floor(Math.random() * sides) + 1;
    const total = result + modifier;
    set({
      lastRoll: {
        sides,
        result,
        modifier,
        total,
        timestamp: Date.now(),
      },
      pendingRollRequest: null,
    });
  },

  requestRoll: (type) => set({ rollRequest: type, pendingRollRequest: type }),

  clearRollRequest: () => set({ rollRequest: null, pendingRollRequest: null }),

  setCurrentModel: (model) => set({ currentModel: model }),

  setAvailableModels: (models) => set({ availableModels: models }),

  loadModule: (module) =>
    set({
      currentModule: module,
      moduleProgress: {
        moduleId: module.id,
        currentRoom: module.rooms[0]?.id || '',
        visitedRooms: [module.rooms[0]?.id || ''],
        completedObjectives: [],
        defeatedEncounters: [],
        collectedItems: [],
      },
    }),

  setCurrentRoom: (roomId) =>
    set((state) =>
      state.moduleProgress
        ? {
            moduleProgress: {
              ...state.moduleProgress,
              currentRoom: roomId,
            },
          }
        : {}
    ),

  markRoomVisited: (roomId) =>
    set((state) =>
      state.moduleProgress
        ? {
            moduleProgress: {
              ...state.moduleProgress,
              visitedRooms: state.moduleProgress.visitedRooms.includes(roomId)
                ? state.moduleProgress.visitedRooms
                : [...state.moduleProgress.visitedRooms, roomId],
            },
          }
        : {}
    ),

  completeObjective: (objective) =>
    set((state) =>
      state.moduleProgress
        ? {
            moduleProgress: {
              ...state.moduleProgress,
              completedObjectives: [...state.moduleProgress.completedObjectives, objective],
            },
          }
        : {}
    ),

  defeatEncounter: (encounterId) =>
    set((state) =>
      state.moduleProgress
        ? {
            moduleProgress: {
              ...state.moduleProgress,
              defeatedEncounters: [...state.moduleProgress.defeatedEncounters, encounterId],
            },
          }
        : {}
    ),

  getCurrentRoom: () => {
    const state = get();
    if (!state.currentModule || !state.moduleProgress) return null;
    return (
      state.currentModule.rooms.find((r) => r.id === state.moduleProgress!.currentRoom) || null
    );
  },
  
  // New AI provider actions
  setAIProvider: (provider) => set({ aiProvider: provider }),
  
  setClaudeApiKey: (apiKey) => {
    set({ claudeApiKey: apiKey });
    // Store in localStorage for persistence
    localStorage.setItem('claude-api-key', apiKey);
  },
}));

// Load Claude API key from localStorage on startup
const savedApiKey = localStorage.getItem('claude-api-key');
if (savedApiKey) {
  useGameStore.getState().setClaudeApiKey(savedApiKey);
}