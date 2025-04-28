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
  const [noteIsSaving, setNoteIsSaving] = useState(false);
  const [examDetails, setExamDetails] = useState<any>(null);
  const [isFlagging, setIsFlagging] = useState(false);

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

  useEffect(() => {
    if (currentExamId) {
      const fetchExamDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('user_exams')
            .select('*')
            .eq('id', currentExamId)
            .single();
            
          if (error) throw error;
          
          setExamDetails(data);
        } catch (error) {
          console.error('Error fetching exam details:', error);
        }
      };
      
      fetchExamDetails();
    }
  }, [currentExamId]);

  useEffect(() => {
    if (currentTestQuestions?.length && currentQuestionIndex >= 0 && user?.id) {
      const currentQId = currentTestQuestions[currentQuestionIndex]?.id;
      
      const existingLocalNote = notes.find(note => note.questionId === currentQId);
      if (existingLocalNote) {
        setNoteText(existingLocalNote.note || "");
      } else {
        const fetchNote = async () => {
          try {
            const { data, error } = await supabase
              .from('user_notes')
              .select('note')
              .eq('question_id', currentQId)
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (error) throw error;
            
            if (data) {
              setNoteText(data.note);
              dispatch(addNote({
                questionId: currentQId,
                note: data.note,
                updatedAt: new Date().toISOString(),
              }));
            } else {
              setNoteText("");
            }
          } catch (error) {
            console.error('Error fetching note:', error);
          }
        };
        
        fetchNote();
      }
      
      const checkFlaggedStatus = async () => {
        try {
          const { data, error } = await supabase
            .from('flagged_questions')
            .select('id')
            .eq('question_id', currentQId)
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (error) throw error;
          
          const isLocallyFlagged = flaggedQuestions.some(q => q.questionId === currentQId);
          if (data && !isLocallyFlagged) {
            dispatch(toggleFlagQuestion(currentQId));
          } else if (!data && isLocallyFlagged) {
            await supabase
              .from('flagged_questions')
              .insert({
                question_id: currentQId,
                user_id: user.id
              });
          }
        } catch (error) {
          console.error('Error checking flagged status:', error);
        }
      };
      
      checkFlaggedStatus();
    }
  }, [currentQuestionIndex, currentTestQuestions, notes, user, dispatch, flaggedQuestions]);

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

  useEffect(() => {
    if (!currentTestQuestions || currentTestQuestions.length === 0 || !currentStudyMode) {
      navigate('/my-exams');
    }
  }, [currentTestQuestions, currentStudyMode, navigate]);

  useEffect(() => {
    if (examDetails && examDetails.is_timed && examDetails.time_limit && currentTestStartTime) {
      const checkTimeLimit = () => {
        const startTime = new Date(currentTestStartTime).getTime();
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        
        let timeLimit;
        if (examDetails.time_limit_type === 'total_time') {
          timeLimit = examDetails.time_limit;
        } else {
          timeLimit = examDetails.time_limit * currentTestQuestions.length;
        }
        
        if (elapsedSeconds >= timeLimit) {
          toast.error("Time's up! Submitting your exam.");
          confirmFinishExam();
        }
      };
      
      const timer = setInterval(checkTimeLimit, 5000);
      return () => clearInterval(timer);
    }
  }, [examDetails, currentTestStartTime, currentTestQuestions]);

  if (!currentTestQuestions || currentTestQuestions.length === 0) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const currentQuestion = currentTestQuestions[currentQuestionIndex];
  const totalQuestions = currentTestQuestions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const questionAnswered = selectedAnswers[currentQuestion.id]?.length > 0;
  const isFlagged = flaggedQuestions.some(q => q.questionId === currentQuestion.id);
  
  const isMultipleChoice = currentQuestion.options.filter(o => o.isCorrect).length > 1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = () => {
    if (!examDetails || !examDetails.is_timed || !examDetails.time_limit) {
      return null;
    }
    
    let totalTimeLimit;
    if (examDetails.time_limit_type === 'total_time') {
      totalTimeLimit = examDetails.time_limit;
    } else {
      totalTimeLimit = examDetails.time_limit * currentTestQuestions.length;
    }
    
    const remainingSeconds = Math.max(0, totalTimeLimit - examDuration);
    return formatTime(remainingSeconds);
  };

  const handleSelectAnswer = (optionId: string) => {
    if (isMultipleChoice) {
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

  const handleSaveNote = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to save notes');
      return;
    }
    
    try {
      setNoteIsSaving(true);
      
      dispatch(
        addNote({
          questionId: currentQuestion.id,
          note: noteText,
          updatedAt: new Date().toISOString(),
        })
      );
      
      if (noteText.trim()) {
        const { error } = await supabase
          .from('user_notes')
          .upsert({
            user_id: user.id,
            question_id: currentQuestion.id,
            note: noteText,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,question_id' });
          
        if (error) throw error;
        
        toast.success("Note saved successfully");
      } else {
        const { error } = await supabase
          .from('user_notes')
          .delete()
          .eq('user_id', user.id)
          .eq('question_id', currentQuestion.id);
          
        if (error) throw error;
        
        toast.success("Note cleared");
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setNoteIsSaving(false);
    }
  };

  const handleFlagQuestion = async (questionId: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to flag questions');
      return;
    }
    
    try {
      setIsFlagging(true);
      
      const isCurrentlyFlagged = flaggedQuestions.some(q => q.questionId === questionId);
      
      if (!isCurrentlyFlagged) {
        const { error } = await supabase
          .from('flagged_questions')
          .insert({
            user_id: user.id,
            question_id: questionId
          });
          
        if (error) throw error;
        
        dispatch(toggleFlagQuestion(questionId));
        toast.success('Question flagged for review');
      } else {
        const { error } = await supabase
          .from('flagged_questions')
          .delete()
          .eq('user_id', user.id)
          .eq('question_id', questionId);
          
        if (error) throw error;
        
        dispatch(toggleFlagQuestion(questionId));
        toast.success('Question unflagged');
      }
    } catch (error) {
      console.error('Error toggling flag:', error);
      toast.error('Failed to update flag status');
    } finally {
      setIsFlagging(false);
    }
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
      
      const allAnswers = Object.keys(selectedAnswers).map(questionId => {
        const question = currentTestQuestions.find(q => q.id === questionId);
        const selectedOptionIds = selectedAnswers[questionId] || [];
        const correctOptionIds = question?.options
          .filter(option => option.isCorrect)
          .map(option => option.id) || [];
        
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
      
      const categoryIds = Array.from(new Set(currentTestQuestions.map(q => q.categoryId)));
      
      const { error: examUpdateError } = await supabase
        .from('user_exams')
        .update({ completed: true })
        .eq('id', currentExamId);
        
      if (examUpdateError) throw examUpdateError;
      
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
      
      for (const answer of allAnswers) {
        await supabase
          .from('user_answers')
          .insert({
            question_id: answer.questionId,
            user_id: user.id,
            is_correct: answer.isCorrect
          });
      }
      
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
            onClick={() => handleFlagQuestion(currentQuestion.id)}>
            <Flag className={`h-3 w-3 mr-1 ${isFlagged ? "text-amber-500" : ""}`} />
            {isFlagged ? "Flagged" : "Flag"}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-2 py-1">
            <Timer className="h-4 w-4 mr-1.5" />
            {examDetails?.is_timed ? getRemainingTime() : formatTime(examDuration)}
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
        onFlagQuestion={handleFlagQuestion}
        isFlagged={flaggedQuestions.some(q => q.questionId === currentQuestion.id)}
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
            <Button onClick={handleSaveNote} size="sm" disabled={noteIsSaving}>
              {noteIsSaving ? "Saving..." : "Save Note"}
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
