
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/lib/hooks';
import { toast } from 'sonner';

interface CaseStudyExam {
  id: string;
  title: string;
  description: string | null;
}

export const useCaseStudySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<CaseStudyExam[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);

  const fetchSubscribedCaseStudyExams = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('exams_case(*)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .not('exams_case_id', 'is', null);

      if (error) throw error;

      const activeCaseStudyExams = data?.map(item => ({
        id: item.exams_case.id,
        title: item.exams_case.title,
        description: item.exams_case.description,
      })) || [];
      
      setSubscriptions(activeCaseStudyExams);
    } catch (error) {
      console.error('Error fetching subscribed case study exams:', error);
      toast.error('Failed to fetch subscribed case study exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribedCaseStudyExams();
  }, [user]);

  return { 
    subscriptions, 
    loading,
    refetch: fetchSubscribedCaseStudyExams
  };
};
