import { useMemo } from 'react';
import { useExamResults } from './useExamResults';
import { useFlaggedQuestions } from './useFlaggedQuestions';
import { useQuestionBankSubscriptions } from './useQuestionBankSubscriptions';
import { useCaseStudySubscriptions } from './useCaseStudySubscriptions';

export const useDashboardStats = () => {
  const { examResults, loading: examResultsLoading } = useExamResults();
  const { flaggedQuestions, loading: flaggedLoading } = useFlaggedQuestions();
  const { subscriptions: questionBanks } = useQuestionBankSubscriptions();
  const { subscriptions: caseStudyExams } = useCaseStudySubscriptions();

  const stats = useMemo(() => {
    const averageScore = examResults.length > 0 
      ? examResults.reduce((acc, result) => acc + result.score, 0) / examResults.length
      : 0;

    return {
      totalQuestionBanks: questionBanks.length,
      totalCaseStudyExams: caseStudyExams.length,
      testsCompleted: examResults.length,
      averageScore: Math.round(averageScore * 100),
      flaggedQuestionsCount: flaggedQuestions.length,
      recentExamResults: examResults.slice(0, 5),
      recentFlaggedQuestions: flaggedQuestions.slice(0, 5)
    };
  }, [examResults, flaggedQuestions, questionBanks, caseStudyExams]);

  const loading = examResultsLoading || flaggedLoading;

  return { stats, loading };
};