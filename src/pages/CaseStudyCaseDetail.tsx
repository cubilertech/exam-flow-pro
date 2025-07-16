import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CaseInfo, Question } from '@/types/case-study';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CaseStudyCaseDetail = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!caseId) return;
      
      try {
        // Fetch case data
        const { data: caseData, error: caseError } = await supabase
          .from('cases')
          .select('*')
          .eq('id', caseId)
          .single();

        if (caseError) throw caseError;
        
        // Add question_count by counting questions
        const { count } = await supabase
          .from('case_questions')
          .select('*', { count: 'exact', head: true })
          .eq('case_id', caseId);

        setCaseInfo({
          ...caseData,
          question_count: count || 0
        } as CaseInfo);

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('case_questions')
          .select('*')
          .eq('case_id', caseId)
          .order('order_index');

        if (questionsError) throw questionsError;
        
        setQuestions(questionsData as Question[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [caseId]);

  if (loading) {
    return <p>Loading case details...</p>;
  }

  if (!caseInfo) {
    return <p>Case not found.</p>;
  }

  const handleCopyToClipboard = () => {
    const caseDetailUrl = `${window.location.origin}/case-study-cases/${caseId}`;
    navigator.clipboard.writeText(caseDetailUrl)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Case detail URL copied to clipboard.",
        })
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Error",
          description: "Failed to copy URL to clipboard.",
          variant: "destructive",
        })
      });
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="modern-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{caseInfo.title}</CardTitle>
              <CardDescription>Explore the details of this case.</CardDescription>
            </div>
            <div className="space-x-2">
              <Button variant="secondary" size="sm" onClick={handleCopyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Link to={`/case-study-cases/edit/${caseId}`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Case
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Scenario</h3>
            <p>{caseInfo.scenario}</p>
          </div>
          {caseInfo.instructions && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Instructions</h3>
              <p>{caseInfo.instructions}</p>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">Questions</h3>
            {questions.length > 0 ? (
              <ul className="list-disc pl-5">
                {questions.map((question) => (
                  <li key={question.id} className="mb-2">
                    {question.question_text}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No questions available for this case.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseStudyCaseDetail;
