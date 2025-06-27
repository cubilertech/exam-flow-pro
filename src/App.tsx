
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { Providers } from "./lib/providers";
import { AuthProvider } from "./components/auth/AuthProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyExams from "./pages/MyExams";
import TakeExam from "./pages/TakeExam";
import ExamResults from "./pages/ExamResults";
import NotFound from "./pages/NotFound";
import Agreement from "./pages/Agreement";
import { MainLayout } from "./layouts/MainLayout";
import QuestionBank from "./pages/QuestionBank";
import QuestionBankDetail from "./pages/QuestionBankDetail";
import Profile from "./pages/Profile";
import CaseStudyExams from "./pages/CaseStudyExams";
import CaseStudyExamDetail from "./pages/CaseStudyExamDetail";
import { AdminRoute } from "./components/auth/AdminRoute";
import { StudentRoute } from "./components/auth/StudentRoute";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import {CaseStudySubjectDetail} from "./pages/CaseStudySubjectDetail";
import { CaseStudyCaseDetail } from "./pages/CaseStudyCaseDetail";
// import { CaseSenerioShow } from "./pages/CaseSenerioShow";
import { CaseStudyTakeExam } from "./pages/CaseStudyTakeExam";

function App() {
  return (
    <div className="App">
      <Router>
        <Providers>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<MainLayout><Index/></MainLayout>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/>
              <Route path="/agreement" element={<MainLayout><Agreement/></MainLayout>}/>
              <Route path="/profile" element={<PrivateRoute><MainLayout><Profile/></MainLayout></PrivateRoute>}/>
              <Route path="/my-exams" element={<StudentRoute><MainLayout><MyExams/></MainLayout></StudentRoute>}/>
              <Route path="/exam/take" element={<StudentRoute><MainLayout><TakeExam/></MainLayout></StudentRoute>}/>
              <Route path="/exam-results/:resultId" element={<StudentRoute><MainLayout><ExamResults/></MainLayout></StudentRoute>}/>
              <Route path="/questions" element={<AdminRoute><MainLayout><QuestionBank/></MainLayout></AdminRoute>}/>
              <Route path="/questions/:id" element={<AdminRoute><MainLayout><QuestionBankDetail/></MainLayout></AdminRoute>}/>
              <Route path="/case-study-exams" element={<PrivateRoute><MainLayout><CaseStudyExams/></MainLayout></PrivateRoute>}/>
              <Route path="/case-study-exams/:examId" element={<PrivateRoute><MainLayout><CaseStudyExamDetail/></MainLayout></PrivateRoute>}/>
              <Route path="/case-study-exams/:examId/subjects/:subjectId" element={<PrivateRoute><MainLayout><CaseStudySubjectDetail/></MainLayout></PrivateRoute>}/>
              <Route path="/case-study-exams/:examId/subjects/:subjectId/cases/:caseId" element={<PrivateRoute><MainLayout><CaseStudyCaseDetail/></MainLayout></PrivateRoute>}/>
              <Route path="/case-study-exams/:examId/subjects/:subjectId/cases/:caseId/testId/:testId" element={<PrivateRoute><MainLayout><CaseStudyTakeExam/></MainLayout></PrivateRoute>}/>
              <Route path="*" element={<NotFound/>}/>
            </Routes>
          </AuthProvider>
        </Providers>
      </Router>
    </div>
  );
}

export default App;
