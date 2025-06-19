
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, CheckCircle } from 'lucide-react';
import { useCases } from '@/hooks/useCases';
import { useAppSelector } from '@/lib/hooks';
import { supabase } from '@/integrations/supabase/client';

const Cases = () => {
  const { examId, subjectId } = useParams();
  const { user } = useAppSelector((state) => state.auth);
  const { subjects, cases, loading, fetchSubjects, fetchCases } = useCases();
  const [caseProgress, setCaseProgress] = useState<Record<string, any>>({});
  const [currentSubject, setCurrentSubject] = useState<any>(null);

  useEffect(() => {
    if (examId) {
      fetchSubjects(examId);
    }
  }, [examId]);

  useEffect(() => {
    if (subjectId) {
      fetchCases(subjectId);
      const subject = subjects.find(s => s.id === subjectId);
      setCurrentSubject(subject);
    }
  }, [subjectId, subjects]);

  useEffect(() => {
    if (cases.length > 0 && user) {
      fetchCaseProgress();
    }
  }, [cases, user]);

  const fetchCaseProgress = async () => {
    if (!user || cases.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from('user_case_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('case_id', cases.map(c => c.id));

      if (error) throw error;
      
      const progressMap = data?.reduce((acc, progress) => {
        acc[progress.case_id] = progress;
        return acc;
      }, {} as Record<string, any>) || {};
      
      setCaseProgress(progressMap);
    } catch (error) {
      console.error('Error fetching case progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading cases...</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link to="/my-exams" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Exams
        </Link>
        <h1 className="text-3xl font-bold">
          {currentSubject?.name || 'Cases'}
        </h1>
        {currentSubject?.description && (
          <p className="text-muted-foreground mt-2">{currentSubject.description}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((caseItem) => {
          const progress = caseProgress[caseItem.id];
          const isCompleted = progress?.completed;
          const isStarted = progress && progress.current_question_index > 0;
          
          return (
            <Card key={caseItem.id} className="relative">
              {isCompleted && (
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {caseItem.scenario}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {isStarted && !isCompleted && (
                      <span>Progress: Question {(progress?.current_question_index || 0) + 1}</span>
                    )}
                    {!isStarted && (
                      <span>Not started</span>
                    )}
                  </div>
                  <Link to={`/cases/${caseItem.id}`}>
                    <Button size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      {isStarted ? 'Continue' : 'Start'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {cases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No cases available for this subject.</p>
        </div>
      )}
    </div>
  );
};

export default Cases;
