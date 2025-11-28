import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GameScene } from '@/game/scenes/GameScene';
import { GAME_CONFIG } from '@/game/config/gameConfig';
import ExitConfirmDialog from './ExitConfirmDialog';

interface GameCanvasProps {
  mode: 'local' | 'online' | 'ai';
  side?: 'left' | 'right';
  difficulty?: 'easy' | 'medium' | 'hard';
  onGameEnd?: () => void;
}

const GameCanvas = ({ mode, side = 'left', difficulty = 'medium', onGameEnd }: GameCanvasProps) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      ...GAME_CONFIG,
      parent: containerRef.current,
      scene: [GameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };
    
    gameRef.current = new Phaser.Game(config);
    
    // Wait for game to be ready, then start scene with proper data
    gameRef.current.events.once('ready', () => {
      gameRef.current?.scene.start('GameScene', { 
        mode, 
        side,
        difficulty,
        onExitRequest: () => setShowExitDialog(true)
      });
    });
    
    // Auto-focus the game canvas
    setTimeout(() => {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) {
        canvas.setAttribute('tabindex', '1');
        canvas.focus();
        console.log('Game canvas focused');
      }
    }, 100);
    
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [mode, side]);
  
  const handleConfirmExit = () => {
    setShowExitDialog(false);
    if (onGameEnd) {
      onGameEnd();
    }
  };
  
  const handleCancelExit = () => {
    setShowExitDialog(false);
    // Resume the game by calling the scene's resume method
    const scene = gameRef.current?.scene?.scenes?.[0] as GameScene;
    if (scene && scene.resumeGame) {
      scene.resumeGame();
    }
  };
  
  return (
    <>
    <div className="relative w-full h-full flex items-center justify-center bg-deep-space">
      <div 
        ref={containerRef} 
        className="rounded-lg overflow-hidden shadow-neon cursor-pointer"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        onClick={() => {
          const canvas = containerRef.current?.querySelector('canvas');
          canvas?.focus();
        }}
      />
      <div className="absolute bottom-4 left-4 text-xs text-foreground/50 bg-background/80 px-3 py-2 rounded">
        <p>🎮 {mode === 'ai' ? 'W/S or ↑/↓ to control your paddle' : 'W/S for left paddle • ↑/↓ for right paddle'}</p>
        <p className="mt-1">Press ESC to exit • Click to focus if keys don't work</p>
      </div>
      
      <ExitConfirmDialog 
        open={showExitDialog}
        onOpenChange={handleCancelExit}
        onConfirmExit={handleConfirmExit}
      />
    </div>
    </>
  );
};

export default GameCanvas;
