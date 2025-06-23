import { useEffect, useState } from "react";
import { ArrowLeft, PenSquare, Plus, Search, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/lib/hooks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CaseQuestionForm } from "@/components/case-study/CaseQuestionForm";
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

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";

interface Case {
  id: string;
  title: string;
  subject_id: number;
  scenario: string;
  order_index: number;
  question_count: number;
}

interface Question {
  id: string;
  question_text: string;
  case_id: number;
  correct_answer: string;
  explanation: string;
  order_index: number;
}

const formSchema = z.object({
  title: z.string().min(2, { message: "Name must be at least 2 characters" }),
  scenario: z.string().optional(),
});

const SortableItem = ({
  selectedQuestion,
  onDelete,
  onEdit,
}: {
  selectedQuestion: Question;
  onDelete: (question: Question) => void;
  onEdit: (question: Question) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: selectedQuestion.id });
  const customListeners = {
    ...listeners,
    onPointerDown: (event: React.PointerEvent) => {
      const isNoDrag = (event.target as HTMLElement)?.closest("[data-no-drag]");
      if (isNoDrag) {
        return; // Block drag
      }
      listeners?.onPointerDown?.(event); // Call original
    },
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function normalizeHTML(input: string) {
    try {
      const maybeParsed = JSON.parse(input);
      return typeof maybeParsed === "string" ? maybeParsed : input;
    } catch {
      return input;
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...customListeners}>
      <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 cursor-move">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <h3
              className="text-base md:text-lg font-semibold text-gray-900 leading-tight"
              dangerouslySetInnerHTML={{
                __html: normalizeHTML(selectedQuestion.question_text),
              }}
            ></h3>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                data-no-drag
                variant="outline"
                size="sm"
                className="text-primary border-primary hover:bg-blue-50 hover:border-blue-300"
                onClick={() => onEdit(selectedQuestion)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                data-no-drag
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={() => onDelete(selectedQuestion)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export const CaseStudyCaseDetail = () => {
  const { examId, subjectId, caseId } = useParams<{
    examId: string;
    subjectId: string;
    caseId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.isAdmin || false;

  const [caseInfo, setCaseInfo] = useState<Case | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      scenario: "",
    },
  });

  useEffect(() => {
    if (caseId) {
      fetchCaseDetail(caseId);
      fetchQuestions(caseId);
    }
  }, [caseId]);

  useEffect(() => {
    if (caseInfo) {
      form.reset({
        title: caseInfo.title,
        scenario: caseInfo.scenario || "",
      });
    }
  }, [caseInfo, form]);

  useEffect(() => {
    const ordered = questions
      .filter(
        (q) =>
          q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.explanation.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .map((q) => q.id);

    setQuestionOrder(ordered);
  }, [questions, searchTerm]);

  const fetchCaseDetail = async (caseId: string) => {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .order("order_index", { ascending: true })
      .single();

    if (data) {
      setCaseInfo(data);
    }
  };

  const fetchQuestions = async (caseId: string) => {
    const { data, error } = await supabase
      .from("case_questions")
      .select("*")
      .eq("case_id", caseId)
      .order("order_index", { ascending: true });

    if (data.length > 0) {
      setQuestions(data);
    }
  };

  const filteredQuestions = questionOrder
    .map((id) => questions.find((q) => q.id === id))
    .filter((q): q is Question => !!q);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    console.log("Drag Ended", event);
    if (event.target.closest("[data-drag-disabled]")) {
      return;
    }
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = questionOrder.indexOf(active.id);
      const newIndex = questionOrder.indexOf(over.id);
      const newOrder = arrayMove(questionOrder, oldIndex, newIndex);
      setQuestionOrder(newOrder);
    }
  };

  const handleDeleteQuestion = (question: Question) => {
    setQuestionToDelete(question);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    try {
      setIsDeleting(true);
      const { error: deleteError } = await supabase
        .from("case_questions")
        .delete()
        .eq("id", questionToDelete.id);
      if (deleteError) throw deleteError;
      const updated = questions.filter((q) => q.id !== questionToDelete.id);
      setQuestions(updated);
      toast({ title: "Deleted", description: "Question removed." });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setQuestionToDelete(null);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setSheetOpen(true);
    setCurrentQuestion(question);
    console.log("Editing", question);
  };

  const onEditCase = async (values: z.infer<typeof formSchema>) => {
    if (!caseId) return;
    try {
      const { error, data } = await supabase
        .from("cases")
        .update({
          title: values.title,
          scenario: values.scenario || null,
        })
        .eq("id", caseId);
      if (error) throw error;
      await fetchCaseDetail(caseId);
      toast({ title: "Updated", description: "Case updated successfully" });
      setSheetOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subject",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setEditDialogOpen(false);
    }
  };

  const handleFormSubmitted = () => {
    setSheetOpen(false);
    setCurrentQuestion(null);
    fetchQuestions(caseId);
  };

  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold flex-0 md:flex-1 my-3 md:my-0">
          {caseInfo?.title}
        </h1>
        <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
          <PenSquare className="mr-2 h-4 w-4" /> Edit Case
        </Button>
      </div>

      {caseInfo?.scenario && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Explanation</CardTitle>
            <p className="text-muted-foreground">{caseInfo.scenario}</p>
          </CardHeader>
        </Card>
      )}

      <div className="rounded-lg border p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Question..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setCurrentQuestion(null);
              setSheetOpen(true);
            }}
            className="px-3 md:px-6 py-2 md:py-3"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questionOrder}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-y-3">
              {filteredQuestions.map((question) => (
                <SortableItem
                  key={question.id}
                  selectedQuestion={question}
                  onDelete={handleDeleteQuestion}
                  onEdit={handleEditQuestion}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Case</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onEditCase)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter case name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scenario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scenario</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description (optional)"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Case"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full md:max-w-3xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>
              {currentQuestion ? "Edit Question" : "Add New Question"}
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <CaseQuestionForm
              caseId={caseId || ""}
              initialData={currentQuestion}
              onFormSubmitted={handleFormSubmitted}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!questionToDelete}
        onOpenChange={(open) => !open && setQuestionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete question "
              {questionToDelete?.question_text}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
