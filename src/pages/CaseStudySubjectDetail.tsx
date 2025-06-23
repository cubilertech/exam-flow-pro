import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  FileText,
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
import { CreateCaseStudyCaseModal } from "@/components/case-study/CreateCaseStudyCaseModal";

interface Subject {
  id: string;
  name: string;
  description: string;
  order_index: number;
  case_count?: number;
}

const DemoSubjectInfoData: Subject = {
  id: "1",
  name: "Subject Cardiology",
  description: "Study of heart and blood vessels",
  order_index: 1,
  case_count: 5,
};

interface Case {
  id: string;
  name: string;
  description: string;
  order_index: number;
  question_count: number;
}

const DemoCaseData: Case[] = [
  {
    id: "1",
    name: "Case Cardiology",
    description: "Study of heart and blood vessels",
    order_index: 1,
    question_count: 5,
  },
  {
    id: "2",
    name: "case Neurology",
    description: "Study of the nervous system",
    order_index: 2,
    question_count: 3,
  },
  {
    id: "3",
    name: "case Oncology",
    description: "Study of cancer",
    order_index: 3,
    question_count: 4,
  },
  {
    id: "4",
    name: "case Pediatrics",
    description: "Study of children’s health",
    order_index: 4,
    question_count: 2,
  },
  {
    id: "1",
    name: "Case Cardiology",
    description: "Study of heart and blood vessels",
    order_index: 1,
    question_count: 5,
  },
  {
    id: "2",
    name: "case Neurology",
    description: "Study of the nervous system",
    order_index: 2,
    question_count: 3,
  },
  {
    id: "3",
    name: "case Oncology",
    description: "Study of cancer",
    order_index: 3,
    question_count: 4,
  },
  {
    id: "4",
    name: "case Pediatrics",
    description: "Study of children’s health",
    order_index: 4,
    question_count: 2,
  },
  {
    id: "1",
    name: "Case Cardiology",
    description: "Study of heart and blood vessels",
    order_index: 1,
    question_count: 5,
  },
  {
    id: "2",
    name: "case Neurology",
    description: "Study of the nervous system",
    order_index: 2,
    question_count: 3,
  },
  {
    id: "3",
    name: "case Oncology",
    description: "Study of cancer",
    order_index: 3,
    question_count: 4,
  },
  {
    id: "4",
    name: "case Pediatrics",
    description: "Study of children’s health",
    order_index: 4,
    question_count: 2,
  },
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
});

export const CaseStudySubjectDetail = () => {
  const { examId ,subjectId } = useParams<{ examId : string ,subjectId: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.isAdmin || false;

  const [subjectInfo, setSubjectInfo] = useState<Subject | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (subjectId) {
      // fetchSubject();
      // fetchCases();
      setSubjectInfo(DemoSubjectInfoData); // For demo purposes, replace with actual fetch
      setCases(DemoCaseData);

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

  // const fetchSubject = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("subjects")
  //       .select("*")
  //       .eq("subjectId", subjectId)
  //       .single();

  //     if (error) throw error;
  //     setSubjectInfo(data);
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to load subject info",
  //       variant: "destructive",
  //     });
  //     navigate("/case-study-exams");
  //   }
  // };

 

  // const fetchCases = async () => {
  //   try {
  //     setLoading(true);
  //     const { data, error } = await supabase
  //       .from("cases")
  //       .select("*")
  //       .eq("subject_id", subjectId)
  //       .order("order_index", { ascending: true });

  //     if (error) throw error;
  //     setCases(data);
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

  const filteredCases = cases.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onEditSubject = async (values: z.infer<typeof formSchema>) => {
    if (!subjectId) return;
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("subjects")
        .update({
          name: values.name,
          description: values.description || null,
        })
        .eq("subjectId", subjectId);

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

  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      <div className="flex flex-col md:flex-row  items-start md:items-center mb-6">
        <Button  
          variant="outline" 
          size="sm"
          onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold flex-0 md:flex-1 my-3 md:my-0">{subjectInfo?.name}</h1>
        <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
          <PenSquare className="mr-2 h-4 w-4" /> Edit Subject
        </Button>
      </div>

      {subjectInfo?.description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>{subjectInfo.description}</CardDescription>
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

          {/* disabled={loading} */}
          <Button onClick={() => setIsCreateSubjectModalOpen(true)}  className="px-4 md:px-6 py-2 md:py-3"> 
            <Plus className="h-2 w-2 mr-2" /> Add Case
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => navigate(`/case-study-exams/${examId}/subjects/${subjectId}/cases/${c.id}`)}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                </div>
                {c.description && (
                  <CardDescription>{c.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{c.question_count} questions</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Case available
              </h3>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "Add your first subject to get started"
                  : "Check back later for new subjects"}
              </p>
            </div>
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

      {isAdmin && (
              <CreateCaseStudyCaseModal
                open={isCreateSubjectModalOpen}
                onOpenChange={setIsCreateSubjectModalOpen}
                subjectId={subjectId!}
                // onSuccess={fetchSubject}
              />
            )}
    </div>
  );
};

