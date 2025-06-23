import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, ArrowLeft, BookOpen, FileText } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreateCaseStudySubjectModal } from "@/components/case-study/CreateCaseStudySubjectModal";

const DemoSubjectData: Subject[] = [
  {
    id: "1",
    name: "Cardiology",
    description: "Study of heart and blood vessels",
    order_index: 1,
    case_count: 5,
  },
  {
    id: "2",
    name: "Neurology",
    description: "Study of the nervous system",
    order_index: 2,
    case_count: 3,
  },
  {
    id: "3",
    name: "Oncology",
    description: "Study of cancer",
    order_index: 3,
    case_count: 4,
  },
  {
    id: "4",
    name: "Pediatrics",
    description: "Study of children’s health",
    order_index: 4,
    case_count: 2,
  },
];

interface Subject {
  id: string;
  name: string;
  description: string;
  order_index: number;
  case_count?: number;
}

interface CaseStudyExamInfo {
  id: string;
  name: string;
  description: string;
  order_index: number;
  created_at: string;
  subject_count?: number;
  is_subscribed?: boolean;
}

const DemoExamInfoData: CaseStudyExamInfo = {
  id: "1",
  name: "Exam Cardiology",
  description: "Study of heart and blood vessels",
  created_at: "2023-10-01T00:00:00Z",
  order_index: 1,
  subject_count: 5,
};

const CaseStudyExamDetail = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.isAdmin || false;

  const [examInfo, setExamInfo] = useState<CaseStudyExamInfo | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] =
    useState(false);

  useEffect(() => {
    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  const fetchExamData = async () => {
    if (!examId) return;

    try {
      setLoading(true);
      const { data: examData, error: examError } = await supabase
        .from("exams_case")
        .select("*")
        .eq("id", examId)
        .single();

      setExamInfo(examData);

      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .eq("exams_case_id", examId)
        .order("order_index", { ascending: true });

      if (subjectsError) throw subjectsError;

      // For each subject, get case count************************
      const subjectsWithCaseCount = await Promise.all(
        (subjectsData || []).map(async (subject) => {
          const { count: caseCount } = await supabase
            .from("cases")
            .select("*", { count: "exact", head: true })
            .eq("subject_id", subject.id);

          return {
            ...subject,
            case_count: caseCount || 0,
          };
        }),
      );

      setSubjects(subjectsWithCaseCount);
    } catch (error) {
      console.error("Error fetching exam data:", error);
      toast.error("Failed to load exam data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subject: Subject) => {
    navigate(`/case-study-exams/${examId}/subjects/${subject.id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading exam details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!examInfo) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Exam not found
          </h3>
          <Button onClick={() => navigate("/case-study-exams")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* <div className="flex flex-col md:flex-row items-start md:items-center space-x-4"> */}
      <div className="flex flex-col md:flex-row items-start md:items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/case-study-exams")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="mt-2 md:mt-0">
          <h1 className="text-3xl font-bold tracking-tight">{examInfo.name}</h1>
          {examInfo.description && (
            <p className="text-muted-foreground">{examInfo.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Subjects</h2>
        {isAdmin && (
          <Button onClick={() => setIsCreateSubjectModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card
            key={subject.id}
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => handleSubjectClick(subject)}
          >
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{subject.name}</CardTitle>
              </div>
              {subject.description && (
                <CardDescription>{subject.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{subject.case_count} cases</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No subjects available
          </h3>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Add your first subject to get started"
              : "Check back later for new subjects"}
          </p>
        </div>
      )}

      {isAdmin && (
        <CreateCaseStudySubjectModal
          open={isCreateSubjectModalOpen}
          onOpenChange={setIsCreateSubjectModalOpen}
          examId={examId!}
          onSuccess={fetchExamData}
        />
      )}
    </div>
  );
};

export default CaseStudyExamDetail;
