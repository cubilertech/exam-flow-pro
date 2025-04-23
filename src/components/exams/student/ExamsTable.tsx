
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  PlayCircle,
  CheckCircle,
  Clock,
  BarChart2,
  Loader2,
  BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/lib/hooks';
import { toast } from 'sonner';

interface ExamsTableProps {
  filterStatus?: 'all' | 'completed' | 'inprogress';
}

const ExamsTable = ({ filterStatus = 'all' }: ExamsTableProps) => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);
  const activeQuestionBankId = useAppSelector(state => state.questions.activeQuestionBankId);

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
        
        // Format exams for display
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
            resultId: latestResult ? latestResult.id : null
          };
        });
        
        // Filter by status if needed
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

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Determine exam status
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
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/exam/take">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Continue
                    </Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ExamsTable;
