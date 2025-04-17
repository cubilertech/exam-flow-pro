
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Play } from "lucide-react";
import { TestResult } from '@/features/study/studySlice';
import { formatDistanceToNow } from 'date-fns';

interface ExamsTableProps {
  exams: TestResult[];
}

const ExamsTable: React.FC<ExamsTableProps> = ({ exams }) => {
  if (exams.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No exams found.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>List of your exams</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Marks (%)</TableHead>
          <TableHead>Correct</TableHead>
          <TableHead>Incorrect</TableHead>
          <TableHead>Unanswered</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exams.map((exam) => {
          const unansweredCount = exam.questionCount - (exam.correctCount + exam.incorrectCount);
          const isCompleted = unansweredCount === 0;
          
          return (
            <TableRow key={exam.id}>
              <TableCell className="font-medium">{exam.id}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(exam.testDate), { addSuffix: true })}</TableCell>
              <TableCell>{exam.score.toFixed(1)}%</TableCell>
              <TableCell>{exam.correctCount}</TableCell>
              <TableCell>{exam.incorrectCount}</TableCell>
              <TableCell>{unansweredCount}</TableCell>
              <TableCell>
                {isCompleted ? (
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                ) : (
                  <Button variant="default" size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Continue
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
