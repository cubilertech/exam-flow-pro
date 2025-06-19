
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Users } from "lucide-react";
import { useQuestionBankSubscriptions } from "@/hooks/useQuestionBankSubscriptions";
import { supabase } from "@/integrations/supabase/client";

interface Exam {
  id: string;
  title: string;
  description?: string;
  question_bank_id: string;
}

export const ExamsTable = () => {
  const { subscriptions } = useQuestionBankSubscriptions();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (subscriptions.length > 0) {
      fetchSubscribedExams();
    }
  }, [subscriptions]);

  useEffect(() => {
    if (exams.length > 0) {
      fetchSubjectCounts();
    }
  }, [exams]);

  const fetchSubscribedExams = async () => {
    try {
      const questionBankIds = subscriptions.map(sub => sub.question_bank_id);
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .in('question_bank_id', questionBank_ids);

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching subscribed exams:', error);
    }
  };

  const fetchSubjectCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('exam_id')
        .in('exam_id', exams.map(e => e.id));

      if (error) throw error;
      
      const counts = data?.reduce((acc, subject) => {
        acc[subject.exam_id] = (acc[subject.exam_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      setSubjectCounts(counts);
    } catch (error) {
      console.error('Error fetching subject counts:', error);
    }
  };

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Subscriptions</h3>
          <p className="text-muted-foreground text-center mb-4">
            You don't have any active exam subscriptions. Contact your administrator to get access to exam content.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => {
          const subjectCount = subjectCounts[exam.id] || 0;
          
          return (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {exam.title}
                </CardTitle>
                {exam.description && (
                  <p className="text-sm text-muted-foreground">{exam.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {subjectCount} {subjectCount === 1 ? 'Subject' : 'Subjects'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/subjects/${exam.id}`}>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        Cases
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
