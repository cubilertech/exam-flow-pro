
import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import "./App.css";
import { MainLayout } from "./layouts/MainLayout";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { AdminRoute } from "./components/auth/AdminRoute";
import CaseStudyExamDetail from "./pages/CaseStudyExamDetail";
import CaseStudyExams from "./pages/CaseStudyExams";
import CaseStudySubjectDetail from "./pages/CaseStudySubjectDetail";
import CaseStudyTakeExam from "./pages/CaseStudyTakeExam";
import Home from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import CaseStudyResults from "./pages/CaseStudyResults";
import Admin from "./pages/Admin";

function App() {
  return (
    <div className="App">
      <Toaster />
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <Home />
          </MainLayout>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={
          <PrivateRoute>
            <MainLayout>
              <Profile />
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

        <Route path="/case-study-exams/:examId/subjects/:subjectId/cases/:caseId/results" element={
          <PrivateRoute>
            <MainLayout>
              <CaseStudyResults />
            </MainLayout>
          </PrivateRoute>
        } />

        <Route path="/admin" element={
          <AdminRoute>
            <MainLayout>
              <Admin />
            </MainLayout>
          </AdminRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
