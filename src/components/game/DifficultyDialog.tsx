import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Brain, Zap, Flame } from "lucide-react";

interface DifficultyDialogProps {
  open: boolean;
  onSelect: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onCancel: () => void;
}

const DifficultyDialog = ({ open, onSelect, onCancel }: DifficultyDialogProps) => {
  const difficulties = [
    {
      id: 'easy',
      title: 'Easy',
      description: 'Relaxed AI for beginners',
      icon: Brain,
      gradient: 'from-neon-green to-neon-cyan',
      speed: '40% speed',
    },
    {
      id: 'medium',
      title: 'Medium',
      description: 'Balanced challenge',
      icon: Zap,
      gradient: 'from-neon-cyan to-neon-purple',
      speed: '65% speed',
    },
    {
      id: 'hard',
      title: 'Hard',
      description: 'Intense competition',
      icon: Flame,
      gradient: 'from-neon-pink to-neon-purple',
      speed: '90% speed',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-2 border-primary/50 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold neon-text text-center">
            Select Difficulty
          </DialogTitle>
          <DialogDescription className="text-center text-foreground/70">
            Choose your challenge level
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {difficulties.map((diff, index) => {
            const Icon = diff.icon;
            return (
              <motion.div
                key={diff.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-6 flex flex-col items-center space-y-3 border-2 hover:border-primary hover:shadow-neon transition-all duration-300"
                  onClick={() => onSelect(diff.id as 'easy' | 'medium' | 'hard')}
                >
                  <div 
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${diff.gradient} flex items-center justify-center`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold neon-text mb-1">{diff.title}</h3>
                    <p className="text-sm text-foreground/70 mb-2">{diff.description}</p>
                    <p className="text-xs text-primary">{diff.speed}</p>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
        
        <Button
          variant="ghost"
          onClick={onCancel}
          className="mt-4 w-full"
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DifficultyDialog;
