
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExamsList } from "@/components/exams/ExamsList";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const Exams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .order("created_at", { ascending: false });

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
        <Button asChild>
          <Link to="/exams/new">
            <Plus className="mr-2 h-4 w-4" /> New Exam
          </Link>
        </Button>
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
