import React, { useEffect, useRef, useState } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Flag,
  StickyNote,
  Timer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { QuestionCard } from "@/components/questions/QuestionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  addNote,
  AnsweredQuestion,
  answerQuestion,
  submitTestResult,
  toggleFlagQuestion,
} from "@/features/study/studySlice";
import { supabase } from "@/integrations/supabase/client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

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
    currentExamName,
    currentExamType,
  } = useAppSelector((state) => state.study);

  const { user } = useAppSelector((state) => state.auth);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string[]>
  >({});
  const selectedAnswersRef = useRef<Record<string, string[]>>({});
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteIsSaving, setNoteIsSaving] = useState(false);
  const [examDuration, setExamDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [examDetails, setExamDetails] = useState<
    import("@/features/study/studySlice").ExamData | null
  >(null);
  const [isFlagging, setIsFlagging] = useState(false);

  useEffect(() => {
    if (answeredQuestions.length > 0 && currentTestQuestions?.length > 0) {
      const savedAnswers: Record<string, string[]> = {};
      answeredQuestions.forEach((answer) => {
        if (currentTestQuestions.some((q) => q.id === answer.questionId)) {
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
            .from("user_exams")
            .select("*")
            .eq("id", currentExamId)
            .single();

          if (error) throw error;

          setExamDetails({
            categoryIds: data.category_ids,
            difficultyLevels: data.difficulty_levels,
            questionCount: data.question_count,
            isTimed: data.is_timed,
            timeLimit: data.time_limit,
            timeLimitType: data.time_limit_type,
            examType: data.exam_type as "study" | "test",
            name: data.name,
            id: data.id,
          });
        } catch (error) {
          console.error("Error fetching exam details:", error);
        }
      };

      fetchExamDetails();
    }
  }, [currentExamId]);

  useEffect(() => {
    if (currentTestQuestions?.length && currentQuestionIndex >= 0 && user?.id) {
      const currentQId = currentTestQuestions[currentQuestionIndex]?.id;

      if (!currentQId) return;

      const existingLocalNote = notes.find(
        (note) => note.questionId === currentQId,
      );
      if (existingLocalNote) {
        setNoteText(existingLocalNote.note || "");
      } else {
        const fetchNote = async () => {
          try {
            const { data, error } = await supabase
              .from("user_notes")
              .select("note")
              .eq("question_id", currentQId)
              .eq("user_id", user.id)
              .maybeSingle();

            if (error) throw error;

            if (data) {
              setNoteText(data.note);
              dispatch(
                addNote({
                  questionId: currentQId,
                  note: data.note,
                  updatedAt: new Date().toISOString(),
                }),
              );
            } else {
              setNoteText("");
            }
          } catch (error) {
            console.error("Error fetching note:", error);
          }
        };

        fetchNote();
      }
    }
  }, [currentQuestionIndex, currentTestQuestions, notes, user, dispatch]);

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
    // Don't navigate away if we're currently submitting the exam
    if (isSaving) return;

    if (
      !currentTestQuestions ||
      currentTestQuestions.length === 0 ||
      !currentStudyMode
    ) {
      navigate("/my-exams");
    }
  }, [currentTestQuestions, currentStudyMode, navigate, isSaving]);

  useEffect(() => {
    if (
      examDetails &&
      examDetails.isTimed &&
      examDetails.timeLimit &&
      currentTestStartTime
    ) {
      const checkTimeLimit = () => {
        const startTime = new Date(currentTestStartTime).getTime();
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);

        let timeLimit;
        if (examDetails.timeLimitType === "total_time") {
          timeLimit = examDetails.timeLimit;
        } else {
          timeLimit = examDetails.timeLimit * currentTestQuestions.length;
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id || !currentTestQuestions?.length) return;

      try {
        const { data: flaggedData, error: flaggedError } = await supabase
          .from("flagged_questions")
          .select("question_id, created_at")
          .eq("user_id", user.id)
          .in(
            "question_id",
            currentTestQuestions.map((q) => q.id),
          );

        if (flaggedError) throw flaggedError;

        flaggedData?.forEach((flag) => {
          dispatch(
            toggleFlagQuestion({
              questionId: flag.question_id,
              flaggedAt: flag.created_at,
            }),
          );
        });

        const { data: notesData, error: notesError } = await supabase
          .from("user_notes")
          .select("question_id, note, updated_at")
          .eq("user_id", user.id)
          .in(
            "question_id",
            currentTestQuestions.map((q) => q.id),
          );

        if (notesError) throw notesError;

        notesData?.forEach((note) => {
          dispatch(
            addNote({
              questionId: note.question_id,
              note: note.note,
              updatedAt: note.updated_at,
            }),
          );
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load your notes and flags");
      }
    };

    fetchUserData();
  }, [user?.id, currentTestQuestions, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "u", "s"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  if (!currentTestQuestions || currentTestQuestions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        take Loading...
      </div>
    );
  }

  const currentQuestion = currentTestQuestions[currentQuestionIndex];
  const totalQuestions = currentTestQuestions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const questionAnswered = selectedAnswers[currentQuestion.id]?.length > 0;
  const isCurrentQuestionFlagged = flaggedQuestions.some(
    (q) => q.questionId === currentQuestion.id,
  );

  const isMultipleChoice =
    currentQuestion.options.filter((o) => o.isCorrect).length > 1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getRemainingTime = () => {
    if (!examDetails || !examDetails.isTimed || !examDetails.timeLimit) {
      return null;
    }

    let totalTimeLimit;
    if (examDetails.timeLimitType === "total_time") {
      totalTimeLimit = examDetails.timeLimit;
    } else {
      totalTimeLimit = examDetails.timeLimit * currentTestQuestions.length;
    }

    const remainingSeconds = Math.max(0, totalTimeLimit - examDuration);
    return formatTime(remainingSeconds);
  };

  const handleSelectAnswer = (
    questionId: string,
    selectedOptionIds: string[],
  ) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: selectedOptionIds,
    });

    if (currentExamType === "study") {
      // In study mode, we don't automatically save the answer until they check it
      // saveCurrentAnswer will be called when they hit "Check Answer"
    }
  };

  const saveCurrentAnswer = (
    questionId?: string,
    selectedOptionIds?: string[],
  ) => {
    const qId = questionId || currentQuestion.id;
    const optionIds = selectedOptionIds || selectedAnswers[qId];

    if (qId && optionIds?.length > 0) {
      const question = currentTestQuestions.find((q) => q.id === qId);
      if (!question) return;

      const correctOptionIds = question.options
        .filter((option) => option.isCorrect)
        .map((option) => option.id);

      const isCorrect = isMultipleChoice
        ? optionIds.length === correctOptionIds.length &&
          optionIds.every((id) => correctOptionIds.includes(id))
        : optionIds[0] === correctOptionIds[0];

      const answer: AnsweredQuestion = {
        questionId: qId,
        selectedOptions: optionIds,
        isCorrect,
        answeredAt: new Date().toISOString(),
      };

      dispatch(answerQuestion(answer));
    }
  };

  const handlePrevQuestion = () => {
    if (!isFirstQuestion) {
      if (currentExamType === "test") {
        saveCurrentAnswer();
      }
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      if (currentExamType === "test") {
        saveCurrentAnswer();
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleCheckAnswer = () => {
    saveCurrentAnswer();
    // Answer is now saved to the study state
    // The UI update will be handled by the QuestionCard component
  };

  const handleSaveNote = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to save notes");
      return;
    }

    try {
      setNoteIsSaving(true);

      dispatch(
        addNote({
          questionId: currentQuestion.id,
          note: noteText,
          updatedAt: new Date().toISOString(),
        }),
      );

      if (noteText.trim()) {
        const { error } = await supabase.from("user_notes").upsert(
          {
            user_id: user.id,
            question_id: currentQuestion.id,
            note: noteText,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,question_id" },
        );

        if (error) throw error;

        toast.success("Note saved successfully");
        setShowNotesDialog(false);
      } else {
        const { error } = await supabase
          .from("user_notes")
          .delete()
          .eq("user_id", user.id)
          .eq("question_id", currentQuestion.id);

        if (error) throw error;

        toast.success("Note cleared");
        setShowNotesDialog(false);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    } finally {
      setNoteIsSaving(false);
    }
  };

  const handleFlagQuestion = async (questionId: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to flag questions");
      return;
    }

    try {
      setIsFlagging(true);

      const isCurrentlyFlagged = flaggedQuestions.some(
        (q) => q.questionId === questionId,
      );

      if (!isCurrentlyFlagged) {
        const { error } = await supabase.from("flagged_questions").insert({
          user_id: user.id,
          question_id: questionId,
        });

        if (error) throw error;

        dispatch(
          toggleFlagQuestion({
            questionId,
            flaggedAt: new Date().toISOString(),
          }),
        );
        toast.success("Question flagged for review");
      } else {
        const { error } = await supabase
          .from("flagged_questions")
          .delete()
          .eq("user_id", user.id)
          .eq("question_id", questionId);

        if (error) throw error;

        dispatch(
          toggleFlagQuestion({
            questionId,
            flaggedAt: new Date().toISOString(),
          }),
        );
        toast.success("Question unflagged");
      }
    } catch (error) {
      console.error("Error toggling flag:", error);
      toast.error("Failed to update flag status");
    } finally {
      setIsFlagging(false);
    }
  };

  const getCompletedQuestionCount = () => {
    return Object.keys(selectedAnswers).length;
  };

  const handleFinishExam = () => {
    if (currentExamType === "test") {
      saveCurrentAnswer();
    }
    setShowSummaryDialog(true);
  };

  const confirmFinishExam = async () => {
    if (!user?.id || !currentExamId) {
      toast.error("You must be logged in to submit an exam");
      return;
    }

    try {
      setIsSaving(true);
      const allAnswers = Object.keys(selectedAnswersRef.current).map(
        (questionId) => {
          const question = currentTestQuestions.find(
            (q) => q.id === questionId,
          );
          const selectedOptionIds =
            selectedAnswersRef.current[questionId] || [];
          const correctOptionIds =
            question?.options
              .filter((option) => option.isCorrect)
              .map((option) => option.id) || [];

          const isCorrect =
            question?.options.filter((o) => o.isCorrect).length > 1
              ? selectedOptionIds.length === correctOptionIds.length &&
                selectedOptionIds.every((id) => correctOptionIds.includes(id))
              : selectedOptionIds[0] === correctOptionIds[0];

          return {
            questionId,
            selectedOptions: selectedOptionIds,
            isCorrect,
            answeredAt: new Date().toISOString(),
          };
        },
      );

      const correctCount = allAnswers.filter(
        (answer) => answer.isCorrect,
      ).length;
      const scorePercentage =
        (correctCount / currentTestQuestions.length) * 100;

      const categoryIds = Array.from(
        new Set(currentTestQuestions.map((q) => q.categoryId)),
      );

      const { data: examUpdateData, error: examUpdateError } = await supabase
        .from("user_exams")
        .update({ completed: true })
        .eq("id", currentExamId);

      if (examUpdateError) throw examUpdateError;

      const { data: resultData, error: resultError } = await supabase
        .from("exam_results")
        .insert({
          user_exam_id: currentExamId,
          user_id: user.id,
          correct_count: correctCount,
          incorrect_count: currentTestQuestions.length - correctCount,
          score: Math.round(scorePercentage),
          time_taken: examDuration,
          answers: allAnswers,
          completed_at: new Date().toISOString(),
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
        examName: currentExamName || "Exam",
        is_timed: examDetails?.isTimed,
      };

      dispatch(submitTestResult(result));
      setShowSummaryDialog(false);

      for (const answer of allAnswers) {
        await supabase.from("user_answers").insert({
          question_id: answer.questionId,
          user_id: user.id,
          is_correct: answer.isCorrect,
        });
      }

      navigate(`/exam-results/${result.id}`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container px-3 sm:px-8 mx-auto py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl sm:text-2xl font-bold">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </h1>
          <div className="flex space-x-1 sm:space-x-2">
            <Badge
              variant={isCurrentQuestionFlagged ? "secondary" : "outline"}
              className="cursor-pointer hover:bg-secondary"
              onClick={() => handleFlagQuestion(currentQuestion.id)}
            >
              <Flag
                className={`h-2 sm:h-3 w-2 sm:w-3 mr-1 ${isCurrentQuestionFlagged ? "text-amber-500" : ""}`}
              />
              {isCurrentQuestionFlagged ? "Flagged" : "Flag"}
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
              onClick={() => {
                setNoteText(
                  notes.find((n) => n.questionId === currentQuestion.id)
                    ?.note || "",
                );
                setShowNotesDialog(true);
              }}
            >
              <StickyNote className="h-2 sm:h-3 w-2 sm:w-3 mr-1" />
              Notes
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {examDetails?.isTimed && (
            <Badge variant="outline" className="px-2 py-1">
              <Timer className="h-4 w-4 mr-1.5" />
              {/* {examDetails?.is_timed ? getRemainingTime() : formatTime(examDuration)} */}
              {getRemainingTime()}
            </Badge>
          )}
          <Button
            onClick={handleFinishExam}
            variant="default"
            className="py-2 px-4 sm:py-3 sm:px-6"
          >
            Finish Exam
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Progress
          value={(getCompletedQuestionCount() / totalQuestions) * 100}
          className="h-2"
        />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>
            Completed: {getCompletedQuestionCount()}/{totalQuestions}
          </span>
          <span>
            {Math.round((getCompletedQuestionCount() / totalQuestions) * 100)}%
          </span>
        </div>
      </div>

      <QuestionCard
        question={currentQuestion}
        showAnswers={currentExamType === "test" ? false : true}
        onAnswerSelect={handleSelectAnswer}
        selectedOptions={selectedAnswers[currentQuestion.id] || []}
        isAnswered={questionAnswered}
        isTestMode={currentExamType === "test"}
        examType={currentExamType || "test"}
        onFlagQuestion={handleFlagQuestion}
        isFlagged={isCurrentQuestionFlagged}
        onCheckAnswer={handleCheckAnswer}
      />

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
                <span className="font-medium">
                  {getCompletedQuestionCount()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Unanswered:</span>
                <span className="font-medium">
                  {totalQuestions - getCompletedQuestionCount()}
                </span>
              </div>
              {examDetails?.isTimed && (
                <div className="flex justify-between items-center">
                  <span>Time taken:</span>
                  <span className="font-medium">
                    {formatTime(examDuration)}
                  </span>
                </div>
              )}
              {totalQuestions - getCompletedQuestionCount() > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    You have {totalQuestions - getCompletedQuestionCount()}{" "}
                    unanswered questions. Unanswered questions will be marked as
                    incorrect.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setShowSummaryDialog(false)}
            >
              Continue Exam
            </Button>
            <Button onClick={confirmFinishExam} disabled={isSaving}>
              {isSaving ? "Submitting..." : "Submit Exam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Question Notes</DialogTitle>
            <DialogDescription>
              Add or update your notes for this question.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Add your notes here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote} disabled={noteIsSaving}>
              {noteIsSaving ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TakeExam;
