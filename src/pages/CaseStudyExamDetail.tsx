import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CaseStudyExamInfo } from '@/types/case-study';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CaseStudyExamDetail = () => {
  const { examId } = useParams<{ examId: string }>();
  const [examInfo, setExamInfo] = useState<CaseStudyExamInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) return;
      
      try {
        const { data, error } = await supabase
          .from('exams_case')
          .select('*')
          .eq('id', examId)
          .single();

        if (error) throw error;
        
        setExamInfo({
          ...data,
          order_index: data.order_index || 0
        } as CaseStudyExamInfo);
      } catch (error) {
        console.error('Error fetching exam:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  if (loading) {
    return <div>Loading exam details...</div>;
  }

  if (!examInfo) {
    return <div>Exam not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{examInfo.title}</CardTitle>
          <CardDescription>{examInfo.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Exam ID: {examInfo.id}</p>
          <p>Created At: {examInfo.created_at}</p>
          <Link to={`/case-study-exams/${examId}/subjects`}>
            <Button>View Subjects</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseStudyExamDetail;
