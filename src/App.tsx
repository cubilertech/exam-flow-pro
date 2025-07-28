
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './lib/store';
import { AuthProvider } from './components/auth/AuthProvider';
import { AdminRoute } from './components/auth/AdminRoute';
import { StudentRoute } from './components/auth/StudentRoute';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Toaster } from './components/ui/sonner';
import { Toaster as ToasterComponent } from './components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { SidebarProvider } from './components/ui/sidebar';
import { MainLayout } from './layouts/MainLayout';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Categories from './pages/Categories';
import QuestionBank from './pages/QuestionBank';
import QuestionBankDetail from './pages/QuestionBankDetail';
import MyExams from './pages/MyExams';
import TakeExam from './pages/TakeExam';
import ExamResults from './pages/ExamResults';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import CaseStudyExams from './pages/CaseStudyExams';
import CaseStudyExamDetail from './pages/CaseStudyExamDetail';
import { CaseStudySubjectDetail } from './pages/CaseStudySubjectDetail';
import { CaseStudyCaseDetail } from './pages/CaseStudyCaseDetail';
import { CaseStudyTakeExam } from './pages/CaseStudyTakeExam';
import { CaseSenerioShow } from './pages/CaseSenerioShow';
import NotFound from './pages/NotFound';
import Agreement from './pages/Agreement';

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Router>
            <AuthProvider>
              <SidebarProvider>
                <div className="min-h-screen bg-background w-full">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/agreement" element={<Agreement />} />
                    
                    {/* Admin Routes */}
                    <Route 
                      path="/admin" 
                      element={
                        <AdminRoute>
                          <MainLayout>
                            <Admin />
                          </MainLayout>
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="/questions" 
                      element={
                        <AdminRoute>
                          <MainLayout>
                            <QuestionBank />
                          </MainLayout>
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="/questions/:id" 
                      element={
                        <AdminRoute>
                          <MainLayout>
                            <QuestionBankDetail />
                          </MainLayout>
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="/categories" 
                      element={
                        <AdminRoute>
                          <MainLayout>
                            <Categories />
                          </MainLayout>
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="/users" 
                      element={
                        <AdminRoute>
                          <MainLayout>
                            <UserManagement />
                          </MainLayout>
                        </AdminRoute>
                      } 
                    />
                    
                    {/* Student Routes */}
                    <Route 
                      path="/my-exams" 
                      element={
                        <StudentRoute>
                          <MainLayout>
                            <MyExams />
                          </MainLayout>
                        </StudentRoute>
                      } 
                    />
                    <Route 
                      path="/exam/take" 
                      element={
                        <StudentRoute>
                          <MainLayout>
                            <TakeExam />
                          </MainLayout>
                        </StudentRoute>
                      } 
                    />
                    <Route 
                      path="/exam-results/:resultId" 
                      element={
                        <StudentRoute>
                          <MainLayout>
                            <ExamResults />
                          </MainLayout>
                        </StudentRoute>
                      } 
                    />
                    
                    {/* Case Study Routes - Available to both admins and students */}
                    <Route 
                      path="/case-study-exams" 
                      element={
                        <PrivateRoute>
                          <MainLayout>
                            <CaseStudyExams />
                          </MainLayout>
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/case-study-exams/:examId" 
                      element={
                        <PrivateRoute>
                          <MainLayout>
                            <CaseStudyExamDetail />
                          </MainLayout>
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/case-study-exams/:examId/subjects/:subjectId" 
                      element={
                        <PrivateRoute>
                          <MainLayout>
                            <CaseStudySubjectDetail />
                          </MainLayout>
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/case-study-exams/:examId/subjects/:subjectId/cases/:caseId" 
                      element={
                        <PrivateRoute>
                          <MainLayout>
                            <CaseStudyCaseDetail />
                          </MainLayout>
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/case-study-exams/:examId/subjects/:subjectId/cases/:caseId/testId/:testId" 
                      element={
                        <StudentRoute>
                          <MainLayout>
                            <CaseStudyTakeExam />
                          </MainLayout>
                        </StudentRoute>
                      } 
                    />
                    <Route 
                      path="/case-study-exams/:examId/subjects/:subjectId/cases/:caseId" 
                      element={
                        <StudentRoute>
                          <MainLayout>
                            <CaseSenerioShow />
                          </MainLayout>
                        </StudentRoute>
                      } 
                    />
                    
                    {/* Shared Routes */}
                    <Route 
                      path="/profile" 
                      element={
                        <PrivateRoute>
                          <MainLayout>
                            <Profile />
                          </MainLayout>
                        </PrivateRoute>
                      } 
                    />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </SidebarProvider>
            </AuthProvider>
          </Router>
          <Toaster />
          <ToasterComponent />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
