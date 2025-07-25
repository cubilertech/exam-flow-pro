import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExamsTable from '@/components/exams/student/ExamsTable';
import NewExamModal from '@/components/exams/student/NewExamModal';
import { useQuestionBankSubscriptions } from '@/hooks/useQuestionBankSubscriptions';

// Import dropdown components from shadcn/ui
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const MyExams = () => {
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);

  const {
    subscriptions,
    setActiveQuestionBankById,
    activeQuestionBankId,
  } = useQuestionBankSubscriptions();

  useEffect(() => {
    console.log("Subscribed Question Banks:", subscriptions);
  }, [subscriptions]);

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

      {/* Tabs with dropdown pushed to far right */}
      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="flex w-full gap-2 mb-4 items-center">
            <div className="flex gap-2">
              <TabsTrigger value="all" className="whitespace-nowrap">All</TabsTrigger>
              <TabsTrigger value="completed" className="whitespace-nowrap">Completed</TabsTrigger>
              <TabsTrigger value="inprogress" className="whitespace-nowrap">In Progress</TabsTrigger>
            </div>

            {/* Fixed-size dropdown on the right */}
            <div className="ml-auto flex-shrink-0 w-[240px]">
              {subscriptions.length > 0 && (
                <Select
                  onValueChange={(value) => setActiveQuestionBankById(value)}
                  defaultValue={activeQuestionBankId || subscriptions[0]?.id}
                >
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Choose a question bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptions.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </TabsList>
        </div>

        {/* Tab Contents */}
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
