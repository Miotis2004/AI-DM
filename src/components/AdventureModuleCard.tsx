import React, { useState } from 'react';
import Card from './Card';
import { useGameStore } from '../store/gameStore';
import GoblinCave from '../data/modules/goblin-cave';
import { AdventureModule } from '../types/module';
import './AdventureModuleCard.css';

const AdventureModuleCard: React.FC = () => {
  const {
    currentModule,
    moduleProgress,
    startModule,
    addToLog,
  } = useGameStore();

  const availableModules: AdventureModule[] = [GoblinCave];

  const handleLoadModule = (module: AdventureModule) => {
    startModule(module);
  };

  if (!currentModule) {
    return (
      <Card title="Adventure Module">
        <div className="no-module">
          <p>No adventure loaded</p>
          <h4>Available Modules:</h4>
          <div className="module-list">
            {availableModules.map(module => (
              <div key={module.id} className="module-item">
                <div className="module-info">
                  <strong>{module.title}</strong>
                  <p>{module.summary}</p>
                  <span className="module-level">Level {module.levelRange[0]}-{module.levelRange[1]}</span>
                </div>
                <button
                  onClick={() => handleLoadModule(module)}
                  className="load-module-btn"
                >
                  Load Adventure
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Calculate progress stats
  const visitedCount = moduleProgress?.currentRoom ? 1 : 0; // Simplified for now since we removed visitedRooms tracking in store for simplicity, or we can add it back later.
  // Actually, let's just show current room since we simplified the store.

  const currentRoom = currentModule.rooms.find(r => r.id === moduleProgress?.currentRoom);

  return (
    <Card title={`Module: ${currentModule.title}`}>
      <div className="module-active">
        <div className="module-stats">
          <div className="stat">
            <span className="stat-label">Current Room:</span>
            <span className="stat-value">{currentRoom?.name || 'Unknown'}</span>
          </div>
          <div className="stat">
             {/* Placeholder for future stats */}
            <span className="stat-label">Encounters Defeated:</span>
            <span className="stat-value">
              {moduleProgress?.defeatedEncounters?.length || 0}
            </span>
          </div>
        </div>

        <div className="current-objectives">
          <h4>Objectives</h4>
          <ul className="objectives-list">
            {currentModule.objectives.map((objective) => {
              // Simple check: if all encounters mentioned in objective are defeated?
              // For now, just listing them static is safer than broken logic.
              return (
                <li key={objective.id}>
                  <span className="objective-checkbox">
                     {/* TODO: Implement objective tracking logic */}
                     ○
                  </span>
                  <span>{objective.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
        
        {currentRoom && (
           <div className="room-items">
             {currentRoom.items && currentRoom.items.length > 0 && (
                <div>
                    <strong>Items in area:</strong> {currentRoom.items.join(', ')}
                </div>
             )}
           </div>
        )}
      </div>
    </Card>
  );
};

export default AdventureModuleCard;
