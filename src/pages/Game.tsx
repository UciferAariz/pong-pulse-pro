import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCanvas from '@/components/game/GameCanvas';
import MainMenu from '@/components/game/MainMenu';
import RoomManager from '@/components/game/RoomManager';
import DifficultyDialog from '@/components/game/DifficultyDialog';

type GameState = 'menu' | 'room-manager' | 'local-game' | 'ai-game' | 'online-game' | 'difficulty-select';
type Difficulty = 'easy' | 'medium' | 'hard';

const Game = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [isHost, setIsHost] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const navigate = useNavigate();
  
  const handleModeSelect = (mode: 'local' | 'online' | 'ai') => {
    if (mode === 'local') {
      setGameState('local-game');
    } else if (mode === 'ai') {
      setGameState('difficulty-select');
    } else {
      setGameState('room-manager');
    }
  };

  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setGameState('ai-game');
  };
  
  const handleRoomReady = (roomId: string, host: boolean) => {
    setIsHost(host);
    setGameState('online-game');
  };
  
  const handleBack = () => {
    setGameState('menu');
  };
  
  const handleGameEnd = () => {
    setGameState('menu');
  };
  
  if (gameState === 'menu') {
    return <MainMenu onModeSelect={handleModeSelect} />;
  }
  
  if (gameState === 'room-manager') {
    return <RoomManager onBack={handleBack} onRoomReady={handleRoomReady} />;
  }
  
  if (gameState === 'local-game') {
    return (
      <div className="min-h-screen bg-deep-space">
        <GameCanvas mode="local" onGameEnd={handleGameEnd} />
      </div>
    );
  }
  
  if (gameState === 'difficulty-select') {
    return (
      <div className="min-h-screen bg-deep-space">
        <MainMenu onModeSelect={handleModeSelect} />
        <DifficultyDialog
          open={true}
          onSelect={handleDifficultySelect}
          onCancel={handleBack}
        />
      </div>
    );
  }

  if (gameState === 'ai-game') {
    return (
      <div className="min-h-screen bg-deep-space">
        <GameCanvas mode="ai" difficulty={difficulty} onGameEnd={handleGameEnd} />
      </div>
    );
  }
  
  if (gameState === 'online-game') {
    return (
      <div className="min-h-screen bg-deep-space">
        <GameCanvas 
          mode="online" 
          side={isHost ? 'left' : 'right'}
          onGameEnd={handleGameEnd} 
        />
      </div>
    );
  }
  
  return null;
};

export default Game;
