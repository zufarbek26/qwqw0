import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Home,
  RotateCcw,
  Share2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Answer {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}

interface TestResult {
  id: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent_seconds: number;
  answers: Answer[];
  completed_at: string;
  test: {
    id: string;
    title: string;
    subject: string;
    questions: Array<{
      id: string;
      text: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>;
  };
}

const Result: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      if (!resultId || !user) return;

      try {
        const { data, error } = await supabase
          .from('test_results')
          .select(`
            *,
            test:tests(id, title, subject, questions)
          `)
          .eq('id', resultId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        setResult(data as unknown as TestResult);
        
        // Update user profile points
        await refreshProfile();
      } catch (error) {
        console.error('Error fetching result:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId, user, navigate, refreshProfile]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { label: 'Отлично!', emoji: '🏆', color: 'text-green-500' };
    if (percentage >= 70) return { label: 'Хорошо!', emoji: '👍', color: 'text-blue-500' };
    if (percentage >= 50) return { label: 'Неплохо', emoji: '📚', color: 'text-yellow-500' };
    return { label: 'Нужно подтянуть', emoji: '💪', color: 'text-red-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Результат не найден</h1>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </Layout>
    );
  }

  const grade = getGrade(result.percentage);

  return (
    <>
      <Helmet>
        <title>Результат теста — EduPlatform</title>
      </Helmet>
      <Layout>
        <div className="container py-12 px-4 max-w-3xl mx-auto">
          {/* Result Card */}
          <Card className="glass-card mb-8 overflow-hidden animate-scale-in">
            <div className="h-2 bg-gradient-primary" />
            <CardHeader className="text-center pt-8">
              <div className="text-6xl mb-4">{grade.emoji}</div>
              <CardTitle className={cn("text-3xl", grade.color)}>
                {grade.label}
              </CardTitle>
              <p className="text-muted-foreground">{result.test.title}</p>
            </CardHeader>
            <CardContent>
              {/* Score */}
              <div className="text-center mb-8">
                <div className="text-6xl font-bold gradient-text mb-2">
                  {Math.round(result.percentage)}%
                </div>
                <p className="text-muted-foreground">
                  {result.score} из {result.total_questions} правильных ответов
                </p>
              </div>

              {/* Progress */}
              <Progress value={result.percentage} className="h-3 mb-8" />

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{result.score}</div>
                  <div className="text-xs text-muted-foreground">Правильно</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <div className="text-2xl font-bold">{formatTime(result.time_spent_seconds)}</div>
                  <div className="text-xs text-muted-foreground">Время</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">+{result.score * 10}</div>
                  <div className="text-xs text-muted-foreground">Очков</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1"
                  variant="outline"
                  onClick={() => setShowAnswers(!showAnswers)}
                >
                  {showAnswers ? 'Скрыть ответы' : 'Посмотреть ответы'}
                </Button>
                <Button 
                  className="flex-1"
                  variant="outline"
                  onClick={() => navigate(`/quiz/${result.test.id}`)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Пройти снова
                </Button>
                <Button 
                  className="flex-1 btn-primary"
                  onClick={() => navigate('/')}
                >
                  <Home className="h-4 w-4 mr-2" />
                  <span>На главную</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Answers Review */}
          {showAnswers && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold">Разбор ответов</h2>
              {result.test.questions.map((question, index) => {
                const answer = result.answers[index];
                const isCorrect = answer?.isCorrect;

                return (
                  <Card 
                    key={question.id} 
                    className={cn(
                      "glass-card border-l-4",
                      isCorrect ? "border-l-green-500" : "border-l-red-500"
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        )}
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Вопрос {index + 1}
                          </span>
                          <CardTitle className="text-base">{question.text}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 ml-8">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={cn(
                              "p-3 rounded-lg text-sm",
                              optIndex === question.correctAnswer && "bg-green-500/10 text-green-600 dark:text-green-400",
                              optIndex === answer?.userAnswer && !isCorrect && "bg-red-500/10 text-red-600 dark:text-red-400",
                              optIndex !== question.correctAnswer && optIndex !== answer?.userAnswer && "bg-muted/50"
                            )}
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            {option}
                            {optIndex === question.correctAnswer && (
                              <span className="ml-2 text-green-500">✓ Правильный ответ</span>
                            )}
                            {optIndex === answer?.userAnswer && !isCorrect && (
                              <span className="ml-2 text-red-500">✗ Ваш ответ</span>
                            )}
                          </div>
                        ))}
                        {question.explanation && (
                          <div className="mt-3 p-3 bg-primary/5 rounded-lg text-sm">
                            <strong>Объяснение:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default Result;
