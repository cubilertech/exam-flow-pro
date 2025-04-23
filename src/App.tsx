
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
          <AuthProvider>
            <Routes>
              <Route path="/" element={<MainLayout><Index/></MainLayout>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/>
              <Route path="/profile" element={<PrivateRoute><MainLayout><Profile/></MainLayout></PrivateRoute>}/>
              <Route path="/my-exams" element={<StudentRoute><MainLayout><MyExams/></MainLayout></StudentRoute>}/>
              <Route path="/exam/take" element={<StudentRoute><MainLayout><TakeExam/></MainLayout></StudentRoute>}/>
              <Route path="/exam-results/:resultId" element={<StudentRoute><MainLayout><ExamResults/></MainLayout></StudentRoute>}/>
              <Route path="/questions" element={<AdminRoute><MainLayout><QuestionBank/></MainLayout></AdminRoute>}/>
              <Route path="/questions/:id" element={<AdminRoute><MainLayout><QuestionBankDetail/></MainLayout></AdminRoute>}/>
              <Route path="*" element={<NotFound/>}/>
            </Routes>
          </AuthProvider>
        </Router>
      </Providers>
    </div>
  );
}

export default App;

