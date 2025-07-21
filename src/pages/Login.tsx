import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="flex items-center min-h-screen bg-background">
      <div className="w-full max-w-md p-6 ml-[430px] flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Login</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Please contact your administrator for account access
        </p>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
