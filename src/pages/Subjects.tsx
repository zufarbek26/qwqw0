import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { SubjectCard } from '@/components/home/SubjectCard';
import { SUBJECTS } from '@/lib/constants';

const Subjects: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Все предметы — EduPlatform</title>
        <meta 
          name="description" 
          content="Выбери предмет для тестирования: программирование, математика, физика, химия, биология" 
        />
      </Helmet>
      <Layout>
        <div className="container py-12 px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Все <span className="gradient-text">предметы</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Выбери интересующую тебя область и проверь свои знания
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
      </Layout>
    </>
  );
};

export default Subjects;
