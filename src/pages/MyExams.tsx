
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Database } from "lucide-react";
import ExamsTable from '@/components/exams/student/ExamsTable';
import NewExamModal from '@/components/exams/student/NewExamModal';
import { useQuestionBankSubscriptions } from '@/hooks/useQuestionBankSubscriptions';

const MyExams = () => {
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const { subscriptions, setActiveQuestionBankById, activeQuestionBankId } = useQuestionBankSubscriptions();
  // console.log('subscriptions:', subscriptions);

  const handleQuestionBankChange = (questionBankId: string) => {
    setActiveQuestionBankById(questionBankId);
  };

  const activeQuestionBank = subscriptions.find(qb => qb.id === activeQuestionBankId);

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

        {/* Question Bank Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Question Bank:</span>
          </div>
          <Select
            value={activeQuestionBankId || ''}
            onValueChange={handleQuestionBankChange}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select a question bank" />
            </SelectTrigger>
            <SelectContent>
            

              {subscriptions.map((questionBank) => (
                <SelectItem key={questionBank.id} value={questionBank.id}>
                  {questionBank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
