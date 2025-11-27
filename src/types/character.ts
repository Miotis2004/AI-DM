export interface Character {
    id: string;
    name: string;
    race: string;
    class: string;
    level: number;
    background: string;
    
    // Ability Scores
    abilities: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
    
    // Hit Points
    hp: number;
    maxHp: number;
    tempHp: number;
    
    // Stats
    armorClass: number;
    speed: number;
    proficiencyBonus: number;
    
    // Skills (proficient or not)
    skills: {
      acrobatics: boolean;
      animalHandling: boolean;
      arcana: boolean;
      athletics: boolean;
      deception: boolean;
      history: boolean;
      insight: boolean;
      intimidation: boolean;
      investigation: boolean;
      medicine: boolean;
      nature: boolean;
      perception: boolean;
      performance: boolean;
      persuasion: boolean;
      religion: boolean;
      sleightOfHand: boolean;
      stealth: boolean;
      survival: boolean;
    };
    
    // Equipment
    inventory: Item[];
    gold: number;
    
    // Spell casting (if applicable)
    spellcasting?: {
      spellcastingAbility: 'intelligence' | 'wisdom' | 'charisma';
      spellSaveDC: number;
      spellAttackBonus: number;
      spellSlots: {
        level1: { current: number; max: number };
        level2: { current: number; max: number };
        level3: { current: number; max: number };
        level4: { current: number; max: number };
        level5: { current: number; max: number };
        level6: { current: number; max: number };
        level7: { current: number; max: number };
        level8: { current: number; max: number };
        level9: { current: number; max: number };
      };
    };
  }
  
  export interface Item {
    id: string;
    name: string;
    description: string;
    quantity: number;
    weight: number;
    equipped?: boolean;
  }
  
  export const CLASSES = [
    'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 
    'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 
    'Warlock', 'Wizard'
  ];
  
  export const RACES = [
    'Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn',
    'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling'
  ];
  
  export const BACKGROUNDS = [
    'Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Sage',
    'Soldier', 'Charlatan', 'Entertainer', 'Guild Artisan', 'Hermit'
  ];
  
  // Helper function to calculate ability modifier
  export const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };
  
  // Helper function to calculate proficiency bonus
  export const calculateProficiencyBonus = (level: number): number => {
    return Math.ceil(level / 4) + 1;
  };