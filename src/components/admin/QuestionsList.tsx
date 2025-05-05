import { useState } from 'react';

import {
  Edit,
  Image,
  Trash2,
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  serialNumber: string;
  text: string;
  options: Option[];
  explanation: string;
  imageUrl?: string;
  categoryId: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
}

interface QuestionsListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
}

export const QuestionsList = ({ questions, onEdit }: QuestionsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const filteredQuestions = questions.filter(
    (question) =>
      question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.serialNumber.toString().includes(searchTerm)
  );

  const handleDeleteQuestion = (question: Question) => {
    setQuestionToDelete(question);
  };

  const confirmDelete = async () => {
    if (questionToDelete) {
      try {
        setIsDeleting(true);

        // Delete the question from the database
        const { error } = await supabase
          .from("questions")
          .delete()
          .eq("id", questionToDelete.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Question deleted successfully",
        });

        // Refresh the questions list
        window.location.reload();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete question",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
        setQuestionToDelete(null);
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "hard":
        return "bg-red-600";
      case "medium":
        return "bg-yellow-600";
      case "easy":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div>
      {filteredQuestions.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36">ID</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="w-24">Type</TableHead>
                <TableHead className="w-24">Difficulty</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium">
                    {question.serialNumber}
                  </TableCell>
                  <TableCell>
                    <div className="truncate max-w-md">{question.text}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {question.options.filter((opt) => opt.isCorrect).length >
                      1 ? (
                        <Badge variant="outline" className="bg-blue-100">
                          Multiple
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-purple-100">
                          Single
                        </Badge>
                      )}
                      {question.imageUrl && (
                        <Image className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getDifficultyColor(
                        question.difficulty
                      )} text-white capitalize`}
                    >
                      {question.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(question)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteQuestion(question)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-md">
          <p className="mb-4 text-muted-foreground">No questions found</p>
          <Button
            variant="outline"
            onClick={() => setSearchTerm("")}
            className="mt-2"
          >
            Clear search
          </Button>
        </div>
      )}

      <AlertDialog
        open={!!questionToDelete}
        onOpenChange={(open) => !open && setQuestionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete question #
              {questionToDelete?.serialNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
