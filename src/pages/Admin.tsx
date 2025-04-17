
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { 
  fetchExamsSuccess, 
  fetchCategoriesSuccess, 
  fetchQuestionsSuccess, 
  Exam, 
  Category, 
  Question 
} from '@/features/questions/questionsSlice';
import { mockExams } from '@/data/mockExams';
import { mockCategories } from '@/data/mockCategories';
import { mockQuestions } from '@/data/mockQuestions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionsList } from '@/components/admin/QuestionsList';
import { QuestionForm } from '@/components/admin/QuestionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Admin = () => {
  const dispatch = useAppDispatch();
  const { exams, categories, questions } = useAppSelector((state) => state.questions);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  useEffect(() => {
    // Load mock data on component mount
    dispatch(fetchExamsSuccess(mockExams));
    dispatch(fetchCategoriesSuccess(mockCategories));
    dispatch(fetchQuestionsSuccess(mockQuestions));
  }, [dispatch]);

  const filteredCategories = categories.filter(
    (category) => currentExamId && category.examId === currentExamId
  );

  const filteredQuestions = questions.filter(
    (question) => currentCategoryId && question.categoryId === currentCategoryId
  );

  const handleExamChange = (examId: string) => {
    setCurrentExamId(examId);
    setCurrentCategoryId(null);
    setEditingQuestion(null);
    setActiveTab('list');
  };

  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategoryId(categoryId);
    setEditingQuestion(null);
    setActiveTab('list');
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setActiveTab('create');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard - Question Bank Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className={`p-3 rounded-md cursor-pointer ${
                    currentExamId === exam.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => handleExamChange(exam.id)}
                >
                  <div className="font-medium">{exam.title}</div>
                  <div className="text-sm opacity-90">{exam.categoryCount} categories</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={currentExamId ? '' : 'opacity-50 pointer-events-none'}>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className={`p-3 rounded-md cursor-pointer ${
                    currentCategoryId === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm opacity-90">{category.questionCount} questions</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Question Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              {!currentExamId
                ? 'Please select an exam to manage questions'
                : !currentCategoryId
                ? 'Please select a category to manage questions'
                : `Managing questions for ${
                    categories.find((c) => c.id === currentCategoryId)?.name || ''
                  }`}
            </p>
            
            {currentExamId && currentCategoryId && (
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'create')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list">Questions List</TabsTrigger>
                  <TabsTrigger value="create">
                    {editingQuestion ? 'Edit Question' : 'Create Question'}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="list">
                  <QuestionsList 
                    questions={filteredQuestions} 
                    onEdit={handleEditQuestion} 
                  />
                </TabsContent>
                <TabsContent value="create">
                  <QuestionForm 
                    categoryId={currentCategoryId} 
                    initialData={editingQuestion}
                    allCategories={categories}
                    onFormSubmitted={() => {
                      setEditingQuestion(null);
                      setActiveTab('list');
                    }}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
