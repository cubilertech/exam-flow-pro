
import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Please contact your administrator for account access
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
