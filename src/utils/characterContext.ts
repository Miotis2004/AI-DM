import { Character, calculateModifier } from '../types/character';
import { AdventureModule, ModuleProgress } from '../types/module';
import { getDMSystemPrompt } from '../prompts/dmPrompt';

export const buildCharacterContext = (character: Character): string => {
  const getAbilityScoreText = () => {
    const scores = Object.entries(character.abilities)
      .map(([ability, score]) => {
        const mod = calculateModifier(score);
        return `${ability.toUpperCase()}: ${score} (${mod >= 0 ? '+' : ''}${mod})`;
      })
      .join(', ');
    return scores;
  };

  const getProficientSkills = () => {
    return Object.entries(character.skills)
      .filter(([_, proficient]) => proficient)
      .map(([skill, _]) => skill.replace(/([A-Z])/g, ' $1').trim())
      .join(', ') || 'None';
  };

  const getEquippedItems = () => {
    const equipped = character.inventory.filter(item => item.equipped);
    return equipped.length > 0
      ? equipped.map(item => item.name).join(', ')
      : 'None';
  };

  const proficiencyBonus = Math.floor((character.level - 1) / 4) + 2;
  const strMod = calculateModifier(character.abilities.strength);
  const dexMod = calculateModifier(character.abilities.dexterity);

  return `
=== PLAYER CHARACTER ===
Name: ${character.name}
Race: ${character.race}
Class: ${character.class}
Level: ${character.level}

HP: ${character.hp}/${character.maxHp}
AC: ${character.armorClass}

=== COMBAT STATS ===
Melee Attack: +${strMod + proficiencyBonus} (already added to player's rolls)
Melee Damage: +${strMod} (already added to player's rolls)

The player's rolls ALREADY INCLUDE these bonuses.
When you see "🎲 17", that is the FINAL TOTAL.
Just compare it to AC or DC.

=== ABILITIES ===
${getAbilityScoreText()}

=== PROFICIENT SKILLS ===
${getProficientSkills()}

EQUIPPED: ${getEquippedItems()}
GOLD: ${character.gold} gp`;
};

export const buildModuleContext = (module: AdventureModule | null, progress: ModuleProgress | null): string => {
  if (!module || !progress) {
    return '\n\nNo adventure module loaded.';
  }

  const currentRoom = module.rooms.find(r => r.id === progress.currentRoom);
  
  if (!currentRoom) {
    return '\n\nModule loaded but current location unknown.';
  }

  let encounterText = '';
  if (currentRoom.encounter && !progress.defeatedEncounters.includes(currentRoom.encounter)) {
    const encounter = module.encounters.find(e => e.id === currentRoom.encounter);
    if (encounter) {
      encounterText = `\n=== ACTIVE COMBAT ENCOUNTER ===
${encounter.name}

ENEMIES (TRACK HP EVERY TURN):
${encounter.enemies.map((e, i) => {
  return `Goblin ${i + 1}: ${e.hp}/${e.hp} HP, AC ${e.ac}
  Attack: ${e.attack}`;
}).join('\n')}

COMBAT TRACKING INSTRUCTIONS:
1. Each goblin starts at ${encounter.enemies[0]?.hp} HP
2. When player hits (Roll >= ${encounter.enemies[0]?.ac}), ask for damage
3. When player misses (Roll < ${encounter.enemies[0]?.ac}), describe miss
4. After damage, subtract from goblin's HP
5. Always show: "Goblin X (current/max HP)"
6. When HP reaches 0: goblin is DEAD

HIT OR MISS TABLE (AC ${encounter.enemies[0]?.ac}):
Roll 1-${(encounter.enemies[0]?.ac || 13) - 1}: MISS
Roll ${encounter.enemies[0]?.ac}-20: HIT

Example:
- Player rolls 11 total → 11 < 13 → MISS
- Player rolls 13 total → 13 >= 13 → HIT
- Player rolls 17 total → 17 >= 13 → HIT

Tactics: ${encounter.tactics}`;
    }
  }

  let npcText = '';
  if (currentRoom.npcs && currentRoom.npcs.length > 0) {
    const npcsInRoom = module.npcs.filter(n => currentRoom.npcs?.includes(n.id));
    npcText = '\n=== NPCs HERE ===\n' + npcsInRoom.map(n => 
      `${n.name}: ${n.description}`
    ).join('\n');
  }

  return `
=== CURRENT LOCATION ===
${currentRoom.name}

${currentRoom.description}

Exits: ${Object.keys(currentRoom.exits).join(', ')}
Items: ${currentRoom.items.join(', ') || 'None'}
${currentRoom.secrets ? `\nSecrets: ${currentRoom.secrets}` : ''}
${npcText}
${encounterText}

IMPORTANT: Only use content above. Do not invent new enemies, NPCs, or locations.`;
};

export const buildEnhancedDMPrompt = (
  character: Character | null, 
  module: AdventureModule | null = null,
  progress: ModuleProgress | null = null
): string => {
  if (!character) {
    return getDMSystemPrompt('No character selected. Ask them to create one.', '');
  }

  return getDMSystemPrompt(
    buildCharacterContext(character),
    buildModuleContext(module, progress)
  );
};