import { create } from 'zustand';
import { Character, calculateModifier } from '../types/character';
import { AdventureModule, ModuleProgress, Room, Message, MessageRole, Encounter, StatBlock, EncounterEnemyRef } from '../types/module';

interface ActiveEncounterState {
  id: string;
  enemies: Array<{
    instanceId: string;
    originalRefId: string;
    name: string;
    hp: number;
    maxHp: number;
    ac: number;
    stats: StatBlock;
  }>;
}

interface GameStore {
  // Characters
  characters: Character[];
  currentCharacterId: string | null;

  // Game Log
  log: Message[];

  // Dice
  lastRoll: {
    sides: number;
    result: number;
    modifier?: number;
    total: number;
    timestamp: number;
  } | null;

  // Module State
  currentModule: AdventureModule | null;
  moduleProgress: ModuleProgress | null;
  activeEncounter: ActiveEncounterState | null;
  
  // Actions
  addCharacter: (character: Character) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => void;
  setCurrentCharacter: (id: string | null) => void;
  getCurrentCharacter: () => Character | null;

  addToLog: (role: MessageRole, message: string) => void;
  clearLog: () => void;

  setLastRoll: (roll: {
    sides: number;
    result: number;
    modifier?: number;
    total: number;
    timestamp: number;
  }) => void;

  startModule: (module: AdventureModule) => void;
  move: (direction: string) => void;
  getCurrentRoom: () => Room | null;
  
  // Combat Actions
  startEncounter: (encounterId: string) => void;
  attackEnemy: (enemyInstanceId: string) => void;
  fleeEncounter: () => void;
}

const uid = () => Math.random().toString(36).slice(2);

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  characters: [],
  currentCharacterId: null,
  log: [
    {
      id: uid(),
      role: 'system',
      message: 'Welcome, adventurer! Load a module to begin.',
      ts: Date.now()
    },
  ],
  lastRoll: null,
  currentModule: null,
  moduleProgress: null,
  activeEncounter: null,

  // Actions
  addCharacter: (character: Character) =>
    set((state: GameStore) => ({
      characters: [...state.characters, character],
    })),

  updateCharacter: (character: Character) =>
    set((state: GameStore) => ({
      characters: state.characters.map((c: Character) =>
        c.id === character.id ? character : c
      ),
    })),

  deleteCharacter: (id: string) =>
    set((state: GameStore) => ({
      characters: state.characters.filter((c: Character) => c.id !== id),
      currentCharacterId: state.currentCharacterId === id ? null : state.currentCharacterId,
    })),

  setCurrentCharacter: (id: string | null) => set({ currentCharacterId: id }),
  
  getCurrentCharacter: () => {
    const state = get();
    return state.characters.find((c: Character) => c.id === state.currentCharacterId) || null;
  },

  addToLog: (role: MessageRole, message: string) =>
    set((state: GameStore) => ({
      log: [...state.log, { id: uid(), role, message, ts: Date.now() }],
    })),

  clearLog: () =>
    set({
      log: [],
    }),

  setLastRoll: (roll: any) => set({ lastRoll: roll }),

  startModule: (module: AdventureModule) => {
    const startRoomId = module.rooms[0]?.id || '';
    const startRoom = module.rooms[0];

    set({
      currentModule: module,
      moduleProgress: {
        currentRoom: startRoomId,
        defeatedEncounters: [],
      },
      activeEncounter: null,
      log: [
        {
          id: uid(),
          role: 'system',
          message: `Loaded module: ${module.title}\n\n${module.summary}`,
          ts: Date.now()
        },
      ]
    });

    if (startRoom) {
      get().addToLog('dm', `**${startRoom.name}**\n${startRoom.description}`);
    }
  },

  move: (direction: string) => {
    const state = get();

    // Prevent movement during combat
    if (state.activeEncounter) {
      state.addToLog('system', 'You cannot move while in combat! Flee or defeat the enemies.');
      return;
    }

    const currentRoom = state.getCurrentRoom();

    if (!currentRoom) return;

    const nextRoomId = currentRoom.exits[direction];

    if (!nextRoomId) {
      state.addToLog('system', `You cannot go ${direction}.`);
      return;
    }

    // Check if next room exists
    const nextRoom = state.currentModule?.rooms.find((r: Room) => r.id === nextRoomId);
    if (!nextRoom) {
      state.addToLog('system', `Error: Room ${nextRoomId} not found.`);
      return;
    }

    set((state: GameStore) => ({
        moduleProgress: {
            ...state.moduleProgress!,
            currentRoom: nextRoomId
        }
    }));

    state.addToLog('player', `I go ${direction}.`);
    state.addToLog('dm', `**${nextRoom.name}**\n${nextRoom.description}`);

    // Check for encounter
    if (nextRoom.encounterId && !state.moduleProgress?.defeatedEncounters?.includes(nextRoom.encounterId)) {
        state.startEncounter(nextRoom.encounterId);
    }
  },

  getCurrentRoom: () => {
    const state = get();
    if (!state.currentModule || !state.moduleProgress) return null;
    return (
      state.currentModule.rooms.find((r: Room) => r.id === state.moduleProgress!.currentRoom) || null
    );
  },

  startEncounter: (encounterId: string) => {
    const state = get();
    const encounter = state.currentModule?.encounters.find((e: Encounter) => e.id === encounterId);

    if (!encounter) return;

    state.addToLog('dm', `**Combat Started!**\n${encounter.description}`);

    const enemies: ActiveEncounterState['enemies'] = [];

    encounter.enemies.forEach((ref: EncounterEnemyRef) => {
      const count = ref.count || 1;
      for (let i = 0; i < count; i++) {
        enemies.push({
          instanceId: uid(),
          originalRefId: ref.id || ref.name, // Use name if ID missing
          name: `${ref.name} ${count > 1 ? i + 1 : ''}`.trim(),
          hp: ref.stats.hp,
          maxHp: ref.stats.hp,
          ac: ref.stats.ac,
          stats: ref.stats
        });
      }
    });

    set({
      activeEncounter: {
        id: encounterId,
        enemies
      }
    });
  },

  attackEnemy: (enemyInstanceId: string) => {
    const state = get();
    const character = state.getCurrentCharacter();
    if (!state.activeEncounter) return;

    const enemyIndex = state.activeEncounter.enemies.findIndex((e: any) => e.instanceId === enemyInstanceId);
    if (enemyIndex === -1) return;

    const enemy = state.activeEncounter.enemies[enemyIndex];

    // Logic adapted for Character type from types/character.ts
    let hitBonus = 2;
    let dmgDice = 8; // d8
    let dmgBonus = 0;

    if (character) {
       // Using character.abilities (strength, dexterity)
       const strMod = calculateModifier(character.abilities.strength);
       const dexMod = calculateModifier(character.abilities.dexterity);
       hitBonus = character.proficiencyBonus + Math.max(strMod, dexMod);
       dmgBonus = Math.max(strMod, dexMod);
    }

    const d20 = Math.floor(Math.random() * 20) + 1;
    const hitTotal = d20 + hitBonus;

    let resultMsg = `Attacking ${enemy.name}: Rolled ${d20} + ${hitBonus} = ${hitTotal} (AC ${enemy.ac}).`;

    if (hitTotal >= enemy.ac) {
       const dmg = Math.floor(Math.random() * dmgDice) + 1 + dmgBonus;
       const newHp = enemy.hp - dmg;
       resultMsg += ` **HIT!** for ${dmg} damage.`;

       const newEnemies = [...state.activeEncounter.enemies];
       newEnemies[enemyIndex] = { ...enemy, hp: newHp };

       if (newHp <= 0) {
         resultMsg += ` **${enemy.name} is defeated!**`;
         newEnemies.splice(enemyIndex, 1);
       }

       set((s: GameStore) => ({
         activeEncounter: s.activeEncounter ? {
           ...s.activeEncounter,
           enemies: newEnemies
         } : null
       }));

       state.addToLog('player', resultMsg);

       // Check if encounter ended
       if (newEnemies.length === 0) {
         state.addToLog('dm', `**Victory!** All enemies defeated.`);
         set((s: GameStore) => ({
           activeEncounter: null,
           moduleProgress: s.moduleProgress ? {
             ...s.moduleProgress,
             defeatedEncounters: [...(s.moduleProgress.defeatedEncounters || []), s.activeEncounter!.id]
           } : null
         }));
       } else {
         // Enemy Turn
         setTimeout(() => {
             const s = useGameStore.getState();
             if (!s.activeEncounter) return;
             const attacker = s.activeEncounter.enemies[Math.floor(Math.random() * s.activeEncounter.enemies.length)];
             const attack = attacker.stats.attacks[0];
             const enemyRoll = Math.floor(Math.random() * 20) + 1;
             const enemyTotal = enemyRoll + attack.bonus;

             // Try to use character AC if available, else 15
             const char = s.getCurrentCharacter();
             const playerAC = char ? char.armorClass : 15;

             let enemyMsg = `${attacker.name} attacks you with ${attack.name}: Rolled ${enemyRoll} + ${attack.bonus} = ${enemyTotal}.`;
             if (enemyTotal >= playerAC) {
                // Parse damage roughly from string like "1d6+2"
                // For safety/speed, just assume 4 damage for now
                enemyMsg += ` **Hit!** You take 4 damage.`;
                // TODO: Deduct HP from character
             } else {
                enemyMsg += ` Miss.`;
             }
             s.addToLog('dm', enemyMsg);
         }, 1000);
       }

    } else {
       resultMsg += ` Miss.`;
       state.addToLog('player', resultMsg);

        // Enemy Turn
         setTimeout(() => {
             const s = useGameStore.getState();
             if (!s.activeEncounter) return;
             const attacker = s.activeEncounter.enemies[Math.floor(Math.random() * s.activeEncounter.enemies.length)];
             const attack = attacker.stats.attacks[0];
             const enemyRoll = Math.floor(Math.random() * 20) + 1;
             const enemyTotal = enemyRoll + attack.bonus;

             const char = s.getCurrentCharacter();
             const playerAC = char ? char.armorClass : 15;

             let enemyMsg = `${attacker.name} attacks you with ${attack.name}: Rolled ${enemyRoll} + ${attack.bonus} = ${enemyTotal}.`;
             if (enemyTotal >= playerAC) {
                enemyMsg += ` **Hit!** You take 4 damage.`;
             } else {
                enemyMsg += ` Miss.`;
             }
             s.addToLog('dm', enemyMsg);
         }, 1000);
    }
  },

  fleeEncounter: () => {
     const state = get();
     state.addToLog('player', 'I flee!');
     set({ activeEncounter: null });
  }
}));
