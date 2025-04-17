
import { useAppSelector } from "@/lib/hooks";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, TestTube, BarChart, Flag, BookMarked } from "lucide-react";

export const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { exams } = useAppSelector((state) => state.questions);
  const { flaggedQuestions, testResults } = useAppSelector((state) => state.study);
  
  return (
    <div className="container max-w-7xl mx-auto py-10 px-4 md:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username}!</h1>
        <p className="text-muted-foreground">
          Track your progress and continue your exam preparation
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <CardHeader>
            <CardTitle>Study Mode</CardTitle>
            <CardDescription>Browse and learn at your own pace</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{exams.length}</p>
            <p className="text-sm text-muted-foreground">Available exams</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/study">Start Studying</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-lg bg-examSecondary/10 flex items-center justify-center">
            <TestTube className="h-8 w-8 text-examSecondary" />
          </div>
          <CardHeader>
            <CardTitle>Test Mode</CardTitle>
            <CardDescription>Challenge yourself with custom tests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{testResults.length}</p>
            <p className="text-sm text-muted-foreground">Tests completed</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link to="/test">Take a Test</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-lg bg-examInfo/10 flex items-center justify-center">
            <BarChart className="h-8 w-8 text-examInfo" />
          </div>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Track your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {testResults.length > 0
                ? `${Math.round(
                    (testResults.reduce(
                      (acc, result) => acc + result.score,
                      0
                    ) /
                      testResults.length) *
                      100
                  )}%`
                : "N/A"}
            </p>
            <p className="text-sm text-muted-foreground">Average score</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link to="/analytics">View Analytics</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Exams</CardTitle>
              <BookMarked className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {exams.length > 0 ? (
              <ul className="space-y-2">
                {exams.slice(0, 5).map((exam) => (
                  <li
                    key={exam.id}
                    className="flex justify-between items-center p-3 hover:bg-muted rounded-md transition-colors"
                  >
                    <div>
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {exam.categoryCount} categories
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/study?exam=${exam.id}`}>Study</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center p-6">
                <p className="text-muted-foreground">No exams available yet</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/study">View All Exams</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Flagged Questions</CardTitle>
              <Flag className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            {flaggedQuestions.length > 0 ? (
              <ul className="space-y-2">
                {flaggedQuestions.slice(0, 5).map((flagged) => {
                  const question = mockQuestions.find(
                    (q) => q.id === flagged.questionId
                  );
                  return question ? (
                    <li
                      key={flagged.questionId}
                      className="flex justify-between items-center p-3 hover:bg-muted rounded-md transition-colors"
                    >
                      <div>
                        <p className="font-medium truncate max-w-[250px]">
                          {question.text}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Question #{question.serialNumber}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/study?question=${question.id}`}>Review</Link>
                      </Button>
                    </li>
                  ) : null;
                })}
              </ul>
            ) : (
              <div className="text-center p-6">
                <p className="text-muted-foreground">
                  No flagged questions yet. Flag important questions during study
                  to review them later.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/study?flagged=true">View All Flagged</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
