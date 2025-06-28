import { supabase } from "@/integrations/supabase/client";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, PlayCircle, ArrowLeft } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { useToast } from "@/components/ui/use-toast";

interface Case {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  instructions: string;
  subject_id: number;
  scenario: string;
  order_index: number;
}

export const CaseSenerioShow = () => {
  const { examId, subjectId, caseId } = useParams<{
    examId: string;
    subjectId: string;
    caseId: string;
  }>();
  const { user } = useAppSelector((state) => state.auth);
  const [caseInfo, setCaseInfo] = React.useState<Case | null>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resultData, setResultData] = React.useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [disabledExam, setDisabledExam] = useState<boolean>(true);

  useEffect(() => {
    fetchCaseDetail(caseId);
    fetchQuestion(caseId);
  }, [caseId]);

  const fetchCaseDetail = async (caseId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .order("order_index", { ascending: true })
        .single();

      if (data) {
        setCaseInfo(data);
      }
      if (error) throw error;
    } catch (error) {
      console.error("Error Fetching the Case :", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestion = async (caseId: string) => {
    setLoading(true);
    try {
      if (!caseId) return;
      const { data, error } = await supabase
        .from("case_questions")
        .select("*")
        .eq("case_id", caseId)
        .order("order_index", { ascending: true });

      if (data.length === 0) {
        console.log("No Fetched Questions: ");
        setDisabledExam(true);
      }
      if (data.length > 0) {
        setDisabledExam(false);
        console.log("Fetched Questions:", data.length);
        //  setQuestions(data);
      }
      if (error) throw error;
    } catch (error) {
      console.error("Error Fetching the Questions :", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  function normalizeHTML(input: string) {
  try {
    const maybeParsed = JSON.parse(input);
    return typeof maybeParsed === "string" ? maybeParsed : input;
  } catch {
    return input;
  }
}

  const handleStartExam = async () => {
    try {
      const payload = {
        user_id: user.id,
        case_id: caseId,
        current_question_index: 0,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_case_progress")
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      console.log("Data:", data, "Error:", error);

      setResultData(data);
      setError(error);
      window.location.href = `/case-study-exams/${examId}/subjects/${subjectId}/cases/${caseId}/testId/${data.id}`; // Assuming data.id is the exam ID

      if (error) throw error;
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };



  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Case details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!caseInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Case Not Found
            </h2>
            <p className="text-gray-500 mb-4">
              The requested case scenario could not be found.
            </p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="container py-4 md:py-8 px-4 md:px-8 ">
        {/* Header */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>

        {/* Main Content Card */}
        <div className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6 bg-gradient-to-rounded-t-lg">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold leading-tight">
                  {caseInfo.title}
                </CardTitle>
                <div className="flex flex-wrap gap-3"></div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="">
            {/* Scenario Content */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                Scenario
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 ">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                   <span dangerouslySetInnerHTML={{__html : normalizeHTML(caseInfo.scenario)}}/>
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button
                size="lg"
                onClick={() => handleStartExam()}
                disabled={disabledExam}
                className={`bg-primary text-white px-8 py-3 text-lg font-semibold shadow-lg  ${disabledExam  ? "cursor-not-allowed bg-yellow-500" : "cursor-pointer " } hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
              //  className={`px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105${disabledExam   ? "cursor-not-allowed bg-yellow-500 text-white": "bg-primary text-white hover:shadow-xl cursor-pointer"   }  disabled:opacity-50 disabled:pointer-events-none`}
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Exam
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
};
