import React from 'react';
import { 
  Brain, 
  Trophy, 
  Clock, 
  Shield, 
  Sparkles, 
  Award 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Brain,
    title: 'AI-помощник',
    description: 'Получай объяснения ошибок и персональные рекомендации от искусственного интеллекта',
    gradient: 'from-primary/20 to-purple-500/20',
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    description: 'Соревнуйся с другими учениками и поднимайся в рейтинге по каждому предмету',
    gradient: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    icon: Clock,
    title: 'Таймер & Прогресс',
    description: 'Отслеживай время и сохраняй прогресс даже после перезагрузки страницы',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: Shield,
    title: 'Анти-чит система',
    description: 'Честные результаты благодаря защите от списывания и копирования',
    gradient: 'from-red-500/20 to-pink-500/20',
  },
  {
    icon: Sparkles,
    title: 'Daily Challenge',
    description: 'Ежедневные задания с бонусными очками для поддержания мотивации',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    icon: Award,
    title: 'Сертификаты',
    description: 'Получай PDF-сертификаты за успешное прохождение тестов',
    gradient: 'from-accent/20 to-teal-500/20',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Почему <span className="gradient-text">EduPlatform</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Современные технологии для эффективного обучения
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "glass-card p-6 hover:scale-[1.02] transition-all duration-300",
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                "bg-gradient-to-br",
                feature.gradient
              )}>
                <feature.icon className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
