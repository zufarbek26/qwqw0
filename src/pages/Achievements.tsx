import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, Award, Star, Zap, Target, Flame, Crown, Medal,
  Rocket, BookOpen, GraduationCap, Calendar, CalendarCheck, 
  CalendarHeart, Sun, Gem, Loader2, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
}

interface UserAchievement {
  achievement_id: string;
  earned_at: string;
}

interface UserProfile {
  total_points: number;
  tests_completed: number;
  streak_days: number;
}

const iconMap: Record<string, React.ReactNode> = {
  'rocket': <Rocket className="h-6 w-6" />,
  'star': <Star className="h-6 w-6" />,
  'book-open': <BookOpen className="h-6 w-6" />,
  'graduation-cap': <GraduationCap className="h-6 w-6" />,
  'trophy': <Trophy className="h-6 w-6" />,
  'crown': <Crown className="h-6 w-6" />,
  'zap': <Zap className="h-6 w-6" />,
  'flame': <Flame className="h-6 w-6" />,
  'target': <Target className="h-6 w-6" />,
  'gem': <Gem className="h-6 w-6" />,
  'calendar': <Calendar className="h-6 w-6" />,
  'calendar-check': <CalendarCheck className="h-6 w-6" />,
  'calendar-heart': <CalendarHeart className="h-6 w-6" />,
  'award': <Award className="h-6 w-6" />,
  'sun': <Sun className="h-6 w-6" />,
  'medal': <Medal className="h-6 w-6" />,
};

const categoryLabels: Record<string, string> = {
  'tests': 'Тесты',
  'points': 'Очки',
  'streak': 'Активность',
  'special': 'Особые',
  'daily': 'Ежедневные',
};

const Achievements: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [achievementsRes, userAchRes, profileRes] = await Promise.all([
        supabase.from('achievements').select('*').order('requirement_value'),
        user ? supabase.from('user_achievements').select('achievement_id, earned_at').eq('user_id', user.id) : Promise.resolve({ data: [] }),
        user ? supabase.from('profiles').select('total_points, tests_completed, streak_days').eq('id', user.id).single() : Promise.resolve({ data: null })
      ]);

      if (achievementsRes.data) setAchievements(achievementsRes.data);
      if (userAchRes.data) setUserAchievements(userAchRes.data);
      if (profileRes.data) setProfile(profileRes.data);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const earnedIds = new Set(userAchievements.map(ua => ua.achievement_id));

  const getProgress = (achievement: Achievement): number => {
    if (!profile) return 0;
    
    let current = 0;
    switch (achievement.requirement_type) {
      case 'tests_completed':
        current = profile.tests_completed;
        break;
      case 'total_points':
        current = profile.total_points;
        break;
      case 'streak_days':
        current = profile.streak_days;
        break;
      default:
        current = 0;
    }
    
    return Math.min(100, (current / achievement.requirement_value) * 100);
  };

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const totalEarned = userAchievements.length;
  const totalAchievements = achievements.length;
  const totalPoints = userAchievements.reduce((sum, ua) => {
    const ach = achievements.find(a => a.id === ua.achievement_id);
    return sum + (ach?.points_reward || 0);
  }, 0);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Достижения — TestLix</title>
        <meta name="description" content="Ваши достижения и бейджи на TestLix" />
      </Helmet>
      <Layout>
        <div className="container py-12 px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Достижения</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Зарабатывай бейджи за активность и прогресс
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto mb-12">
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-3xl font-bold">{totalEarned}</div>
                <div className="text-sm text-muted-foreground">из {totalAchievements}</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold gradient-text">{totalPoints}</div>
                <div className="text-sm text-muted-foreground">очков за бейджи</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="pt-6">
                <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-3xl font-bold">{Math.round((totalEarned / totalAchievements) * 100)}%</div>
                <div className="text-sm text-muted-foreground">прогресс</div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements by category */}
          {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
            <div key={category} className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                {categoryLabels[category] || category}
                <span className="text-sm font-normal text-muted-foreground">
                  ({categoryAchievements.filter(a => earnedIds.has(a.id)).length}/{categoryAchievements.length})
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryAchievements.map((achievement) => {
                  const isEarned = earnedIds.has(achievement.id);
                  const progress = getProgress(achievement);
                  const earnedData = userAchievements.find(ua => ua.achievement_id === achievement.id);
                  
                  return (
                    <Card 
                      key={achievement.id} 
                      className={cn(
                        "transition-all duration-300",
                        isEarned 
                          ? "glass-card border-primary/50 bg-primary/5" 
                          : "bg-muted/20 border-border/50"
                      )}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                            isEarned 
                              ? "bg-primary/20 text-primary" 
                              : "bg-muted/50 text-muted-foreground"
                          )}>
                            {isEarned ? iconMap[achievement.icon] : <Lock className="h-6 w-6" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={cn(
                              "font-semibold truncate",
                              !isEarned && "text-muted-foreground"
                            )}>
                              {achievement.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            {!isEarned && profile && (
                              <Progress value={progress} className="h-1.5" />
                            )}
                            {isEarned && earnedData && (
                              <p className="text-xs text-green-500">
                                ✓ Получено {new Date(earnedData.earned_at).toLocaleDateString('ru')}
                              </p>
                            )}
                          </div>
                          <div className={cn(
                            "text-sm font-bold",
                            isEarned ? "text-primary" : "text-muted-foreground"
                          )}>
                            +{achievement.points_reward}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Layout>
    </>
  );
};

export default Achievements;
