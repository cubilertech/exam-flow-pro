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

interface QuestionBank {
  id: string;
  name: string;
  description: string | null;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
}

interface UserQuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdated: () => void;
}

export const UserQuestionBankModal = ({
  isOpen,
  onClose,
  user,
  onUpdated,
}: UserQuestionBankModalProps) => {
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
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

      const { data: qbData, error: qbError } = await supabase
        .from('question_banks')
        .select('*')
        .order('name');

      if (qbError) throw qbError;

      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('question_bank_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (subError) throw subError;

      setQuestionBanks(qbData || []);
      setUserSubscriptions(subData?.map((sub) => sub.question_bank_id) || []);
    } catch (error: any) {
      console.error('Error fetching data:', error.message || error);
      toast({
        title: 'Error',
        description: 'Failed to load question banks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionChange = (questionBankId: string, checked: boolean) => {
    setUserSubscriptions((prev) =>
      checked ? [...prev, questionBankId] : prev.filter((id) => id !== questionBankId)
    );
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { data: currentSubs, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('question_bank_id')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      const currentSubIds = currentSubs?.map((sub) => sub.question_bank_id) || [];

      const toAdd = userSubscriptions.filter((id) => !currentSubIds.includes(id));
      const toRemove = currentSubIds.filter((id) => !userSubscriptions.includes(id));

      if (toAdd.length > 0) {
        const { error: addError } = await supabase
          .from('user_subscriptions')
          .upsert(
            toAdd.map((questionBankId) => ({
              user_id: user.id,
              question_bank_id: questionBankId,
              is_active: true,
            })),
            {
              onConflict: 'user_id,question_bank_id',
            }
          );

        if (addError) throw addError;
      }

      // Remove unselected subscriptions
      if (toRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('user_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .in('question_bank_id', toRemove);

        if (removeError) throw removeError;
      }

      toast({
        title: 'Success',
        description: 'Question bank access updated successfully',
      });

      onUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating subscriptions:', error.message || error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update question bank access',
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
          <DialogTitle>Manage Question Bank Access</DialogTitle>
          <DialogDescription>
            Assign or revoke question bank access for <strong>{user.username}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Card className='transition-all duration-0'>
          <CardHeader>
            <CardTitle className="text-lg">Available Question Banks</CardTitle>
            <CardDescription>
              Select which question banks this user should have access to.
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
                  {questionBanks.map((qb) => (
                    <div
                      key={qb.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg"
                    >
                      <Checkbox
                        id={qb.id}
                        checked={userSubscriptions.includes(qb.id)}
                        onCheckedChange={(checked) =>
                          handleSubscriptionChange(qb.id, checked as boolean)
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={qb.id} className="text-sm font-medium cursor-pointer">
                          {qb.name}
                        </Label>
                        {qb.description && (
                          <p className="text-sm text-muted-foreground mt-1">{qb.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {questionBanks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No question banks available
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {userSubscriptions.length} of {questionBanks.length} selected
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
