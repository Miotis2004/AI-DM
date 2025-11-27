import React, { useState } from 'react';
import Card from './Card';
import { useGameStore } from '../store/gameStore';
import CharacterCreationModal from './CharacterCreationModal';
import { calculateModifier } from '../types/character';
import './CharacterCard.css';

const CharacterCard: React.FC = () => {
  const { characters, currentCharacterId, selectCharacter, addCharacter, updateCharacter, getCurrentCharacter } = useGameStore();
  const [showCreation, setShowCreation] = useState(false);
  const [view, setView] = useState<'stats' | 'skills' | 'inventory'>('stats');
  
  const currentCharacter = getCurrentCharacter();

  const handleCreateCharacter = (character: any) => {
    addCharacter(character);
    setShowCreation(false);
  };

  const handleHPChange = (delta: number) => {
    if (!currentCharacter) return;
    const newHp = Math.max(0, Math.min(currentCharacter.maxHp, currentCharacter.hp + delta));
    updateCharacter({ ...currentCharacter, hp: newHp });
  };

  const getSkillModifier = (skill: string): number => {
    if (!currentCharacter) return 0;
    
    const skillAbilityMap: { [key: string]: 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma' } = {
      acrobatics: 'dexterity',
      animalHandling: 'wisdom',
      arcana: 'intelligence',
      athletics: 'strength',
      deception: 'charisma',
      history: 'intelligence',
      insight: 'wisdom',
      intimidation: 'charisma',
      investigation: 'intelligence',
      medicine: 'wisdom',
      nature: 'intelligence',
      perception: 'wisdom',
      performance: 'charisma',
      persuasion: 'charisma',
      religion: 'intelligence',
      sleightOfHand: 'dexterity',
      stealth: 'dexterity',
      survival: 'wisdom',
    };

    const ability = skillAbilityMap[skill];
    const abilityMod = calculateModifier(currentCharacter.abilities[ability]);
    const profBonus = currentCharacter.skills[skill as keyof typeof currentCharacter.skills] 
      ? currentCharacter.proficiencyBonus 
      : 0;
    
    return abilityMod + profBonus;
  };

  if (!currentCharacter) {
    return (
      <Card title="Character Sheet">
        <div className="no-character">
          <p>No character selected</p>
          
          {characters.length > 0 && (
            <div>
              <h4>Select a character:</h4>
              <div className="character-list">
                {characters.map(char => (
                  <button
                    key={char.id}
                    onClick={() => selectCharacter(char.id)}
                    className="character-select-btn"
                  >
                    {char.name} - Lv{char.level} {char.race} {char.class}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <button onClick={() => setShowCreation(true)} className="create-character-btn">
            ➕ Create New Character
          </button>
          
          {showCreation && (
            <CharacterCreationModal
              onClose={() => setShowCreation(false)}
              onCreateCharacter={handleCreateCharacter}
            />
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card title={`${currentCharacter.name} - Character Sheet`}>
      <div className="character-sheet">
        {/* Header with character switcher */}
        <div className="character-header">
          <select 
            value={currentCharacterId || ''}
            onChange={(e) => selectCharacter(e.target.value)}
            className="character-selector"
          >
            {characters.map(char => (
              <option key={char.id} value={char.id}>
                {char.name}
              </option>
            ))}
          </select>
          <button onClick={() => setShowCreation(true)} className="small-btn">➕</button>
        </div>

        {/* Basic Info */}
        <div className="basic-info">
          <div className="info-row">
            <span className="label">Race:</span> {currentCharacter.race}
          </div>
          <div className="info-row">
            <span className="label">Class:</span> {currentCharacter.class}
          </div>
          <div className="info-row">
            <span className="label">Level:</span> {currentCharacter.level}
          </div>
          <div className="info-row">
            <span className="label">Background:</span> {currentCharacter.background}
          </div>
        </div>

        {/* View Tabs */}
        <div className="view-tabs">
          <button 
            className={view === 'stats' ? 'active' : ''}
            onClick={() => setView('stats')}
          >
            Stats
          </button>
          <button 
            className={view === 'skills' ? 'active' : ''}
            onClick={() => setView('skills')}
          >
            Skills
          </button>
          <button 
            className={view === 'inventory' ? 'active' : ''}
            onClick={() => setView('inventory')}
          >
            Inventory
          </button>
        </div>

        {/* Stats View */}
        {view === 'stats' && (
          <div className="stats-view">
            {/* HP */}
            <div className="hp-section">
              <div className="hp-display">
                <span className="hp-current">{currentCharacter.hp}</span>
                <span className="hp-separator">/</span>
                <span className="hp-max">{currentCharacter.maxHp}</span>
              </div>
              <div className="hp-label">Hit Points</div>
              <div className="hp-controls">
                <button onClick={() => handleHPChange(-1)}>-</button>
                <button onClick={() => handleHPChange(1)}>+</button>
                <button onClick={() => handleHPChange(-5)}>-5</button>
                <button onClick={() => handleHPChange(5)}>+5</button>
              </div>
            </div>

            {/* Combat Stats */}
            <div className="combat-stats">
              <div className="stat-box">
                <div className="stat-value">{currentCharacter.armorClass}</div>
                <div className="stat-label">AC</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{currentCharacter.speed}</div>
                <div className="stat-label">Speed</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">+{currentCharacter.proficiencyBonus}</div>
                <div className="stat-label">Prof</div>
              </div>
            </div>

            {/* Ability Scores */}
            <div className="abilities">
              {Object.entries(currentCharacter.abilities).map(([ability, score]) => (
                <div key={ability} className="ability-box">
                  <div className="ability-name">{ability.substring(0, 3).toUpperCase()}</div>
                  <div className="ability-score">{score}</div>
                  <div className="ability-modifier">
                    {calculateModifier(score) >= 0 ? '+' : ''}
                    {calculateModifier(score)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills View */}
        {view === 'skills' && (
          <div className="skills-view">
            {Object.entries(currentCharacter.skills).map(([skill, proficient]) => {
              const modifier = getSkillModifier(skill);
              const skillName = skill.replace(/([A-Z])/g, ' $1').trim();
              
              return (
                <div key={skill} className={`skill-row ${proficient ? 'proficient' : ''}`}>
                  <span className="skill-prof">{proficient ? '●' : '○'}</span>
                  <span className="skill-name">{skillName}</span>
                  <span className="skill-modifier">
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Inventory View */}
        {view === 'inventory' && (
          <div className="inventory-view">
            <div className="gold-display">
              <span className="gold-icon">💰</span>
              <span className="gold-amount">{currentCharacter.gold} GP</span>
            </div>
            
            <div className="inventory-list">
              {currentCharacter.inventory.map(item => (
                <div key={item.id} className={`inventory-item ${item.equipped ? 'equipped' : ''}`}>
                  <div className="item-header">
                    <strong>{item.name}</strong>
                    {item.equipped && <span className="equipped-badge">E</span>}
                  </div>
                  <div className="item-details">
                    {item.description}
                  </div>
                  <div className="item-meta">
                    Qty: {item.quantity} | Weight: {item.weight} lbs
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showCreation && (
          <CharacterCreationModal
            onClose={() => setShowCreation(false)}
            onCreateCharacter={handleCreateCharacter}
          />
        )}
      </div>
    </Card>
  );
};

export default CharacterCard;