
import React, {
  useEffect,
  useState,
} from 'react';

import {
  BookOpen,
  CheckCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Question } from '@/features/questions/questionsSlice';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  showAnswers?: boolean;
  onAnswerSelect?: (questionId: string, selectedOptions: string[]) => void;
  selectedOptions?: string[];
  isAnswered?: boolean;
  isTestMode?: boolean;
  examType?: 'study' | 'test';
  onFlagQuestion?: (questionId: string) => void;
  isFlagged?: boolean;
  onCheckAnswer?: () => void;
}

export const QuestionCard = ({
  question,
  showAnswers = true,
  onAnswerSelect,
  selectedOptions = [],
  isAnswered = false,
  isTestMode = false,
  examType = 'test',
  onFlagQuestion,
  isFlagged = false,
  onCheckAnswer,
}: QuestionCardProps) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [answerChecked, setAnswerChecked] = useState(false);
  
  const isMultipleChoice = question.options.filter((opt) => opt.isCorrect).length > 1;
  const shouldShowAnswers = examType === 'study' ? answerChecked : (examType === 'test' && showAnswers);
  
  const handleOptionSelect = (optionId: string) => {
    // if (!onAnswerSelect || (isAnswered && examType === 'test')) return;
    
    let newSelectedOptions: string[];
    
    if (isMultipleChoice) {
      newSelectedOptions = selectedOptions.includes(optionId)
        ? selectedOptions.filter((id) => id !== optionId)
        : [...selectedOptions, optionId];
    } else {
      newSelectedOptions = [optionId];
    }
    
    onAnswerSelect?.(question.id, newSelectedOptions);
  };
  
  useEffect(()=>{
    if(question){
      setShowExplanation(false);
      setAnswerChecked(false);
    }
  },[question]);

  const handleCheckAnswer = () => {
    setAnswerChecked(true);
    if (onCheckAnswer) {
      onCheckAnswer();
    }
  };

  const isOptionCorrect = (optionId: string) => {
    return question.options.find(opt => opt.id === optionId)?.isCorrect || false;
  };

  const isOptionIncorrect = (optionId: string) => {
    return selectedOptions.includes(optionId) && !isOptionCorrect(optionId);
  };

  return (
    <Card className={cn("w-full mb-4 transition-all", isFlagged && "border-amber-400 border-2")}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex flex-col">
          <Badge 
            variant="outline" 
            className={cn(
              "mb-2 w-fit", 
              question.difficulty === 'easy' && "bg-green-100 text-green-800 border-green-200",
              question.difficulty === 'medium' && "bg-yellow-100 text-yellow-800 border-yellow-200",
              question.difficulty === 'hard' && "bg-red-100 text-red-800 border-red-200"
            )}
          >
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </Badge>
          <div className="text-sm text-muted-foreground">
            Question #{question.serialNumber}
          </div>
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
                 className="max-w-full h-[200px] rounded-md object-cover"
              />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {question.options.map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            const isCorrect = option.isCorrect;
            const showCorrectness = shouldShowAnswers && (isAnswered || answerChecked);
            
            return (
              <div
                key={option.id}
                className={cn(
                  "flex items-start p-3 rounded-md border cursor-pointer",
                  !isAnswered && !answerChecked && "hover:border-primary",
                  isSelected && !showCorrectness && "border-primary bg-primary/10",
                  showCorrectness && isCorrect && "border-green-500 bg-green-50",
                  showCorrectness && isSelected && !isCorrect && "border-red-500 bg-red-50",
                  showCorrectness && !isSelected && !isCorrect && ""
                )}
                onClick={() => handleOptionSelect(option.id)}
              >
                <p className={cn(
                  "text-sm",
                  showCorrectness && isCorrect && "text-green-700 font-medium",
                  showCorrectness && isSelected && !isCorrect && "text-red-700 font-medium"
                )}>
                  {option.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 justify-between">
          {examType === 'study' && (
            <Button 
            disabled={selectedOptions.length > 0 ? false : true}
              variant="default" 
              size="sm"
              onClick={handleCheckAnswer}
              className="flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Check Answer
            </Button>
          )}
          {question.explanation && (shouldShowAnswers || examType === 'study') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {showExplanation ? "Hide Explanation" : "Show Explanation"}
            </Button>
          )}
        </div>
        
        {showExplanation && question.explanation && (
          <div className="mt-4 p-4 bg-secondary rounded-md">
            <h4 className="font-medium text-sm mb-2">Explanation:</h4>
            <div 
              className="text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: question.explanation }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
