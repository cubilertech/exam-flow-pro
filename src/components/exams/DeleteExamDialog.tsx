
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Exam } from "@/pages/Exams";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: Exam | null;
  onConfirm: () => void;
}

export function DeleteExamDialog({
  open,
  onOpenChange,
  exam,
  onConfirm,
}: DeleteExamDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!exam) return;

    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from("exams")
        .delete()
        .eq("id", exam.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Exam deleted successfully",
      });
      
      onOpenChange(false);
      onConfirm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete exam",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the exam "{exam?.title}" and cannot be undone.
            All questions associated with this exam will remain in the database but will no longer be associated with this exam.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
