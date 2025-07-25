import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  PenSquare,
  Plus,
  Search,
  Trash,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppSelector } from "@/lib/hooks";
import { CreateCaseStudyCaseModal } from "@/components/case-study/CreateCaseStudyCaseModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CreateCaseStudyCaseForm } from "@/components/case-study/CreateCaseStudyCaseForm";
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

interface SubjectInfo {
  id?: string;
  name: string;
  description: string;
  exams_case_id?: string;
  order_index?: number;
  case_count?: number;
  is_deleted_subject?: boolean;
}
interface Case {
  id?: string;
  subject_id?: string;
  title: string;
  scenario: string;
  order_index?: number;
  question_count?: number;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters" }),
  // .or(z.literal("")), // allows empty string
});

export const CaseStudySubjectDetail = () => {
  const { examId, subjectId } = useParams<{
    examId: string;
    subjectId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.isAdmin || false;

  const [subjectInfo, setSubjectInfo] = useState<SubjectInfo | null>(null);
  const [cases, setCases] = useState<Case[]>(null);
  const [caseCount, setCaseCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectInfo | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  // const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] =    useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // console.log("examId", examId);
  // console.log("subjectId", subjectId);

  useEffect(() => {
    if (subjectId) {
      fetchSubject();
      fetchCases();
    }
  }, [subjectId]);

  useEffect(() => {
    if (subjectInfo) {
      form.reset({
        name: subjectInfo.name,
        description: subjectInfo.description || "",
      });
    }
  }, [subjectInfo, form]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", subjectId)
        .eq("is_deleted_subject", false)
        .maybeSingle(); // no error if 0 rows

      if (error) throw error;
      setSubjectInfo(data);
    } catch (error) {
      console.error("load subject info", error);
      toast({
        title: "Error",
        description: "Failed to load subject info",
        variant: "destructive",
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      setLoading(true);
      let caseWithQuestions = [];
      const { data, error } = await supabase
        .from("cases")
        .select("*, case_questions(*)")
        .eq("subject_id", subjectId)
        .eq("is_deleted_case", false)
        .order("order_index", { ascending: true });

      if (error) throw error;
      if (data.length > 0) {
        caseWithQuestions = data.map((c) => ({
          ...c,
          question_count: c.case_questions?.length || 0,
        }));
      }
      setCaseCount(caseWithQuestions.length);
      setCases(caseWithQuestions);
    } catch (error) {
      console.error("Failed to load cases", error);
      toast({
        title: "Error",
        description: "Failed to load cases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases
    ? cases.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.scenario?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch && (isAdmin || c.question_count > 0);
    })
    : [];

  const onEditSubject = async (values: z.infer<typeof formSchema>) => {
    if (!subjectId) return;
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("subjects")
        .update({
          name: values.name.trim(),
          description: values.description?.trim() || null,
        })
        .eq("id", subjectId);

      if (error) throw error;

      toast({ title: "Updated", description: "Subject updated successfully" });
      fetchSubject();
      setEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subject",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmitted = () => {
    setSheetOpen(false);
    fetchCases();
  };

  const confirmDeleteImmediate = async (subjectId: string) => {
    try {
      setIsDeleting(true);
      const { error: deleteError } = await supabase
        .from("subjects")
        .update({
          is_deleted_subject: true,
        })
        .eq("id", subjectId);
      if (deleteError) throw deleteError;
      // navigate(`/case-study-exams/:${examId}/subjects`);
      navigate(-1);
      fetchSubject();
      // const updated = questions.filter((q) => q.id !== questionToDelete.id);
      // setQuestions(updated);
      toast({ title: "Deleted", description: "Subject Deleted." });
    } catch (error) {
      console.error("Failed to delete Subject", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete Subject",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setSubjectToDelete(null);
    }
  };

  const confirmDelete = async () => {
    if (!subjectToDelete?.id) return;
    await confirmDeleteImmediate(subjectToDelete.id);
  };

  const handleDeleteSubject = async (subject: SubjectInfo) => {
    try {
      const { count, error } = await supabase
        .from("cases")
        .select("*", { count: "exact", head: true })
        .eq("subject_id", subject.id);

      if (error) throw error;

      if (count === 0) {
        // No subjects → delete immediately
        await confirmDeleteImmediate(subject.id);
      } else {
        // Has subjects → show confirmation dialog
        setSubjectToDelete(subject);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not check for Case before deleting.",
        variant: "destructive",
      });
    }
  };

  function normalizeHTML(input: string) {
    try {
      const maybeParsed = JSON.parse(input);
      return typeof maybeParsed === "string" ? maybeParsed : input;
    } catch {
      return input;
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Subject details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
            className="flex items-center  font-semibold text-gray-800 truncate dark:text-neutral-200 hover:text-black focus:outline-none "
            to="#"
          // onClick={(e) => {
          //   e.preventDefault();
          //   navigate(0);
          // }}
          >
            Subject
          </Link>
        </li>
      </ol>

      <div className="flex flex-col md:flex-row  items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex-0 md:flex-1 my-3 md:my-0">
          {subjectInfo?.name}
        </h1>
        {isAdmin && (
          <div>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
              className="mr-2"
            >
              <PenSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="delete"
              onClick={() => handleDeleteSubject(subjectInfo)}
            >
              <Trash className=" h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {subjectInfo?.description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription className="max-h-32 overflow-y-auto custom-scrollbar">
              {subjectInfo.description}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className=" rounded-lg border p-4 md:p-6 ">
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Cases..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isAdmin && (
            <Button
              onClick={() => setSheetOpen(true)}
              className="px-4 md:px-6 py-2 md:py-3"
            >
              <Plus className="h-2 w-2 mr-2" /> Add Case
            </Button>
          )}
        </div>

        {caseCount === 0 && cases && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Case available
            </h3>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Add your first case to get started"
                : "Check back later for new Cases"}
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 text-lg py-8">
              Loading...
            </div>
          ) : (
            filteredCases.map((c) => (
              <Card
                key={c.id}
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() =>
                  navigate(
                    `/case-study-exams/${examId}/subjects/${subjectId}/cases/${c.id}`
                  )
                }
              >
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">
                      {normalizeHTML(c.title)}
                    </CardTitle>
                  </div>
                  {c.scenario && (
                    <CardDescription className="text-ellipsis overflow-hidden h-[7rem] md:h-[7.5rem] line-clamp-5 custom-scrollbar">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: normalizeHTML(c.scenario),
                        }}
                      ></div>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{c.question_count} questions</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onEditSubject)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description "
                        className="resize-none"
                        {...field}
                      // required
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
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mb-2 md:mb-0"
                >
                  {isSubmitting ? "Updating..." : "Update Subject"}
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
            <SheetTitle>Add New Case</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <CreateCaseStudyCaseForm
              subjectId={subjectId || ""}
              onsuccess={handleFormSubmitted}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!subjectToDelete}
        onOpenChange={(open) => !open && setSubjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete subject? Related Data also
              Deleted.
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
