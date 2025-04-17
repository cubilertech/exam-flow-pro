
import { RegisterForm } from "@/components/auth/RegisterForm";

const Register = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
