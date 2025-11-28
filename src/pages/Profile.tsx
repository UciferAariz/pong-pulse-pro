import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Trophy, Target, Zap, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  league: string;
  leagueColor: string;
  leagueIcon: string;
  rank: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const getLeague = (winRate: number, totalGames: number): { name: string; color: string; icon: string } => {
    if (totalGames < 5) return { name: 'Rookie', color: 'from-gray-500 to-gray-600', icon: '🥉' };
    if (winRate >= 80) return { name: 'Champion', color: 'from-yellow-400 to-yellow-600', icon: '👑' };
    if (winRate >= 65) return { name: 'Master', color: 'from-purple-500 to-purple-700', icon: '💎' };
    if (winRate >= 50) return { name: 'Expert', color: 'from-blue-500 to-blue-700', icon: '⭐' };
    if (winRate >= 35) return { name: 'Intermediate', color: 'from-green-500 to-green-700', icon: '🎯' };
    return { name: 'Beginner', color: 'from-orange-500 to-orange-700', icon: '🔰' };
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch user's matches
        const { data: matches, error } = await supabase
          .from('matches')
          .select('*')
          .or(`player_left_id.eq.${profile?.id},player_right_id.eq.${profile?.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const totalGames = matches?.length || 0;
        const wins = matches?.filter(m => m.winner_id === profile?.id).length || 0;
        const losses = totalGames - wins;
        const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
        
        const league = getLeague(winRate, totalGames);

        // Get rank from leaderboard
        const { data: leaderboard } = await supabase
          .from('leaderboard')
          .select('*')
          .order('wins', { ascending: false });
        
        const rank = (leaderboard?.findIndex(p => p.id === profile?.id) || 0) + 1;

        setStats({
          totalGames,
          wins,
          losses,
          winRate,
          league: league.name,
          leagueColor: league.color,
          leagueIcon: league.icon,
          rank: rank || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile stats',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `player_left_id=eq.${profile?.id},player_right_id=eq.${profile?.id}`,
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile?.id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="text-2xl neon-text">Loading...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Games', value: stats?.totalGames || 0, icon: Target, gradient: 'from-neon-cyan to-neon-green' },
    { label: 'Wins', value: stats?.wins || 0, icon: Trophy, gradient: 'from-neon-green to-neon-cyan' },
    { label: 'Losses', value: stats?.losses || 0, icon: Zap, gradient: 'from-neon-pink to-neon-purple' },
    { label: 'Win Rate', value: `${stats?.winRate.toFixed(1)}%`, icon: TrendingUp, gradient: 'from-neon-purple to-neon-cyan' },
  ];

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
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24 border-4 border-primary shadow-neon">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary/20">
                  {profile?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-4xl font-bold neon-text mb-2">{profile?.username}</h1>
                <div className="flex items-center space-x-4">
                  <div className={`bg-gradient-to-r ${stats?.leagueColor} px-4 py-2 rounded-full flex items-center space-x-2`}>
                    <span className="text-2xl">{stats?.leagueIcon}</span>
                    <span className="font-bold text-white">{stats?.league}</span>
                  </div>
                  {stats?.rank && stats.rank > 0 && (
                    <div className="flex items-center space-x-2 text-foreground/70">
                      <Award className="w-5 h-5" />
                      <span>Rank #{stats.rank}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-card/50 backdrop-blur-xl border-2 border-border hover:border-primary transition-all duration-300 p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold neon-text">{stat.value}</p>
                        <p className="text-sm text-foreground/70 mt-1">{stat.label}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Card className="bg-card/50 backdrop-blur-xl border-2 border-primary/50 p-6 mt-6">
            <h2 className="text-2xl font-bold neon-text mb-4 flex items-center">
              <Trophy className="mr-2" />
              League System
            </h2>
            <div className="space-y-3">
              {[
                { name: 'Rookie', req: '< 5 games', icon: '🥉' },
                { name: 'Beginner', req: '< 35% win rate', icon: '🔰' },
                { name: 'Intermediate', req: '35-50% win rate', icon: '🎯' },
                { name: 'Expert', req: '50-65% win rate', icon: '⭐' },
                { name: 'Master', req: '65-80% win rate', icon: '💎' },
                { name: 'Champion', req: '80%+ win rate', icon: '👑' },
              ].map((league, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    league.name === stats?.league
                      ? 'border-primary bg-primary/10 shadow-neon'
                      : 'border-border/50 bg-card/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{league.icon}</span>
                    <span className={`font-bold ${league.name === stats?.league ? 'neon-text' : 'text-foreground/70'}`}>
                      {league.name}
                    </span>
                  </div>
                  <span className="text-sm text-foreground/60">{league.req}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
