
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExamsTable from '@/components/exams/student/ExamsTable';
import NewExamModal from '@/components/exams/student/NewExamModal';
import { useAppDispatch } from '@/lib/hooks';
import { clearCurrentTest } from '@/features/study/studySlice';

const MyExams = () => {
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  
  // Clear any ongoing test when entering this page
  useEffect(() => {
    dispatch(clearCurrentTest());
  }, [dispatch]);

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
          <ExamsTable filterStatus="all" />
        </TabsContent>
        
        <TabsContent value="completed">
          <ExamsTable filterStatus="completed" />
        </TabsContent>
        
        <TabsContent value="inprogress">
          <ExamsTable filterStatus="inprogress" />
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
