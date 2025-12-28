import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { SUBJECTS, DIFFICULTY_LABELS } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, BookOpen, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Test {
  id: string;
  title: string;
  description: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit_minutes: number;
  questions: unknown[];
}

const Subject: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  const subject = SUBJECTS.find(s => s.id === subjectId);

  useEffect(() => {
    const fetchTests = async () => {
      if (!subjectId) return;

      try {
        const { data, error } = await supabase
          .from('tests')
          .select('id, title, description, difficulty, time_limit_minutes, questions')
          .eq('subject', subjectId as 'python' | 'html' | 'css' | 'javascript' | 'math' | 'physics' | 'chemistry' | 'biology')
          .eq('is_published', true);

        if (error) throw error;
        
        setTests((data || []).map(test => ({
          ...test,
          questions: Array.isArray(test.questions) ? test.questions : [],
        })));
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [subjectId]);

  if (!subject) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Предмет не найден</h1>
          <Button onClick={() => navigate('/subjects')}>
            Вернуться к предметам
          </Button>
        </div>
      </Layout>
    );
  }

  const Icon = subject.icon;

  return (
    <>
      <Helmet>
        <title>{subject.name} — Тесты | EduPlatform</title>
        <meta name="description" content={subject.description} />
      </Helmet>
      <Layout>
        <div className="container py-8 px-4">
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/subjects')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Все предметы
          </Button>

          {/* Header */}
          <div className={cn("subject-card mb-8", `subject-${subject.color}`)}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center">
                <Icon className={cn("h-8 w-8", `text-subject-${subject.color}`)} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{subject.name}</h1>
                <p className="text-muted-foreground">{subject.description}</p>
              </div>
            </div>
          </div>

          {/* Tests grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Доступные тесты</h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="glass-card">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : tests.length === 0 ? (
              <Card className="glass-card text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Тесты по этому предмету скоро появятся
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.map((test, index) => (
                  <Card 
                    key={test.id} 
                    className="glass-card hover:scale-[1.02] transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{test.title}</CardTitle>
                        <Badge 
                          variant="outline"
                          className={cn(DIFFICULTY_LABELS[test.difficulty].color)}
                        >
                          {DIFFICULTY_LABELS[test.difficulty].label}
                        </Badge>
                      </div>
                      {test.description && (
                        <CardDescription className="line-clamp-2">
                          {test.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{test.questions.length} вопросов</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{test.time_limit_minutes} мин</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full btn-primary"
                        onClick={() => {
                          if (!user) {
                            navigate('/auth?mode=signup');
                          } else {
                            navigate(`/quiz/${test.id}`);
                          }
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Начать тест
                        </span>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Subject;
