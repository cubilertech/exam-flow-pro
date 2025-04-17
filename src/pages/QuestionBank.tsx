
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionsList } from "@/components/admin/QuestionsList";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  examId?: string;
  questionCount?: number;
}

const QuestionBank = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      
      if (data) {
        setCategories(data.map(cat => ({
          id: cat.id,
          name: cat.name,
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
      
      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
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

  const filteredQuestions = questions.filter(question => 
    question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.serialNumber.toString().includes(searchTerm)
  );

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Question Bank</h1>

      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => {
                setCurrentQuestion(null);
                setSheetOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" /> Add Question
              </Button>
            </div>

            <QuestionsList 
              questions={filteredQuestions} 
              onEdit={handleEditQuestion}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full md:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{currentQuestion ? "Edit Question" : "Add New Question"}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <QuestionForm 
              categoryId={selectedCategory === "all-categories" ? "" : selectedCategory} 
              initialData={currentQuestion} 
              allCategories={categories}
              onFormSubmitted={handleFormSubmitted}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default QuestionBank;
