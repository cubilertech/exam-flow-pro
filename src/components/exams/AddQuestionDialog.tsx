
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Question {
  id: string;
  serial_number: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  category_id: string | null;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

interface AddQuestionDialogProps {
  examId: string;
  onClose: () => void;
  onSuccess: () => void;
  existingQuestionIds: string[];
}

export function AddQuestionDialog({ 
  examId, 
  onClose, 
  onSuccess,
  existingQuestionIds
}: AddQuestionDialogProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all-categories");
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      
      setCategories(data || []);
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
          difficulty,
          created_at,
          category_id,
          category:category_id(id, name)
        `)
        .order("created_at", { ascending: false });
      
      // Filter out questions already in the exam
      if (existingQuestionIds.length > 0) {
        query = query.not('id', 'in', `(${existingQuestionIds.join(',')})`);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      setQuestions(data || []);
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

  const handleAddQuestions = async () => {
    if (selectedQuestionIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one question",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare the data to insert
      const examQuestions = selectedQuestionIds.map(questionId => ({
        exam_id: examId,
        question_id: questionId
      }));
      
      const { error } = await supabase
        .from("exam_questions")
        .insert(examQuestions);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${selectedQuestionIds.length} question${selectedQuestionIds.length > 1 ? 's' : ''} added to exam`,
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add questions",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestionIds(prevSelected => {
      if (prevSelected.includes(questionId)) {
        return prevSelected.filter(id => id !== questionId);
      } else {
        return [...prevSelected, questionId];
      }
    });
  };

  const handleToggleAll = () => {
    if (selectedQuestionIds.length === filteredQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredQuestions.map(q => q.id));
    }
  };

  // Filter questions based on search term and category
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = 
      question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all-categories" || 
      question.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-categories">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-[400px] overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={
                    filteredQuestions.length > 0 && 
                    selectedQuestionIds.length === filteredQuestions.length
                  }
                  onCheckedChange={handleToggleAll}
                />
              </TableHead>
              <TableHead>Serial #</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Loading questions...
                </TableCell>
              </TableRow>
            ) : filteredQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  {searchTerm || selectedCategory !== "all-categories" ? "No questions match your filters" : "No questions available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredQuestions.map(question => (
                <TableRow 
                  key={question.id}
                  className={selectedQuestionIds.includes(question.id) ? "bg-muted/50" : ""}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedQuestionIds.includes(question.id)}
                      onCheckedChange={() => handleSelectQuestion(question.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono">
                    {question.serial_number}
                  </TableCell>
                  <TableCell>
                    {question.text.length > 80
                      ? question.text.substring(0, 80) + "..."
                      : question.text}
                  </TableCell>
                  <TableCell>
                    {question.category?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      question.difficulty === 'easy'
                        ? 'bg-green-100 text-green-800'
                        : question.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div>
          {selectedQuestionIds.length} question{selectedQuestionIds.length !== 1 ? 's' : ''} selected
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleAddQuestions} disabled={selectedQuestionIds.length === 0 || submitting}>
            {submitting ? "Adding..." : "Add Selected Questions"}
          </Button>
        </div>
      </div>
    </div>
  );
}
