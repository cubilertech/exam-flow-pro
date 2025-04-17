
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExamsList } from "@/components/exams/ExamsList";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  subscription_type: string | null;
  question_bank_id: string | null;
}

interface QuestionBank {
  id: string;
  name: string;
  description: string | null;
}

const Exams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [selectedQuestionBank, setSelectedQuestionBank] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  useEffect(() => {
    fetchExams();
  }, [selectedQuestionBank]);

  const fetchQuestionBanks = async () => {
    try {
      const { data, error } = await supabase
        .from("question_banks")
        .select("*")
        .order("name");

      if (error) throw error;
      
      if (data && data.length > 0) {
        setQuestionBanks(data);
        setSelectedQuestionBank(data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load question banks",
        variant: "destructive",
      });
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("exams")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (selectedQuestionBank) {
        query = query.eq("question_bank_id", selectedQuestionBank);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setExams(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load exams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exam Management</h1>
        <div className="flex space-x-4 items-center">
          <div className="w-[200px]">
            <Select value={selectedQuestionBank} onValueChange={setSelectedQuestionBank}>
              <SelectTrigger>
                <SelectValue placeholder="Select Question Bank" />
              </SelectTrigger>
              <SelectContent>
                {questionBanks.map((qbank) => (
                  <SelectItem key={qbank.id} value={qbank.id}>
                    {qbank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button asChild>
            <Link to={`/exams/new?qbankId=${selectedQuestionBank}`}>
              <Plus className="mr-2 h-4 w-4" /> New Exam
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="exams">
        <TabsList className="mb-6">
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exams">
          <ExamsList exams={exams} loading={loading} onRefresh={fetchExams} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Exams;
