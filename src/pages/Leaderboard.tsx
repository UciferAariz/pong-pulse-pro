import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  total_games: number;
  wins: number;
  losses: number;
  win_percentage: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('wins', { ascending: false })
          .limit(100);

        if (error) throw error;

        setEntries(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast({
          title: 'Error',
          description: 'Failed to load leaderboard',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-neon-cyan to-neon-purple';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="text-2xl neon-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space cyber-grid p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/game')}
          className="mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2" />
          Back to Menu
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-card/50 backdrop-blur-xl border-2 border-primary/50 p-8 mb-6">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Trophy className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold neon-text">Leaderboard</h1>
            </div>
            
            {entries.length === 0 ? (
              <div className="text-center py-12 text-foreground/50">
                <Medal className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-xl">No players yet!</p>
                <p className="text-sm mt-2">Be the first to play and claim the top spot!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry, index) => {
                  const rank = index + 1;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        className={`
                          bg-card/30 backdrop-blur-sm border-2 p-4
                          ${rank <= 3 ? 'border-primary shadow-neon' : 'border-border/50'}
                          hover:border-primary transition-all duration-300
                        `}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`
                              w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                              bg-gradient-to-br ${getRankColor(rank)}
                              ${rank <= 3 ? 'shadow-neon text-2xl' : 'text-foreground/70'}
                            `}
                          >
                            {getRankIcon(rank)}
                          </div>
                          
                          <Avatar className="w-12 h-12 border-2 border-primary/50">
                            <AvatarImage src={entry.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/20">
                              {entry.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <h3 className="font-bold text-lg neon-text">{entry.username}</h3>
                            <p className="text-sm text-foreground/60">
                              {entry.total_games} {entry.total_games === 1 ? 'game' : 'games'} played
                            </p>
                          </div>

                          <div className="text-right space-y-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="text-xs text-foreground/60">Wins</p>
                                <p className="text-lg font-bold text-neon-green">{entry.wins}</p>
                              </div>
                              <div>
                                <p className="text-xs text-foreground/60">Losses</p>
                                <p className="text-lg font-bold text-neon-pink">{entry.losses}</p>
                              </div>
                              <div>
                                <p className="text-xs text-foreground/60">Win Rate</p>
                                <p className="text-lg font-bold neon-text">
                                  {entry.win_percentage?.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
