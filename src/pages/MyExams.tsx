import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExamsTable from '@/components/exams/student/ExamsTable';
import NewExamModal from '@/components/exams/student/NewExamModal';

const MyExams = () => {
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Exams</h1>
        <Button
          onClick={() => setIsNewExamModalOpen(true)}
          className="w-full sm:w-auto py-2 px-4 sm:py-3 sm:text-sm sm:px-6"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Exam
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="flex min-w-full sm:min-w-0 w-max gap-2 mb-4">
            <TabsTrigger value="all" className="whitespace-nowrap">All</TabsTrigger>
            <TabsTrigger value="completed" className="whitespace-nowrap">Completed</TabsTrigger>
            <TabsTrigger value="inprogress" className="whitespace-nowrap">In Progress</TabsTrigger>
          </TabsList>
        </div>

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

      {/* Modal */}
      <NewExamModal
        open={isNewExamModalOpen}
        onOpenChange={setIsNewExamModalOpen}
      />
    </div>
  );
};

export default MyExams;
