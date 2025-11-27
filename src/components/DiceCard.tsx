import React, { useEffect } from 'react';
import Card from './Card';
import { useGameStore } from '../store/gameStore';

const DiceCard: React.FC = () => {
  const { lastRoll, pendingRollRequest, rollDice, clearRollRequest } = useGameStore();

  // Highlight dice roller when there's a pending roll request
  const isPending = pendingRollRequest !== null;

  const handleRoll = (sides: number) => {
    rollDice(sides);
  };

  useEffect(() => {
    if (lastRoll) {
      // Announce the roll to the DM
      console.log(`Rolled d${lastRoll.sides}: ${lastRoll.result} (Total: ${lastRoll.total})`);
    }
  }, [lastRoll]);

  return (
    <Card title="Dice Roller">
      <div>
        {isPending && (
          <div style={{ 
            background: '#443300', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            border: '1px solid #aa8800'
          }}>
            <strong>Roll requested:</strong> {pendingRollRequest.type}
            {pendingRollRequest.dc && ` (DC ${pendingRollRequest.dc})`}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => handleRoll(4)}>d4</button>
          <button onClick={() => handleRoll(6)}>d6</button>
          <button onClick={() => handleRoll(8)}>d8</button>
          <button onClick={() => handleRoll(10)}>d10</button>
          <button onClick={() => handleRoll(12)}>d12</button>
          <button onClick={() => handleRoll(20)}>d20</button>
        </div>
        
        {lastRoll && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '48px', textAlign: 'center', color: '#4af' }}>
              {lastRoll.result}
            </div>
            {lastRoll.modifier !== 0 && (
              <div style={{ textAlign: 'center', color: '#aaa' }}>
                + {lastRoll.modifier} modifier = {lastRoll.total}
              </div>
            )}
            <div style={{ textAlign: 'center', color: '#666', fontSize: '12px', marginTop: '5px' }}>
              d{lastRoll.sides}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DiceCard;