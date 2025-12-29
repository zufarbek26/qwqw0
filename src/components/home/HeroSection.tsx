import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Trophy } from 'lucide-react';
import { useStats } from '@/hooks/useStats';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { testsCount, subjectsCount } = useStats();

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Новая платформа для обучения</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
            Учись с <span className="gradient-text">удовольствием</span>
            <br />
            проверяй знания
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Интерактивные тесты по программированию, математике и естественным наукам. 
            Отслеживай прогресс, соревнуйся с друзьями и получай сертификаты.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button 
              className="btn-primary text-lg px-8 py-6"
              onClick={() => navigate(user ? '/subjects' : '/auth?mode=signup')}
            >
              <span className="flex items-center gap-2">
                {user ? 'Начать тест' : 'Начать бесплатно'}
                <ArrowRight className="h-5 w-5" />
              </span>
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-6 border-border/50 hover:bg-muted/50"
              onClick={() => navigate('/subjects')}
            >
              Смотреть предметы
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-3xl md:text-4xl font-bold text-primary">
                <Zap className="h-6 w-6" />
                <span>{testsCount || '0'}</span>
              </div>
              <span className="text-sm text-muted-foreground mt-1">Тестов</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-3xl md:text-4xl font-bold text-accent">
                <Trophy className="h-6 w-6" />
                <span>{subjectsCount}</span>
              </div>
              <span className="text-sm text-muted-foreground mt-1">Предметов</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-bold text-green-500">
                <span>∞</span>
              </div>
              <span className="text-sm text-muted-foreground mt-1">Попыток</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
