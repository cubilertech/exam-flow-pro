import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import "./App.css";
import AdminLayout from "./components/layouts/AdminLayout";
import MainLayout from "./components/layouts/MainLayout";
import PrivateRoute from "./components/routes/PrivateRoute";
import PublicRoute from "./components/routes/PublicRoute";
import AdminCases from "./pages/admin/AdminCases";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminExams from "./pages/admin/AdminExams";
import AdminQuestionBanks from "./pages/admin/AdminQuestionBanks";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminSubjects from "./pages/admin/AdminSubjects";
import CaseStudyExamDetail from "./pages/CaseStudyExamDetail";
import CaseStudyExams from "./pages/CaseStudyExams";
import CaseStudySubjectDetail from "./pages/CaseStudySubjectDetail";
import CaseStudyTakeExam from "./pages/CaseStudyTakeExam";
import ExamDetail from "./pages/ExamDetail";
import Exams from "./pages/Exams";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import QuestionBankDetail from "./pages/QuestionBankDetail";
import QuestionBanks from "./pages/QuestionBanks";
import Questions from "./pages/Questions";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import CaseStudyResults from "./pages/CaseStudyResults";

function App() {
  return (
    <div className="App">
      <Toaster />
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <MainLayout>
              <Home />
            </MainLayout>
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/question-banks" element={
          <PrivateRoute>
            <MainLayout>
              <QuestionBanks />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/question-banks/:id" element={
          <PrivateRoute>
            <MainLayout>
              <QuestionBankDetail />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/questions" element={
          <PrivateRoute>
            <MainLayout>
              <Questions />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/exams" element={
          <PrivateRoute>
            <MainLayout>
              <Exams />
            </MainLayout>
          </PrivateRoute>
        } />
        <Route path="/exams/:id" element={
          <PrivateRoute>
            <MainLayout>
              <ExamDetail />
            </MainLayout>
          </PrivateRoute>
        } />

        <Route path="/case-study-exams" element={
          <PrivateRoute>
            <MainLayout>
              <CaseStudyExams />
            </MainLayout>
          </PrivateRoute>
        } />

        <Route path="/case-study-exams/:examId" element={
          <PrivateRoute>
            <MainLayout>
              <CaseStudyExamDetail />
            </MainLayout>
          </PrivateRoute>
        } />

        <Route path="/case-study-exams/:examId/subjects/:subjectId" element={
          <PrivateRoute>
            <MainLayout>
              <CaseStudySubjectDetail />
            </MainLayout>
          </PrivateRoute>
        } />

        <Route path="/case-study-exams/:examId/subjects/:subjectId/cases/:caseId/take" element={
          <PrivateRoute>
            <MainLayout>
              <CaseStudyTakeExam />
            </MainLayout>
          </PrivateRoute>
        } />

        <Route path="/admin" element={
          <PrivateRoute requiredRole="admin">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/question-banks" element={
          <PrivateRoute requiredRole="admin">
            <AdminLayout>
              <AdminQuestionBanks />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/categories" element={
          <PrivateRoute requiredRole="admin">
            <AdminLayout>
              <AdminCategories />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/questions" element={
          <PrivateRoute requiredRole="admin">
            <AdminLayout>
              <AdminQuestions />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/exams" element={
          <PrivateRoute requiredRole="admin">
            <AdminLayout>
              <AdminExams />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/cases" element={
          <PrivateRoute requiredRole="admin">
            <AdminLayout>
              <AdminCases />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/subjects" element={
          <PrivateRoute requiredRole="admin">
            <AdminLayout>
              <AdminSubjects />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="*" element={<NotFound />} />
        
        <Route path="/case-study-exams/:examId/subjects/:subjectId/cases/:caseId/results" element={
          <PrivateRoute>
            <MainLayout>
              <CaseStudyResults />
            </MainLayout>
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
