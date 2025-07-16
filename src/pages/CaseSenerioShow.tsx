import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Case } from '@/types/case-study';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CaseSenerioShow = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      if (!caseId) return;
      
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .eq('id', caseId)
          .single();

        if (error) throw error;
        
        // Type assertion to ensure compatibility
        setCaseData(data as Case);
      } catch (error) {
        console.error('Error fetching case:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [caseId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!caseData) {
    return <p>Case not found.</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-3xl mx-auto shadow-md rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">{caseData.title}</CardTitle>
          <Link to={`/case-study-exams`}>
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exams
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <h3 className="text-lg font-semibold">Scenario</h3>
            <p className="text-gray-700">{caseData.scenario}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Instructions</h3>
            <p className="text-gray-700">{caseData.instructions || 'No instructions provided.'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseSenerioShow;
