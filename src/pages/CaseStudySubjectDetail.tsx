import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SubjectInfo } from '@/types/case-study';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const CaseStudySubjectDetail = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [subjectInfo, setSubjectInfo] = useState<SubjectInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubject = async () => {
      if (!subjectId) return;
      
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('id', subjectId)
          .single();

        if (error) throw error;
        
        setSubjectInfo(data as SubjectInfo);
      } catch (error) {
        console.error('Error fetching subject:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [subjectId]);

  if (loading) {
    return <div>Loading subject details...</div>;
  }

  if (!subjectInfo) {
    return <div>Subject not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">{subjectInfo.name}</CardTitle>
              <CardDescription>{subjectInfo.description || 'No description provided.'}</CardDescription>
            </div>
            <Link to={`/case-study-exams/${subjectInfo.exams_case_id}/subjects/${subjectId}/cases/create`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Case
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <p>Subject ID: {subjectInfo.id}</p>
          <p>Exam Case ID: {subjectInfo.exams_case_id}</p>
          <p>Order Index: {subjectInfo.order_index}</p>
          <p>Is Deleted: {subjectInfo.is_deleted_subject ? 'Yes' : 'No'}</p>
          <p>Created At: {subjectInfo.created_at}</p>
          <p>Updated At: {subjectInfo.updated_at}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseStudySubjectDetail;
