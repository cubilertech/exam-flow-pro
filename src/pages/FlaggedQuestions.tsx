import React, { useState } from "react";
import { useFlaggedQuestions } from "@/hooks/useFlaggedQuestions";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag, Search, Filter, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const FlaggedQuestions = () => {
  const {
    flaggedQuestions,
    allFlaggedQuestions,
    loading,
    searchTerm,
    setSearchTerm,
    difficultyFilter,
    setDifficultyFilter,
    unflagQuestion,
  } = useFlaggedQuestions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'single'>('list');

  const currentQuestion = flaggedQuestions[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : flaggedQuestions.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < flaggedQuestions.length - 1 ? prev + 1 : 0));
  };

  const handleUnflag = async (questionId: string) => {
    await unflagQuestion(questionId);
    // Adjust current index if we're in single view and removed current question
    if (viewMode === 'single' && currentIndex >= flaggedQuestions.length - 1) {
      setCurrentIndex(Math.max(0, flaggedQuestions.length - 2));
    }
  };

  const convertToQuestionFormat = (flaggedQ: any) => ({
    id: flaggedQ.questions.id,
    text: flaggedQ.questions.text,
    serialNumber: flaggedQ.questions.serial_number,
    difficulty: flaggedQ.questions.difficulty as 'easy' | 'medium' | 'hard',
    explanation: flaggedQ.questions.explanation || '',
    imageUrl: flaggedQ.questions.image_url,
    options: flaggedQ.questions.question_options?.map((opt: any) => ({
      id: opt.id,
      text: opt.text,
      isCorrect: opt.is_correct,
    })) || [],
    categoryId: '', // Not needed for display purposes
    tags: [], // Not needed for display purposes
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Flag className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Flagged Questions</h1>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (allFlaggedQuestions.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Flag className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Flagged Questions</h1>
        </div>
        
        <Card className="text-center p-12">
          <CardContent className="space-y-4">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold mb-2">No Flagged Questions</h3>
              <p className="text-muted-foreground mb-4">
                You haven't flagged any questions yet. Flag important questions during study sessions to review them later.
              </p>
              <Button asChild>
                <Link to="/my-exams">Start Studying</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Flagged Questions</h1>
          <Badge variant="secondary">{allFlaggedQuestions.length} total</Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            size="sm"
          >
            List View
          </Button>
          {/* <Button
            variant={viewMode === 'single' ? 'default' : 'outline'}
            onClick={() => setViewMode('single')}
            size="sm"
          >
            Study Mode
          </Button> */}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {flaggedQuestions.length !== allFlaggedQuestions.length && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {flaggedQuestions.length} of {allFlaggedQuestions.length} flagged questions
            </div>
          )}
        </CardContent>
      </Card>

      {flaggedQuestions.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-muted-foreground">
              No flagged questions match your current search and filter criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'single' ? (
            <div className="space-y-4">
              {/* Navigation Controls */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Question {currentIndex + 1} of {flaggedQuestions.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        disabled={flaggedQuestions.length <= 1}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNext}
                        disabled={flaggedQuestions.length <= 1}
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUnflag(currentQuestion.questions.id)}
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Unflag
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Question */}
              {currentQuestion && (
                <QuestionCard
                  question={convertToQuestionFormat(currentQuestion)}
                  showAnswers={true}
                  examType="study"
                  isFlagged={true}
                  onFlagQuestion={() => handleUnflag(currentQuestion.questions.id)}
                />
              )}
            </div>
          ) : (
            /* List View */
            <div className="space-y-6">
              {flaggedQuestions.map((flaggedQ, index) => (
                <div key={flaggedQ.id} className="relative">
                  <div className="absolute top-4 right-4 z-10">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUnflag(flaggedQ.questions.id)}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Unflag
                    </Button>
                  </div>
                  
                  <QuestionCard
                    question={convertToQuestionFormat(flaggedQ)}
                    showAnswers={true}
                    examType="study"
                    isFlagged={true}
                    onFlagQuestion={() => handleUnflag(flaggedQ.questions.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlaggedQuestions;