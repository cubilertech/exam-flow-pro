import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, BookOpen, Users, Clock, ArrowLeft } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CreateCaseStudyExamModal } from "@/components/case-study/CreateCaseStudyExamModal";
import { useToast } from "@/hooks/use-toast";

interface CaseStudyExam {
  id: string;
  title: string;
  description: string;
  created_at: string;
  subjectCount: number;
}

const CaseStudyExams = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.isAdmin || false;
  const navigate = useNavigate();
  const [exams, setExams] = useState<CaseStudyExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const examsWithSubjectCount: any[] = [];

      // Step 1: Fetch all non-deleted exams with non-deleted subjects and cases
      const { data: examsData, error: examsError } = await supabase
        .from("exams_case")
        .select(`*,subjects(*,cases(id))`)
        .eq("is_deleted_exam", false)
        .eq("subjects.is_deleted_subject", false)
        .eq("subjects.cases.is_deleted_case", false)
        .order("created_at", { ascending: false });

      if (examsError) throw examsError;

      // Step 2: Loop through exams to calculate subjectCount
      for (const exam of examsData || []) {
        const subjects = exam.subjects || [];
        let subjectCount = 0;

        for (const subject of subjects) {
          const cases = subject.cases || [];

          if (isAdmin) {
            if (isAdmin) {
              subjectCount++; // count all subjects, even if they have 0 cases
            }
          } else {
            // Only count subject if at least one case has questions
            let visibleCaseCount = 0;

            for (const caseItem of cases) {
              const { count: questionCount, error: questionError } =
                await supabase
                  .from("case_questions")
                  .select("*", { count: "exact", head: true })
                  .eq("case_id", caseItem.id);

              if (questionError) throw questionError;

              if ((questionCount || 0) > 0) {
                visibleCaseCount++;
              }
            }

            if (visibleCaseCount > 0) {
              subjectCount++;
            }
          }
        }

        examsWithSubjectCount.push({
          ...exam,
          subjectCount,
        });
      }
      const filteredExams = isAdmin
        ? examsWithSubjectCount
        : examsWithSubjectCount.filter((exam) => exam.subjectCount > 0);

      setExams(filteredExams);
    } catch (error) {
      console.error("Error fetching case study exams:", error);
      toast({
        title: "Error",
        description: "Failed to load case study exams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExamClick = (exam: CaseStudyExam) => {
    // if (isAdmin) {
    navigate(`/case-study-exams/${exam.id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading case study exams...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Case Study Exams
          </h1>
          <p className="text-muted-foreground">
            {" "}
            {isAdmin
              ? "Manage case study exams and their content"
              : "Access your subscribed case study exams"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Exams</h2>
        {isAdmin && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Card
            key={exam.id}
            className={`cursor-pointer transition-shadow hover:shadow-lg`}
            onClick={() => handleExamClick(exam)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{exam.title}</CardTitle>
                </div>
              </div>
              {exam.description && (
                <CardDescription className="text-ellipsis overflow-hidden h-[7rem] md:h-[7.5rem]  line-clamp-5 custom-scrollbar">
                  {exam.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{exam.subjectCount} subjects</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(exam.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdmin && (
        <CreateCaseStudyExamModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={fetchExams}
        />
      )}
    </div>
  );
};

export default CaseStudyExams;
