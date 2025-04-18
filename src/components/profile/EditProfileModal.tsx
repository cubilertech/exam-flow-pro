
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { supabase } from "@/integrations/supabase/client";
import { updateProfileSuccess } from "@/features/auth/authSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EditProfileFormData {
  username: string;
  country: string;
  gender: string;
  phone: string;
  city: string;
}

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const { register, handleSubmit } = useForm<EditProfileFormData>({
    defaultValues: {
      username: user?.username || '',
      country: user?.country || '',
      gender: user?.gender || '',
      phone: user?.phone || '',
      city: user?.city || '',
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          country: data.country,
          gender: data.gender,
          phone_number: data.phone,
          city: data.city,
        })
        .eq('id', user.id);

      if (error) throw error;

      dispatch(updateProfileSuccess({
        username: data.username,
        country: data.country,
        gender: data.gender,
        phone: data.phone,
        city: data.city,
      }));

      toast.success('Profile updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register('username')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register('country')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input id="gender" {...register('gender')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
