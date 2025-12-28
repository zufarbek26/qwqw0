import React from 'react';
import { SubjectCard } from './SubjectCard';
import { SUBJECTS } from '@/lib/constants';

export const SubjectsGrid: React.FC = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Выбери <span className="gradient-text">предмет</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            От программирования до естественных наук — проверь свои знания в любой области
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUBJECTS.map((subject, index) => (
            <SubjectCard
              key={subject.id}
              {...subject}
              delay={index * 50}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
