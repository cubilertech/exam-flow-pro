
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Clock, 
  FileText, 
  CheckCircle, 
  RotateCcw, 
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearAnswers } from "@/features/caseAnswers/caseAnswersSlice";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function CaseStudyResults() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { examId, subjectId, caseId } = useParams();
  
  const { answers, sessionStartTime, totalQuestions } = useAppSelector(
    (state) => state.caseAnswers
  );
  const { user } = useAppSelector((state) => state.auth);

  const [caseTitle, setCaseTitle] = useState("");
  const [submissionCount, setSubmissionCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const answeredQuestions = Object.keys(answers).length;
  const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  const timeTaken = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  useEffect(() => {
    const fetchCaseDetails = async () => {
      if (!caseId || !user?.id) return;

      try {
        // Fetch case title
        const { data: caseData, error: caseError } = await supabase
          .from("cases")
          .select("title")
          .eq("id", caseId)
          .single();

        if (caseError) throw caseError;
        setCaseTitle(caseData.title);

        // Fetch or create user progress and increment submission count
        const { data: progressData, error: progressError } = await supabase
          .from("user_case_progress")
          .select("submission_count")
          .eq("user_id", user.id)
          .eq("case_id", caseId)
          .single();

        if (progressError && progressError.code !== 'PGRST116') {
          throw progressError;
        }

        let newSubmissionCount = 1;
        
        if (progressData) {
          // Update existing progress
          newSubmissionCount = (progressData.submission_count || 0) + 1;
          const { error: updateError } = await supabase
            .from("user_case_progress")
            .update({ 
              submission_count: newSubmissionCount,
              completed: true,
              completed_at: new Date().toISOString()
            })
            .eq("user_id", user.id)
            .eq("case_id", caseId);

          if (updateError) throw updateError;
        } else {
          // Create new progress record
          const { error: insertError } = await supabase
            .from("user_case_progress")
            .insert({
              user_id: user.id,
              case_id: caseId,
              submission_count: newSubmissionCount,
              completed: true,
              completed_at: new Date().toISOString(),
              current_question_index: totalQuestions
            });

          if (insertError) throw insertError;
        }

        setSubmissionCount(newSubmissionCount);
        
        // Trigger confetti animation
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);

      } catch (error) {
        console.error("Error fetching case details:", error);
        toast.error("Failed to load case details");
      }
    };

    fetchCaseDetails();
  }, [caseId, user?.id, totalQuestions]);

  const handleTryAgain = () => {
    dispatch(clearAnswers());
    navigate(`/case-study-exams/${examId}/subjects/${subjectId}/cases/${caseId}/take`);
  };

  const handleBackToSubject = () => {
    dispatch(clearAnswers());
    navigate(`/case-study-exams/${examId}/subjects/${subjectId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <div 
                className={`w-2 h-2 ${
                  ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][
                    Math.floor(Math.random() * 5)
                  ]
                } transform rotate-45`}
              />
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trophy className="h-16 w-16 text-yellow-500" />
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Congratulations! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            You've completed the case study
          </p>
          <h2 className="text-2xl font-semibold text-gray-800 mt-2">
            "{caseTitle}"
          </h2>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Questions Answered */}
          <Card className="text-center border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-sm font-medium text-blue-600">
                Questions Answered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">
                {answeredQuestions}
              </div>
              <p className="text-sm text-blue-600 mt-1">
                of {totalQuestions} total
              </p>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="text-center border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-sm font-medium text-green-600">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                {completionPercentage}%
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Time Taken */}
          <Card className="text-center border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-sm font-medium text-purple-600">
                Time Taken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">
                {formatTime(timeTaken)}
              </div>
              <p className="text-sm text-purple-600 mt-1">
                Total session time
              </p>
            </CardContent>
          </Card>

          {/* Submission Count */}
          <Card className="text-center border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <RotateCcw className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-sm font-medium text-orange-600">
                Attempts Made
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700">
                {submissionCount}
              </div>
              <p className="text-sm text-orange-600 mt-1">
                {submissionCount === 1 ? 'First attempt' : 'Total attempts'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Badge */}
        <div className="text-center mb-8">
          <Badge 
            variant="secondary" 
            className="px-6 py-2 text-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0"
          >
            Case Study Completed! ✨
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Button 
            onClick={handleTryAgain}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          
          <Button 
            onClick={handleBackToSubject}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Subject
          </Button>
        </div>

        {/* Motivational Message */}
        <div className="text-center mt-8 p-6 bg-white/70 rounded-lg border border-gray-200">
          <p className="text-gray-600 italic">
            "Great job on completing this case study! Each attempt helps you learn and improve. 
            Keep practicing to master the concepts."
          </p>
        </div>
      </div>
    </div>
  );
}
