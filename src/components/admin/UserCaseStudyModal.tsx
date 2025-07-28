
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface CaseStudyExam {
  id: string;
  title: string;
  description: string | null;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
}

interface UserCaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdated: () => void;
}

export const UserCaseStudyModal = ({
  isOpen,
  onClose,
  user,
  onUpdated,
}: UserCaseStudyModalProps) => {
  const [caseStudyExams, setCaseStudyExams] = useState<CaseStudyExam[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      fetchData();
    }
  }, [isOpen, user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Fetch all case study exams
      const { data: examData, error: examError } = await supabase
        .from('exams_case')
        .select('id, title, description')
        .eq('is_deleted_exam', false)
        .order('title');

      if (examError) throw examError;

      // Fetch user's current case study subscriptions
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('exams_case_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .not('exams_case_id', 'is', null);

      if (subError) throw subError;

      setCaseStudyExams(examData || []);
      setUserSubscriptions(
        subData?.map((sub: any) => sub.exams_case_id).filter(Boolean) || []
      );
    } catch (error: any) {
      console.error('Error fetching data:', error.message || error);
      toast({
        title: 'Error',
        description: 'Failed to load case study exams',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionChange = (examId: string, checked: boolean) => {
    setUserSubscriptions((prev) =>
      checked ? [...prev, examId] : prev.filter((id) => id !== examId)
    );
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Get current case study subscriptions
      const { data: currentSubs, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('exams_case_id')
        .eq('user_id', user.id)
        .not('exams_case_id', 'is', null);

      if (fetchError) throw fetchError;

      const currentSubIds = 
        currentSubs?.map((sub: any) => sub.exams_case_id).filter(Boolean) || [];

      const toAdd = userSubscriptions.filter((id) => !currentSubIds.includes(id));
      const toRemove = currentSubIds.filter((id) => !userSubscriptions.includes(id));

      // Add new subscriptions
      if (toAdd.length > 0) {
        const subscriptionsToInsert = toAdd.map((examId) => ({
          user_id: user.id,
          exams_case_id: examId,
          is_active: true,
        }));

        for (const subscription of subscriptionsToInsert) {
          const { error: insertError } = await supabase
            .from('user_subscriptions')
            .insert(subscription);

          if (insertError) throw insertError;
        }
      }

      // Remove unselected subscriptions
      if (toRemove.length > 0) {
        // Use a simpler approach to avoid type inference issues
        for (const examId of toRemove) {
          const { error: removeError } = await supabase
            .from('user_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('exams_case_id', examId);

          if (removeError) throw removeError;
        }
      }

      toast({
        title: 'Success',
        description: 'Case study access updated successfully',
      });

      onUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating subscriptions:', error.message || error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update case study access',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Case Study Access</DialogTitle>
          <DialogDescription>
            Assign or revoke case study exam access for <strong>{user.username}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Case Study Exams</CardTitle>
            <CardDescription>
              Select which case study exams this user should have access to.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {caseStudyExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg"
                    >
                      <Checkbox
                        id={exam.id}
                        checked={userSubscriptions.includes(exam.id)}
                        onCheckedChange={(checked) =>
                          handleSubscriptionChange(exam.id, checked as boolean)
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={exam.id} className="text-sm font-medium cursor-pointer">
                          {exam.title}
                        </Label>
                        {exam.description && (
                          <p className="text-sm text-muted-foreground mt-1">{exam.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {caseStudyExams.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No case study exams available
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {userSubscriptions.length} of {caseStudyExams.length} selected
          </span>
          <Badge variant="outline">{user.username}</Badge>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
