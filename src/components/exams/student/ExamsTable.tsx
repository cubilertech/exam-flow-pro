
import React from 'react';
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
  BarChart2
} from 'lucide-react';
import { TestResult } from '@/features/study/studySlice';

interface ExamsTableProps {
  exams: TestResult[];
}

const ExamsTable = ({ exams }: ExamsTableProps) => {
  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="text-center">
          <h3 className="mt-2 text-lg font-medium">No exams found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new exam.</p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/my-exams">Create Exam</Link>
            </Button>
          </div>
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
  const getExamStatus = (exam: TestResult) => {
    const isComplete = exam.questionCount === (exam.correctCount + exam.incorrectCount);
    
    if (isComplete) {
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
                {formatDate(exam.testDate)}
              </TableCell>
              <TableCell>{exam.questionCount}</TableCell>
              <TableCell className="hidden md:table-cell">
                {formatTime(exam.timeTaken)}
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
                    <Link to={`/exam-results/${exam.id}`}>
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
