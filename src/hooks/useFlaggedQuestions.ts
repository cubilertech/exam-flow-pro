import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/lib/hooks';
import { toast } from 'sonner';

interface FlaggedQuestion {
  id: string;
  question_id: string;
  created_at: string;
  questions: {
    id: string;
    text: string;
    serial_number: string;
    difficulty: string;
  };
}

export const useFlaggedQuestions = () => {
  const [flaggedQuestions, setFlaggedQuestions] = useState<FlaggedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);

  const fetchFlaggedQuestions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('flagged_questions')
        .select(`
          id,
          question_id,
          created_at,
          questions (
            id,
            text,
            serial_number,
            difficulty
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlaggedQuestions(data || []);
    } catch (error) {
      console.error('Error fetching flagged questions:', error);
      toast.error('Failed to fetch flagged questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedQuestions();
  }, [user]);

  return { flaggedQuestions, loading, refetch: fetchFlaggedQuestions };
};