
import React, { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Flag } from 'lucide-react';

const TakeExam = () => {
  const navigate = useNavigate();
  const { currentTestQuestions, currentStudyMode } = useAppSelector((state) => state.study);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});

  // Redirect if not in test mode or no questions
  if (!currentTestQuestions || currentTestQuestions.length === 0) {
    navigate('/my-exams');
    return null;
  }

  const currentQuestion = currentTestQuestions[currentQuestionIndex];
  const totalQuestions = currentTestQuestions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  
  // Check if question has multiple correct answers
  const isMultipleChoice = currentQuestion.options.filter(o => o.isCorrect).length > 1;

  const handleSelectAnswer = (optionId: string) => {
    if (isMultipleChoice) {
      // For multiple choice questions
      const currentSelectedOptions = selectedAnswers[currentQuestion.id] || [];
      const isSelected = currentSelectedOptions.includes(optionId);
      
      if (isSelected) {
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQuestion.id]: currentSelectedOptions.filter(id => id !== optionId)
        });
      } else {
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQuestion.id]: [...currentSelectedOptions, optionId]
        });
      }
    } else {
      // For single choice questions
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion.id]: [optionId]
      });
    }
  };

  const handlePrevQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleFinishExam = () => {
    // TODO: Implement exam submission logic
    navigate('/my-exams');
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </h1>
        <div className="flex items-center">
          {currentStudyMode === 'study' && (
            <Button variant="ghost" className="mr-2">
              <Flag className="h-4 w-4 mr-1" />
              Flag
            </Button>
          )}
          {isLastQuestion ? (
            <Button onClick={handleFinishExam}>Finish Exam</Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-medium mb-4">{currentQuestion.text}</h2>
        
        {currentQuestion.imageUrl && (
          <div className="mb-4">
            <img 
              src={currentQuestion.imageUrl} 
              alt="Question" 
              className="max-h-96 object-contain rounded-md"
            />
          </div>
        )}

        {isMultipleChoice ? (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={option.id}
                  checked={(selectedAnswers[currentQuestion.id] || []).includes(option.id)}
                  onCheckedChange={() => handleSelectAnswer(option.id)}
                />
                <label 
                  htmlFor={option.id} 
                  className="text-base cursor-pointer"
                >
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <RadioGroup 
            value={(selectedAnswers[currentQuestion.id] || [])[0]}
            onValueChange={(value) => handleSelectAnswer(value)}
          >
            {currentQuestion.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 py-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <label 
                  htmlFor={option.id} 
                  className="text-base cursor-pointer"
                >
                  {option.text}
                </label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      <div className="flex justify-between">
        <Button 
          onClick={handlePrevQuestion} 
          disabled={isFirstQuestion}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>
        
        {isLastQuestion ? (
          <Button onClick={handleFinishExam}>Finish Exam</Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            Next
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TakeExam;
