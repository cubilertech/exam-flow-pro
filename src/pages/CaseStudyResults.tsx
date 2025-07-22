
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, FileText, Trophy, ArrowRight } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearAnswers } from "@/features/caseAnswers/caseAnswersSlice";

export const CaseStudyResults = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { examId, subjectId } = useParams<{ examId: string; subjectId: string }>();
  const { answers, session } = useAppSelector((state) => state.caseAnswers);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = session.totalQuestions || 0;
  const completionRate = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const getTimeTaken = () => {
    if (session.startTime && session.endTime) {
      const start = new Date(session.startTime).getTime();
      const end = new Date(session.endTime).getTime();
      const minutes = Math.floor((end - start) / (1000 * 60));
      const seconds = Math.floor(((end - start) % (1000 * 60)) / 1000);
      return `${minutes}m ${seconds}s`;
    }
    return "Unknown";
  };

  useEffect(() => {
    // Add celebration animation on mount
    const timer = setTimeout(() => {
      const confetti = document.querySelector('.confetti-container');
      if (confetti) {
        confetti.classList.add('animate');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    dispatch(clearAnswers());
    if (examId && subjectId) {
      navigate(`/case-study-exams/${examId}/subjects/${subjectId}`);
    } else {
      navigate('/case-study-exams');
    }
  };

  const handleStartNew = () => {
    dispatch(clearAnswers());
    navigate('/case-study-exams');
  };

  return (
    <div className="container py-8 px-4 md:px-8 relative min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Confetti Animation */}
      <div className="confetti-container fixed inset-0 pointer-events-none z-10">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][Math.floor(Math.random() * 6)],
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-20">
        {/* Celebration Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Congratulations! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            You have successfully completed the case study!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Questions Answered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {answeredCount}
              </div>
              <div className="text-sm text-gray-500">
                out of {totalQuestions} questions
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-4">
              <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {completionRate}%
              </div>
              <div className="text-sm text-gray-500">
                overall completion
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-4">
              <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Time Taken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {getTimeTaken()}
              </div>
              <div className="text-sm text-gray-500">
                total time spent
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Badge */}
        <div className="text-center mb-8">
          <Badge 
            variant={completionRate >= 80 ? "default" : completionRate >= 60 ? "secondary" : "outline"}
            className="px-6 py-2 text-lg"
          >
            {completionRate >= 80 ? "Excellent Work!" : 
             completionRate >= 60 ? "Good Job!" : "Keep Practicing!"}
          </Badge>
        </div>

        {/* Summary Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Session Summary</CardTitle>
            <CardDescription>
              Review your performance in this case study
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Questions Attempted:</span>
              <span className="font-semibold">{answeredCount} / {totalQuestions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completion Rate:</span>
              <span className="font-semibold">{completionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Session Duration:</span>
              <span className="font-semibold">{getTimeTaken()}</span>
            </div>
            {session.startTime && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed At:</span>
                <span className="font-semibold">
                  {new Date(session.endTime || session.startTime).toLocaleString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleContinue}
            className="px-8 py-3 text-lg"
            size="lg"
          >
            Continue to Subject
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <Button 
            onClick={handleStartNew}
            variant="outline"
            className="px-8 py-3 text-lg"
            size="lg"
          >
            Start New Case Study
          </Button>
        </div>
      </div>
    </div>
  );
};
