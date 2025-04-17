
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionsList } from "@/components/admin/QuestionsList";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { QuestionBankModal } from "@/components/admin/QuestionBankModal";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Plus, Search, ArrowRight } from "lucide-react";
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
  questionBankId?: string;
  questionCount?: number;
}

interface QuestionBank {
  id: string;
  name: string;
  description: string | null;
  categoryCount?: number;
  questionCount?: number;
}

const QuestionBank = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [selectedQuestionBank, setSelectedQuestionBank] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  useEffect(() => {
    if (selectedQuestionBank) {
      fetchCategories(selectedQuestionBank);
    } else {
      setCategories([]);
    }
    setSelectedCategory("all");
  }, [selectedQuestionBank]);

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, selectedQuestionBank]);

  const fetchQuestionBanks = async () => {
    try {
      const { data, error } = await supabase
        .from("question_banks")
        .select("*")
        .order("name");

      if (error) throw error;
      
      if (data) {
        // Get category counts for each question bank
        const banksWithCounts = await Promise.all(data.map(async (bank) => {
          // Get category count
          const { count: categoryCount, error: catError } = await supabase
            .from("categories")
            .select("*", { count: 'exact', head: true })
            .eq("question_bank_id", bank.id);
          
          if (catError) throw catError;
          
          // Get question count via categories
          const { data: cats } = await supabase
            .from("categories")
            .select("id")
            .eq("question_bank_id", bank.id);
            
          if (cats && cats.length > 0) {
            const categoryIds = cats.map(c => c.id);
            const { count: questionCount, error: qError } = await supabase
              .from("questions")
              .select("*", { count: 'exact', head: true })
              .in("category_id", categoryIds);
            
            if (qError) throw qError;
            
            return {
              ...bank,
              categoryCount: categoryCount || 0,
              questionCount: questionCount || 0
            };
          }
          
          return {
            ...bank,
            categoryCount: categoryCount || 0,
            questionCount: 0
          };
        }));
        
        setQuestionBanks(banksWithCounts);
        if (banksWithCounts.length > 0 && !selectedQuestionBank) {
          setSelectedQuestionBank(banksWithCounts[0].id);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load question banks",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async (questionBankId: string) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("question_bank_id", questionBankId)
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
      } else if (selectedQuestionBank) {
        // If no specific category is selected but a question bank is,
        // fetch questions for all categories in that question bank
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("id")
          .eq("question_bank_id", selectedQuestionBank);
        
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

  const handleBankCreated = () => {
    fetchQuestionBanks();
  };

  const viewBankDetails = (bankId: string) => {
    navigate(`/questions/${bankId}`);
  };

  const filteredQuestions = questions.filter(question => 
    question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.serialNumber.toString().includes(searchTerm)
  );

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Question Banks</h1>

      <Tabs defaultValue="banks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="banks">Banks</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="banks">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">All Question Banks</h2>
            <Button onClick={() => setBankModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Question Bank
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questionBanks.map((bank) => (
              <Card key={bank.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{bank.name}</CardTitle>
                  {bank.description && (
                    <CardDescription className="line-clamp-2">{bank.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 text-sm">
                    <div>
                      <span className="font-medium">{bank.categoryCount}</span> Categories
                    </div>
                    <div>
                      <span className="font-medium">{bank.questionCount}</span> Questions
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => viewBankDetails(bank.id)}
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {questionBanks.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-8 bg-muted rounded-md">
                <p className="mb-4 text-muted-foreground">No question banks found</p>
                <Button onClick={() => setBankModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Question Bank
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

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
                <Select value={selectedQuestionBank} onValueChange={setSelectedQuestionBank}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Question Bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionBanks.map((qb) => (
                      <SelectItem key={qb.id} value={qb.id}>
                        {qb.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => {
                  setCurrentQuestion(null);
                  setSheetOpen(true);
                }}
                disabled={!selectedQuestionBank}
              >
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
              questionBankId={selectedQuestionBank}
              categoryId={selectedCategory !== "all" ? selectedCategory : ""} 
              initialData={currentQuestion} 
              allCategories={categories}
              onFormSubmitted={handleFormSubmitted}
            />
          </div>
        </SheetContent>
      </Sheet>

      <QuestionBankModal 
        open={bankModalOpen} 
        onOpenChange={setBankModalOpen} 
        onSuccess={handleBankCreated}
      />
    </div>
  );
};

export default QuestionBank;
