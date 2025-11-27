import React, { useState } from 'react';
import { Character, CLASSES, RACES, BACKGROUNDS, calculateModifier, calculateProficiencyBonus } from '../types/character';
import './CharacterCreationModal.css';

interface Props {
  onClose: () => void;
  onCreateCharacter: (character: Character) => void;
}

const CharacterCreationModal: React.FC<Props> = ({ onClose, onCreateCharacter }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    race: 'Human',
    class: 'Fighter',
    background: 'Soldier',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  const handleCreate = () => {
    const profBonus = calculateProficiencyBonus(1);
    const conMod = calculateModifier(formData.constitution);
    
    const character: Character = {
      id: Date.now().toString(),
      name: formData.name,
      race: formData.race,
      class: formData.class,
      level: 1,
      background: formData.background,
      abilities: {
        strength: formData.strength,
        dexterity: formData.dexterity,
        constitution: formData.constitution,
        intelligence: formData.intelligence,
        wisdom: formData.wisdom,
        charisma: formData.charisma,
      },
      hp: 10 + conMod, // Base HP for level 1
      maxHp: 10 + conMod,
      tempHp: 0,
      armorClass: 10 + calculateModifier(formData.dexterity),
      speed: 30,
      proficiencyBonus: profBonus,
      skills: {
        acrobatics: false,
        animalHandling: false,
        arcana: false,
        athletics: true, // Default for Fighter
        deception: false,
        history: false,
        insight: false,
        intimidation: false,
        investigation: false,
        medicine: false,
        nature: false,
        perception: false,
        performance: false,
        persuasion: false,
        religion: false,
        sleightOfHand: false,
        stealth: false,
        survival: true, // Default for Fighter
      },
      inventory: [
        { id: '1', name: 'Longsword', description: 'A standard longsword', quantity: 1, weight: 3, equipped: true },
        { id: '2', name: 'Shield', description: 'A wooden shield', quantity: 1, weight: 6, equipped: true },
      ],
      gold: 50,
    };

    onCreateCharacter(character);
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create Character</h2>
        
        {step === 1 && (
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <label>
              Character Name:
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter name..."
              />
            </label>
            
            <label>
              Race:
              <select value={formData.race} onChange={(e) => updateField('race', e.target.value)}>
                {RACES.map(race => <option key={race} value={race}>{race}</option>)}
              </select>
            </label>
            
            <label>
              Class:
              <select value={formData.class} onChange={(e) => updateField('class', e.target.value)}>
                {CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
            </label>
            
            <label>
              Background:
              <select value={formData.background} onChange={(e) => updateField('background', e.target.value)}>
                {BACKGROUNDS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </label>
            
            <button onClick={() => setStep(2)}>Next: Ability Scores →</button>
          </div>
        )}
        
        {step === 2 && (
          <div className="form-section">
            <h3>Ability Scores</h3>
            <p style={{ fontSize: '12px', color: '#aaa' }}>Standard array: 15, 14, 13, 12, 10, 8</p>
            
            {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(ability => (
              <label key={ability}>
                {ability.charAt(0).toUpperCase() + ability.slice(1)}:
                <input
                  type="number"
                  min="3"
                  max="18"
                  value={formData[ability as keyof typeof formData]}
                  onChange={(e) => updateField(ability, parseInt(e.target.value))}
                />
                <span className="modifier">
                  {calculateModifier(formData[ability as keyof typeof formData] as number) >= 0 ? '+' : ''}
                  {calculateModifier(formData[ability as keyof typeof formData] as number)}
                </span>
              </label>
            ))}
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(1)}>← Back</button>
              <button onClick={handleCreate} disabled={!formData.name}>Create Character</button>
            </div>
          </div>
        )}
        
        <button className="close-button" onClick={onClose}>✕</button>
      </div>
    </div>
  );
};

export default CharacterCreationModal;