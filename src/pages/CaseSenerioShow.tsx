// import { supabase } from "@/integrations/supabase/client";
// import React, { useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// // interface CaseSenerioShowProps {
// //   caseId: string;
// // }

// interface Case {
//   id: string;
//   title: string;
//   subject_id: number;
//   scenario: string;
//   order_index: number;
//   question_count: number;
// }

// export const CaseSenerioShow = () => {
//   const { caseId } = useParams<{ caseId: string }>();
//   const [caseInfo, setCaseInfo] = React.useState<Case>(null);
//   const navigate = useNavigate();
//   useEffect(() => {
//     if (caseId) {
//       fetchCaseDetail(caseId);
//     }
//   }, [caseId]);
//   const fetchCaseDetail = async (caseId: string) => {
//     const { data, error } = await supabase
//       .from("cases")
//       .select("*")
//       .eq("id", caseId)
//       .order("order_index", { ascending: true })
//       .single();

//     if (data) {
//       setCaseInfo(data);
//     }
//   };

//   console.log("caseInfo", caseInfo);

//     if (!caseInfo) {
//         return <div>Loading...</div>;
//     }
//   return (
//     <>
//       <div>{caseInfo.title}</div>
//       <div>{caseInfo.scenario}</div>
//         <div className="flex justify-end">
//             <button
//             className="btn btn-primary"
//             onClick={() => navigate(`/case-study-exams/${caseInfo.subject_id}/subjects/${caseInfo.subject_id}/cases/${caseId}/takeExam`)}
//             >
//             Start Exam
//             </button>
//             </div>
//     </>
//   );
// };

import { supabase } from "@/integrations/supabase/client";
import React, { useEffect } from "react";
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
  const { caseId } = useParams<{ caseId: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const [caseInfo, setCaseInfo] = React.useState<Case | null>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resultData, setResultData] = React.useState<any>(null);
  const [error, setError] = React.useState<any>(null);

  useEffect(() => {
    if (caseId) {
      fetchCaseDetail(caseId);
    }
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
      if (error) {
        console.error("Error fetching case:", error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

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
      window.location.href = `/case-study-exams/${caseInfo.subject_id}/subjects/${caseInfo.subject_id}/cases/${caseId}/ExamId/${data.id}`; // Assuming data.id is the exam ID
      // navigate(
      //   `/case-study-exams/${caseInfo.subject_id}/subjects/${caseInfo.subject_id}/cases/${caseId}/ExamId/${data.id}` // Assuming data.id is the exam ID
      // );
      // let resultData, resultError;

      // if (!resultData) {
      //   console.log("Insert" , resultData)
      //   // First time: INSERT
      //   const { data, error } = await supabase
      //     .from("user_case_progress")
      //     .insert({
      //       ...payload,
      //       created_at: new Date().toISOString(),
      //     })
      //     .select()
      //     .single();
      //     console.log("Data:", data, "Error:", error);

      //   setResultData(data);
      //   setError(error);

      // } else {
      //   // Already exists: UPDATE
      //   console.log("Update")
      //   const { data, error } = await supabase
      //     .from("user_case_progress")
      //     .update(payload)
      //     .eq("id", resultData.id);

      //   setResultData(data);
      //   setError(error);
      // }

      if (error) throw error;

      // Reset editor and show success

      // console.log("Submitted:", resultData);
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // console.log("caseInfo", caseInfo);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-4" />
          </div>
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-6">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="pt-6">
                <Skeleton className="h-12 w-32 ml-auto" />
              </div>
            </CardContent>
          </Card>
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
        <div className="">
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
                <div className="flex flex-wrap gap-3">
                  {/* {caseInfo.question_count > 0 && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <Clock className="w-3 h-3 mr-1" />
                      {caseInfo.question_count} Questions
                    </Badge>
                  )} */}
                </div>
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
                  {caseInfo.scenario}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button
                size="lg"
                onClick={() =>  handleStartExam()}
                className="bg-primary text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
