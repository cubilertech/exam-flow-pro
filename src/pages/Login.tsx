
import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
