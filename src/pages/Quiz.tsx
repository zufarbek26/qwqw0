import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { checkAndAwardAchievements } from '@/lib/achievements';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Test {
  id: string;
  title: string;
  subject: string;
  time_limit_minutes: number;
  questions: Question[];
}

interface QuizState {
  currentQuestion: number;
  answers: Record<number, number>;
  startTime: number;
  warnings: number;
}

const Quiz: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>(() => {
    const saved = localStorage.getItem(`quiz-${testId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      currentQuestion: 0,
      answers: {},
      startTime: Date.now(),
      warnings: 0,
    };
  });
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) return;

      try {
        const { data, error } = await supabase
          .from('tests')
          .select('*')
          .eq('id', testId)
          .single();

        if (error) throw error;

        const questions = (data.questions as unknown as Question[]) || [];
        setTest({
          ...data,
          questions,
        });

        // Calculate remaining time
        const saved = localStorage.getItem(`quiz-${testId}`);
        const startTime = saved ? JSON.parse(saved).startTime : Date.now();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = data.time_limit_minutes * 60 - elapsed;
        setTimeLeft(Math.max(0, remaining));
      } catch (error) {
        console.error('Error fetching test:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить тест',
          variant: 'destructive',
        });
        navigate('/subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId, navigate, toast]);

  // Save state to localStorage
  useEffect(() => {
    if (testId) {
      localStorage.setItem(`quiz-${testId}`, JSON.stringify(quizState));
    }
  }, [testId, quizState]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 && test) {
      handleSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, test]);

  // Anti-cheat: visibility change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submitting) {
        setQuizState(prev => {
          const newWarnings = prev.warnings + 1;
          
          if (newWarnings >= 3) {
            toast({
              title: 'Тест завершён',
              description: 'Вы слишком часто переключали вкладки',
              variant: 'destructive',
            });
            handleSubmit();
          } else {
            toast({
              title: `Предупреждение ${newWarnings}/3`,
              description: 'Не переключайте вкладки во время теста',
              variant: 'destructive',
            });
          }
          
          return { ...prev, warnings: newWarnings };
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [submitting, toast]);

  // Prevent copy/paste
  useEffect(() => {
    const preventCopy = (e: Event) => {
      e.preventDefault();
      toast({
        title: 'Копирование запрещено',
        description: 'Во время теста нельзя копировать текст',
        variant: 'destructive',
      });
    };

    document.addEventListener('copy', preventCopy);
    document.addEventListener('paste', preventCopy);
    document.addEventListener('contextmenu', preventCopy);

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('paste', preventCopy);
      document.removeEventListener('contextmenu', preventCopy);
    };
  }, [toast]);

  const handleAnswer = (optionIndex: number) => {
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [prev.currentQuestion]: optionIndex },
    }));
  };

  const handleNext = () => {
    if (test && quizState.currentQuestion < test.questions.length - 1) {
      setQuizState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    }
  };

  const handlePrev = () => {
    if (quizState.currentQuestion > 0) {
      setQuizState(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }));
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!test || !user || submitting) return;

    setSubmitting(true);

    try {
      // Calculate score
      let score = 0;
      const answersData = test.questions.map((q, index) => {
        const userAnswer = quizState.answers[index];
        const isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) score++;
        return {
          questionIndex: index,
          question: q.question,
          userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
        };
      });

      const percentage = (score / test.questions.length) * 100;
      const timeSpent = Math.floor((Date.now() - quizState.startTime) / 1000);

      // Save result
      const { data: resultData, error } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          test_id: test.id,
          score,
          total_questions: test.questions.length,
          percentage,
          time_spent_seconds: timeSpent,
          answers: answersData,
        })
        .select()
        .single();

      if (error) throw error;

      // Update profile stats and check achievements
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('total_points, tests_completed, streak_days')
        .eq('id', user.id)
        .single();

      if (updatedProfile) {
        const isPerfect = percentage === 100;
        const newAchievements = await checkAndAwardAchievements(
          user.id,
          updatedProfile,
          { perfectScore: isPerfect }
        );
        
        if (newAchievements.length > 0) {
          toast({
            title: `🏆 Новые достижения: ${newAchievements.length}!`,
            description: newAchievements.map(a => a.name).join(', '),
          });
        }
      }

      // Clear saved state
      localStorage.removeItem(`quiz-${testId}`);

      // Navigate to results
      navigate(`/result/${resultData.id}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить результат',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }, [test, user, quizState, testId, navigate, toast, submitting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!test || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="glass-card p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Тест не найден</h1>
          <Button onClick={() => navigate('/subjects')}>Вернуться</Button>
        </Card>
      </div>
    );
  }

  const currentQ = test.questions[quizState.currentQuestion];
  const progress = ((quizState.currentQuestion + 1) / test.questions.length) * 100;
  const answeredCount = Object.keys(quizState.answers).length;

  return (
    <>
      <Helmet>
        <title>{test.title} — Тест | TestLix</title>
      </Helmet>
      <div className="min-h-screen bg-background p-4">
        {/* Background effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold">{test.title}</h1>
              <p className="text-sm text-muted-foreground">
                Вопрос {quizState.currentQuestion + 1} из {test.questions.length}
              </p>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full",
              timeLeft < 60 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-muted"
            )}>
              <Clock className="h-4 w-4" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>

          {/* Warnings */}
          {quizState.warnings > 0 && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">
                Предупреждений: {quizState.warnings}/3
              </span>
            </div>
          )}

          {/* Question Card */}
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={cn(
                    "w-full p-4 rounded-xl text-left transition-all duration-200",
                    "border-2",
                    quizState.answers[quizState.currentQuestion] === index
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      quizState.answers[quizState.currentQuestion] === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={quizState.currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>

            <div className="flex items-center gap-2">
              {test.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setQuizState(prev => ({ ...prev, currentQuestion: index }))}
                  className={cn(
                    "w-8 h-8 rounded-full text-xs font-medium transition-all",
                    index === quizState.currentQuestion
                      ? "bg-primary text-primary-foreground"
                      : quizState.answers[index] !== undefined
                        ? "bg-green-500/20 text-green-500 border border-green-500/50"
                        : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {quizState.currentQuestion === test.questions.length - 1 ? (
              <Button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    <span>Завершить ({answeredCount}/{test.questions.length})</span>
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Далее
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Quiz;
