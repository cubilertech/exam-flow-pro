import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, FileText, CheckCircle } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  exams_case_id: string | null;
  created_at: string;
  updated_at: string;
  is_deleted_subject: boolean | null;
  order_index: number | null;
}

interface Case {
  id: string;
  title: string;
  scenario: string;
  instructions: string | null;
  subject_id: string | null;
  created_at: string;
  updated_at: string;
  is_deleted_case: boolean | null;
  order_index: number | null;
}

export default function CaseStudySubjectDetail() {
  const { examId, subjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchSubjectAndCases = async () => {
      if (!subjectId || !user?.id) return;

      try {
        // Fetch subject details
        const { data: subjectData, error: subjectError } = await supabase
          .from("subjects")
          .select("*")
          .eq("id", subjectId)
          .single();

        if (subjectError) throw subjectError;
        setSubject(subjectData);

        // Fetch cases for this subject
        const { data: casesData, error: casesError } = await supabase
          .from("cases")
          .select("*")
          .eq("subject_id", subjectId)
          .eq("is_deleted_case", false)
          .order("order_index");

        if (casesError) throw casesError;
        setCases(casesData);

        // Fetch submission counts for each case
        if (casesData.length > 0) {
          const caseIds = casesData.map(case_ => case_.id);
          const { data: progressData, error: progressError } = await supabase
            .from("user_case_progress")
            .select("case_id, submission_count")
            .eq("user_id", user.id)
            .in("case_id", caseIds);

          if (progressError) {
            console.error("Error fetching submission counts:", progressError);
          } else {
            const counts: Record<string, number> = {};
            progressData.forEach(progress => {
              counts[progress.case_id] = progress.submission_count || 0;
            });
            setSubmissionCounts(counts);
          }
        }

      } catch (error) {
        console.error("Error fetching subject and cases:", error);
        toast.error("Failed to load subject details");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectAndCases();
  }, [subjectId, user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subject details...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Subject not found.</p>
        <Button 
          onClick={() => navigate(`/case-study-exams/${examId}`)}
          className="mt-4"
        >
          Back to Exam
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <ArrowLeft className="h-4 w-4" />
          <button 
            onClick={() => navigate(`/case-study-exams/${examId}`)}
            className="hover:text-gray-900"
          >
            Back to Exam
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
        {subject.description && (
          <p className="text-gray-600 mt-2">{subject.description}</p>
        )}
      </div>

      {/* Cases Grid */}
      {cases.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No cases available
          </h3>
          <p className="text-gray-600">
            There are no case studies available for this subject yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((case_) => {
            const submissionCount = submissionCounts[case_.id] || 0;
            
            return (
              <Card 
                key={case_.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/case-study-exams/${examId}/subjects/${subjectId}/cases/${case_.id}/take`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="group-hover:text-blue-600 transition-colors">
                      {case_.title}
                    </CardTitle>
                    {submissionCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        {submissionCount} attempt{submissionCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div 
                    className="text-gray-600 mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ 
                      __html: case_.scenario.substring(0, 150) + (case_.scenario.length > 150 ? '...' : '')
                    }}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FileText className="h-4 w-4" />
                      <span>Case Study</span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="group-hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/case-study-exams/${examId}/subjects/${subjectId}/cases/${case_.id}/take`);
                      }}
                    >
                      {submissionCount > 0 ? 'Retake' : 'Start'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  
                  {submissionCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Previously completed {submissionCount} time{submissionCount > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
