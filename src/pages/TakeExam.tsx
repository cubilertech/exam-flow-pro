
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { answerQuestion, submitTestResult } from '@/features/study/studySlice';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';

const TakeExam = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentTestQuestions, currentExam, currentTestStartTime, answeredQuestions } = 
    useAppSelector((state) => state.study);
  const { user } = useAppSelector((state) => state.auth);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no test questions or no current exam are loaded
  useEffect(() => {
    console.log("TakeExam page loaded with:", { 
      questionsCount: currentTestQuestions.length,
      currentExam,
      startTime: currentTestStartTime 
    });
    
    if (!currentTestQuestions || currentTestQuestions.length === 0 || !currentExam) {
      console.log("No questions or exam data found, redirecting to /my-exams");
      toast.error("No exam in progress. Please start or continue an exam first.");
      navigate('/my-exams');
    }
  }, [currentTestQuestions, currentExam, navigate, currentTestStartTime]);

  // Calculate remaining time if test is timed
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  
  useEffect(() => {
    let timer: number | undefined;
    
    if (currentExam?.isTimed && currentExam?.timeLimit && currentTestStartTime) {
      // Calculate time based on time limit type
      let totalSeconds;
      if (currentExam.timeLimitType === 'total_seconds') {
        totalSeconds = currentExam.timeLimit;
      } else {
        // Default to seconds_per_question
        totalSeconds = currentExam.timeLimit * currentTestQuestions.length;
      }
      
      const updateTime = () => {
        const startTime = new Date(currentTestStartTime).getTime();
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, totalSeconds - elapsedSeconds);
        
        setRemainingTime(remaining);
        
        if (remaining <= 0) {
          clearInterval(timer);
          handleSubmitExam();
        }
      };
      
      updateTime();
      timer = window.setInterval(updateTime, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentExam, currentTestStartTime, currentTestQuestions]);

  // Load any previously saved answers
  useEffect(() => {
    const savedAnswers: Record<string, string[]> = {};
    
    answeredQuestions.forEach((answer) => {
      if (currentTestQuestions.some(q => q.id === answer.questionId)) {
        savedAnswers[answer.questionId] = answer.selectedOptions;
      }
    });
    
    setSelectedOptions(savedAnswers);
  }, [answeredQuestions, currentTestQuestions]);

  const currentQuestion = currentTestQuestions[currentQuestionIndex];

  const handleOptionSelect = (questionId: string, options: string[]) => {
    console.log("Option selected:", { questionId, options });
    setSelectedOptions({
      ...selectedOptions,
      [questionId]: options,
    });

    // Determine if the answer is correct
    const question = currentTestQuestions.find(q => q.id === questionId);
    if (!question) return;

    const correctOptionIds = question.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt.id);

    const isCorrect = 
      options.length === correctOptionIds.length &&
      options.every(optId => correctOptionIds.includes(optId));

    // Save the answer to redux
    dispatch(answerQuestion({
      questionId,
      selectedOptions: options,
      isCorrect,
      answeredAt: new Date().toISOString(),
    }));
  };

  const handleSubmitExam = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!user?.id || !currentExam) {
        toast.error("User or exam data missing");
        return;
      }

      const startTime = currentTestStartTime ? new Date(currentTestStartTime) : new Date();
      const endTime = new Date();
      const timeTakenSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      
      // Create a results summary
      const answers = currentTestQuestions.map(question => {
        const selected = selectedOptions[question.id] || [];
        const correctOptionIds = question.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.id);
          
        const isCorrect = 
          selected.length === correctOptionIds.length &&
          selected.every(optId => correctOptionIds.includes(optId));
          
        return {
          questionId: question.id,
          selectedOptions: selected,
          isCorrect,
        };
      });
      
      const correctCount = answers.filter(a => a.isCorrect).length;
      const incorrectCount = answers.length - correctCount;
      const score = Math.round((correctCount / answers.length) * 100);

      const resultId = uuidv4();
      
      // Store result in database
      const { error: resultError } = await supabase
        .from('exam_results')
        .insert({
          id: resultId,
          user_exam_id: currentExam.id,
          user_id: user.id,
          completed_at: endTime.toISOString(),
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          score: score,
          time_taken: timeTakenSeconds,
          answers: answers,
        });
        
      if (resultError) {
        console.error('Error saving exam results:', resultError);
        throw new Error(resultError.message);
      }
      
      // Update exam to completed
      const { error: updateError } = await supabase
        .from('user_exams')
        .update({ completed: true })
        .eq('id', currentExam.id);
        
      if (updateError) {
        console.error('Error updating exam status:', updateError);
        throw new Error(updateError.message);
      }

      // Update Redux
      dispatch(submitTestResult({
        id: resultId,
        examId: currentExam.id,
        examName: currentExam.name,
        testDate: startTime.toISOString(),
        categoryIds: currentExam.categoryIds,
        questionCount: currentTestQuestions.length,
        correctCount,
        incorrectCount,
        score,
        timeTaken: timeTakenSeconds,
        answers: answers.map(a => ({
          ...a,
          answeredAt: endTime.toISOString(),
        })),
        timeStarted: startTime.toISOString(),
        timeCompleted: endTime.toISOString(),
      }));

      toast.success("Exam completed!");
      navigate(`/exam-results/${resultId}`);
      
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast.error(`Error submitting exam: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentQuestion) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading exam...</p>
      </div>
    );
  }

  const isAnswered = selectedOptions[currentQuestion.id]?.length > 0;
  const isLastQuestion = currentQuestionIndex === currentTestQuestions.length - 1;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{currentExam?.name || 'Exam'}</h1>
        
        <div className="flex items-center space-x-4">
          {remainingTime !== null && (
            <div className="text-lg font-semibold">
              Time: {formatTime(remainingTime)}
            </div>
          )}
          
          <div className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {currentTestQuestions.length}
          </div>
        </div>
      </div>
      
      <QuestionCard
        question={currentQuestion}
        showAnswers={false}
        onAnswerSelect={handleOptionSelect}
        selectedOptions={selectedOptions[currentQuestion.id] || []}
        isAnswered={false}
        isTestMode={true}
      />
      
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <div className="space-x-2">
          {isLastQuestion ? (
            <Button 
              onClick={handleSubmitExam}
              disabled={isSubmitting}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Submit Exam
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(currentTestQuestions.length - 1, prev + 1))}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
