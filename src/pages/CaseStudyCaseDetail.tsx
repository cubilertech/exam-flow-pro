import { useEffect, useState } from "react";
import {
  PenSquare,
  Plus,
  Search,
  Trash,
  BookOpen,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  arrayMove,
} from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";

import { CaseSenerioShow } from "./CaseSenerioShow";
import { CreateCaseStudyCaseForm } from "@/components/case-study/CreateCaseStudyCaseForm";
import { useToast } from "@/hooks/use-toast";
import { SortableItem } from "@/components/case-study/SortableItem";

interface CaseInfo {
  id: string;
  title: string | null;
  subject_id: number | null;
  scenario: string | null;
  order_index: number | null;
  question_count: number;
  is_deleted_case: boolean;
}

interface Question {
  id: string;
  question_text: string | null;
  case_id: number | null;
  correct_answer: string;
  explanation: string | null;
  order_index: number | null;
}

const formSchema = z.object({
  title: z.string().min(2, { message: "Name must be at least 2 characters" }),
  scenario: z.string().optional(),
});

export const CaseStudyCaseDetail = () => {
  const { examId, subjectId, caseId } = useParams<{
    examId: string;
    subjectId: string;
    caseId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.isAdmin || false;
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [availbleQuestions, setAvailbleQuestions] = useState<Question[] | null>(null);
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [caseToDelete, setCaseToDelete] = useState<CaseInfo | null>(null);
  const [isDeletingCase, setIsDeletingCase] = useState(false);
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
      fetchCasesAndQuestions(caseId);
    }
  }, [caseId]);

  useEffect(() => {
    if (caseInfo) {
      form.reset({
        title: caseInfo.title || "",
        scenario: caseInfo.scenario || "",
      });
    }
  }, [caseInfo, form]);

  const fetchCasesAndQuestions = async (caseId: string) => {
    try {
      setLoading(true);
      // Fetch both case and questions in parallel
      await Promise.all([fetchCaseInfo(), fetchQuestions(caseId)]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ordered = questions
      .filter((q) =>
        q.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((q) => q.id);
    setQuestionOrder(ordered);
  }, [questions, searchTerm]);

  const fetchCaseInfo = async () => {
    
    if (!caseId) return;
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .eq("is_deleted_case", false)
        .order("order_index", { ascending: true })
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const formattedCase: CaseInfo = {
          id: data.id,
          title: data.title ?? null,
          subject_id: data.subject_id ? parseInt(data.subject_id, 10) : null,
          scenario: data.scenario ?? null,
          order_index: data.order_index ?? null,
          is_deleted_case: data.is_deleted_case ?? false,
          question_count: 0, // Default or computed elsewhere
        };
        setCaseInfo(formattedCase);
      }
    } catch (error: any) {
      console.error("Error in Fetching Case");
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } 
  };

  const fetchQuestions = async (caseId: string) => {
    
    try {
      const { data, error } = await supabase
        .from("case_questions")
        .select("*")
        .eq("case_id", caseId)
        .order("order_index", { ascending: true });

      if (error) throw error;

      if (data.length === 0) {
        setAvailbleQuestions([]);
        setQuestions([]);
        setQuestionCount(0);
      } else {
        // Convert fields to match the `Question` interface
        const mappedQuestions: Question[] = data.map((item: any) => ({
          id: item.id,
          question_text: item.question_text ?? null,
          case_id: item.case_id ? Number(item.case_id) : null,
          correct_answer: item.correct_answer,
          explanation: item.explanation ?? null,
          order_index: item.order_index ?? null,
        }));

        setQuestions(mappedQuestions);
        setQuestionCount(mappedQuestions.length);
      }
    } catch (error: any) {
      console.error("Error Fetching the Questions :", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } 
  };

  const filteredQuestions = questionOrder
    .map((id) => questions.find((q) => q.id === id))
    .filter((q): q is Question => !!q);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event) => {
    if (
      event.target &&
      "closest" in event.target &&
      (event.target as HTMLElement).closest("[data-no-drag]")
    ) {
      return;
    }

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questionOrder.indexOf(active.id as string);
    const newIndex = questionOrder.indexOf(over.id as string);
    const newOrder = arrayMove(questionOrder, oldIndex, newIndex);
    setQuestionOrder(newOrder);

    const updates = newOrder.map((id, index) => ({
      id,
      order_index: index,
    }));

    const updatedQuestions = questions
      .map((q) => {
        const updated = updates.find((u) => u.id === q.id);
        return updated ? { ...q, order_index: updated.order_index } : q;
      })
      .sort((a, b) => a.order_index - b.order_index);

    console.log("updatedQuestions: ", updatedQuestions);

    setQuestions(updatedQuestions.sort((a, b) => a.order_index - b.order_index));

    try {
      await Promise.all(
        updates.map((update) =>
          supabase
            .from("case_questions")
            .update({ order_index: update.order_index })
            .eq("id", update.id)
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order in database",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (question: Question) => {
    try {
      await supabase
        .from("case_questions")
        .delete()
        .eq("id", question.id);

      toast({ title: "Deleted", description: "Question deleted" });

      if (caseId) {
        const { data: remaining, error } = await supabase
          .from("case_questions")
          .select("id")
          .eq("case_id", caseId)
          .order("order_index", { ascending: true });

        if (error) throw error;
        await Promise.all(
          remaining.map((q, index) =>
            supabase
              .from("case_questions")
              .update({ order_index: index })
              .eq("id", q.id)
          )
        );
        await fetchQuestions(caseId);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };


  const handleEditCase = () => {
    setEditSheetOpen(false);
    fetchCaseInfo();
    console.log("Editing Case");
  };

  const handleEditQuestion = (question: Question) => {
    setSheetOpen(true);
    setCurrentQuestion(question);
    console.log("Editing", question);
  };

  const handleFormSubmitted = () => {
    setSheetOpen(false);
    setCurrentQuestion(null);
    fetchQuestions(caseId);
  };

  function normalizeHTML(input: string) {
    try {
      const maybeParsed = JSON.parse(input);
      return typeof maybeParsed === "string" ? maybeParsed : input;
    } catch {
      return input;
    }
  }

  const confirmDeleteImmediate = async (caseId: string) => {
    try {
      setIsDeletingCase(true);
      const { error: deleteError } = await supabase
        .from("cases")
        .update({
          is_deleted_case: true,
        })
        .eq("id", caseId);
      if (deleteError) throw deleteError;

      navigate(-1);
      await fetchCaseInfo();

      toast({ title: "Deleted", description: "Case Deleted Sucessfully. " });
    } catch (error) {
      console.error("Failed to delete Case", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete Case",
        variant: "destructive",
      });
    } finally {
      setIsDeletingCase(false);
      setCaseToDelete(null);
      setLoading(false)
    }
  };

  const confirmDelete = async () => {
    if (!caseToDelete?.id) return;
    await confirmDeleteImmediate(caseToDelete.id);
  };

  const handleDeleteCase = async (deletedCase: CaseInfo) => {
    console.log("delete click")
    setLoading(true);
    try {
      const { count, error } = await supabase
        .from("case_questions")
        .select("*", { count: "exact", head: true })
        .eq("case_id", deletedCase.id);

      if (error) throw error;

      if (count === 0) {
        await confirmDeleteImmediate(deletedCase.id);
      } else {
        setCaseToDelete(deletedCase);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not check for Case before deleting.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Case details...</p>
          </div>
        </div>
      </div>
    );
  }

  return isAdmin ? (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      <ol className="flex items-center whitespace-nowrap text-sm md:text-base ">
        <li className="inline-flex items-center">
          <Link
            className="flex items-center  text-gray-500 hover:text-gray-800 hover:font-semibold focus:outline-none focus:text-blue-600 dark:text-neutral-500 dark:hover:text-blue-500 dark:focus:text-blue-500"
            to="#"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/case-study-exams`);
            }}
          >
            Home
          </Link>
          <svg
            className="shrink-0 mx-2 size-4 text-gray-400 dark:text-neutral-600"
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </li>
        <li className="inline-flex items-center">
          <Link
            className="flex items-center  text-gray-500 hover:text-gray-800 hover:font-semibold focus:outline-none focus:text-blue-600 dark:text-neutral-500 dark:hover:text-blue-500 dark:focus:text-blue-500"
            to="#"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/case-study-exams/${examId}`);
            }}
          >
            Exam
          </Link>
          <svg
            className="shrink-0 mx-2 size-4 text-gray-400 dark:text-neutral-600"
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </li>
        <li className="inline-flex items-center">
          <Link
            className="flex items-center  text-gray-500 hover:text-gray-800 hover:font-semibold focus:outline-none focus:text-blue-600 dark:text-neutral-500 dark:hover:text-blue-500 dark:focus:text-blue-500"
            to="#"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/case-study-exams/${examId}/subjects/${subjectId}`);
            }}
          >
            Subject
          </Link>
          <svg
            className="shrink-0 mx-2 size-4 text-gray-400 dark:text-neutral-600"
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </li>
        <li className="inline-flex items-center">
          <Link
            className="flex items-center  font-semibold text-gray-800 truncate dark:text-neutral-200 hover:text-black focus:outline-none "
            to="#"
          >
            Case
          </Link>
        </li>
      </ol>

      <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex-0 md:flex-1 my-3 md:my-0">
          {caseInfo?.title}
        </h1>
        {/* <Button variant="outline" onClick={() => setEditSheetOpen(true)}>
          <PenSquare className="mr-2 h-4 w-4" /> Edit Case
        </Button> */}
        {isAdmin && (
          <div>
            <Button
              variant="outline"
              onClick={() => setEditSheetOpen(true)}
              className="mr-2"
            >
              <PenSquare className="h-4 w-4" />
            </Button>
            <Button variant="delete" onClick={() => handleDeleteCase(caseInfo)}>
              <Trash className=" h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {caseInfo?.scenario && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Scenario</CardTitle>
            <CardDescription className="max-h-32 overflow-y-auto">
              <div
                dangerouslySetInnerHTML={{
                  __html: normalizeHTML(caseInfo.scenario),
                }}
              />
            </CardDescription>
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
            className="px-3  md:px-6 py-2 md:py-3"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>
        </div>
        {(questionCount === 0 && Array.isArray(availbleQuestions)) || (filteredQuestions.length === 0 && questionCount > 0) ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Question available
            </h3>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Add your first case to get started"
                : "Check back later for new subjects"}
            </p>
          </div>
        ) : null}

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
              {filteredQuestions.map((question, index) => (
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

      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent
          side="right"
          className="w-full md:max-w-3xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Edit Case</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <CreateCaseStudyCaseForm
              subjectId={subjectId || ""}
              initialData={caseInfo}
              onsuccess={handleEditCase}
            />
          </div>
        </SheetContent>
      </Sheet>

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
        open={!!caseToDelete}
        onOpenChange={(open) => !open && setCaseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Case.? Related Data also Deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCase}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeletingCase}
            >
              {isDeletingCase ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ) : (
    <CaseSenerioShow />
  );
};
