import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubjectCardProps {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  testsCount?: number;
  delay?: number;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  id,
  name,
  icon: Icon,
  description,
  color,
  testsCount,
  delay = 0,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "subject-card cursor-pointer animate-fade-in-up",
        `subject-${color}`
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => navigate(`/subject/${id}`)}
    >
      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
        "bg-gradient-to-br from-foreground/10 to-foreground/5"
      )}>
        <Icon className={cn("h-6 w-6", `text-subject-${color}`)} />
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
        <span className="text-sm text-muted-foreground">
          {testsCount !== undefined ? `${testsCount} тестов` : 'Загрузка...'}
        </span>
        <span className={cn(
          "text-sm font-medium",
          `text-subject-${color}`
        )}>
          Начать →
        </span>
      </div>

      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <Icon className="w-full h-full" />
      </div>
    </div>
  );
};
