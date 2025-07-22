import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, FileText, Clock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { saveAnswer, setSessionStartTime, setTotalQuestions } from "@/features/caseAnswers/caseAnswersSlice";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Case {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  scenario: string;
  instructions: string | null;
  subject_id: string | null;
  order_index: number | null;
  is_deleted_case: boolean | null;
}

interface CaseQuestion {
  id: string;
  created_at: string;
  updated_at: string;
  case_id: string | null;
  question_text: string;
  correct_answer: string;
  explanation: string | null;
  hint: string | null;
  order_index: number | null;
}

export default function CaseStudyTakeExam() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { examId, subjectId, caseId } = useParams();
  
  const { answers, sessionStartTime } = useAppSelector(
    (state) => state.caseAnswers
  );
  const { user } = useAppSelector((state) => state.auth);

  const [case_, setCase] = useState<Case | null>(null);
  const [questions, setQuestions] = useState<CaseQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCaseAndQuestions = async () => {
      if (!caseId) return;

      try {
        const { data: caseData, error: caseError } = await supabase
          .from("cases")
          .select("*")
          .eq("id", caseId)
          .single();

        if (caseError) throw caseError;
        setCase(caseData);

        const { data: questionsData, error: questionsError } = await supabase
          .from("case_questions")
          .select("*")
          .eq("case_id", caseId)
          .order("order_index");

        if (questionsError) throw questionsError;
        setQuestions(questionsData);
        
        // Set total questions count and start time if not already set
        dispatch(setTotalQuestions(questionsData.length));
        if (!sessionStartTime) {
          dispatch(setSessionStartTime(Date.now()));
        }

      } catch (error) {
        console.error("Error fetching case and questions:", error);
        toast.error("Failed to load case study");
      } finally {
        setLoading(false);
      }
    };

    fetchCaseAndQuestions();
  }, [caseId, dispatch, sessionStartTime]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || "" : "";

  const handleAnswerChange = (content: string) => {
    if (currentQuestion) {
      dispatch(saveAnswer({
        questionId: currentQuestion.id,
        answerHtml: content
      }));
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id || !caseId) return;

    setIsSubmitting(true);
    try {
      // Navigate to results page instead of subject detail
      navigate(`/case-study-exams/${examId}/subjects/${subjectId}/cases/${caseId}/results`);
    } catch (error) {
      console.error("Error submitting case study:", error);
      toast.error("Failed to submit case study");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading case study...</p>
        </div>
      </div>
    );
  }

  if (!case_ || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Case study not found or has no questions.</p>
        <Button 
          onClick={() => navigate(`/case-study-exams/${examId}/subjects/${subjectId}`)}
          className="mt-4"
        >
          Back to Subject
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <ArrowLeft className="h-4 w-4" />
          <button 
            onClick={() => navigate(`/case-study-exams/${examId}/subjects/${subjectId}`)}
            className="hover:text-gray-900"
          >
            Back to Subject
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{case_.title}</h1>
        <div className="flex items-center gap-4 mt-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {sessionStartTime ? 
              `${Math.floor((Date.now() - sessionStartTime) / 60000)}m elapsed` : 
              'Starting...'
            }
          </Badge>
        </div>
      </div>

      {/* Case Scenario */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Case Scenario</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: case_.scenario }}
          />
          {case_.instructions && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
              <div 
                className="text-blue-800"
                dangerouslySetInnerHTML={{ __html: case_.instructions }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Your Answer:
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
            </div>

            {currentQuestion.hint && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-1">Hint:</p>
                <p className="text-yellow-700 text-sm">{currentQuestion.hint}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <span className="text-sm text-gray-600">
          {Object.keys(answers).length} of {questions.length} questions answered
        </span>

        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          className={isLastQuestion ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isSubmitting ? (
            "Submitting..."
          ) : isLastQuestion ? (
            "Submit Case Study"
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
