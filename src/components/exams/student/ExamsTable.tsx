import React, {
  useEffect,
  useState,
} from 'react';

import { format } from 'date-fns';
import {
  BarChart2,
  BookOpen,
  CheckCircle,
  Clock,
  Loader2,
  PlayCircle,
  Trash2,
} from 'lucide-react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  loadExamQuestions,
  setCurrentExam,
  startExam,
} from '@/features/study/studySlice';
import { supabase } from '@/integrations/supabase/client';
import {
  useAppDispatch,
  useAppSelector,
} from '@/lib/hooks';

interface ExamsTableProps {
  filterStatus?: 'all' | 'completed' | 'inprogress';
}

const ExamsTable = ({ filterStatus = 'all' }: ExamsTableProps) => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);
  const activeQuestionBankId = useAppSelector(state => state.questions.activeQuestionBankId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      if (!user?.id || !activeQuestionBankId) {
        setExams([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('user_exams')
          .select(`
            *,
            exam_results (*)
          `)
          .eq('user_id', user.id)
          .eq('question_bank_id', activeQuestionBankId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data) {
          setExams([]);
          return;
        }
        
        const formattedExams = data.map(exam => {
          const latestResult = exam.exam_results && exam.exam_results.length > 0
            ? exam.exam_results.sort((a: any, b: any) => 
                new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
              )[0]
            : null;
          
          return {
            id: exam.id,
            name: exam.name,
            testDate: exam.created_at,
            questionCount: exam.question_count,
            completed: exam.completed,
            score: latestResult ? Number(latestResult.score) : null,
            timeTaken: latestResult ? latestResult.time_taken : 0,
            correctCount: latestResult ? latestResult.correct_count : 0,
            incorrectCount: latestResult ? latestResult.incorrect_count : 0,
            resultId: latestResult ? latestResult.id : null,
            categoryIds: exam.category_ids,
            difficulty_levels: exam.difficulty_levels,
            is_timed: exam.is_timed,
            time_limit: exam.time_limit,
            time_limit_type: exam.time_limit_type
          };
        });
        
        let filteredExams = formattedExams;
        if (filterStatus === 'completed') {
          filteredExams = formattedExams.filter(exam => exam.completed);
        } else if (filterStatus === 'inprogress') {
          filteredExams = formattedExams.filter(exam => !exam.completed);
        }
        
        setExams(filteredExams);
      } catch (error) {
        console.error('Error fetching exams:', error);
        toast.error('Failed to load exams');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExams();
  }, [user?.id, filterStatus, activeQuestionBankId]);

  const handleContinueExam = async (exam: any) => {
    try {
      toast.loading("Loading exam...");
      
      dispatch(setCurrentExam({
        id: exam.id,
        name: exam.name,
        categoryIds: exam.categoryIds,
        difficultyLevels: exam.difficulty_levels,
        questionCount: exam.questionCount,
        isTimed: exam.is_timed,
        timeLimit: exam.time_limit,
        timeLimitType: exam.time_limit_type,
        examType: 'test' // Add the missing examType property
      }));
      console.log(exam,'qqwqwqwqwqwqwqw')
      let query = supabase
      .from('questions')
      .select(`*,question_options (*)`)
      .in('category_id', exam.categoryIds || []); // Provide empty array as fallback
       if (exam.difficulty_levels?.length) {
      query = query.in('difficulty', exam.difficulty_levels);
      }
      const { data: questions, error } = await query.limit(1);

      // const { data: questions, error } = await supabase
      //   .from('questions')
      //   .select(`*,question_options (*)`)
      //   .in('category_id', exam.categoryIds)
      //   .in('difficulty', exam.difficulty_levels)
      //   .limit(1);

      if (error) throw error;

      if (!questions || questions.length === 0) {
        toast.dismiss();
        toast.error('No questions found for this exam');
        return;
      }

      const formattedQuestions = questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        serialNumber: q.serial_number,
        explanation: q.explanation,
        imageUrl: q.image_url,
        categoryId: q.category_id,
        difficulty: q.difficulty,
        tags: [],
        options: q.question_options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.is_correct
        }))
      }));

      dispatch(loadExamQuestions(formattedQuestions));
      
      dispatch(startExam({
        mode: 'test',
        startTime: new Date().toISOString()
      }));

      toast.dismiss();
      
      navigate('/exam/take');
    } catch (error) {
      console.error('Error continuing exam:', error);
      toast.dismiss();
      toast.error('Failed to continue exam');
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      const { data: result, error } = await supabase
        .rpc('delete_exam_cascade', {
          exam_id: examId
        });

      if (error) throw error;

      setExams(exams.filter(exam => exam.id !== examId));
      toast.success('Exam deleted successfully');
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
    }
  };

  if (!activeQuestionBankId) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Select a Question Bank</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Please select a question bank from the dropdown above to view your exams.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="text-center">
          <h3 className="mt-2 text-lg font-medium">No exams found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new exam.</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getExamStatus = (exam: any) => {
    if (exam.completed) {
      return {
        label: 'Completed',
        variant: 'success' as const,
        icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
      };
    } else {
      return {
        label: 'In Progress',
        variant: 'warning' as const,
        icon: <Clock className="h-3.5 w-3.5 mr-1" />
      };
    }
  };

  return (
    <Table>
      <TableCaption>A list of your exams</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Exam Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Questions</TableHead>
          <TableHead className="hidden md:table-cell">Time Taken</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exams.map((exam) => {
          const status = getExamStatus(exam);
          const isComplete = status.label === 'Completed';
          
          return (
            <TableRow key={exam.id}>
              <TableCell className="font-medium">
                {exam.name}
              </TableCell>
              <TableCell>
                {formatDate(exam.testDate)}
              </TableCell>
              <TableCell>{exam.questionCount}</TableCell>
              <TableCell className="hidden md:table-cell">
                {isComplete ? formatTime(exam.timeTaken) : '-'}
              </TableCell>
              <TableCell>
                {isComplete ? `${exam.score}%` : '-'}
              </TableCell>
              <TableCell>
                <Badge variant={status.variant} className="whitespace-nowrap flex w-fit items-center">
                  {status.icon}
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {isComplete ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/exam-results/${exam.resultId}`}>
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Results
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleContinueExam(exam)}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Continue
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this exam? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleDeleteExam(exam.id)}
                      >
                        Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ExamsTable;
