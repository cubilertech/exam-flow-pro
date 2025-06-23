import { useEffect, useState } from "react";
import {
  ArrowLeft,
  PenSquare,
  Plus,
  Search,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CaseQuestionForm } from "@/components/case-study/CaseQuestionForm";
import { on } from "events";

interface Case {
  id: string;
  name: string;
  description: string;
  order_index: number;
  question_count: number;
}

interface Question {
  questionId: string;
  questionText: string;
  answer: string;
  explanation: string;
  caseId: string;
}

const DemoCaseInfoData: Case = {
  id: "1",
  name: "Case Cardiology",
  description: "Study of heart and blood vessels",
  order_index: 1,
  question_count: 5,
};

const DemoQuestionData: Question[] = [
  {
    questionId: "q1",
    questionText: "What is the normal heart rate?",
    answer: "60-100 bpm",
    explanation: "Normal adult resting heart rate is 60–100 beats per minute.",
    caseId: "1",
  },
  {
    questionId: "q2",
    questionText: "Which valve is between left atrium and ventricle?",
    answer: "Mitral valve",
    explanation: "Mitral valve prevents backflow into left atrium.",
    caseId: "1",
  },
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
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

  const [caseInfo, setCaseInfo] = useState<Case | null>(null);
  const [questions, setQuestion] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (caseId) {
         // fetchCase();
      // fetchQuestions();
      setCaseInfo(DemoCaseInfoData);
      setQuestion(DemoQuestionData);
    }
  }, [caseId]);

  useEffect(() => {
    if (caseInfo) {
      form.reset({
        name: caseInfo.name,
        description: caseInfo.description || "",
      });
    }
  }, [caseInfo, form]);

  const filteredCases = questions.filter(
    (c) =>
      c.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.explanation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

   // const fetctCase = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("cases")
  //       .select("*")
  //       .eq("caseId", caseId)
  //       .single();

  //     if (error) throw error;
  //     setCaseInfo(data);
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to load subject info",
  //       variant: "destructive",
  //     });
  //     navigate("/case-study-exams");
  //   }
  // };

 

  // const fetchQuestions = async () => {
  //   try {
  //     setLoading(true);
  //     const { data, error } = await supabase
  //       .from("questions")
  //       .select("*")
  //       .eq("case_id", caseId)
  //       .order("order_index", { ascending: true });

  //     if (error) throw error;
  //     setQuestions(data);
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to load cases",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onEditCase = async (values: z.infer<typeof formSchema>) => {
    if (!caseId) return;
    try {
    //   setIsSubmitting(true);

    //   const { error } = await supabase
    //     .from("cases")
    //     .update({
    //       name: values.name,
    //       description: values.description || null,
    //     })
    //     .eq("caseId", caseId);
        const error = null; // Simulating no error for demo

      if (error) throw error;

      toast({ title: "Updated", description: "Case updated successfully" });
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
    // This function can be used to refresh the questions after adding a new one
    // For now, we will just log a message
     setSheetOpen(false);
    // setCurrentQuestion(null);
    // fetchQuestions();
    console.log("New question added, refresh questions if needed");
  };

  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      <div className="flex flex-col md:flex-row  items-start md:items-center mb-6">
        <Button variant="outline"
        size="sm" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold flex-0 md:flex-1 my-3 md:my-0">{caseInfo?.name}</h1>
        <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
          <PenSquare className="mr-2 h-4 w-4" /> Edit Case
        </Button>
      </div>

      {caseInfo?.description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Explanation</CardTitle>
            <CardDescription>{caseInfo.description}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="rounded-lg border p-6 ">
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

          <Button onClick={() => setSheetOpen(true)} className="px-3 md:px-6 py-2 md:py-3">
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((q) => (
            <Card key={q.questionId} className="p-4">
              <CardHeader>
                <CardTitle className="text-lg">{q.questionText}</CardTitle>
                <CardDescription>{q.answer}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {q.explanation}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Case</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditCase)} className="space-y-4">
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
                  {isSubmitting ? "Updating..." : "Update Subject"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full md:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Question</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <CaseQuestionForm
              caseId={caseId  || ""}
              onFormSubmitted={handleFormSubmitted}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
