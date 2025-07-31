import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/lib/hooks';
import { toast } from 'sonner';

interface ExamResult {
  id: string;
  score: number;
  correct_count: number;
  incorrect_count: number;
  time_taken: number;
  completed_at: string;
  user_exam_id: string;
  exam_name?: string;
  question_bank_name?: string;
}

export const useExamResults = () => {
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);

  const fetchExamResults = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          *,
          user_exams!inner(
            name,
            question_banks!inner(name)
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedResults = (data || []).map(result => ({
        ...result,
        exam_name: result.user_exams?.name,
        question_bank_name: result.user_exams?.question_banks?.name
      }));
      
      setExamResults(formattedResults);
    } catch (error) {
      console.error('Error fetching exam results:', error);
      toast.error('Failed to fetch exam results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamResults();
  }, [user]);

  return { examResults, loading, refetch: fetchExamResults };
};