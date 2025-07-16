import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ExamResultData, Question } from '@/types/case-study';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

const ExamResults = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const [examResult, setExamResult] = useState<ExamResultData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!resultId) return;
      
      try {
        const { data: resultData, error: resultError } = await supabase
          .from('exam_results')
          .select('*')
          .eq('id', resultId)
          .single();

        if (resultError) throw resultError;
        
        setExamResult(resultData as ExamResultData);

        // Process questions from answers if available
        if (resultData.answers && Array.isArray(resultData.answers)) {
          const processedQuestions = resultData.answers.map((answer: any, index: number) => ({
            id: answer.questionId || `q-${index}`,
            question_text: answer.questionText || '',
            correct_answer: answer.correctAnswer || '',
            explanation: answer.explanation || null,
            hint: null,
            case_id: answer.caseId || '',
            order_index: index,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isCorrect: answer.isCorrect || false,
            userAnswer: answer.userAnswer || '',
            categoryId: answer.categoryId || '',
            tags: answer.tags || [],
            difficulty: answer.difficulty || 'medium'
          }));
          
          setQuestions(processedQuestions);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [resultId]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!examResult) {
    return <div className="text-center">No results found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Exam Results</h1>
      <div className="mb-4">
        <p>
          <strong>Score:</strong> {examResult.score}
        </p>
        <p>
          <strong>Correct Answers:</strong> {examResult.correct_count}
        </p>
        <p>
          <strong>Incorrect Answers:</strong> {examResult.incorrect_count}
        </p>
        <p>
          <strong>Time Taken:</strong> {examResult.time_taken} seconds
        </p>
        <p>
          <strong>Completed At:</strong> {new Date(examResult.completed_at).toLocaleString()}
        </p>
      </div>

      <h2 className="text-xl font-semibold mb-2">Question Breakdown</h2>
      <ScrollArea className="mb-4 h-[400px] w-full rounded-md border">
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle>Question {index + 1}</CardTitle>
              <CardDescription>{question.question_text}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Your Answer:</strong> {question.userAnswer}
              </p>
              <p>
                <strong>Correct Answer:</strong> {question.correct_answer}
              </p>
              {question.isCorrect ? (
                <Badge variant="outline">Correct</Badge>
              ) : (
                <Badge variant="destructive">Incorrect</Badge>
              )}
              {question.explanation && (
                <p>
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      </ScrollArea>
    </div>
  );
};

export default ExamResults;
