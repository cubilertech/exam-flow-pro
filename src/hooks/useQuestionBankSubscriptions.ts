
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setActiveQuestionBank } from '@/features/questions/questionsSlice';
import { QuestionBank } from '@/features/questions/questionsSlice';
import { toast } from 'sonner';

export const useQuestionBankSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<QuestionBank[]>([]);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const activeQuestionBankId = useAppSelector(state => state.questions.activeQuestionBankId);

  const fetchSubscribedQuestionBanks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('question_banks(*)')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const activeQuestionBanks = data?.map(item => {
        return {
          id: item.question_banks.id,
          name: item.question_banks.name,
          description: item.question_banks.description,
          question_bank_id: item.question_banks.id
        };
      }) || [];
      
      setSubscriptions(activeQuestionBanks);

      // Set the first subscribed question bank as active by default
      if (activeQuestionBanks.length > 0 && !activeQuestionBankId) {
        dispatch(setActiveQuestionBank(activeQuestionBanks[0].id));
      }
    } catch (error) {
      console.error('Error fetching subscribed question banks:', error);
      toast.error('Failed to fetch subscribed question banks');
    }
  };

  const setActiveQuestionBankById = async (questionBankId: string) => {
    if (!user) return;

    try {
      dispatch(setActiveQuestionBank(questionBankId));
      toast.success('Question bank activated');
    } catch (error) {
      toast.error('Failed to set active question bank');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSubscribedQuestionBanks();
  }, [user]);

  return { 
    subscriptions, 
    setActiveQuestionBankById,
    activeQuestionBankId
  };
};
