
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  setCurrentExam,
  setCurrentCategory,
  fetchQuestionsSuccess,
  Question,
} from "@/features/questions/questionsSlice";
import { setStudyMode } from "@/features/study/studySlice";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BookOpen, Filter } from "lucide-react";

// Mock data for initial development
import { mockExams } from "@/data/mockExams";
import { mockCategories } from "@/data/mockCategories";
import { mockQuestions } from "@/data/mockQuestions";

export const StudyMode = () => {
  const dispatch = useAppDispatch();
  const { exams, categories, questions, currentExam, currentCategory } = useAppSelector(
    (state) => state.questions
  );
  
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState(10);
  const [difficultyFilter, setDifficultyFilter] = useState<"easy" | "medium" | "hard" | null>(null);
  
  // Load mock data on initial render
  useEffect(() => {
    if (exams.length === 0) {
      dispatch({ type: "questions/fetchExamsSuccess", payload: mockExams });
    }
    
    if (categories.length === 0) {
      dispatch({ type: "questions/fetchCategoriesSuccess", payload: mockCategories });
    }
    
    if (questions.length === 0) {
      dispatch(fetchQuestionsSuccess(mockQuestions as Question[]));
    }
    
    dispatch(setStudyMode("study"));
  }, [dispatch]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentExam, currentCategory, difficultyFilter]);
  
  // Filter questions based on selected exam and category
  const filteredQuestions = questions.filter((question) => {
    let matches = true;
    
    if (currentCategory && question.categoryId !== currentCategory.id) {
      matches = false;
    }
    
    if (difficultyFilter && question.difficulty !== difficultyFilter) {
      matches = false;
    }
    
    return matches;
  });
  
  // Calculate pagination
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  const handleExamChange = (examId: string) => {
    const selectedExam = exams.find((exam) => exam.id === examId) || null;
    dispatch(setCurrentExam(selectedExam));
    dispatch(setCurrentCategory(null));
  };
  
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === "all-categories") {
      dispatch(setCurrentCategory(null));
    } else {
      const selectedCategory = categories.find(
        (category) => category.id === categoryId
      ) || null;
      dispatch(setCurrentCategory(selectedCategory));
    }
  };
  
  const handleDifficultyChange = (difficulty: string) => {
    setDifficultyFilter(difficulty === "all" ? null : difficulty as "easy" | "medium" | "hard");
  };
  
  const filteredCategories = currentExam
    ? categories.filter((category) => category.examId === currentExam.id)
    : categories;

  const pageCount = Math.ceil(filteredQuestions.length / questionsPerPage);

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Study Mode</h1>
        <p className="text-muted-foreground">
          Browse through questions, view explanations, and add notes
        </p>
      </div>
      
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Select Exam</label>
            <Select onValueChange={handleExamChange} value={currentExam?.id || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Select Category</label>
            <Select
              onValueChange={handleCategoryChange}
              value={currentCategory?.id || "all-categories"}
              disabled={!currentExam}
            >
              <SelectTrigger>
                <SelectValue placeholder={currentExam ? "Choose a category" : "Select exam first"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Difficulty Level</label>
            <Select
              onValueChange={handleDifficultyChange}
              value={difficultyFilter || "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {indexOfFirstQuestion + 1}-
          {Math.min(indexOfLastQuestion, filteredQuestions.length)} of{" "}
          {filteredQuestions.length} questions
        </div>
        
        <Select
          value={questionsPerPage.toString()}
          onValueChange={(value) => setQuestionsPerPage(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Questions per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredQuestions.length === 0 ? (
        <div className="text-center p-10 bg-secondary rounded-lg">
          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No questions found</h3>
          <p className="text-muted-foreground mb-4">
            Try selecting a different exam, category, or difficulty level.
          </p>
          <Button onClick={() => {
            dispatch(setCurrentExam(null));
            dispatch(setCurrentCategory(null));
            setDifficultyFilter(null);
          }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {currentQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
          
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) paginate(currentPage - 1);
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: pageCount }).map((_, i) => {
                // Show first page, last page, and pages around the current page
                if (
                  i === 0 ||
                  i === pageCount - 1 ||
                  (i >= currentPage - 2 && i <= currentPage + 2)
                ) {
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          paginate(i + 1);
                        }}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  i === currentPage - 3 ||
                  i === currentPage + 3
                ) {
                  return (
                    <PaginationItem key={i}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < pageCount) paginate(currentPage + 1);
                  }}
                  className={currentPage >= pageCount ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
};
