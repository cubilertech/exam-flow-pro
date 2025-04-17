
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '@/lib/hooks';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BarChart3, 
  AlertCircle,
  ChevronLeft,
  Tag,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { Question } from '@/features/questions/questionsSlice';

const ExamResults = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { testResults, answeredQuestions } = useAppSelector((state) => state.study);
  const { categories, questions } = useAppSelector((state) => state.questions);
  
  const [activeTab, setActiveTab] = useState<'summary' | 'questions'>('summary');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Find the test result
  const result = testResults.find(result => result.id === resultId);
  
  // If no result found, redirect to my exams
  useEffect(() => {
    if (!result) {
      navigate('/my-exams');
    }
  }, [result, navigate]);
  
  if (!result) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Get category names
  const getCategoryNames = () => {
    return result.categoryIds
      .map(id => categories.find(cat => cat.id === id)?.name || 'Unknown')
      .join(', ');
  };
  
  // Data for pie chart
  const chartData = [
    { name: 'Correct', value: result.correctCount, color: '#10b981' },
    { name: 'Incorrect', value: result.incorrectCount, color: '#ef4444' }
  ];
  
  // Get all questions related to this exam with their answers
  const getExamQuestions = (): Array<Question & { 
    userAnswer?: string[], 
    isCorrect?: boolean 
  }> => {
    return result.answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) return null;
      
      return {
        ...question,
        userAnswer: answer.selectedOptions,
        isCorrect: answer.isCorrect
      };
    }).filter(Boolean) as Array<Question & { userAnswer?: string[], isCorrect?: boolean }>;
  };
  
  const examQuestions = getExamQuestions();
  const currentQuestion = examQuestions[currentQuestionIndex];
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/my-exams')} className="mb-2">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to My Exams
        </Button>
        <h1 className="text-3xl font-bold">Exam Results</h1>
        <p className="text-muted-foreground mt-1">
          Completed on {formatDate(result.testDate)}
        </p>
      </div>
      
      <Tabs defaultValue="summary" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Performance Summary</CardTitle>
                <CardDescription>
                  Your overall exam performance
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center justify-center h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-4">
                    <h3 className="text-2xl font-bold">{result.score}%</h3>
                    <p className="text-muted-foreground text-sm">
                      {result.score >= 70 ? 'Excellent!' : result.score >= 50 ? 'Good job!' : 'Keep practicing!'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Exam Details</CardTitle>
                <CardDescription>
                  Information about your exam
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Questions</span>
                    <span className="font-medium">{result.questionCount}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Time Taken</span>
                    <span className="font-medium">{formatTime(result.timeTaken)}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Correct</span>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
                      <span className="font-medium">{result.correctCount}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Incorrect</span>
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-1.5" />
                      <span className="font-medium">{result.incorrectCount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center mb-1">
                    <Tag className="h-4 w-4 mr-1.5 text-primary" />
                    <span className="text-sm font-medium">Categories</span>
                  </div>
                  <p className="text-sm">{getCategoryNames()}</p>
                </div>
                
                <div className="pt-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Score</span>
                    <span className="text-sm font-medium">{result.score}%</span>
                  </div>
                  <Progress value={result.score} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab('questions')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Review Questions
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Analysis</CardTitle>
              <CardDescription>
                Areas where you performed well and areas that need improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.score < 70 && (
                  <div className="flex items-start p-4 border rounded-md">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Areas for Improvement</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your score indicates that you may need more practice in this area.
                        Consider reviewing the questions you got wrong and studying the explanations.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start p-4 border rounded-md">
                  <BarChart3 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Time Management</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      You spent an average of {(result.timeTaken / result.questionCount).toFixed(1)} seconds per question.
                      {result.timeTaken / result.questionCount > 60 
                        ? ' Try to improve your speed for better time management.'
                        : ' Good job managing your time efficiently!'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions" className="mt-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold">
              Question {currentQuestionIndex + 1} of {examQuestions.length}
            </h2>
            <div className="flex items-center space-x-2">
              <Badge variant={currentQuestion?.isCorrect ? "success" : "destructive"} className="px-2 py-1">
                {currentQuestion?.isCorrect ? (
                  <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Correct</>
                ) : (
                  <><XCircle className="h-3.5 w-3.5 mr-1" /> Incorrect</>
                )}
              </Badge>
            </div>
          </div>
          
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              showAnswers={true}
              selectedOptions={currentQuestion.userAnswer || []}
              isAnswered={true}
              isTestMode={false}
            />
          )}
          
          <div className="flex justify-between mt-6">
            <Button 
              onClick={handlePrevQuestion} 
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} of {examQuestions.length}
              </span>
            </div>
            
            {currentQuestionIndex === examQuestions.length - 1 ? (
              <Button onClick={() => setActiveTab('summary')} variant="default">
                Back to Summary
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamResults;
