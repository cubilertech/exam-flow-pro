
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

  const fetchSubscribedQuestionBanks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('question_banks(*)')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const activeQuestionBanks = data?.map(item => item.question_banks) || [];
      setSubscriptions(activeQuestionBanks);

      // Set the first subscribed question bank as active by default
      if (activeQuestionBanks.length > 0) {
        dispatch(setActiveQuestionBank(activeQuestionBanks[0].id));
      }
    } catch (error) {
      toast.error('Failed to fetch subscribed question banks');
      console.error(error);
    }
  };

  const subscribeToQuestionBank = async (questionBankId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          question_bank_id: questionBankId,
          is_active: true
        });

      if (error) throw error;

      // Refresh subscriptions
      await fetchSubscribedQuestionBanks();
      toast.success('Successfully subscribed to question bank');
    } catch (error) {
      toast.error('Failed to subscribe to question bank');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSubscribedQuestionBanks();
  }, [user]);

  return { 
    subscriptions, 
    subscribeToQuestionBank,
    activeQuestionBankId: useAppSelector(state => state.questions.activeQuestionBankId)
  };
};
