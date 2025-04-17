
import { useAppSelector } from "@/lib/hooks";
import { Dashboard } from "@/components/core/Dashboard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, TestTube, BarChart, Users } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tighter">
                Master Your Exams with
                <span className="text-primary"> ExamFlowPro</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                The intelligent exam preparation platform that adapts to your learning style.
                Study smarter, not harder with personalized question banks and real-time analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden shadow-xl border">
              <img
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&h=600"
                alt="Student preparing for exam with laptop"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Study Mode</h3>
            <p className="text-muted-foreground">
              Browse questions by topic with detailed explanations and add personal notes.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-full bg-examSecondary/10 flex items-center justify-center mb-4">
              <TestTube className="h-6 w-6 text-examSecondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Test Mode</h3>
            <p className="text-muted-foreground">
              Create custom tests with your choice of topics, difficulty levels, and time limits.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-full bg-examInfo/10 flex items-center justify-center mb-4">
              <BarChart className="h-6 w-6 text-examInfo" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
            <p className="text-muted-foreground">
              Track your progress with detailed analytics and identify areas for improvement.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-full bg-examPrimary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-examPrimary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Admin Controls</h3>
            <p className="text-muted-foreground">
              Comprehensive tools for content management and user analytics for administrators.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Ace Your Exams?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of students who are studying smarter and achieving better results.
            </p>
            <Button size="lg" asChild>
              <Link to="/register">Create Your Free Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
