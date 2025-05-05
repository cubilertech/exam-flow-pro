import React, {
  useEffect,
  useState,
} from 'react';

import { format } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Tag,
  XCircle,
} from 'lucide-react';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { toast } from 'sonner';

import { QuestionCard } from '@/components/questions/QuestionCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/lib/hooks';

const ExamResults = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { testResults } = useAppSelector((state) => state.study);
  
  const [activeTab, setActiveTab] = useState<'summary' | 'questions'>('summary');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [examResult, setExamResult] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Find the test result in Redux store first
  const storeResult = testResults.find(result => result.id === resultId);
  
  useEffect(() => {
    const fetchExamResult = async () => {
      try {
        setLoading(true);

        if (storeResult) {
          setExamResult(storeResult);
          await fetchQuestions(storeResult.answers);
          if (storeResult?.categoryIds) {
            const { data: catData } = await supabase
              .from('categories')
              .select('id, name')
              .in('id', storeResult.categoryIds);
              
            if (catData) {
              setCategories(catData);
            }
          }
          return;
        }
        
        // If not in store, fetch from database
        const { data, error } = await supabase
          .from('exam_results')
          .select(`
            *,
            user_exams (
              name, 
              question_bank_id,
              category_ids
            )
          `)
          .eq('id', resultId)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          navigate('/my-exams');
          return;
        }
        
        // Transform data to match the format we use
        const transformedResult = {
          id: data.id,
          testDate: data.completed_at,
          correctCount: data.correct_count,
          incorrectCount: data.incorrect_count,
          score: Number(data.score),
          timeTaken: data.time_taken,
          answers: data.answers,
          examId: data.user_exam_id,
          examName: data.user_exams?.name || 'Exam',
          categoryIds: data.user_exams?.category_ids || [],
          questionCount: data.correct_count + data.incorrect_count
        };
        
        setExamResult(transformedResult);
        
        // Fetch questions based on answer data
        await fetchQuestions(data.answers);
        
        // Fetch categories
        if (data.user_exams?.category_ids) {
          const { data: catData } = await supabase
            .from('categories')
            .select('id, name')
            .in('id', data.user_exams.category_ids);
            
          if (catData) {
            setCategories(catData);
          }
        }
      } catch (error) {
        console.error('Error fetching exam result:', error);
        toast.error('Failed to load exam result');
        navigate('/my-exams');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamResult();
  }, [resultId, navigate, storeResult]);
  
  const fetchQuestions = async (answers: any) => {
    try {
      // Make sure answers is an array before proceeding
      const answersArray = Array.isArray(answers) 
        ? answers 
        : typeof answers === 'string' 
          ? JSON.parse(answers) 
          : answers && typeof answers === 'object' && answers.hasOwnProperty('length') 
            ? Array.from(answers) 
            : [];
            
      if (answersArray.length === 0) return;
      
      const questionIds = answersArray.map((a: any) => a.questionId); 
      
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          question_options (*)
        `)
        .in('id', questionIds);
        
      if (error) throw error;
      
      if (!data) return;
      
      // Transform questions to match our format
      const formattedQuestions = data.map(q => {
        const answer = answersArray.find((a: any) => a.questionId === q.id);
        
        return {
          id: q.id,
          serialNumber: parseInt(q.serial_number.replace(/\D/g, '')),
          text: q.text,
          options: q.question_options.map((opt: any) => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.is_correct
          })),
          explanation: q.explanation || "",
          imageUrl: q.image_url || undefined,
          categoryId: q.category_id || "",
          tags: [],
          difficulty: q.difficulty || "medium",
          userAnswer: answer?.selectedOptions || [],
          isCorrect: answer?.isCorrect
        };
      });
      
      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading results...</div>;
  }
  
  if (!examResult) {
    return <div className="flex justify-center items-center h-screen">Exam result not found</div>;
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
    if (categories.length === 0) return 'N/A';
    return categories
      .map(cat => cat.name)
      .join(', ');
  };
  
  // Data for pie chart
  const chartData = [
    { name: 'Correct', value: examResult.correctCount, color: '#10b981' },
    { name: 'Incorrect', value: examResult.incorrectCount, color: '#ef4444' }
  ];
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
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
        <h1 className="text-3xl font-bold">{examResult.examName || 'Exam Results'}</h1>
        <p className="text-muted-foreground mt-1">
          Completed on {formatDate(examResult.testDate)}
        </p>
      </div>
      
      <Tabs value={activeTab}  className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
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
                    <h3 className="text-2xl font-bold">{examResult.score}%</h3>
                    <p className="text-muted-foreground text-sm">
                      {examResult.score >= 70 ? 'Excellent!' : examResult.score >= 50 ? 'Good job!' : 'Keep practicing!'}
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
                    <span className="font-medium">{examResult.questionCount}</span>
                  </div>
                  {examResult?.is_timed &&   <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Time Taken</span>
                    <span className="font-medium">{formatTime(examResult.timeTaken)}</span>
                  </div> }
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Correct</span>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
                      <span className="font-medium">{examResult.correctCount}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Incorrect</span>
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-1.5" />
                      <span className="font-medium">{examResult.incorrectCount}</span>
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
                    <span className="text-sm font-medium">{examResult.score}%</span>
                  </div>
                  <Progress value={examResult.score} className="h-2" />
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
          
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Analysis</CardTitle>
              <CardDescription>
                Areas where you performed well and areas that need improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {examResult.score < 70 && (
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
                      You spent an average of {(examResult.timeTaken / examResult.questionCount).toFixed(1)} seconds per question.
                      {examResult.timeTaken / examResult.questionCount > 60 
                        ? ' Try to improve your speed for better time management.'
                        : ' Good job managing your time efficiently!'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </TabsContent>
        
        <TabsContent value="questions" className="mt-6">
          {questions.length > 0 ? (
            <>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  Question {currentQuestionIndex + 1} of {questions.length}
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
                    {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
                
                {currentQuestionIndex === questions.length - 1 ? (
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
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No questions available</h3>
              <p className="text-muted-foreground mt-2">
                Questions for this exam couldn't be loaded.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setActiveTab('summary')}>
                Back to Summary
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamResults;
