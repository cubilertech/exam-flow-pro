import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppSelector } from "@/lib/hooks";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ExamResultQuestion } from "@/types/case-study";

interface ExamInfo {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface UserAnswer {
  question_id: string;
  user_answer: string;
  is_correct: boolean;
}

const ExamResults = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { toast } = useToast();
  const [examInfo, setExamInfo] = useState<ExamInfo | null>(null);
  const [questions, setQuestions] = useState<ExamResultQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<ExamResultQuestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (examId && user) {
      fetchExamResults();
    }
  }, [examId, user]);

  const fetchExamResults = async () => {
    try {
      setLoading(true);

      // Fetch exam information
      const { data: examData, error: examError } = await supabase
        .from("exams_case")
        .select("*")
        .eq("id", examId)
        .single();

      if (examError) throw examError;
      setExamInfo(examData);

      // Fetch user's answers for the exam
      const { data: answersData, error: answersError } = await supabase
        .from("user_exam_answers")
        .select("*")
        .eq("exam_id", examId)
        .eq("user_id", user.id);

      if (answersError) throw answersError;
      setUserAnswers(answersData || []);

      // Fetch questions for the exam
      const { data: questionsData, error: questionsError } = await supabase
        .from("case_questions")
        .select("*")
        .eq("exam_id", examId);

      if (questionsError) throw questionsError;

      // Map questions with user answers
      const mappedQuestions = questionsData?.map((question) => {
        const userAnswer = answersData?.find((answer) => answer.question_id === question.id);
        return {
          id: question.id,
          question_text: question.question_text,
          correct_answer: question.correct_answer,
          explanation: question.explanation || '',
          categoryId: 'case-study', // Assuming all questions are in the same category
          tags: [], // Assuming no tags
          difficulty: 'medium', // Assuming default difficulty
          userAnswer: userAnswer?.user_answer,
          isCorrect: userAnswer?.is_correct,
        };
      }) || [];

      setQuestions(mappedQuestions);
    } catch (error) {
      console.error("Error fetching exam results:", error);
      toast({
        title: "Error",
        description: "Failed to load exam results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (question: ExamResultQuestion) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading exam results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!examInfo) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground mb-4">
            Exam not found
          </h3>
          <Button onClick={() => navigate("/exams")}>
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">{examInfo.title} - Results</h1>
      <p className="text-muted-foreground">{examInfo.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.map((question) => (
          <Card
            key={question.id}
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => handleQuestionClick(question)}
          >
            <CardHeader>
              <CardTitle>Question</CardTitle>
              <CardDescription>{question.question_text.substring(0, 100)}...</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Your Answer: {question.userAnswer || "Not answered"}
              </p>
              <Badge variant={question.isCorrect ? "success" : "destructive"}>
                {question.isCorrect ? "Correct" : "Incorrect"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
            <DialogDescription>
              {selectedQuestion?.question_text}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              <p>
                <strong>Your Answer:</strong> {selectedQuestion?.userAnswer || "Not answered"}
              </p>
              <p>
                <strong>Correct Answer:</strong> {selectedQuestion?.correct_answer}
              </p>
              <p>
                <strong>Explanation:</strong> {selectedQuestion?.explanation}
              </p>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamResults;
