
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ExamsTable } from '@/components/exams/student/ExamsTable';

const CaseStudyExams = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Case Study Exams</h1>
          <p className="text-muted-foreground mt-2">
            Access your subscribed case-based examinations with interactive scenarios and sequential questions.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Available Case Study Exams
            </CardTitle>
            <CardDescription>
              Select an exam to explore subjects and interactive case studies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExamsTable filterStatus="all" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CaseStudyExams;
