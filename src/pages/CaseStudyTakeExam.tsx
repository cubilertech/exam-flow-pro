import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BookOpen } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BoldExtension,
  CodeExtension,
  HeadingExtension,
  BlockquoteExtension,
  NodeFormattingExtension,
  BulletListExtension,
  TableExtension,
} from "remirror/extensions";
import { Remirror, ThemeProvider, useRemirror } from "@remirror/react";
import { htmlToProsemirrorNode } from "remirror";
import {
  ToggleCodeButton,
  ToggleBoldButton,
  HeadingLevelButtonGroup,
  IndentationButtonGroup,
  TextAlignmentButtonGroup,
  Toolbar,
} from "@remirror/react-ui";
import { Box } from "@mui/material";
import { UploadImageButton } from "../components/remirror-extensions/UploadImageButton";
import { TableDropdown } from "../components/remirror-extensions/TableButton";
import { imageExtension, reactComponentExtension } from "@/lib/image-extension";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";
import {
  removeAnswer,
  saveAnswer,
} from "@/features/caseAnswers/caseAnswersSlice";

import { Progress } from "@/components/ui/progress";

interface Case {
  id: string;
  title: string;
  subject_id: number;
  scenario: string;
  order_index: number;
  question_count: number;
}

interface Question {
  id: string;
  question_text: string;
  case_id: number;
  correct_answer: string;
  explanation: string;
  order_index: number;
}

export const CaseStudyTakeExam = () => {
  const { examId, subjectId, caseId , testId } = useParams<{examId: string; subjectId: string;caseId: string; testId : string}>();
  const { user } = useAppSelector((state) => state.auth);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(1);
  const [answerHtml, setAnswerHtml] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const dispatch = useAppDispatch();
  const [resultData, setResultData] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const savedAnswers = useAppSelector((state) => state.caseAnswers.answers);
  const [isAnswerValid, setIsAnswerValid] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const extensions = () => [
    new HeadingExtension({ levels: [1, 2, 3, 4, 5] }),
    new CodeExtension(),
    new BoldExtension({}),
    new BlockquoteExtension(),
    new NodeFormattingExtension({}),
    new BulletListExtension({}),
    new TableExtension(),
    imageExtension(),
    reactComponentExtension(),
  ];

  const { manager, state, getContext } = useRemirror({
    extensions,
    content: "",
    stringHandler: htmlToProsemirrorNode,
  });



  useEffect(() => {
    if (caseId) {
      fetchQuestions(caseId);
    }
  }, [caseId]);

  useEffect(() => {
    setShowAnswer(false);
  }, [currentQuestionIndex]);

  const fetchQuestions = async (caseId: string) => {
    try {
      
      const { data, error } = await supabase
        .from("case_questions")
        .select("*")
        .eq("case_id", caseId)
        .order("order_index", { ascending: true });
  
      if (data.length > 0) {
        setQuestions(data);
      }
      if (error) throw error;
    } catch (error) {
      console.error("Error submitting answer:", error);  
    }
  };

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex - 1];

  // Handler for answer changes

  const onAnswerChange = (updatedHtml: string) => {
    const isEmpty = manager.view.state.doc.textContent.trim() === "";

    setIsAnswerValid(!isEmpty);

    setAnswerHtml(JSON.stringify(updatedHtml));

    if (currentQuestion?.id) {
      if (isEmpty) {
        console.log("Answer cleared — removing from Redux");
        dispatch(removeAnswer({ questionId: currentQuestion.id }));
      } else {
        console.log("Answer saved to Redux:", updatedHtml);
        dispatch(
          saveAnswer({
            questionId: currentQuestion.id,
            answerHtml: JSON.stringify(updatedHtml),
          })
        );
      }
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

  //  Function to handle exam submission
  const handleSubmitAnswer = async () => {
    setIsSubmitted(true);
    try {
      const payload = {
        user_id: user.id,
        case_id: caseId,
        current_question_index: currentQuestionIndex,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (testId) {
        // Already exists: UPDATE
        console.log("Update");
        const { data, error } = await supabase
          .from("user_case_progress")
          .update(payload)
          .eq("id", testId);

        if (error) throw error;
        setResultData(data);
        
        toast({
          title: "Success",
          description: "Answer submitted successfully",
        });
      }
      if (currentQuestionIndex < totalQuestions) {
         setCurrentQuestionIndex(currentQuestionIndex + 1);
     }
     if (currentQuestionIndex === totalQuestions) {
      navigate(`/case-study-exams/${examId}/subjects/${subjectId}`);     
        // (/case-study-exams/:examId/subjects/:subjectId/cases/:caseId)
     }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitted(false);
    }
  };

  // If you want to submit all answers in Redux at once later (e.g., at "Finish Exam"), you can do:********
  //   const handleFinishExam = async () => {
  //   storeCurrentAnswerToRedux();

  //   for (const [questionId, user_answer] of Object.entries(savedAnswers)) {
  //     await supabase.from("user_case_answers").insert({
  //       user_id: user.id,
  //       case_question_id: questionId,
  //       user_answer,
  //       created_at: new Date().toISOString(),
  //       answered_at: new Date().toISOString(),
  //     });
  //   }

  //   toast.success("All answers submitted.");
  //   navigate("/some/summary/page");
  // };

  useEffect(() => {
    const saved = savedAnswers[currentQuestion?.id];
    const savedAnswerHtml = saved ? JSON.parse(saved) : "";
    // Ensure Remirror is initialized
    if (
      getContext()?.commands &&
      typeof getContext().commands.setContent === "function"
    ) {
      if (savedAnswerHtml) {
        getContext().commands.setContent(savedAnswerHtml);
        setAnswerHtml(saved);
      } else {
        getContext().commands.setContent("");
        setAnswerHtml("");
      }
    }
  }, [currentQuestionIndex]);

  // console.log("Saved Answers:", savedAnswers);

  const getCompletedQuestionCount = () => {
    return Object.keys(savedAnswers).length;
  };

//   const getStrippedTextLength = (html: string) => {
//   try {
//     const parsed = JSON.parse(html) as string;
//     const text = parsed
//       .replace(/<[^>]+>/g, "")   // Remove HTML tags
//       .replace(/&nbsp;/g, "")    // Remove &nbsp;
//       .replace(/\s+/g, "")       // Remove all spaces
//       .trim();
//     return text.length;
//   } catch {
//     return 0;
//   }
// };
//   const validateForm = () => {
  
//   const answerLength = getStrippedTextLength(formData.correct_answer);

//   return answerLength >= 2;
// };

  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      {/* Question Navigation and Display */}
      {totalQuestions > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xl sm:text-2xl font-bold">
              Question {currentQuestionIndex} of {totalQuestions}
            </span>

            {/* <Button
              onClick={() => "handleFinishExam()"}
              variant="default"
              className="py-2 px-4 sm:py-3 sm:px-6"
            >
              Finish Exam
            </Button> */}
          </div>
          <div className="mb-4">
            <Progress
              value={(getCompletedQuestionCount() / totalQuestions) * 100}
              className="h-2"
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>
                Completed: {getCompletedQuestionCount()}/{totalQuestions}
              </span>
              <span>
                {Math.round(
                  (getCompletedQuestionCount() / totalQuestions) * 100
                )}
                %
              </span>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg border border-gray-200">
            <CardDescription className="p-4 rounded-md">
              <h3 className="font-semibold text-lg mb-2">
                Question {currentQuestionIndex}{" "}
              </h3>
              <div
                className="bg-gray-50 p-4 rounded-md mb-4 h-36 overflow-y-auto"
                dangerouslySetInnerHTML={{
                  __html: normalizeHTML(currentQuestion?.question_text),
                }}
              />

              {/* Correct Answer */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Answer </h3>
                <ThemeProvider>
                  <Remirror
                    manager={manager}
                    initialContent={state}
                    onChange={({ helpers }) =>
                      onAnswerChange(helpers.getHTML())
                    }
                    autoRender="end"
                    editable={!showAnswer} // ✅ Disable editing after Proceed
                  >
                    <Toolbar>
                      <Box sx={{ display: "flex" }}>
                        <ToggleBoldButton />
                        <HeadingLevelButtonGroup />
                        <ToggleCodeButton />
                        <TextAlignmentButtonGroup />
                        <IndentationButtonGroup />
                        <UploadImageButton />
                        <TableDropdown />
                      </Box>
                    </Toolbar>
                  </Remirror>
                </ThemeProvider>
              </div>

              {currentQuestion && (
                <div className="flex justify-end items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnswer(true)}
                    disabled={!isAnswerValid}
                    className={`flex items-center mt-4 ${showAnswer ? "hidden" : ""}`}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {showAnswer ? "Processing " : "Proceed Answer"}
                  </Button>

                </div>
              )}

              {/* Content */}

              {showAnswer && currentQuestion?.correct_answer && (
                <div className="mt-0  p-4  rounded-md">
                  <h4 className=" font-medium text-sm mb-2">Correct Answer:</h4>
                  <div
                    className="text-sm prose prose-sm max-w-none bg-secondary p-2 rounded-sm min-h-16"
                    dangerouslySetInnerHTML={{
                      __html: normalizeHTML(currentQuestion.correct_answer),
                    }}
                  />
                  <div className="flex justify-end">
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSubmitAnswer()}
                    className="flex items-center mt-4"
                  >
                    {isSubmitted ? "Submitting" : "Submit Answer"}
                  </Button>

                  </div>
                </div>
              )}
            </CardDescription>
          </div>         
        </div>
      )}
    </div>
  );
};
