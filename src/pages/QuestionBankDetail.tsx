
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QuestionsList } from "@/components/admin/QuestionsList";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Plus, Search, ArrowLeft, PenSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface Question {
  id: string;
  serialNumber: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  imageUrl?: string;
  categoryId: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Category {
  id: string;
  name: string;
  questionBankId?: string;
}

interface QuestionBank {
  id: string;
  name: string;
  description: string | null;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
});

const QuestionBankDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (id) {
      fetchQuestionBank();
      fetchCategories();
    }
  }, [id]);

  useEffect(() => {
    if (questionBank) {
      form.reset({
        name: questionBank.name,
        description: questionBank.description || "",
      });
    }
  }, [questionBank, form]);

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, id]);

  const fetchQuestionBank = async () => {
    try {
      const { data, error } = await supabase
        .from("question_banks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (data) {
        setQuestionBank(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load question bank",
        variant: "destructive",
      });
      navigate("/questions"); // Redirect on error
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("question_bank_id", id)
        .order("name");

      if (error) throw error;
      
      if (data) {
        setCategories(data.map(cat => ({
          id: cat.id,
          name: cat.name,
          questionBankId: cat.question_bank_id,
        })));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("questions")
        .select(`
          id,
          serial_number,
          text,
          explanation,
          image_url,
          difficulty,
          category_id,
          question_options(id, text, is_correct)
        `)
        .order("created_at", { ascending: false });
      
      if (selectedCategory && selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      } else if (id) {
        // If no specific category is selected but a question bank ID is provided,
        // fetch questions for all categories in that question bank
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("id")
          .eq("question_bank_id", id);
        
        if (categoriesData && categoriesData.length > 0) {
          const categoryIds = categoriesData.map(cat => cat.id);
          query = query.in("category_id", categoryIds);
        } else {
          // If no categories exist for this question bank, return no questions
          setQuestions([]);
          setLoading(false);
          return;
        }
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      if (data) {
        const formattedQuestions: Question[] = data.map(q => ({
          id: q.id,
          serialNumber: q.serial_number,
          text: q.text,
          explanation: q.explanation || "",
          imageUrl: q.image_url,
          categoryId: q.category_id || "",
          options: q.question_options.map((opt: any) => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.is_correct
          })),
          difficulty: q.difficulty || 'medium',
          tags: []
        }));
        
        setQuestions(formattedQuestions);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setSheetOpen(true);
  };

  const handleFormSubmitted = () => {
    setSheetOpen(false);
    setCurrentQuestion(null);
    fetchQuestions();
  };

  const onEditQuestionBank = async (values: z.infer<typeof formSchema>) => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from("question_banks")
        .update({
          name: values.name,
          description: values.description || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question bank updated successfully",
      });
      
      setEditDialogOpen(false);
      fetchQuestionBank();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update question bank",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuestions = questions.filter(question => 
    question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.serialNumber.toString().includes(searchTerm)
  );

  if (!questionBank && loading) {
    return <div className="container py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/questions")}
          className="mr-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Question Banks
        </Button>
        <h1 className="text-3xl font-bold flex-1">
          {questionBank?.name}
        </h1>
        <Button 
          variant="outline"
          onClick={() => setEditDialogOpen(true)}
        >
          <PenSquare className="mr-2 h-4 w-4" />
          Edit Bank
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          {questionBank?.description && (
            <CardDescription>{questionBank.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.length > 0 ? (
                  categories.map(category => (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(
                        selectedCategory === category.id ? "all" : category.id
                      )}
                    >
                      {category.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No categories defined</p>
                )}
                <Badge
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Categories
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-card rounded-lg border p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
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
          >
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>
        </div>

        <QuestionsList 
          questions={filteredQuestions} 
          onEdit={handleEditQuestion}
        />
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full md:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{currentQuestion ? "Edit Question" : "Add New Question"}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <QuestionForm 
              questionBankId={id || ""}
              categoryId={selectedCategory !== "all" ? selectedCategory : ""} 
              initialData={currentQuestion} 
              allCategories={categories}
              onFormSubmitted={handleFormSubmitted}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Question Bank</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditQuestionBank)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter question bank name" {...field} />
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
                        value={field.value || ""}
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
                >
                  {isSubmitting ? "Updating..." : "Update Question Bank"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionBankDetail;
