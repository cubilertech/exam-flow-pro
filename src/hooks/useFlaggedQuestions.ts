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
    explanation?: string;
    image_url?: string;
    question_options: {
      id: string;
      text: string;
      is_correct: boolean;
    }[];
  };
}

export const useFlaggedQuestions = () => {
  const [flaggedQuestions, setFlaggedQuestions] = useState<FlaggedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
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
            difficulty,
            explanation,
            image_url,
            question_options (
              id,
              text,
              is_correct
            )
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

  const unflagQuestion = async (questionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('flagged_questions')
        .delete()
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;
      
      // Remove from local state
      setFlaggedQuestions(prev => prev.filter(fq => fq.question_id !== questionId));
      toast.success('Question unflagged successfully');
    } catch (error) {
      console.error('Error unflagging question:', error);
      toast.error('Failed to unflag question');
    }
  };

  const filteredQuestions = flaggedQuestions.filter(fq => {
    const matchesSearch = fq.questions.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fq.questions.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || fq.questions.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  useEffect(() => {
    fetchFlaggedQuestions();
  }, [user]);

  return { 
    flaggedQuestions: filteredQuestions, 
    allFlaggedQuestions: flaggedQuestions,
    loading, 
    searchTerm,
    setSearchTerm,
    difficultyFilter,
    setDifficultyFilter,
    unflagQuestion,
    refetch: fetchFlaggedQuestions 
  };
};