
import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  ArrowRight, 
  Flag, 
  BookOpen, 
  Timer, 
  AlertTriangle
} from 'lucide-react';
import { 
  answerQuestion, 
  submitTestResult, 
  toggleFlagQuestion, 
  addNote,
  AnsweredQuestion
} from '@/features/study/studySlice';
import { toast } from 'sonner';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { supabase } from '@/integrations/supabase/client';

const TakeExam = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { 
    currentTestQuestions, 
    currentStudyMode, 
    answeredQuestions,
    notes,
    flaggedQuestions,
    currentTestStartTime,
    currentExamId,
    currentExamName
  } = useAppSelector((state) => state.study);
  
  const { user } = useAppSelector((state) => state.auth);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [noteText, setNoteText] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [examDuration, setExamDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize selected answers from previously saved answers
  useEffect(() => {
    if (answeredQuestions.length > 0 && currentTestQuestions?.length > 0) {
      const savedAnswers: Record<string, string[]> = {};
      answeredQuestions.forEach(answer => {
        if (currentTestQuestions.some(q => q.id === answer.questionId)) {
          savedAnswers[answer.questionId] = answer.selectedOptions;
        }
      });
      setSelectedAnswers(savedAnswers);
    }
  }, [answeredQuestions, currentTestQuestions]);

  // Load existing note for current question
  useEffect(() => {
    if (currentTestQuestions?.length && currentQuestionIndex >= 0) {
      const currentQId = currentTestQuestions[currentQuestionIndex]?.id;
      const existingNote = notes.find(note => note.questionId === currentQId);
      setNoteText(existingNote?.note || "");
    }
  }, [currentQuestionIndex, currentTestQuestions, notes]);

  // Update timer
  useEffect(() => {
    if (currentTestStartTime) {
      const interval = setInterval(() => {
        const startTime = new Date(currentTestStartTime).getTime();
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        setExamDuration(elapsedSeconds);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [currentTestStartTime]);

  // Redirect if not in test mode or no questions
  useEffect(() => {
    if (!currentTestQuestions || currentTestQuestions.length === 0 || !currentStudyMode) {
      navigate('/my-exams');
    }
  }, [currentTestQuestions, currentStudyMode, navigate]);

  if (!currentTestQuestions || currentTestQuestions.length === 0) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const currentQuestion = currentTestQuestions[currentQuestionIndex];
  const totalQuestions = currentTestQuestions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const questionAnswered = selectedAnswers[currentQuestion.id]?.length > 0;
  const isFlagged = flaggedQuestions.some(q => q.questionId === currentQuestion.id);
  
  // Check if question has multiple correct answers
  const isMultipleChoice = currentQuestion.options.filter(o => o.isCorrect).length > 1;

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionId: string) => {
    if (isMultipleChoice) {
      // For multiple choice questions
      const currentSelectedOptions = selectedAnswers[currentQuestion.id] || [];
      const isSelected = currentSelectedOptions.includes(optionId);
      
      if (isSelected) {
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQuestion.id]: currentSelectedOptions.filter(id => id !== optionId)
        });
      } else {
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQuestion.id]: [...currentSelectedOptions, optionId]
        });
      }
    } else {
      // For single choice questions
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion.id]: [optionId]
      });
    }
  };

  const saveCurrentAnswer = () => {
    if (currentQuestion && selectedAnswers[currentQuestion.id]?.length > 0) {
      const selectedOptionIds = selectedAnswers[currentQuestion.id];
      const correctOptionIds = currentQuestion.options
        .filter(option => option.isCorrect)
        .map(option => option.id);
      
      // For single choice, exact match required
      // For multiple choice, all correct answers must be selected and no incorrect ones
      const isCorrect = isMultipleChoice
        ? selectedOptionIds.length === correctOptionIds.length && 
          selectedOptionIds.every(id => correctOptionIds.includes(id))
        : selectedOptionIds[0] === correctOptionIds[0];
      
      const answer: AnsweredQuestion = {
        questionId: currentQuestion.id,
        selectedOptions: selectedOptionIds,
        isCorrect,
        answeredAt: new Date().toISOString()
      };
      
      dispatch(answerQuestion(answer));
    }
  };

  const handlePrevQuestion = () => {
    if (!isFirstQuestion) {
      saveCurrentAnswer();
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
    }
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      saveCurrentAnswer();
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    }
  };

  const handleSaveNote = () => {
    if (noteText.trim()) {
      dispatch(
        addNote({
          questionId: currentQuestion.id,
          note: noteText,
          updatedAt: new Date().toISOString(),
        })
      );
      toast.success("Note saved successfully");
    }
  };

  const handleFlagQuestion = () => {
    dispatch(toggleFlagQuestion(currentQuestion.id));
  };

  const getCompletedQuestionCount = () => {
    return Object.keys(selectedAnswers).length;
  };

  const handleFinishExam = () => {
    saveCurrentAnswer();
    setShowSummaryDialog(true);
  };

  const confirmFinishExam = async () => {
    if (!user?.id || !currentExamId) {
      toast.error('You must be logged in to submit an exam');
      return;
    }

    try {
      setIsSaving(true);
      
      // Calculate results
      const allAnswers = Object.keys(selectedAnswers).map(questionId => {
        const question = currentTestQuestions.find(q => q.id === questionId);
        const selectedOptionIds = selectedAnswers[questionId] || [];
        const correctOptionIds = question?.options
          .filter(option => option.isCorrect)
          .map(option => option.id) || [];
        
        // Calculate if answer is correct
        const isCorrect = question?.options.filter(o => o.isCorrect).length > 1
          ? selectedOptionIds.length === correctOptionIds.length && 
            selectedOptionIds.every(id => correctOptionIds.includes(id))
          : selectedOptionIds[0] === correctOptionIds[0];
        
        return {
          questionId,
          selectedOptions: selectedOptionIds,
          isCorrect,
          answeredAt: new Date().toISOString()
        };
      });
      
      const correctCount = allAnswers.filter(answer => answer.isCorrect).length;
      const scorePercentage = (correctCount / currentTestQuestions.length) * 100;
      
      // Get unique category IDs from questions
      const categoryIds = Array.from(new Set(currentTestQuestions.map(q => q.categoryId)));
      
      // Update the exam status to completed in the database
      const { error: examUpdateError } = await supabase
        .from('user_exams')
        .update({ completed: true })
        .eq('id', currentExamId);
        
      if (examUpdateError) throw examUpdateError;
      
      // Save the exam result to the database
      const { data: resultData, error: resultError } = await supabase
        .from('exam_results')
        .insert({
          user_exam_id: currentExamId,
          user_id: user.id,
          correct_count: correctCount,
          incorrect_count: currentTestQuestions.length - correctCount,
          score: Math.round(scorePercentage),
          time_taken: examDuration,
          answers: allAnswers,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (resultError) throw resultError;
      
      // Submit test results to the state
      const result = {
        id: resultData.id,
        testDate: new Date().toISOString(),
        categoryIds,
        questionCount: currentTestQuestions.length,
        correctCount,
        incorrectCount: currentTestQuestions.length - correctCount,
        score: Math.round(scorePercentage),
        timeTaken: examDuration,
        answers: allAnswers,
        timeStarted: currentTestStartTime || new Date().toISOString(),
        timeCompleted: new Date().toISOString(),
        examId: currentExamId,
        examName: currentExamName || 'Exam'
      };
      
      dispatch(submitTestResult(result));
      setShowSummaryDialog(false);
      
      // Update the user_answers table to help with difficulty calculation
      for (const answer of allAnswers) {
        await supabase
          .from('user_answers')
          .insert({
            question_id: answer.questionId,
            user_id: user.id,
            is_correct: answer.isCorrect
          });
      }
      
      // Navigate to results page
      navigate(`/exam-results/${result.id}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Failed to submit exam. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </h1>
          <Badge variant={isFlagged ? "secondary" : "outline"} 
            className="cursor-pointer hover:bg-secondary" 
            onClick={handleFlagQuestion}>
            <Flag className={`h-3 w-3 mr-1 ${isFlagged ? "text-amber-500" : ""}`} />
            {isFlagged ? "Flagged" : "Flag"}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-2 py-1">
            <Timer className="h-4 w-4 mr-1.5" />
            {formatTime(examDuration)}
          </Badge>
          <Button onClick={handleFinishExam} variant="default">
            Finish Exam
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <Progress value={(getCompletedQuestionCount() / totalQuestions) * 100} className="h-2" />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>Completed: {getCompletedQuestionCount()}/{totalQuestions}</span>
          <span>{Math.round((getCompletedQuestionCount() / totalQuestions) * 100)}%</span>
        </div>
      </div>

      <QuestionCard
        question={currentQuestion}
        showAnswers={false}
        onAnswerSelect={(_, selectedOpts) => {
          setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestion.id]: selectedOpts
          });
        }}
        selectedOptions={selectedAnswers[currentQuestion.id] || []}
        isAnswered={questionAnswered}
        isTestMode={true}
      />

      <div className="mt-6">
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="notes">My Notes</TabsTrigger>
            <TabsTrigger value="explanation" onClick={() => setShowExplanation(true)}>
              Explanation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notes" className="space-y-2 mt-2">
            <Textarea
              placeholder="Add your notes for this question here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[100px]"
            />
            <Button onClick={handleSaveNote} size="sm">
              Save Note
            </Button>
          </TabsContent>
          
          <TabsContent value="explanation" className="mt-2">
            {showExplanation ? (
              <div className="p-4 border rounded-md bg-muted/30">
                <div className="flex items-center mb-2">
                  <BookOpen className="h-4 w-4 mr-2 text-primary" />
                  <h3 className="font-medium">Explanation</h3>
                </div>
                <p className="text-sm">{currentQuestion.explanation || "No explanation available."}</p>
              </div>
            ) : (
              <div className="p-4 border rounded-md bg-muted/30">
                <div className="flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                  <p className="text-sm text-muted-foreground">
                    Viewing the explanation will mark this as a study question rather than a test question.
                  </p>
                </div>
                <div className="flex justify-center mt-3">
                  <Button 
                    variant="outline"
                    className="text-sm"
                    onClick={() => setShowExplanation(true)}
                  >
                    Show Explanation Anyway
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-between mt-6">
        <Button 
          onClick={handlePrevQuestion} 
          disabled={isFirstQuestion}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>
        
        {isLastQuestion ? (
          <Button onClick={handleFinishExam} variant="default">
            Finish Exam
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            Next
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
      
      {/* Exam Summary Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to finish and submit this exam?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Total Questions:</span>
                <span className="font-medium">{totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Answered:</span>
                <span className="font-medium">{getCompletedQuestionCount()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Unanswered:</span>
                <span className="font-medium">{totalQuestions - getCompletedQuestionCount()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Time taken:</span>
                <span className="font-medium">{formatTime(examDuration)}</span>
              </div>
              
              {totalQuestions - getCompletedQuestionCount() > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    You have {totalQuestions - getCompletedQuestionCount()} unanswered questions. Unanswered questions will be marked as incorrect.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setShowSummaryDialog(false)}>
              Continue Exam
            </Button>
            <Button onClick={confirmFinishExam} disabled={isSaving}>
              {isSaving ? "Submitting..." : "Submit Exam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TakeExam;
