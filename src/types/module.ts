export interface AdventureModule {
    id: string;
    title: string;
    description: string;
    recommendedLevel: number;
    rooms: Room[];
    npcs: NPC[];
    encounters: Encounter[];
    objectives: string[];
  }
  
  export interface Room {
    id: string;
    name: string;
    description: string;
    exits: { [direction: string]: string };
    items: string[];
    npcs: string[];
    encounter?: string;
    secrets?: string;
  }
  
  export interface NPC {
    id: string;
    name: string;
    description: string;
    personality: string;
    stats?: NPCStats;
    dialogue: string[];
  }
  
  export interface NPCStats {
    hp: number;
    ac: number;
    attack: string;
  }
  
  export interface Encounter {
    id: string;
    name: string;
    description: string;
    enemies: Enemy[];
    tactics?: string;
  }
  
  export interface Enemy {
    name: string;
    hp: number;
    maxHp?: number;
    ac: number;
    attack: string;
    initiative: number;
  }
  
  export interface ModuleProgress {
    moduleId: string;
    currentRoom: string;
    visitedRooms: string[];
    completedObjectives: string[];
    defeatedEncounters: string[];
    collectedItems: string[];
  }