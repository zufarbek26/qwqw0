import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SUBJECTS } from '@/lib/constants';

export const useStats = () => {
  const [testsCount, setTestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count, error } = await supabase
          .from('tests')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true);

        if (error) throw error;
        setTestsCount(count || 0);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { 
    testsCount, 
    subjectsCount: SUBJECTS.length,
    loading 
  };
};
