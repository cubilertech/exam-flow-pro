
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearAnswers } from "@/features/caseAnswers/caseAnswersSlice";
import { Trophy, CheckCircle, Clock, BookOpen, Sparkles } from "lucide-react";

export const CaseStudyResults = () => {
  const { examId, subjectId } = useParams<{ examId: string; subjectId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { answers, sessionStats } = useAppSelector((state) => state.caseAnswers);

  const answeredCount = Object.keys(answers).length;
  const completionRate = sessionStats.totalQuestions > 0 
    ? Math.round((answeredCount / sessionStats.totalQuestions) * 100) 
    : 0;

  const getTimeTaken = () => {
    if (!sessionStats.startTime || !sessionStats.endTime) return "N/A";
    
    const start = new Date(sessionStats.startTime);
    const end = new Date(sessionStats.endTime);
    const diffInMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Less than 1 minute";
    if (diffInMinutes === 1) return "1 minute";
    return `${diffInMinutes} minutes`;
  };

  // Trigger confetti animation on mount
  useEffect(() => {
    // Create confetti elements
    const createConfetti = () => {
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = [
          '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'
        ][Math.floor(Math.random() * 6)];
        document.body.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => {
          if (document.body.contains(confetti)) {
            document.body.removeChild(confetti);
          }
        }, 4000);
      }
    };

    createConfetti();
  }, []);

  const handleBackToSubject = () => {
    dispatch(clearAnswers());
    navigate(`/case-study-exams/${examId}/subjects/${subjectId}`);
  };

  const handleBackToExams = () => {
    dispatch(clearAnswers());
    navigate('/case-study-exams');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Celebration Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <Trophy className="h-24 w-24 text-yellow-500 mx-auto mb-4 animate-bounce" />
          <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-2">
          Congratulations! 🎉
        </h1>
        <p className="text-xl text-muted-foreground">
          You've successfully completed the case study!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <CardHeader className="pb-2">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
            <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {answeredCount}
            </div>
            <p className="text-xs text-muted-foreground">
              out of {sessionStats.totalQuestions}
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-2">
            <BookOpen className="h-8 w-8 text-blue-500 mx-auto" />
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {completionRate}%
            </div>
            <Badge variant={completionRate === 100 ? "default" : "secondary"} className="text-xs">
              {completionRate === 100 ? "Perfect!" : "Great effort!"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-2">
            <Clock className="h-8 w-8 text-purple-500 mx-auto" />
            <CardTitle className="text-sm font-medium">Time Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {getTimeTaken()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total time spent
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-2">
            <Sparkles className="h-8 w-8 text-pink-500 mx-auto" />
            <CardTitle className="text-sm font-medium">Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary">
              Case Study
            </div>
            <Badge variant="outline" className="text-xs">
              Completed
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant="default" className="bg-green-500">
                ✅ Submitted Successfully
              </Badge>
            </div>
            
            {sessionStats.startTime && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Started at:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(sessionStats.startTime).toLocaleString()}
                </span>
              </div>
            )}
            
            {sessionStats.endTime && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completed at:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(sessionStats.endTime).toLocaleString()}
                </span>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <p className="text-center text-sm font-medium text-purple-700">
                🎊 Great job! Your responses have been submitted. Keep up the excellent work! 🎊
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={handleBackToSubject}
          variant="default" 
          size="lg"
          className="min-w-[200px]"
        >
          Back to Subject
        </Button>
        <Button 
          onClick={handleBackToExams}
          variant="outline" 
          size="lg"
          className="min-w-[200px]"
        >
          All Case Studies
        </Button>
      </div>
    </div>
  );
};
