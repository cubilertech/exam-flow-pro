import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Categories from "./pages/Categories";
import Study from "./pages/Study";
import Admin from "./pages/Admin";
import Exams from "./pages/Exams";
import NewExam from "./pages/NewExam";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import MainLayout from "./components/core/MainLayout";
import QuestionBank from "./pages/QuestionBank";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout><Index/></MainLayout>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/categories" element={<PrivateRoute><MainLayout><Categories/></MainLayout></PrivateRoute>}/>
            <Route path="/study" element={<PrivateRoute><MainLayout><Study/></MainLayout></PrivateRoute>}/>
            <Route path="/admin" element={<PrivateRoute><MainLayout><Admin/></MainLayout></PrivateRoute>}/>
            <Route path="/exams" element={<PrivateRoute><MainLayout><Exams/></MainLayout></PrivateRoute>}/>
            <Route path="/exams/new" element={<PrivateRoute><MainLayout><NewExam/></MainLayout></PrivateRoute>}/>
            <Route path="/exams/:id/edit" element={<PrivateRoute><MainLayout><NewExam/></MainLayout></PrivateRoute>}/>
            <Route path="/questions" element={<PrivateRoute><MainLayout><QuestionBank/></MainLayout></PrivateRoute>}/>
            <Route path="*" element={<NotFound/>}/>
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
