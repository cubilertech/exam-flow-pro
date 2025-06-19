
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCaseQuestions } from '@/hooks/useCases';
import { supabase } from '@/integrations/supabase/client';
import { Case } from '@/types/cases';
import { toast } from 'sonner';

const CaseDetail = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const {
    questions,
    progress,
    userAnswers,
    loading,
    fetchCaseQuestions,
    fetchCaseProgress,
    fetchUserAnswers,
    updateProgress,
    saveAnswer,
  } = useCaseQuestions();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (caseId) {
      fetchCaseData();
      fetchCaseQuestions(caseId);
      fetchCaseProgress(caseId);
    }
  }, [caseId]);

  useEffect(() => {
    if (questions.length > 0 && caseId) {
      fetchUserAnswers(caseId);
    }
  }, [questions, caseId]);

  useEffect(() => {
    if (progress) {
      setCurrentQuestionIndex(progress.current_question_index);
      if (progress.current_question_index > 0) {
        setShowInstructions(false);
      }
    }
  }, [progress]);

  useEffect(() => {
    // Load existing answer for current question
    if (questions[currentQuestionIndex]) {
      const existingAnswer = userAnswers.find(
        answer => answer.case_question_id === questions[currentQuestionIndex].id
      );
      setCurrentAnswer(existingAnswer?.user_answer || '');
      setShowCorrectAnswer(!!existingAnswer);
    }
  }, [currentQuestionIndex, questions, userAnswers]);

  const fetchCaseData = async () => {
    if (!caseId) return;
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (error) throw error;
      setCaseData(data);
    } catch (error) {
      console.error('Error fetching case:', error);
      toast.error('Failed to load case');
    }
  };

  const handleStartQuestions = () => {
    setShowInstructions(false);
    updateProgress(caseId!, 0);
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error('Please provide an answer before proceeding');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    await saveAnswer(currentQuestion.id, currentAnswer);
    setShowCorrectAnswer(true);
  };

  const handleNextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;
    const isLastQuestion = nextIndex >= questions.length;
    
    await updateProgress(caseId!, nextIndex, isLastQuestion);
    
    if (isLastQuestion) {
      toast.success('Case completed!');
      navigate(-1);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setShowCorrectAnswer(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowCorrectAnswer(false);
    }
  };

  if (loading || !caseData) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading case...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (showInstructions) {
    return (
      <div className="container py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cases
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{caseData.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Case Scenario</h3>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{caseData.scenario}</p>
              </div>
            </div>

            {caseData.instructions && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Instructions</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{caseData.instructions}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4">
              <Badge variant="outline">
                {questions.length} Questions
              </Badge>
              <Button onClick={handleStartQuestions}>
                Start Questions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cases
        </Button>
        
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{caseData.title}</h1>
          <Badge variant="outline">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </div>

        <Progress value={progressPercentage} className="w-full" />
      </div>

      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{currentQuestion.question_text}</p>
            </div>

            <div className="space-y-4">
              <Textarea
                placeholder="Type your answer here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={4}
                disabled={showCorrectAnswer}
              />

              {showCorrectAnswer && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Correct Answer:</h4>
                  <p className="text-green-700 whitespace-pre-wrap">
                    {currentQuestion.correct_answer}
                  </p>
                  {currentQuestion.explanation && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <h5 className="font-semibold text-green-800 mb-1">Explanation:</h5>
                      <p className="text-green-700 whitespace-pre-wrap">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-2">
                {!showCorrectAnswer ? (
                  <Button onClick={handleSubmitAnswer} disabled={!currentAnswer.trim()}>
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    {currentQuestionIndex === questions.length - 1 ? 'Complete Case' : 'Next Question'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CaseDetail;
