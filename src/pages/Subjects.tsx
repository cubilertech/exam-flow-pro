
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useCases } from '@/hooks/useCases';
import { supabase } from '@/integrations/supabase/client';

const Subjects = () => {
  const { examId } = useParams();
  const { subjects, loading, fetchSubjects } = useCases();
  const [examData, setExamData] = useState<any>(null);
  const [caseCounts, setCaseCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (examId) {
      fetchExamData();
      fetchSubjects(examId);
    }
  }, [examId]);

  useEffect(() => {
    if (subjects.length > 0) {
      fetchCaseCounts();
    }
  }, [subjects]);

  const fetchExamData = async () => {
    if (!examId) return;
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (error) throw error;
      setExamData(data);
    } catch (error) {
      console.error('Error fetching exam:', error);
    }
  };

  const fetchCaseCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('subject_id')
        .in('subject_id', subjects.map(s => s.id));

      if (error) throw error;
      
      const counts = data?.reduce((acc, caseItem) => {
        acc[caseItem.subject_id] = (acc[caseItem.subject_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      setCaseCounts(counts);
    } catch (error) {
      console.error('Error fetching case counts:', error);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading subjects...</div>
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
          {examData?.title || 'Subjects'}
        </h1>
        {examData?.description && (
          <p className="text-muted-foreground mt-2">{examData.description}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          const caseCount = caseCounts[subject.id] || 0;
          
          return (
            <Card key={subject.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {subject.name}
                </CardTitle>
                <CardDescription>
                  {subject.description || 'Explore cases in this subject'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {caseCount} {caseCount === 1 ? 'Case' : 'Cases'}
                  </Badge>
                  <Link to={`/subjects/${examId}/${subject.id}/cases`}>
                    <Button size="sm">
                      View Cases
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No subjects available for this exam.</p>
        </div>
      )}
    </div>
  );
};

export default Subjects;
