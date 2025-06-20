
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuestionBankModal } from "@/components/admin/QuestionBankModal";
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

interface QuestionBank {
  id: string;
  name: string;
  description: string | null;
  categoryCount?: number;
  questionCount?: number;
}

const QuestionBank = () => {
  const navigate = useNavigate();
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  const fetchQuestionBanks = async () => {
    try {
      setLoading(true);
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
      }
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to load question banks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBankCreated = () => {
    fetchQuestionBanks();
  };

  const viewBankDetails = (bankId: string) => {
    navigate(`/questions/${bankId}`);
  };

  const filteredBanks = questionBanks.filter(bank => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bank.description && bank.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Question Banks</h1>
        <Button onClick={() => setBankModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Question Bank
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search question banks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <p>Loading question banks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanks.map((bank) => (
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

          {filteredBanks.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-8 bg-muted rounded-md">
              <p className="mb-4 text-muted-foreground">
                {searchTerm 
                  ? "No question banks found matching your search" 
                  : "No question banks found"}
              </p>
              <Button onClick={() => setBankModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Create Your First Question Bank
              </Button>
            </div>
          )}
        </div>
      )}

      <QuestionBankModal 
        open={bankModalOpen} 
        onOpenChange={setBankModalOpen} 
        onSuccess={handleBankCreated}
      />
    </div>
  );
};

export default QuestionBank;
