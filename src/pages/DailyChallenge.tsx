import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SUBJECTS } from '@/lib/constants';
import { Loader2, Trophy, CheckCircle2, XCircle, Zap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface DailyChallenge {
  id: string;
  challenge_date: string;
  subject: string;
  question: Question;
  points_reward: number;
}

interface Completion {
  id: string;
  is_correct: boolean;
}

const DailyChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!user) return;

      try {
        const today = new Date().toISOString().split('T')[0];

        // Fetch today's challenge
        const { data: challengeData, error: challengeError } = await supabase
          .from('daily_challenges')
          .select('*')
          .eq('challenge_date', today)
          .maybeSingle();

        if (challengeError) throw challengeError;

        if (challengeData) {
          setChallenge({
            ...challengeData,
            question: challengeData.question as unknown as Question,
          });

          // Check if user already completed
          const { data: completionData, error: completionError } = await supabase
            .from('daily_challenge_completions')
            .select('id, is_correct')
            .eq('challenge_id', challengeData.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (completionError) throw completionError;
          if (completionData) {
            setCompletion(completionData);
          }
        }
      } catch (error) {
        console.error('Error fetching challenge:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [user]);

  const handleSubmit = async () => {
    if (!challenge || selectedAnswer === null || !user) return;

    setIsSubmitting(true);

    try {
      const isCorrect = selectedAnswer === challenge.question.correctAnswer;

      // Save completion
      const { error: insertError } = await supabase
        .from('daily_challenge_completions')
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          is_correct: isCorrect,
        });

      if (insertError) throw insertError;

      // Update points if correct
      if (isCorrect) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('total_points')
          .eq('id', user.id)
          .single();

        if (currentProfile) {
          await supabase
            .from('profiles')
            .update({
              total_points: currentProfile.total_points + challenge.points_reward,
            })
            .eq('id', user.id);
        }

        await refreshProfile();

        toast({
          title: "Правильно! 🎉",
          description: `Вы заработали ${challenge.points_reward} очков!`,
        });
      } else {
        toast({
          title: "Неправильно",
          description: "Попробуйте завтра!",
          variant: "destructive",
        });
      }

      setCompletion({ id: '', is_correct: isCorrect });
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить ответ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const subject = challenge ? SUBJECTS.find(s => s.id === challenge.subject) : null;
  const SubjectIcon = subject?.icon || Zap;

  return (
    <>
      <Helmet>
        <title>Ежедневное задание — TestLix</title>
      </Helmet>
      <Layout>
        <div className="container py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Ежедневное задание</h1>
              <p className="text-muted-foreground">
                Отвечай каждый день и получай бонусные очки!
              </p>
            </div>

            {!challenge ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-xl font-semibold mb-2">Нет задания на сегодня</h2>
                  <p className="text-muted-foreground">
                    Загляни позже, администратор скоро добавит новое задание!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        subject ? `subject-${subject.color}` : "bg-primary/10"
                      )}>
                        <SubjectIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle>{subject?.name || 'Задание'}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          +{challenge.points_reward} очков за правильный ответ
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4">
                      <Trophy className="h-4 w-4 mr-1" />
                      {challenge.points_reward} XP
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-lg font-medium">
                    {challenge.question.question}
                  </div>

                  <div className="space-y-3">
                    {challenge.question.options.map((option, index) => {
                      const isCompleted = completion !== null;
                      const isSelected = selectedAnswer === index;
                      const isCorrect = index === challenge.question.correctAnswer;
                      const showCorrect = isCompleted && isCorrect;
                      const showWrong = isCompleted && isSelected && !isCorrect;

                      return (
                        <button
                          key={index}
                          onClick={() => !isCompleted && setSelectedAnswer(index)}
                          disabled={isCompleted}
                          className={cn(
                            "w-full p-4 rounded-xl text-left transition-all",
                            "border-2",
                            isCompleted ? "cursor-default" : "cursor-pointer hover:border-primary/50",
                            showCorrect && "border-green-500 bg-green-500/10",
                            showWrong && "border-red-500 bg-red-500/10",
                            !isCompleted && isSelected && "border-primary bg-primary/10",
                            !isCompleted && !isSelected && "border-border hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                              showCorrect && "bg-green-500 text-white",
                              showWrong && "bg-red-500 text-white",
                              !isCompleted && isSelected && "bg-primary text-primary-foreground",
                              !isCompleted && !isSelected && "bg-muted"
                            )}>
                              {showCorrect ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : showWrong ? (
                                <XCircle className="h-5 w-5" />
                              ) : (
                                String.fromCharCode(65 + index)
                              )}
                            </div>
                            <span>{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {completion && challenge.question.explanation && (
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <p className="text-sm font-medium mb-1">Объяснение:</p>
                      <p className="text-sm text-muted-foreground">
                        {challenge.question.explanation}
                      </p>
                    </div>
                  )}

                  {!completion && (
                    <Button
                      onClick={handleSubmit}
                      disabled={selectedAnswer === null || isSubmitting}
                      className="w-full btn-primary"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Ответить
                    </Button>
                  )}

                  {completion && (
                    <div className={cn(
                      "p-4 rounded-xl text-center",
                      completion.is_correct ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {completion.is_correct ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">Отлично! +{challenge.points_reward} очков</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <XCircle className="h-5 w-5" />
                          <span className="font-medium">Неправильно. Попробуй завтра!</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default DailyChallengePage;
