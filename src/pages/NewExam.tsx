
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Define an interface for the exam data to include subscription_type
interface ExamData {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  subscription_type: string | null;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().optional(),
  subscriptionType: z.string().optional(),
  isSubscription: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

const SUBSCRIPTION_TYPES = [
  { value: "part1", label: "Part 1 Exam" },
  { value: "part2", label: "Part 2 Exam" },
  { value: "promo1", label: "Promotion 1" },
  { value: "promo2", label: "Promotion 2" },
  { value: "promo3", label: "Promotion 3" },
];

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
      subscriptionType: "",
      isSubscription: false,
    },
  });

  // Watch the isSubscription value to conditionally show subscription type
  const isSubscription = form.watch("isSubscription");

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
        // Type assert data as ExamData to ensure TypeScript recognizes subscription_type
        const examData = data as ExamData;
        form.reset({
          title: examData.title,
          description: examData.description || "",
          subscriptionType: examData.subscription_type || "",
          isSubscription: !!examData.subscription_type,
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
      
      const examData = {
        title: values.title,
        description: values.description,
        subscription_type: values.isSubscription ? values.subscriptionType : null,
        updated_at: new Date().toISOString(),
      };
      
      if (isEditMode) {
        // Update existing exam
        const { error } = await supabase
          .from("exams")
          .update(examData)
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
          .insert(examData)
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
              
              <FormField
                control={form.control}
                name="isSubscription"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        This is a subscription exam
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Subscription exams can be associated with specific categories for different subscription types
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              {isSubscription && (
                <FormField
                  control={form.control}
                  name="subscriptionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subscription type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUBSCRIPTION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
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
