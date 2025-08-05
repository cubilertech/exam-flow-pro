import { useAppSelector } from "@/lib/hooks";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  TestTube,
  BarChart,
  Flag,
  BookMarked,
  GraduationCap,
  Clock,
  Target,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useQuestionBankSubscriptions } from "@/hooks/useQuestionBankSubscriptions";
import { useCaseStudySubscriptions } from "@/hooks/useCaseStudySubscriptions";
import { format } from "date-fns";

export const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { stats, loading } = useDashboardStats();
  const { subscriptions: questionBanks } = useQuestionBankSubscriptions();
  const { subscriptions: caseStudyExams } = useCaseStudySubscriptions();

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4 md:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {user?.username || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Track your progress and continue your exam preparation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card className="relative overflow-hidden transition-all duration-0">
          <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <CardHeader>
            <CardTitle>Question Banks</CardTitle>
            <CardDescription className="pt-1">
              Browse and learn at your own pace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loading ? "..." : stats.totalQuestionBanks}
            </p>
            <p className="text-sm text-muted-foreground">
              Available question banks
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/profile">Browse Question Banks</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative overflow-hidden duration-0 transition-all">
          <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <CardHeader>
            <CardTitle>Case Studies</CardTitle>
            <CardDescription>Advanced case-based learning</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loading ? "..." : stats.totalCaseStudyExams}
            </p>
            <p className="text-sm text-muted-foreground">
              Available case studies
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link to="/case-study-exams">Browse Cases</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-0">
          <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-lg bg-examSecondary/10 flex items-center justify-center">
            <TestTube className="h-8 w-8 text-examSecondary" />
          </div>
          <CardHeader>
            <CardTitle>Test Mode</CardTitle>
            <CardDescription className="pt-1">
              Challenge yourself with custom tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {loading ? "..." : stats.testsCompleted}
            </p>
            <p className="text-sm text-muted-foreground">Tests completed</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link to="/my-exams">My Exams</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="transition-all duration-0 relative ">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Exams</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent >
            {stats.recentExamResults && stats.recentExamResults.length > 0 ? (
              <div className="pb-14">

              <ul className="space-y-2">
                {stats.recentExamResults.slice(0, 5).map((result) => (
                  <li
                    key={result.id}
                    className="flex flex-col md:flex-row justify-between items-end p-3 hover:bg-muted rounded-md transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {result.exam_name || "Unnamed Exam"}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {result.question_bank_name || "Question Bank"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>{Math.round(result.score)}%</span>
                        </div>
                        <span>
                          {format(new Date(result.completed_at), "MMM dd")}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/exam-results/${result.id}`}>View</Link>
                    </Button>
                  </li>
                ))}
              </ul>
              </div>
            ) : (
              <div className="text-center p-6 pb-20">
                <p className="text-muted-foreground">No exams taken yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start your first exam to see results here
                </p>
              </div>
            )}
          </CardContent >
          <CardFooter className="absolute bottom-0 left-0 right-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/my-exams">View All Exams</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="transition-all duration-0 relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="pb-1">Flagged Questions</CardTitle>
              <Flag className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent >
           
            {stats.recentFlaggedQuestions &&
            stats.recentFlaggedQuestions.length > 0 ? (
             <div className="pb-14">
              
              <ul className="space-y-2  ">
                {stats.recentFlaggedQuestions.map((flagged) => (
                  <li
                    key={flagged.id}
                    className="flex flex-col md:flex-row justify-between items-end p-3 hover:bg-muted rounded-md transition-colors"
                  >
                    <div>
                      <p className="font-medium truncate max-w-[250px]">
                        {flagged.questions.text}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {flagged.questions.serial_number} •{" "}
                        {flagged.questions.difficulty}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/flagged-questions`}>Review</Link>
                    </Button>
                  </li>        
                ))}
              </ul>
            </div>
              
            ) : (
              <div className="text-center p-6 pb-20">
                <p className="text-muted-foreground">
                  No flagged questions yet. Flag important questions during
                  study to review them later.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="absolute bottom-0 left-0 right-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/flagged-questions">
                {stats.flaggedQuestionsCount > 5
                  ? "View All Flagged Questions"
                  : "View Flagged Questions"}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
