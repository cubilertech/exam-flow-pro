
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

      const activeQuestionBanks = data?.map(item => item.question_banks) || [];
      setSubscriptions(activeQuestionBanks);

      // Set the first subscribed question bank as active by default
      if (activeQuestionBanks.length > 0 && !activeQuestionBankId) {
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

  const setActiveQuestionBankById = async (questionBankId: string) => {
    if (!user) return;

    try {
      // First, set all user's subscriptions to inactive
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Then set the selected one to active
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ is_active: true })
        .eq('user_id', user.id)
        .eq('question_bank_id', questionBankId);

      if (error) throw error;

      // Update Redux state
      dispatch(setActiveQuestionBank(questionBankId));
      
      // Refresh subscriptions
      await fetchSubscribedQuestionBanks();
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
    subscribeToQuestionBank,
    setActiveQuestionBankById,
    activeQuestionBankId
  };
};
