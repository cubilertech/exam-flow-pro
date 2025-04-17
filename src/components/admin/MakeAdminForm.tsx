
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const adminFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export const MakeAdminForm = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: AdminFormValues) => {
    try {
      setLoading(true);
      
      // First, find the user ID by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .single();
      
      if (userError) {
        toast.error(`User not found: ${data.email}`);
        setLoading(false);
        return;
      }
      
      // Insert the user into admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({ user_id: userData.id });
      
      if (adminError) {
        if (adminError.code === "23505") { // Unique violation
          toast.error("This user is already an admin");
        } else {
          toast.error(`Error making user admin: ${adminError.message}`);
        }
        setLoading(false);
        return;
      }
      
      toast.success(`User ${data.email} has been made an admin`);
      form.reset();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Make User Admin</CardTitle>
        <CardDescription>
          Grant admin privileges to an existing user
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the email of an existing user you want to make an admin
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Make Admin"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
