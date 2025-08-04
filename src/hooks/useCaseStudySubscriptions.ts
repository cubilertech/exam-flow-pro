
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
  const [subscribedExamIds, setSubscribedExamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);

  const fetchSubscribedCaseStudyExams = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // First get subscription IDs for case studies
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('exams_case_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .not('exams_case_id', 'is', null);

      if (subscriptionError) throw subscriptionError;

      const examIds = subscriptionData?.map((sub: any) => sub.exams_case_id).filter(Boolean) || [];

      if (examIds.length === 0) {
        setSubscriptions([]);
        setSubscribedExamIds([]);
        return;
      }

      // Then get the actual exam details
      const { data: examData, error: examError } = await supabase
        .from('exams_case')
        .select('id, title, description')
        .in('id', examIds)
        .eq('is_deleted_exam', false);

      if (examError) throw examError;

      const activeCaseStudyExams = examData || [];

      // console.log('activeCaseStudyExams: ', activeCaseStudyExams);
      
      setSubscriptions(activeCaseStudyExams);
      setSubscribedExamIds(examIds);
    } catch (error) {
      console.error('Error fetching subscribed case study exams:', error);
      toast.error('Failed to fetch subscribed case study exams');
    } finally {
      setLoading(false);
    }
  };

  const hasAccessToExam = (examId: string): boolean => {
    return subscribedExamIds.includes(examId);
  };

  useEffect(() => {
    fetchSubscribedCaseStudyExams();
  }, []);

  return { 
    subscriptions, 
    subscribedExamIds,
    loading,
    hasAccessToExam,
    refetch: fetchSubscribedCaseStudyExams
  };
};
