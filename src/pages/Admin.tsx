import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SUBJECTS, DIFFICULTY_LABELS } from '@/lib/constants';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Users, 
  FileText, 
  Zap,
  Edit,
  Key,
  Mail,
  Save,
  Award,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Test {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  is_published: boolean;
  questions: any[];
}

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  level: string;
  total_points: number;
  role?: string;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [tests, setTests] = useState<Test[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tests');

  // Test form state
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [testForm, setTestForm] = useState<{
    title: string;
    subject: string;
    difficulty: 'easy' | 'medium' | 'hard';
    description: string;
    time_limit_minutes: number;
    is_published: boolean;
  }>({
    title: '',
    subject: '',
    difficulty: 'medium' as const,
    description: '',
    time_limit_minutes: 15,
    is_published: false,
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  // User edit dialog state
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Daily challenge state
  const [challengeForm, setChallengeForm] = useState({
    subject: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    points_reward: 10,
  });

  useEffect(() => {
    if (!authLoading && (!user || userRole?.role !== 'admin')) {
      navigate('/');
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (userRole?.role === 'admin') {
      fetchData();
    }
  }, [userRole]);

  const fetchData = async () => {
    try {
      // Fetch tests
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (testsError) throw testsError;
      setTests(testsData as Test[]);

      // Fetch users with roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const usersWithRoles = profilesData.map(profile => ({
        ...profile,
        role: rolesData.find(r => r.user_id === profile.id)?.role || 'student',
      }));

      setUsers(usersWithRoles as UserWithRole[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTest = async () => {
    try {
      if (!testForm.title || !testForm.subject || questions.length === 0) {
        toast({
          title: "Ошибка",
          description: "Заполните все поля и добавьте хотя бы один вопрос",
          variant: "destructive",
        });
        return;
      }

      const testData = {
        title: testForm.title,
        subject: testForm.subject as any,
        difficulty: testForm.difficulty,
        description: testForm.description,
        time_limit_minutes: testForm.time_limit_minutes,
        is_published: testForm.is_published,
        questions: questions as any,
        created_by: user?.id,
      };

      if (editingTest) {
        const { error } = await supabase
          .from('tests')
          .update(testData)
          .eq('id', editingTest.id);

        if (error) throw error;
        toast({ title: "Тест обновлён" });
      } else {
        const { error } = await supabase
          .from('tests')
          .insert(testData);

        if (error) throw error;
        toast({ title: "Тест создан" });
      }

      setShowTestForm(false);
      setEditingTest(null);
      resetTestForm();
      fetchData();
    } catch (error) {
      console.error('Error saving test:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить тест",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Удалить этот тест?')) return;

    try {
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;
      toast({ title: "Тест удалён" });
      fetchData();
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  const handleTogglePublish = async (test: Test) => {
    try {
      const { error } = await supabase
        .from('tests')
        .update({ is_published: !test.is_published })
        .eq('id', test.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const handleUpdateUserEmail = async () => {
    if (!editingUser || !userEmail) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ email: userEmail })
        .eq('id', editingUser.id);

      if (error) throw error;
      
      toast({ title: "Email обновлён" });
      setEditingUser(null);
      fetchData();
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить email",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!editingUser || !newPassword) return;

    try {
      // Note: Admin password reset requires Supabase admin API
      // This is a simplified version - in production you'd use an edge function
      toast({
        title: "Функция в разработке",
        description: "Сброс пароля через админ-панель требует дополнительной настройки",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const handleCreateChallenge = async () => {
    try {
      if (!challengeForm.subject || !challengeForm.question) {
        toast({
          title: "Ошибка",
          description: "Заполните все поля",
          variant: "destructive",
        });
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('daily_challenges')
        .insert({
          challenge_date: today,
          subject: challengeForm.subject as any,
          question: {
            question: challengeForm.question,
            options: challengeForm.options.filter(o => o.trim()),
            correctAnswer: challengeForm.correctAnswer,
            explanation: challengeForm.explanation,
          } as any,
          points_reward: challengeForm.points_reward,
        });

      if (error) throw error;

      toast({ title: "Ежедневное задание создано" });
      setChallengeForm({
        subject: '',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        points_reward: 10,
      });
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать задание",
        variant: "destructive",
      });
    }
  };

  const resetTestForm = () => {
    setTestForm({
      title: '',
      subject: '',
      difficulty: 'medium',
      description: '',
      time_limit_minutes: 15,
      is_published: false,
    });
    setQuestions([]);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
      },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    if (field === 'option') {
      updated[index].options[value.index] = value.value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole?.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Админ-панель — TestLix</title>
      </Helmet>
      <Layout>
        <div className="container py-8 px-4">
          <h1 className="text-3xl font-bold mb-8">Админ-панель</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="tests" className="gap-2">
                <FileText className="h-4 w-4" />
                Тесты
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Пользователи
              </TabsTrigger>
              <TabsTrigger value="daily" className="gap-2">
                <Zap className="h-4 w-4" />
                Daily Challenge
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2">
                <Award className="h-4 w-4" />
                Достижения
              </TabsTrigger>
            </TabsList>

            {/* Tests Tab */}
            <TabsContent value="tests" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Управление тестами</h2>
                <Button onClick={() => { resetTestForm(); setShowTestForm(true); }} className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать тест
                </Button>
              </div>

              {showTestForm && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>{editingTest ? 'Редактировать тест' : 'Новый тест'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Название</Label>
                        <Input
                          value={testForm.title}
                          onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                          placeholder="Название теста"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Предмет</Label>
                        <Select
                          value={testForm.subject}
                          onValueChange={(v) => setTestForm({ ...testForm, subject: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите предмет" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Сложность</Label>
                        <Select
                          value={testForm.difficulty}
                          onValueChange={(v) => setTestForm({ ...testForm, difficulty: v as 'easy' | 'medium' | 'hard' })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(DIFFICULTY_LABELS).map(([key, info]) => (
                              <SelectItem key={key} value={key}>
                                {info.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Время (минуты)</Label>
                        <Input
                          type="number"
                          value={testForm.time_limit_minutes}
                          onChange={(e) => setTestForm({ ...testForm, time_limit_minutes: parseInt(e.target.value) || 15 })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Описание</Label>
                      <Textarea
                        value={testForm.description}
                        onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                        placeholder="Описание теста"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={testForm.is_published}
                        onCheckedChange={(v) => setTestForm({ ...testForm, is_published: v })}
                      />
                      <Label>Опубликован</Label>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-lg">Вопросы ({questions.length})</Label>
                        <Button variant="outline" onClick={addQuestion}>
                          <Plus className="h-4 w-4 mr-2" />
                          Добавить вопрос
                        </Button>
                      </div>

                      {questions.map((q, qIndex) => (
                        <Card key={qIndex} className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <Label>Вопрос {qIndex + 1}</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(qIndex)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <Textarea
                              value={q.question}
                              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                              placeholder="Текст вопроса"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${qIndex}`}
                                    checked={q.correctAnswer === oIndex}
                                    onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                  />
                                  <Input
                                    value={opt}
                                    onChange={(e) => updateQuestion(qIndex, 'option', { index: oIndex, value: e.target.value })}
                                    placeholder={`Вариант ${oIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                            <Input
                              value={q.explanation || ''}
                              onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                              placeholder="Объяснение (опционально)"
                            />
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveTest} className="btn-primary">
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить
                      </Button>
                      <Button variant="outline" onClick={() => { setShowTestForm(false); setEditingTest(null); }}>
                        Отмена
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {tests.map((test) => {
                  const subject = SUBJECTS.find(s => s.id === test.subject);
                  return (
                    <Card key={test.id} className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              subject ? `subject-${subject.color}` : "bg-muted"
                            )}>
                              {subject && <subject.icon className="h-6 w-6" />}
                            </div>
                            <div>
                              <h3 className="font-semibold">{test.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{subject?.name}</span>
                                <span>•</span>
                                <span>{DIFFICULTY_LABELS[test.difficulty as keyof typeof DIFFICULTY_LABELS]?.label}</span>
                                <span>•</span>
                                <span>{test.questions?.length || 0} вопросов</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={test.is_published ? "default" : "secondary"}>
                              {test.is_published ? 'Опубликован' : 'Черновик'}
                            </Badge>
                            <Switch
                              checked={test.is_published}
                              onCheckedChange={() => handleTogglePublish(test)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingTest(test);
                                setTestForm({
                                  title: test.title,
                                  subject: test.subject,
                                  difficulty: test.difficulty as 'easy' | 'medium' | 'hard',
                                  description: '',
                                  time_limit_minutes: 15,
                                  is_published: test.is_published,
                                });
                                setQuestions(test.questions as Question[] || []);
                                setShowTestForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTest(test.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <h2 className="text-xl font-semibold">Управление пользователями</h2>

              <div className="grid gap-4">
                {users.map((u) => (
                  <Card key={u.id} className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{u.name}</h3>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{u.role}</Badge>
                            <Badge variant="secondary">{u.total_points} XP</Badge>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingUser(u);
                                setUserEmail(u.email);
                                setNewPassword('');
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Редактировать
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Редактировать пользователя</DialogTitle>
                              <DialogDescription>
                                Изменение email и сброс пароля для {u.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    placeholder="Новый email"
                                  />
                                  <Button onClick={handleUpdateUserEmail}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Сохранить
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Новый пароль</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Новый пароль"
                                  />
                                  <Button onClick={handleResetPassword} variant="outline">
                                    <Key className="h-4 w-4 mr-2" />
                                    Сбросить
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Daily Challenge Tab */}
            <TabsContent value="daily" className="space-y-6">
              <h2 className="text-xl font-semibold">Ежедневное задание</h2>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Создать задание на сегодня</CardTitle>
                  <CardDescription>
                    Это задание будет доступно всем пользователям
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Предмет</Label>
                      <Select
                        value={challengeForm.subject}
                        onValueChange={(v) => setChallengeForm({ ...challengeForm, subject: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите предмет" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Награда (очки)</Label>
                      <Input
                        type="number"
                        value={challengeForm.points_reward}
                        onChange={(e) => setChallengeForm({ ...challengeForm, points_reward: parseInt(e.target.value) || 10 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Вопрос</Label>
                    <Textarea
                      value={challengeForm.question}
                      onChange={(e) => setChallengeForm({ ...challengeForm, question: e.target.value })}
                      placeholder="Текст вопроса"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Варианты ответов</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {challengeForm.options.map((opt, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct-challenge"
                            checked={challengeForm.correctAnswer === index}
                            onChange={() => setChallengeForm({ ...challengeForm, correctAnswer: index })}
                          />
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...challengeForm.options];
                              newOptions[index] = e.target.value;
                              setChallengeForm({ ...challengeForm, options: newOptions });
                            }}
                            placeholder={`Вариант ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Объяснение (опционально)</Label>
                    <Textarea
                      value={challengeForm.explanation}
                      onChange={(e) => setChallengeForm({ ...challengeForm, explanation: e.target.value })}
                      placeholder="Почему этот ответ правильный"
                    />
                  </div>

                  <Button onClick={handleCreateChallenge} className="btn-primary">
                    <Zap className="h-4 w-4 mr-2" />
                    Создать задание
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Управление достижениями
                  </CardTitle>
                  <CardDescription>
                    Просмотр всех достижений в системе. Редактирование через базу данных.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground text-center py-8">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Достижения настроены автоматически</p>
                    <p className="text-sm mt-2">
                      Пользователи получают их за: тесты, очки, streak и ежедневные задания
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/achievements')}
                    >
                      Просмотреть все достижения
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Отправить уведомление
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Заголовок</Label>
                    <Input placeholder="Новый тест доступен!" id="notif-title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Сообщение</Label>
                    <Textarea placeholder="Проверьте новый тест по JavaScript..." id="notif-message" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ссылка (опционально)</Label>
                    <Input placeholder="/subjects" id="notif-link" />
                  </div>
                  <Button 
                    className="btn-primary"
                    onClick={async () => {
                      const title = (document.getElementById('notif-title') as HTMLInputElement)?.value;
                      const message = (document.getElementById('notif-message') as HTMLTextAreaElement)?.value;
                      const link = (document.getElementById('notif-link') as HTMLInputElement)?.value;
                      
                      if (!title || !message) {
                        toast({ title: 'Ошибка', description: 'Заполните заголовок и сообщение', variant: 'destructive' });
                        return;
                      }
                      
                      // Send to all users
                      const { data: allUsers } = await supabase.from('profiles').select('id');
                      if (allUsers) {
                        const notifications = allUsers.map(u => ({
                          user_id: u.id,
                          title,
                          message,
                          type: 'info',
                          link: link || null,
                        }));
                        
                        await supabase.from('notifications').insert(notifications);
                        toast({ title: 'Успешно', description: `Уведомление отправлено ${allUsers.length} пользователям` });
                        
                        // Clear form
                        (document.getElementById('notif-title') as HTMLInputElement).value = '';
                        (document.getElementById('notif-message') as HTMLTextAreaElement).value = '';
                        (document.getElementById('notif-link') as HTMLInputElement).value = '';
                      }
                    }}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Отправить всем
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </>
  );
};

export default Admin;
