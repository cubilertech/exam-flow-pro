
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addNote, toggleFlagQuestion } from "@/features/study/studySlice";
import { Question } from "@/features/questions/questionsSlice";
import { BookOpen, Flag, Check, AlertCircle } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  showAnswers?: boolean;
  onAnswerSelect?: (questionId: string, selectedOptions: string[]) => void;
  selectedOptions?: string[];
  isAnswered?: boolean;
  isTestMode?: boolean;
}

export const QuestionCard = ({
  question,
  showAnswers = true,
  onAnswerSelect,
  selectedOptions = [],
  isAnswered = false,
  isTestMode = false,
}: QuestionCardProps) => {
  const dispatch = useAppDispatch();
  const [noteText, setNoteText] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  
  const { notes, flaggedQuestions } = useAppSelector((state) => state.study);
  
  const existingNote = notes.find((note) => note.questionId === question.id);
  const isFlagged = flaggedQuestions.some((q) => q.questionId === question.id);
  
  const isMultipleChoice = question.options.filter((opt) => opt.isCorrect).length > 1;
  
  const handleOptionSelect = (optionId: string) => {
    if (!onAnswerSelect || isAnswered) return;
    
    let newSelectedOptions: string[];
    
    if (isMultipleChoice) {
      // For multiple choice, toggle the selection
      newSelectedOptions = selectedOptions.includes(optionId)
        ? selectedOptions.filter((id) => id !== optionId)
        : [...selectedOptions, optionId];
    } else {
      // For single choice, replace the selection
      newSelectedOptions = [optionId];
    }
    
    onAnswerSelect(question.id, newSelectedOptions);
  };
  
  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    
    dispatch(
      addNote({
        questionId: question.id,
        note: noteText,
        updatedAt: new Date().toISOString(),
      })
    );
    
    setNoteText("");
  };
  
  const handleFlagQuestion = () => {
    dispatch(toggleFlagQuestion(question.id));
  };
  
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className={cn("w-full mb-4 transition-all", isFlagged && "border-amber-400 border-2")}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex flex-col">
          <Badge variant="outline" className={cn("mb-2 w-fit", getDifficultyClass(question.difficulty))}>
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </Badge>
          <div className="text-sm text-muted-foreground">
            Question #{question.serialNumber}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFlagQuestion}
            className={cn(isFlagged && "text-amber-500")}
          >
            <Flag className="h-4 w-4" />
            <span className="sr-only">Flag question</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{question.text}</h3>
          {question.imageUrl && (
            <div className="my-4">
              <img
                src={question.imageUrl}
                alt="Question illustration"
                className="max-w-full h-auto rounded-md"
              />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {question.options.map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            const isCorrect = option.isCorrect;
            const showCorrectness = showAnswers && (isAnswered || !isTestMode);
            
            return (
              <div
                key={option.id}
                className={cn(
                  "flex items-start p-3 rounded-md border cursor-pointer",
                  !isAnswered && "hover:border-primary",
                  isSelected && !showCorrectness && "border-primary bg-primary/10",
                  showCorrectness && isCorrect && "border-green-500 bg-green-50",
                  showCorrectness && isSelected && !isCorrect && "border-red-500 bg-red-50"
                )}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="flex-1">
                  <p className={cn(
                    "text-sm",
                    showCorrectness && isCorrect && "text-green-700 font-medium",
                    showCorrectness && isSelected && !isCorrect && "text-red-700 font-medium"
                  )}>
                    {option.text}
                  </p>
                </div>
                {showCorrectness && isCorrect && (
                  <Check className="h-5 w-5 text-green-500 ml-2" />
                )}
                {showCorrectness && isSelected && !isCorrect && (
                  <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
            );
          })}
        </div>
        
        {showAnswers && (isAnswered || !isTestMode) && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {showExplanation ? "Hide Explanation" : "Show Explanation"}
            </Button>
            
            {showExplanation && (
              <div className="mt-2 p-3 bg-secondary rounded-md">
                <p className="text-sm">{question.explanation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {!isTestMode && (
        <CardFooter className="flex flex-col items-start">
          <Tabs defaultValue="notes" className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="notes">My Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="space-y-2">
              {existingNote && (
                <div className="p-3 bg-secondary rounded-md mb-2">
                  <p className="text-sm">{existingNote.note}</p>
                </div>
              )}
              <Textarea
                placeholder="Add your notes here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="min-h-[100px]"
              />
              <Button size="sm" onClick={handleSaveNote}>
                Save Note
              </Button>
            </TabsContent>
          </Tabs>
        </CardFooter>
      )}
    </Card>
  );
};
