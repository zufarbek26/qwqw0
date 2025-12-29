import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SUBJECTS } from '@/lib/constants';

type SubjectId = typeof SUBJECTS[number]['id'];

export const useTestsCount = () => {
  const [counts, setCounts] = useState<Record<SubjectId, number>>({} as Record<SubjectId, number>);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('tests')
          .select('subject')
          .eq('is_published', true);

        if (error) throw error;

        // Count tests per subject
        const subjectCounts: Record<string, number> = {};
        SUBJECTS.forEach(s => {
          subjectCounts[s.id] = 0;
        });

        data?.forEach(test => {
          if (subjectCounts[test.subject] !== undefined) {
            subjectCounts[test.subject]++;
          }
        });

        setCounts(subjectCounts as Record<SubjectId, number>);
      } catch (error) {
        console.error('Error fetching test counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return { counts, loading };
};
