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
  CardFooter,
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
        const banksWithCounts = await Promise.all(
          data.map(async (bank) => {
            const { count: categoryCount, error: catError } = await supabase
              .from("categories")
              .select("*", { count: "exact", head: true })
              .eq("question_bank_id", bank.id);

            if (catError) throw catError;

            const { data: cats } = await supabase
              .from("categories")
              .select("id")
              .eq("question_bank_id", bank.id);

            if (cats && cats.length > 0) {
              const categoryIds = cats.map((c) => c.id);
              const { count: questionCount, error: qError } = await supabase
                .from("questions")
                .select("*", { count: "exact", head: true })
                .in("category_id", categoryIds);

              if (qError) throw qError;

              return {
                ...bank,
                categoryCount: categoryCount || 0,
                questionCount: questionCount || 0,
              };
            }

            return {
              ...bank,
              categoryCount: categoryCount || 0,
              questionCount: 0,
            };
          })
        );

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

  const filteredBanks = questionBanks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bank.description &&
        bank.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <Card
              key={bank.id}
              className="flex flex-col justify-between h-64 transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <CardTitle
                  className="text-lg line-clamp-2 min-h-[3.5rem]"
                  title={bank.name}
                >
                  {bank.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden pt-0 pb-2">
                {bank.description && (
                  <CardDescription className="line-clamp-3 text-sm">
                    {bank.description}
                  </CardDescription>
                )}
              </CardContent>

              <CardContent className="text-sm text-muted-foreground pt-0 pb-2">
                <div className="flex space-x-4">
                  <div>
                    <span className="font-medium text-black">
                      {bank.categoryCount}
                    </span>{" "}
                    Categories
                  </div>
                  <div>
                    <span className="font-medium text-black">
                      {bank.questionCount}
                    </span>{" "}
                    Questions
                  </div>
                </div>
              </CardContent>

              <CardFooter className="justify-end pt-0">
                <Button
                  variant="outline"
                  size="sm"
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
                <Plus className="h-4 w-4 mr-2" /> Create Your Question
                Bank
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
