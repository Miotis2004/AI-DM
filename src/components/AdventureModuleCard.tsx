import React, { useState } from 'react';
import Card from './Card';
import { useGameStore } from '../store/gameStore';
import { AdventureModule } from '../types/module';
import { GoblinCave } from '../data/modules/goblin-cave';
import './AdventureModuleCard.css';

const AdventureModuleCard: React.FC = () => {
  const {
    currentModule,
    moduleProgress,
    loadModule,
    setCurrentRoom,
    markRoomVisited,
    completeObjective,
    getCurrentRoom,
    addMessage,
  } = useGameStore();

  const availableModules: AdventureModule[] = [GoblinCave];
  const [loading, setLoading] = useState(false);

  const currentRoom = getCurrentRoom();

  const handleLoadModule = (module: AdventureModule) => {
    setLoading(true);
    loadModule(module);
    
    addMessage('dm', `📖 Starting adventure: ${module.title}`);
    addMessage('dm', module.description);
    
    if (module.rooms[0]) {
      addMessage('dm', `You arrive at: ${module.rooms[0].name}`);
      addMessage('dm', module.rooms[0].description);
    }
    setLoading(false);
  };

  const handleMoveToRoom = (roomId: string) => {
    const targetRoom = currentModule?.rooms.find(r => r.id === roomId);
    if (!targetRoom) return;

    setCurrentRoom(roomId);
    markRoomVisited(roomId);
    
    addMessage('user', `I move to ${targetRoom.name}`);
    addMessage('dm', `📍 ${targetRoom.name}`);
    addMessage('dm', targetRoom.description);
    
    if (targetRoom.encounter && moduleProgress) {
      const encounter = currentModule?.encounters.find(e => e.id === targetRoom.encounter);
      if (encounter && !moduleProgress.defeatedEncounters.includes(encounter.id)) {
        addMessage('dm', `⚔️ ${encounter.description}`);
      }
    }
  };

  const handleObjectiveClick = (objective: string) => {
    if (moduleProgress?.completedObjectives.includes(objective)) return;
    
    completeObjective(objective);
    addMessage('dm', `✅ Objective completed: ${objective}`);
  };

  if (!currentModule) {
    return (
      <Card title="Adventure Module">
        <div className="no-module">
          <p>No adventure loaded</p>
          
          {availableModules.length > 0 && (
            <div>
              <h4>Available Adventures:</h4>
              {availableModules.map(module => (
                <div key={module.id} className="module-option">
                  <div className="module-info">
                    <strong>{module.title}</strong>
                    <p>{module.description}</p>
                    <span className="module-level">Level {module.recommendedLevel}</span>
                  </div>
                  <button 
                    onClick={() => handleLoadModule(module)}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Start Adventure'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card title={currentModule.title}>
      <div className="adventure-module">
        {currentRoom && (
          <div className="current-room">
            <h3>📍 {currentRoom.name}</h3>
            <p className="room-description">{currentRoom.description}</p>
            
            {Object.keys(currentRoom.exits).length > 0 && (
              <div className="exits-section">
                <strong>Exits:</strong>
                <div className="exits">
                  {Object.entries(currentRoom.exits).map(([direction, targetId]) => {
                    const targetIdStr = String(targetId);
                    const targetRoom = currentModule.rooms.find(r => r.id === targetIdStr);
                    const isVisited = moduleProgress?.visitedRooms.includes(targetIdStr) || false;
                    
                    return (
                      <button
                        key={direction}
                        onClick={() => handleMoveToRoom(targetIdStr)}
                        className={`exit-button ${isVisited ? 'visited' : ''}`}
                      >
                        {direction.toUpperCase()} → {targetRoom?.name}
                        {isVisited && ' ✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {currentRoom.items.length > 0 && (
              <div className="items-section">
                <strong>Items visible:</strong>
                <ul>
                  {currentRoom.items.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {currentRoom.secrets && (
              <div className="secrets-hint">
                <em>💡 This room may contain secrets...</em>
              </div>
            )}
          </div>
        )}
        
        <div className="objectives-section">
          <h4>Quest Objectives:</h4>
          <ul className="objectives-list">
            {currentModule.objectives.map((objective, idx) => {
              const isCompleted = moduleProgress?.completedObjectives.includes(objective) || false;
              return (
                <li 
                  key={idx} 
                  className={isCompleted ? 'completed' : ''}
                  onClick={() => !isCompleted && handleObjectiveClick(objective)}
                  style={{ cursor: isCompleted ? 'default' : 'pointer' }}
                >
                  <span className="objective-checkbox">
                    {isCompleted ? '✅' : '☐'}
                  </span>
                  <span className={isCompleted ? 'objective-text-completed' : ''}>
                    {objective}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="progress-stats">
          <div className="stat">
            <span className="stat-label">Rooms Explored:</span>
            <span className="stat-value">
              {moduleProgress?.visitedRooms.length || 0} / {currentModule.rooms.length}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Objectives:</span>
            <span className="stat-value">
              {moduleProgress?.completedObjectives.length || 0} / {currentModule.objectives.length}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdventureModuleCard;