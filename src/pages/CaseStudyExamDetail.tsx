import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  ArrowLeft,
  BookOpen,
  FileText,
  PenSquare,
  Trash,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CreateCaseStudySubjectModal } from "@/components/case-study/CreateCaseStudySubjectModal";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

interface CaseStudyExamInfo {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  is_deleted_exam: boolean | null;
  order_index?: number | null;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  order_index: number;
  case_count?: number;
}

const formSchema = z.object({
  title: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(5, { message: "Name must be at least 5 characters" }),
});

const CaseStudyExamDetail = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.isAdmin || false;
  const { toast } = useToast();

  const [examInfo, setExamInfo] = useState<CaseStudyExamInfo | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);
  const [subjectCount, setSubjectCount] = useState<number>(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<CaseStudyExamInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  console.log("subjects", subjects);

  useEffect(() => {
    console.log("Fetching exam details for ID:", examId);
    if (examId) {
      fetchExamAndSubjects();
    }
  }, [examId]);

  const fetchExamAndSubjects = async () => {
    try {
      setLoading(true);
      // Fetch both exam and subjects in parallel
      await Promise.all([fetchExam(), fetchSubjects()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examInfo) {
      form.reset({
        title: examInfo.title,
        description: examInfo.description || "",
      });
    }
  }, [examInfo, form]);

  const fetchExam = async () => {
    try {
      const { data: examData, error } = await supabase
        .from("exams_case")
        .select("*")
        .eq("id", examId)
        .eq("is_deleted_exam", false)
        .single();

      if (error) throw error;
      setExamInfo(examData);
    } catch (error) {
      console.error("Error fetching exam data:", error);
      toast({
        title: "Error",
        description: "Failed to load exam data",
        variant: "destructive",
      });
      setExamInfo(null);
    }
  };

  const fetchSubjects = async () => {
    try {
      const processedSubjects: Subject[] = [];

      const { data: subjectsData, error } = await supabase
        .from("subjects")
        .select(`*, cases(id)`)
        .eq("exams_case_id", examId)
        .eq("is_deleted_subject", false)
        .eq("cases.is_deleted_case", false)
        .order("order_index", { ascending: true });

      if (error) throw error;

      for (const subject of subjectsData || []) {
        const cases = subject.cases || [];
        let caseCount = 0;

        if (isAdmin) {
          caseCount = cases.length;
        } else {
          let visibleCaseCount = 0;
          for (const caseItem of cases) {
            const { count, error } = await supabase
              .from("case_questions")
              .select("*", { count: "exact", head: true })
              .eq("case_id", caseItem.id);
            if (error) throw error;
            if ((count || 0) > 0) visibleCaseCount++;
          }
          caseCount = visibleCaseCount;
        }

        if (isAdmin || caseCount > 0) {
          processedSubjects.push({
            ...subject,
            case_count: caseCount,
          });
        }
      }

      setSubjects(processedSubjects);
      setSubjectCount(processedSubjects.length);
    } catch (error) {
      console.error("Error fetching subject data:", error);
      toast({
        title: "Error",
        description: "Failed to load Subject data",
        variant: "destructive",
      });
    }
  };

  console.log("examInfo", examInfo);

  const onEditExam = async (values: z.infer<typeof formSchema>) => {
    if (!examId) return;
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("exams_case")
        .update({
          title: values.title,
          description: values.description || null,
        })
        .eq("id", examId);

      if (error) throw error;
      toast({ title: "Updated", description: "Exam updated successfully" });
      fetchExam(); // Only need to refetch exam data for the edit
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating exam:", error);
      toast({
        title: "Error",
        description: "Failed to update exam",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExam = async (exam: CaseStudyExamInfo) => {
    try {
      const { count, error } = await supabase
        .from("subjects")
        .select("*", { count: "exact", head: true })
        .eq("exams_case_id", exam.id);
      if (error) throw error;

      if (count === 0) {
        await confirmDeleteImmediate(exam.id);
      } else {
        setExamToDelete(exam);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not check for subjects before deleting.",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteImmediate = async (examId: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("exams_case")
        .update({ is_deleted_exam: true })
        .eq("id", examId);
      if (error) throw error;

      navigate("/case-study-exams");
      toast({ title: "Deleted", description: "Exam Deleted." });
    } catch (error) {
      console.error("Failed to delete Exam", error);
      toast({
        title: "Error",
        description: "Failed to delete Exam",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setExamToDelete(null);
    }
  };

  const confirmDelete = async () => {
    if (!examToDelete?.id) return;
    await confirmDeleteImmediate(examToDelete.id);
  };

  const handleSubjectClick = (subject: Subject) => {
    navigate(`/case-study-exams/${examId}/subjects/${subject.id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading exam details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!examInfo) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h3 className="text-lg font-medium text-muted-foreground mb-4">
          Exam not found
        </h3>
        <Button onClick={() => navigate("/case-study-exams")}>
          <ArrowLeft className="mt-3 mr-2 h-4 w-4" />
          Back to Exams
        </Button>
      </div>
    );
  }

  return (

    <div className="container mx-auto py-6 space-y-6">
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
            className="flex items-center  font-semibold text-gray-800 truncate dark:text-neutral-200 hover:text-black focus:outline-none "
            to="#"
          // onClick={(e) => {
          //   e.preventDefault();
          //   navigate(0);
          // }}
          >
            Exam
          </Link>
        </li>
      </ol>

      <div className="flex flex-col md:flex-row  items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex-0 md:flex-1 my-3 md:my-0">
          {examInfo?.title}
        </h1>
        {isAdmin && (
          <div>
            <Button
              variant="outline"
              className="mr-2"
              onClick={() => setEditDialogOpen(true)}
            >
              <PenSquare className=" h-4 w-4" />
            </Button>
            <Button variant="delete" onClick={() => handleDeleteExam(examInfo)}>
              <Trash className=" h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {examInfo?.description && (
        <div className="-mx-4 sm:mx-0">
          <Card className="w-full mb-6">
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription className="max-h-32 overflow-y-auto">
                {examInfo.description}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Subjects</h2>
        {isAdmin && (
          <Button onClick={() => setIsCreateSubjectModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        )}
      </div>

      {!loading && subjectCount === 0 && subjects && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No subject available
          </h3>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Add your first subject to get started"
              : "Check back later for new subjects"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects?.map((subject) => (
          <Card
            key={subject.id}
            className="cursor-pointer transition-shadow hover:shadow-lg "
            onClick={() => handleSubjectClick(subject)}
          >
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{subject.name}</CardTitle>
              </div>
              {subject.description && (
                <CardDescription className="text-ellipsis overflow-hidden h-[7rem] md:h-[7.5rem]  line-clamp-5">
                  {subject.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{subject.case_count} cases</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onEditExam)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter exam title" {...field} />
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
                        placeholder="Enter description"
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

      <AlertDialog
        open={!!examToDelete}
        onOpenChange={(open) => !open && setExamToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Exam.? Related Data also Deleted.
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

      {isAdmin && (
        <CreateCaseStudySubjectModal
          open={isCreateSubjectModalOpen}
          onOpenChange={setIsCreateSubjectModalOpen}
          examId={examId!}
          onSuccess={fetchSubjects}
        />
      )}
    </div>
  );
};

export default CaseStudyExamDetail;
