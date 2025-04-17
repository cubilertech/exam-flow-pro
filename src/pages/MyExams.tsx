
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExamsTable from '@/components/exams/student/ExamsTable';
import NewExamModal from '@/components/exams/student/NewExamModal';
import { useAppSelector } from '@/lib/hooks';

const MyExams = () => {
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const { testResults } = useAppSelector((state) => state.study);

  // Filter exams by status
  const allExams = testResults || [];
  const completedExams = allExams.filter(exam => exam.questionCount === exam.correctCount + exam.incorrectCount);
  const inProgressExams = allExams.filter(exam => exam.questionCount > exam.correctCount + exam.incorrectCount);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
        <Button onClick={() => setIsNewExamModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Exam
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="inprogress">In Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <ExamsTable exams={allExams} />
        </TabsContent>
        
        <TabsContent value="completed">
          <ExamsTable exams={completedExams} />
        </TabsContent>
        
        <TabsContent value="inprogress">
          <ExamsTable exams={inProgressExams} />
        </TabsContent>
      </Tabs>

      <NewExamModal 
        open={isNewExamModalOpen}
        onOpenChange={setIsNewExamModalOpen}
      />
    </div>
  );
};

export default MyExams;
