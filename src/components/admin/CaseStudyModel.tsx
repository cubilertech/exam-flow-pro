// UserCaseStudyAccessModal.tsx
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

interface UserCaseStudyAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile | null;
    onUpdated: () => void;
}

export const UserCaseStudyAccessModal = ({
    isOpen,
    onClose,
    user,
    onUpdated,
}: UserCaseStudyAccessModalProps) => {
    const [exams, setExams] = useState<CaseStudyExam[]>([]);
    const [userExamIds, setUserExamIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen && user) fetchData();
    }, [isOpen, user]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data: examsData, error: examsError } = await supabase
                .from('exams_case')
                .select('id, title, description')
                .eq('is_deleted_exam', false)
                .order('created_at', { ascending: false });

            if (examsError) throw examsError;

            const { data: subsData, error: subsError } = await supabase
                .from('user_subscriptions')
                .select('case_id')
                .eq('user_id', user.id)
                .eq('is_active', true);

            if (subsError) throw subsError;

            setExams(examsData || []);
            setUserExamIds(subsData?.map((s) => s.case_id) || []);
        } catch (error: any) {
            console.error('Fetch error:', error.message || error);
            toast({
                title: 'Error',
                description: 'Failed to load case study exams',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (examId: string, checked: boolean) => {
        setUserExamIds((prev) =>
            checked ? [...prev, examId] : prev.filter((id) => id !== examId)
        );
    };

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        try {
            const { data: currentSubs, error: fetchError } = await supabase
                .from('user_subscriptions')
                .select('case_id')
                .eq('user_id', user.id);

            if (fetchError) throw fetchError;

            const currentExamIds = currentSubs?.map((s) => s.case_id) || [];
            const toAdd = userExamIds.filter((id) => !currentExamIds.includes(id));
            const toRemove = currentExamIds.filter((id) => !userExamIds.includes(id));

            const { data: validExams, error: validError } = await supabase
                .from('exams_case')
                .select('id');

            if (validError) throw validError;

            const validIds = validExams?.map((e) => e.id) || [];
            const safeToAdd = toAdd.filter((id) => validIds.includes(id));

            if (safeToAdd.length > 0) {
                const { error: addError } = await supabase
                    .from('user_subscriptions')
                    .upsert(
                        safeToAdd.map((examId) => ({
                            user_id: user.id,
                            case_id: examId,
                            is_active: true,
                        })),
                        { onConflict: 'user_id,case_id' }
                    );
                if (addError) throw addError;
            }

            if (toRemove.length > 0) {
                const { error: removeError } = await supabase
                    .from('user_subscriptions')
                    .delete()
                    .eq('user_id', user.id)
                    .in('case_id', toRemove);
                if (removeError) throw removeError;
            }

            toast({
                title: 'Success',
                description: 'Case study access updated successfully',
            });

            onUpdated();
            onClose();
        } catch (error: any) {
            console.error('Save error:', error.message || error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to update access',
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
                        Assign or revoke case study exam access for{' '}
                        <strong>{user.username}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Available Exams</CardTitle>
                        <CardDescription>
                            Select which exams this user should have access to.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                            </div>
                        ) : (
                            <ScrollArea className="h-[300px] pr-4">
                                <div className="space-y-4">
                                    {exams.map((exam) => (
                                        <div
                                            key={exam.id}
                                            className="flex items-start space-x-3 p-3 border rounded-lg"
                                        >
                                            <Checkbox
                                                id={exam.id}
                                                checked={userExamIds.includes(exam.id)}
                                                onCheckedChange={(checked) =>
                                                    handleToggle(exam.id, checked as boolean)
                                                }
                                            />
                                            <div className="flex-1 min-w-0">
                                                <Label
                                                    htmlFor={exam.id}
                                                    className="text-sm font-medium cursor-pointer"
                                                >
                                                    {exam.title}
                                                </Label>
                                                {exam.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {exam.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {exams.length === 0 && (
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
                        {userExamIds.length} of {exams.length} selected
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
