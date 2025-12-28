import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { SubjectsGrid } from '@/components/home/SubjectsGrid';
import { FeaturesSection } from '@/components/home/FeaturesSection';

const Index: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>TestLix — Образовательная платформа с тестами</title>
        <meta 
          name="description" 
          content="Интерактивные тесты по программированию, математике и естественным наукам. Учись, соревнуйся и получай сертификаты." 
        />
      </Helmet>
      <Layout>
        <HeroSection />
        <SubjectsGrid />
        <FeaturesSection />
      </Layout>
    </>
  );
};

export default Index;
