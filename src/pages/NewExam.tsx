
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { QuestionsSection } from "@/components/exams/QuestionsSection";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const NewExam = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isEditMode) {
      fetchExam();
    }
  }, [id]);

  const fetchExam = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (data) {
        form.reset({
          title: data.title,
          description: data.description || "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load exam",
        variant: "destructive",
      });
      navigate("/exams");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: FormData) => {
    try {
      setIsSubmitting(true);
      
      if (isEditMode) {
        // Update existing exam
        const { error } = await supabase
          .from("exams")
          .update({
            title: values.title,
            description: values.description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Exam updated successfully",
        });
      } else {
        // Create new exam
        const { data, error } = await supabase
          .from("exams")
          .insert({
            title: values.title,
            description: values.description,
          })
          .select();

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Exam created successfully",
        });
        
        // Navigate to edit page for the new exam
        if (data && data.length > 0) {
          navigate(`/exams/${data[0].id}/edit`);
        } else {
          navigate("/exams");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? "update" : "create"} exam`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/exams">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams
        </Link>
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">
        {isEditMode ? "Edit Exam" : "Create New Exam"}
      </h1>
      
      <div className="space-y-8">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Exam Information</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter exam description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update Exam" : "Create Exam"
                )}
              </Button>
            </form>
          </Form>
        </div>
        
        {isEditMode && (
          <QuestionsSection examId={id} />
        )}
      </div>
    </div>
  );
};

export default NewExam;
