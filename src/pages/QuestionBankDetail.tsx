import {
  useEffect,
  useState,
} from 'react';

import {
  ArrowLeft,
  PenSquare,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';
import * as z from 'zod';

import { QuestionForm } from '@/components/admin/QuestionForm';
import { QuestionsList } from '@/components/admin/QuestionsList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';

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

interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
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

  // For category management in the edit dialog
  const [newCategory, setNewCategory] = useState("");
  const [editedCategories, setEditedCategories] = useState<Category[]>([]);
  const [deletedCategoryIds, setDeletedCategoryIds] = useState<string[]>([]);

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

  useEffect(() => {
    // Initialize edited categories whenever categories change
    setEditedCategories([...categories]);
  }, [categories]);

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
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to load question bank",
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
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to load categories",
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
          options: q.question_options.map((opt: QuestionOption) => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.is_correct
          })),
          difficulty: q.difficulty || 'easy',
          tags: []
        }));

        setQuestions(formattedQuestions);
      }
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to load questions",
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

  // Category management in edit dialog
  const handleAddCategory = () => {
    if (newCategory.trim() && !editedCategories.some(cat => cat.name === newCategory.trim())) {
      setEditedCategories([...editedCategories, {
        id: crypto.randomUUID(),
        name: newCategory.trim(),
        questionBankId: id
      }]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    const category = editedCategories.find(cat => cat.id === categoryId);
    if (category) {
      // If it's an existing category (has a questionBankId), mark for deletion
      if (categories.some(cat => cat.id === categoryId)) {
        setDeletedCategoryIds([...deletedCategoryIds, categoryId]);
      }
      setEditedCategories(editedCategories.filter(cat => cat.id !== categoryId));
    }
  };

  const onEditQuestionBank = async (values: z.infer<typeof formSchema>) => {
    if (!id) return;

    try {
      setIsSubmitting(true);

      // 1. Update question bank details
      const { error: bankError } = await supabase
        .from("question_banks")
        .update({
          name: values.name,
          description: values.description || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (bankError) throw bankError;

      // 2. Delete removed categories
      if (deletedCategoryIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("categories")
          .delete()
          .in("id", deletedCategoryIds);

        if (deleteError) throw deleteError;
      }

      // 3. Add new categories
      const newCategories = editedCategories.filter(
        cat => !categories.some(existingCat => existingCat.id === cat.id)
      );

      if (newCategories.length > 0) {
        const categoriesToInsert = newCategories.map(cat => ({
          name: cat.name,
          question_bank_id: id,
        }));

        const { error: insertError } = await supabase
          .from("categories")
          .insert(categoriesToInsert);

        if (insertError) throw insertError;
      }

      // 4. Update existing categories (if any were renamed)
      for (const cat of editedCategories) {
        const existingCat = categories.find(c => c.id === cat.id);
        if (existingCat && existingCat.name !== cat.name) {
          const { error: updateError } = await supabase
            .from("categories")
            .update({ name: cat.name })
            .eq("id", cat.id);

          if (updateError) throw updateError;
        }
      }

      toast({
        title: "Success",
        description: "Question bank updated successfully",
      });

      setEditDialogOpen(false);
      setDeletedCategoryIds([]);
      fetchQuestionBank();
      fetchCategories();
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to update question bank",
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
      <div className="mb-6">
        {/* First row: Back button on left, Edit button on right */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/questions")}
            className="mr-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Question Banks
          </Button>

          <Button
            variant="outline"
            className="mt-2 md:mt-0"
            onClick={() => setEditDialogOpen(true)}
          >
            <PenSquare className="mr-2 h-4 w-4" />
            Edit Bank
          </Button>
        </div>

        <div className="mt-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">
            {questionBank?.name}
          </h1>
        </div>
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

              <div className="space-y-2">
                <FormLabel>Categories</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {editedCategories.map((category) => (
                    <Badge key={category.id} variant="secondary" className="flex items-center space-x-1">
                      <span>{category.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category.id)}
                        className="ml-1 text-muted-foreground rounded-full hover:bg-muted h-4 w-4 inline-flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </button>
                    </Badge>
                  ))}
                  {editedCategories.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      No categories added yet. Add at least one category.
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button
                className="mt-2 md:mt-0"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setEditedCategories([...categories]);
                    setDeletedCategoryIds([]);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || editedCategories.length === 0}
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
