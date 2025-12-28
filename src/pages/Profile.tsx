import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LEVEL_LABELS, SUBJECTS } from '@/lib/constants';
import { 
  Trophy, 
  Target, 
  Flame, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentResult {
  id: string;
  percentage: number;
  completed_at: string;
  test: {
    title: string;
    subject: string;
  };
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchRecentResults = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('test_results')
          .select(`
            id,
            percentage,
            completed_at,
            test:tests(title, subject)
          `)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setRecentResults(data as unknown as RecentResult[]);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentResults();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const levelInfo = LEVEL_LABELS[profile.level];
  const nextLevel = Object.entries(LEVEL_LABELS).find(
    ([_, info]) => info.minPoints > profile.total_points
  );
  const progressToNext = nextLevel
    ? ((profile.total_points - levelInfo.minPoints) / (nextLevel[1].minPoints - levelInfo.minPoints)) * 100
    : 100;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Helmet>
        <title>Профиль — EduPlatform</title>
      </Helmet>
      <Layout>
        <div className="container py-12 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="glass-card lg:col-span-1">
              <CardContent className="pt-8 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/50">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(profile.name || 'User')}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
                <p className="text-muted-foreground mb-4">{profile.email}</p>
                
                <Badge className="mb-6 px-4 py-1 text-sm" variant="secondary">
                  {levelInfo.label}
                </Badge>

                {/* Level Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Прогресс уровня</span>
                    <span className="font-medium">{profile.total_points} XP</span>
                  </div>
                  <Progress value={progressToNext} className="h-2" />
                  {nextLevel && (
                    <p className="text-xs text-muted-foreground mt-1">
                      До уровня "{nextLevel[1].label}": {nextLevel[1].minPoints - profile.total_points} XP
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                    <div className="text-2xl font-bold">{profile.total_points}</div>
                    <div className="text-xs text-muted-foreground">Очков</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{profile.tests_completed}</div>
                    <div className="text-xs text-muted-foreground">Тестов</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold">{profile.streak_days}</div>
                    <div className="text-xs text-muted-foreground">Дней подряд</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-sm font-medium">Активен</div>
                    <div className="text-xs text-muted-foreground">Статус</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Последние результаты
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentResults.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Пока нет пройденных тестов</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentResults.map((result) => {
                      const subject = SUBJECTS.find(s => s.id === result.test.subject);
                      const Icon = subject?.icon || BookOpen;
                      
                      return (
                        <div
                          key={result.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/result/${result.id}`)}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            subject ? `subject-${subject.color}` : "bg-muted"
                          )}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{result.test.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(result.completed_at).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <div className={cn(
                            "text-2xl font-bold",
                            result.percentage >= 70 ? "text-green-500" : 
                            result.percentage >= 50 ? "text-yellow-500" : "text-red-500"
                          )}>
                            {Math.round(result.percentage)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Profile;
