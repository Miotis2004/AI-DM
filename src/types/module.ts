// Export core types for the application to use
export type Ability = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";
export type Skill =
  | "Acrobatics"
  | "Animal Handling"
  | "Arcana"
  | "Athletics"
  | "Deception"
  | "History"
  | "Insight"
  | "Intimidation"
  | "Investigation"
  | "Medicine"
  | "Nature"
  | "Perception"
  | "Performance"
  | "Persuasion"
  | "Religion"
  | "Sleight of Hand"
  | "Stealth"
  | "Survival";

export type DamageType =
  | "slashing"
  | "piercing"
  | "bludgeoning"
  | "fire"
  | "cold"
  | "acid"
  | "lightning"
  | "thunder"
  | "necrotic"
  | "radiant"
  | "poison"
  | "psychic";

export interface AttackBlock {
  name: string;
  bonus: number;
  damageDice: string;
  damageType: DamageType;
  reach?: string;
  range?: string;
  formatted?: string;
}

export interface StatBlock {
  cr?: number;
  ac: number;
  hp: number;
  speed?: string;
  initiativeMod?: number;
  abilities?: Partial<Record<Ability, number>>;
  saves?: Partial<Record<Ability, number>>;
  skills?: Partial<Record<Skill, number>>;
  passivePerception?: number;
  senses?: string;
  languages?: string;
  attacks: AttackBlock[];
  traits?: string[];
}

export interface Check {
  ability?: Ability;
  skill?: Skill;
  dc: number;
  onSuccess: string;
  onFailure?: string;
}

export interface Lock {
  isLocked: boolean;
  keyItemId?: string;
  pickDC?: number;
  forceDC?: number;
}

export interface Container {
  id: string;
  name: string;
  description?: string;
  lock?: Lock;
  contents: string[];
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  disposition: "hostile" | "wary" | "neutral" | "friendly";
  stats?: StatBlock;
  motivations?: string[];
  dialogue?: Array<{ cue: string; line: string; intent?: string }>;
}

export interface EncounterEnemyRef {
  id?: string;
  name: string;
  stats: StatBlock;
  count?: number;
}

export interface Encounter {
  id: string;
  name: string;
  description: string;
  enemies: EncounterEnemyRef[];
  tactics?: string;
  stealthAvoidDC?: number;
  scaling?: { easy?: string; medium?: string; hard?: string; deadly?: string };
  treasure?: string[];
}

export interface Secret {
  text: string;
  check?: Check;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  light: "bright" | "dim" | "dark";
  ambient?: string;
  exits: Record<string, string>;
  items?: string[];
  npcs?: string[];
  encounterId?: string;
  secrets?: Secret[];
  stealthDC?: number;
}

export interface Objective {
  id: string;
  text: string;
  doneIf: string;
}

export interface AdventureModule {
  id: string;
  title: string;
  levelRange: [number, number];
  tags: string[];
  summary: string;
  rooms: Room[];
  encounters: Encounter[];
  npcs: NPC[];
  containers: Container[];
  items: Array<{ id: string; name: string; description?: string; type?: string }>;
  objectives: Objective[];
  rules?: {
    stealth?: string;
    negotiation?: string;
  };
}

export type MessageRole = "dm" | "player" | "system";
export interface Message {
  id: string;
  role: MessageRole;
  message: string;
  ts: number;
}

export interface Character {
  id: string;
  name: string;
  class: string;
  race: string;
  level: number;
  attributes?: Partial<Record<Ability, number>>;
  skills?: Partial<Record<Skill, boolean>>;
}

export interface ModuleProgress {
  currentRoom: string;
  defeatedEncounters?: string[];
}
