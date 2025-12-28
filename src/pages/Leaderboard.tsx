import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LEVEL_LABELS } from '@/lib/constants';
import { Trophy, Medal, Crown, Loader2, Users, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar_url: string | null;
  total_points: number;
  level: keyof typeof LEVEL_LABELS;
  tests_completed: number;
}

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  // Fetch leaderboard and total users count
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [leadersRes, countRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, name, avatar_url, total_points, level, tests_completed')
            .order('total_points', { ascending: false })
            .limit(50),
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
        ]);

        if (leadersRes.error) throw leadersRes.error;
        setLeaders(leadersRes.data as LeaderboardEntry[]);
        setTotalUsers(countRes.count || 0);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Track online users with Realtime Presence
  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user?.id || 'anonymous-' + Math.random().toString(36).substr(2, 9),
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: user?.id || null,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 border-amber-600/30';
      default:
        return 'bg-muted/30 border-transparent';
    }
  };

  return (
    <>
      <Helmet>
        <title>Рейтинг — TestLix</title>
        <meta name="description" content="Топ учеников по очкам и достижениям" />
      </Helmet>
      <Layout>
        <div className="container py-12 px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Рейтинг</span> учеников
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Соревнуйся с другими и поднимайся в топ
            </p>
            
            {/* Online Stats */}
            <div className="flex justify-center gap-8 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <Users className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-green-500">{onlineCount}</span>
                <span className="text-muted-foreground text-sm">онлайн</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
                <Globe className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">{totalUsers.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm">всего</span>
              </div>
            </div>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
                  <TabsTrigger value="all">Все время</TabsTrigger>
                  <TabsTrigger value="week">Эта неделя</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : leaders.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Пока нет участников</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaders.map((leader, index) => {
                    const rank = index + 1;
                    const isCurrentUser = leader.id === user?.id;
                    
                    return (
                      <div
                        key={leader.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                          getRankBg(rank),
                          isCurrentUser && "ring-2 ring-primary",
                          "hover:scale-[1.01]"
                        )}
                      >
                        <div className="w-8 flex justify-center">
                          {getRankIcon(rank)}
                        </div>
                        
                        <Avatar className="h-12 w-12 border-2 border-background">
                          <AvatarImage src={leader.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(leader.name || 'User')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{leader.name}</h3>
                            {isCurrentUser && (
                              <span className="text-xs text-primary">(Вы)</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {LEVEL_LABELS[leader.level].label} • {leader.tests_completed} тестов
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold gradient-text">
                            {leader.total_points.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">очков</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
};

export default Leaderboard;
