import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types/case-study';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  answer: z.string().min(2, {
    message: "Answer must be at least 2 characters.",
  }),
})

const CaseStudyTakeExam = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!caseId) return;
      
      try {
        const { data, error } = await supabase
          .from('case_questions')
          .select('*')
          .eq('case_id', caseId)
          .order('order_index');

        if (error) throw error;
        
        setQuestions(data as Question[]);
        setUserAnswers(new Array(data.length).fill('')); // Initialize userAnswers with empty strings
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [caseId]);

  const handleAnswerChange = (index: number, answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = answer;
    setUserAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitExam = async () => {
    // Basic validation to ensure all questions are answered
    if (userAnswers.some(answer => answer === '')) {
      toast({
        title: "Error",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Prepare the answers array
    const answers = questions.map((question, index) => ({
      questionId: question.id,
      questionText: question.question_text,
      correctAnswer: question.correct_answer,
      userAnswer: userAnswers[index],
      isCorrect: userAnswers[index] === question.correct_answer,
      explanation: question.explanation,
      caseId: question.case_id,
      categoryId: question.categoryId,
      tags: question.tags,
      difficulty: question.difficulty
    }));

    // Calculate the score
    const correctCount = answers.filter(answer => answer.isCorrect).length;
    const incorrectCount = answers.length - correctCount;
    const score = (correctCount / questions.length) * 100;

    try {
      setLoading(true);

      // Save the exam results to the database
      const { data, error } = await supabase
        .from('exam_results')
        .insert([
          {
            score: score,
            correct_count: correctCount,
            incorrect_count: incorrectCount,
            time_taken: 0, // You might want to track time taken
            completed_at: new Date().toISOString(),
            answers: answers,
            user_exam_id: caseId, // Assuming caseId is the exam ID
            user_id: supabase.auth.user()?.id,
          }
        ])
        .select()

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Exam submitted successfully!",
      });

      // Redirect to the exam results page
      navigate(`/exam-results/${data[0].id}`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast({
        title: "Error",
        description: "Failed to submit exam.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading questions...</div>;
  }

  if (!questions || questions.length === 0) {
    return <div>No questions found for this case.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative bg-white shadow-lg sm:rounded-3xl p-5">
          <Card>
            <CardHeader>
              <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
              <CardDescription>{currentQuestion.question_text}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="answer">Your Answer</Label>
                  <Input
                    id="answer"
                    placeholder="Enter your answer"
                    value={userAnswers[currentQuestionIndex]}
                    onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button
              type="button"
              onClick={goToNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next
            </Button>
          </div>
          {currentQuestionIndex === questions.length - 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-4 w-full">Submit Exam</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Are you sure you want to submit the exam?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={submitExam}>Submit</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseStudyTakeExam;
