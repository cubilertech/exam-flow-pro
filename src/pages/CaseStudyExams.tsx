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
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CreateCaseStudyExamModal } from "@/components/case-study/CreateCaseStudyExamModal";

interface CaseStudyExam {
  id: string;
  title: string;
  description: string;
  created_at: string;
  subject_count?: number;
  is_subscribed?: boolean;
}

const DemoExams: CaseStudyExam[] = [
  {
    id: "1",
    name: "Demo Case Study Exam",
    description: "This is a demo case study exam for testing purposes.",
    created_at: new Date().toISOString(),
    subject_count: 3,
    is_subscribed: true,
  },
  {
    id: "2",
    name: "Demo Case Study Exam 2",
    description: "This is a demo case study exam for testing purposes.",
    created_at: new Date().toISOString(),
    subject_count: 4,
    is_subscribed: true,
  },
  {
    id: "3",
    name: "Demo Case Study Exam 3",
    description: "This is a demo case study exam for testing purposes.",
    created_at: new Date().toISOString(),
    subject_count: 4,
    is_subscribed: true,
  },
  {
    id: "4",
    name: "Demo Case Study Exam 3",
    description: "This is a demo case study exam for testing purposes.",
    created_at: new Date().toISOString(),
    subject_count: 4,
    is_subscribed: true,
  },
  {
    id: "5",
    name: "Demo Case Study Exam 3",
    description: "This is a demo case study exam for testing purposes.",
    created_at: new Date().toISOString(),
    subject_count: 4,
    is_subscribed: true,
  },
];

const CaseStudyExams = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.isAdmin || false;
  const navigate = useNavigate();
  const [exams, setExams] = useState<CaseStudyExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => { 
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);

      // Fetch case study exams
      const { data: examsData, error: examsError } = await supabase 
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

      setExams(examsData || []);
      // console.log("Fetched exams:", examsData);

      if (examsError) throw examsError;

      // For each exam, get subject count and subscription status
      // const examsWithDetails = await Promise.all( *****************************
      //   (examsData || []).map(async (exam) => {
      //     // Get subject count
      //     const { count: subjectCount } = await supabase
      //       .from('case_study_subjects')
      //       .select('*', { count: 'exact', head: true })
      //       .eq('exam_id', exam.id);

      //     // Check if user is subscribed (for students)
      //     let isSubscribed = false;
      //     if (!isAdmin) {
      //       const { data: subscription } = await supabase
      //         .from('user_case_study_subscriptions')
      //         .select('id')
      //         .eq('user_id', user?.id)
      //         .eq('exam_id', exam.id)
      //         .eq('is_active', true)
      //         .single();

      //       isSubscribed = !!subscription;
      //     }

      //     return {
      //       ...exam,
      //       subject_count: subjectCount || 0,
      //       is_subscribed: isSubscribed
      //     };
      //   })
      // );

      // setExams(examsWithDetails);
      setExams(DemoExams);
    } catch (error) {
      console.error("Error fetching case study exams:", error);
      toast.error("Failed to load case study exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // For demo purposes, we can set a static exam
    setExams(DemoExams);
    setLoading(false);
  }, []);

  const handleSubscribe = async (examId: string) => {
    try {
      const { error } = await supabase
        .from("user_case_study_subscriptions")
        .upsert({
          user_id: user?.id,
          exam_id: examId,
          is_active: true,
        });

      if (error) throw error;

      toast.success("Successfully subscribed to exam");
      fetchExams(); // Refresh to update subscription status
    } catch (error) {
      console.error("Error subscribing to exam:", error);
      toast.error("Failed to subscribe to exam");
    }
  };

  const handleExamClick = (exam: CaseStudyExam) => {
    if (isAdmin || exam.is_subscribed) {
      navigate(`/case-study-exams/${exam.id}`);
    } else {
      // Show subscription required
      toast.error("Please subscribe to this exam to access it");
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Card
            key={exam.id}
            className={`cursor-pointer transition-shadow hover:shadow-lg ${
              !isAdmin && !exam.is_subscribed ? "opacity-60" : ""
            }`}
            onClick={() => handleExamClick(exam)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{exam.name}</CardTitle>
                </div>
                {!isAdmin && !exam.is_subscribed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubscribe(exam.id);
                    }}
                  >
                    Subscribe
                  </Button>
                )}
              </div>
              {exam.description && (
                <CardDescription>{exam.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{exam.subject_count} subjects</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(exam.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {!isAdmin && exam.is_subscribed && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Subscribed
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {exams.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No case study exams available
          </h3>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Create your first case study exam to get started"
              : "Check back later for new case study exams"}
          </p>
        </div>
      )}

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
