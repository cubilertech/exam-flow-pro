
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/lib/hooks';
import { Subject, Case, CaseQuestion, UserCaseProgress, UserCaseAnswer } from '@/types/cases';
import { toast } from 'sonner';

export const useCases = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubjects = async (examId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('exam_id', examId)
        .order('order_index');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async (subjectId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index');

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  return {
    subjects,
    cases,
    loading,
    fetchSubjects,
    fetchCases,
  };
};

export const useCaseQuestions = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [questions, setQuestions] = useState<CaseQuestion[]>([]);
  const [progress, setProgress] = useState<UserCaseProgress | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserCaseAnswer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCaseQuestions = async (caseId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('case_questions')
        .select('*')
        .eq('case_id', caseId)
        .order('order_index');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching case questions:', error);
      toast.error('Failed to fetch case questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCaseProgress = async (caseId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_case_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('case_id', caseId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProgress(data);
    } catch (error) {
      console.error('Error fetching case progress:', error);
    }
  };

  const fetchUserAnswers = async (caseId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_case_answers')
        .select('*')
        .eq('user_id', user.id)
        .in('case_question_id', questions.map(q => q.id));

      if (error) throw error;
      setUserAnswers(data || []);
    } catch (error) {
      console.error('Error fetching user answers:', error);
    }
  };

  const updateProgress = async (caseId: string, questionIndex: number, completed = false) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('user_case_progress')
        .upsert({
          user_id: user.id,
          case_id: caseId,
          current_question_index: questionIndex,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        });

      if (error) throw error;
      await fetchCaseProgress(caseId);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to save progress');
    }
  };

  const saveAnswer = async (questionId: string, answer: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('user_case_answers')
        .upsert({
          user_id: user.id,
          case_question_id: questionId,
          user_answer: answer,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving answer:', error);
      toast.error('Failed to save answer');
    }
  };

  return {
    questions,
    progress,
    userAnswers,
    loading,
    fetchCaseQuestions,
    fetchCaseProgress,
    fetchUserAnswers,
    updateProgress,
    saveAnswer,
  };
};
