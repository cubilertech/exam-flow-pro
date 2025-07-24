import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { CardDescription } from "@/components/ui/card";
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
import { removeAnswer, saveAnswer } from "@/features/caseAnswers/caseAnswersSlice";
import { Progress } from "@/components/ui/progress";

interface Question {
  id: string;
  question_text: string;
  case_id: string;
  correct_answer: string;
  explanation: string;
  order_index: number;
}

export const CaseStudyTakeExam = () => {
  const { examId, subjectId, caseId, testId } = useParams();
  const { user } = useAppSelector((state) => state.auth);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [answerHtml, setAnswerHtml] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const dispatch = useAppDispatch();
  const [scores, setScores] = useState<{ [key: string]: { score: string; feedback: string } }>({});
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
    if (caseId) fetchQuestions(caseId);
  }, [caseId]);

  useEffect(() => {
    setShowAnswer(false);
    setShowCorrectAnswer(false);
    const saved = savedAnswers[currentQuestion?.id];
    const savedAnswerHtml = saved ? JSON.parse(saved) : "";
    if (getContext()?.commands?.setContent) {
      if (savedAnswerHtml) {
        getContext().commands.setContent(savedAnswerHtml);
        setAnswerHtml(saved);
      } else {
        getContext().commands.setContent("");
        setAnswerHtml("");
      }
    }
  }, [currentQuestionIndex]);

  const fetchQuestions = async (caseId: string) => {
    const { data, error } = await supabase
      .from("case_questions")
      .select("*")
      .eq("case_id", caseId)
      .order("order_index", { ascending: true });
    if (data) setQuestions(data);
    if (error) console.error("Error fetching questions:", error);
  };

  const currentQuestion = questions[currentQuestionIndex - 1];

  const onAnswerChange = (updatedHtml: string) => {
    const isEmpty = manager.view.state.doc.textContent.trim() === "";
    setIsAnswerValid(!isEmpty);
    setAnswerHtml(JSON.stringify(updatedHtml));
    if (currentQuestion?.id) {
      if (isEmpty) {
        dispatch(removeAnswer({ questionId: currentQuestion.id }));
      } else {
        dispatch(
          saveAnswer({
            questionId: currentQuestion.id,
            answerHtml: JSON.stringify(updatedHtml),
          })
        );
      }
    }
  };

  const normalizeHTML = (input: string) => {
    try {
      const parsed = JSON.parse(input);
      return typeof parsed === "string" ? parsed : input;
    } catch {
      return input;
    }
  };

  const handleProceedAnswer = async () => {
    if (!currentQuestion) return;
    try {
      const response = await fetch("http://localhost:3001/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question_text,
          correctAnswer: currentQuestion.correct_answer,
          userAnswer: normalizeHTML(answerHtml),
        }),
      });

      const result = await response.json();
      setScores((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          score: result.score,
          feedback: result.feedback,
        },
      }));
      setShowAnswer(true);

      if (currentQuestionIndex === questions.length) {
        setExamFinished(true);
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (currentQuestionIndex < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      toast({ title: `End of exam. Total score is ${getTotalScore()}%` });
    }
  };

  const getCompletedQuestionCount = () => Object.keys(savedAnswers).length;
  const getTotalScore = () => {
    const values = Object.values(scores);
    const total = values.reduce((acc, cur) => acc + parseFloat(cur.score), 0);
    return (total / questions.length).toFixed(2);
  };

  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      {questions.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xl sm:text-2xl font-bold">
              Question {currentQuestionIndex} of {questions.length}
            </span>
          </div>

          <div className="mb-4">
            <Progress
              value={(getCompletedQuestionCount() / questions.length) * 100}
              className="h-2"
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>
                Completed: {getCompletedQuestionCount()}/{questions.length}
              </span>
              <span>
                {Math.round((getCompletedQuestionCount() / questions.length) * 100)}%
              </span>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg border border-gray-200">
            <CardDescription className="p-4">
              <h3 className="font-semibold text-lg mb-2">
                Question {currentQuestionIndex}
              </h3>
              <div
                className="rich-text-content"
                dangerouslySetInnerHTML={{
                  __html: normalizeHTML(currentQuestion?.question_text || ""),
                }}
              />

              <div>
                <h3 className="font-semibold text-lg mb-2">Answer</h3>
                <ThemeProvider>
                  <Remirror
                    manager={manager}
                    initialContent={state}
                    onChange={({ helpers }) => onAnswerChange(helpers.getHTML())}
                    autoRender="end"
                    editable={!showAnswer}
                  >
                    <Toolbar className="custom">
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

              {!showAnswer && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleProceedAnswer}
                    disabled={!isAnswerValid}
                    className="mt-4"
                  >
                    <BookOpen className="h-4 w-4 mr-2" /> Proceed Answer
                  </Button>
                </div>
              )}

              {showAnswer && currentQuestion && scores[currentQuestion.id] && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2 text-sm mb-2">
                    <h4 className="font-medium">Score:</h4>
                    <div className="font-bold">{scores[currentQuestion.id].score}</div>
                  </div>
                  <h4 className="font-medium text-sm mb-0">Feedback:</h4>
                  <div className="text-sm prose max-w-none bg-secondary p-2 rounded-sm min-h-16 w-full mt-1">
                    {scores[currentQuestion.id].feedback}
                  </div>

                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCorrectAnswer((prev) => !prev)}
                    >
                      {showCorrectAnswer ? "Hide Correct Answer" : "Show Correct Answer"}
                    </Button>

                    {showCorrectAnswer && (
                      <div className="mt-2 p-2 bg-white border border-gray-200 rounded text-sm prose max-w-none">
                        <strong>Correct Answer:</strong>
                        <div
                          className="rich-text-content"
                          dangerouslySetInnerHTML={{
                            __html: normalizeHTML(currentQuestion.correct_answer),
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSubmitAnswer}
                      className="mt-4"
                    >
                      {currentQuestionIndex === questions.length ? "Finish" : "Next Question"}
                    </Button>
                  </div>
                </div>
              )}
            </CardDescription>
          </div>

          {examFinished && (
            <div className="mt-6 text-center">
              <h3 className="text-xl font-bold">
                End of exam. Total Score: {getTotalScore()}%
              </h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
