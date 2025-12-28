import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SUBJECTS } from '@/lib/constants';
import { 
  Trophy, 
  Clock, 
  TrendingUp, 
  BookOpen,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestResult {
  id: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent_seconds: number;
  completed_at: string;
  test: {
    id: string;
    title: string;
    subject: string;
  };
}

const MyResults: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('test_results')
          .select(`
            id,
            score,
            total_questions,
            percentage,
            time_spent_seconds,
            completed_at,
            test:tests(id, title, subject)
          `)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });

        if (error) throw error;
        setResults(data as unknown as TestResult[]);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate stats
  const stats = {
    totalTests: results.length,
    avgPercentage: results.length > 0 
      ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length) 
      : 0,
    bestScore: results.length > 0 
      ? Math.max(...results.map(r => r.percentage)) 
      : 0,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Мои результаты — TestLix</title>
      </Helmet>
      <Layout>
        <div className="container py-12 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Мои результаты</h1>
            <p className="text-muted-foreground">История всех пройденных тестов</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalTests}</div>
                    <div className="text-sm text-muted-foreground">Тестов пройдено</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.avgPercentage}%</div>
                    <div className="text-sm text-muted-foreground">Средний результат</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.bestScore}%</div>
                    <div className="text-sm text-muted-foreground">Лучший результат</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results List */}
          {results.length === 0 ? (
            <Card className="glass-card text-center py-16">
              <CardContent>
                <BookOpen className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">Пока нет результатов</h2>
                <p className="text-muted-foreground mb-6">
                  Пройдите свой первый тест и результаты появятся здесь
                </p>
                <Button className="btn-primary" onClick={() => navigate('/subjects')}>
                  <span className="flex items-center gap-2">
                    Выбрать предмет
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>История тестов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result, index) => {
                    const subject = SUBJECTS.find(s => s.id === result.test.subject);
                    const Icon = subject?.icon || BookOpen;

                    return (
                      <div
                        key={result.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer",
                          "animate-fade-in"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => navigate(`/result/${result.id}`)}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                          subject ? `subject-${subject.color}` : "bg-muted"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{result.test.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{result.score}/{result.total_questions} правильно</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(result.time_spent_seconds)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={cn(
                            "text-2xl font-bold",
                            result.percentage >= 70 ? "text-green-500" :
                            result.percentage >= 50 ? "text-yellow-500" : "text-red-500"
                          )}>
                            {Math.round(result.percentage)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(result.completed_at).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </>
  );
};

export default MyResults;
