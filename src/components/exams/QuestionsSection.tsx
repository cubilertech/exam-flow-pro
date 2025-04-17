
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddQuestionDialog } from "./AddQuestionDialog";

interface Question {
  id: string;
  serial_number: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

interface ExamQuestion {
  id: string;
  exam_id: string;
  question_id: string;
  created_at: string;
  question: Question;
}

interface QuestionsProps {
  examId: string;
  questionBankId: string;
}

export function QuestionsSection({ examId, questionBankId }: QuestionsProps) {
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchExamQuestions();
  }, [examId]);

  const fetchExamQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("exam_questions")
        .select(`
          id,
          exam_id,
          question_id,
          created_at,
          question:question_id(id, serial_number, text, difficulty, created_at)
        `)
        .eq("exam_id", examId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setExamQuestions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveQuestion = async (examQuestionId: string) => {
    try {
      const { error } = await supabase
        .from("exam_questions")
        .delete()
        .eq("id", examQuestionId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Question removed from exam",
      });
      
      // Refresh the question list
      fetchExamQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove question",
        variant: "destructive",
      });
    }
  };

  // Filter questions based on search term
  const filteredQuestions = examQuestions.filter(examQuestion => 
    examQuestion.question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    examQuestion.question.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Questions</h2>
        <Dialog open={addQuestionOpen} onOpenChange={setAddQuestionOpen}>
          <DialogTrigger asChild>
            <Button disabled={!questionBankId}>
              <Plus className="mr-2 h-4 w-4" /> Add Questions
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Add Questions to Exam</DialogTitle>
            </DialogHeader>
            <AddQuestionDialog 
              examId={examId} 
              questionBankId={questionBankId}
              onClose={() => setAddQuestionOpen(false)}
              onSuccess={() => {
                setAddQuestionOpen(false);
                fetchExamQuestions();
              }}
              existingQuestionIds={examQuestions.map(eq => eq.question_id)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial #</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Loading questions...
                </TableCell>
              </TableRow>
            ) : filteredQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  {searchTerm ? "No questions match your search" : "No questions added to this exam yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredQuestions.map(examQuestion => (
                <TableRow key={examQuestion.id}>
                  <TableCell className="font-mono">
                    {examQuestion.question.serial_number}
                  </TableCell>
                  <TableCell>
                    {examQuestion.question.text.length > 100 
                      ? examQuestion.question.text.substring(0, 100) + "..." 
                      : examQuestion.question.text}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      examQuestion.question.difficulty === 'easy' 
                        ? 'bg-green-100 text-green-800' 
                        : examQuestion.question.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {examQuestion.question.difficulty}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleRemoveQuestion(examQuestion.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
