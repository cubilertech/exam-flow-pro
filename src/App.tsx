
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Providers } from "./lib/providers";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Study from "./pages/Study";
import Exams from "./pages/Exams";
import MyExams from "./pages/MyExams";
import TakeExam from "./pages/TakeExam";
import ExamResults from "./pages/ExamResults";
import NewExam from "./pages/NewExam";
import NotFound from "./pages/NotFound";
import { MainLayout } from "./layouts/MainLayout";
import QuestionBank from "./pages/QuestionBank";
import QuestionBankDetail from "./pages/QuestionBankDetail";
import Profile from "./pages/Profile";
import { AdminRoute } from "./components/auth/AdminRoute";
import { StudentRoute } from "./components/auth/StudentRoute";
import { PrivateRoute } from "./components/auth/PrivateRoute";

function App() {
  return (
    <div className="App">
      <Providers>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout><Index/></MainLayout>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/profile" element={<PrivateRoute><MainLayout><Profile/></MainLayout></PrivateRoute>}/>
            <Route path="/study" element={<StudentRoute><MainLayout><Study/></MainLayout></StudentRoute>}/>
            <Route path="/exams" element={<StudentRoute><MainLayout><Exams/></MainLayout></StudentRoute>}/>
            <Route path="/my-exams" element={<StudentRoute><MainLayout><MyExams/></MainLayout></StudentRoute>}/>
            <Route path="/exam/take" element={<StudentRoute><MainLayout><TakeExam/></MainLayout></StudentRoute>}/>
            <Route path="/exam-results/:resultId" element={<StudentRoute><MainLayout><ExamResults/></MainLayout></StudentRoute>}/>
            <Route path="/exams/new" element={<AdminRoute><MainLayout><NewExam/></MainLayout></AdminRoute>}/>
            <Route path="/exams/:id/edit" element={<AdminRoute><MainLayout><NewExam/></MainLayout></AdminRoute>}/>
            <Route path="/questions" element={<AdminRoute><MainLayout><QuestionBank/></MainLayout></AdminRoute>}/>
            <Route path="/questions/:id" element={<AdminRoute><MainLayout><QuestionBankDetail/></MainLayout></AdminRoute>}/>
            <Route path="*" element={<NotFound/>}/>
          </Routes>
        </Router>
      </Providers>
    </div>
  );
}

export default App;
