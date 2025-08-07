
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
});

interface Category {
  id: string;
  name: string;
}

interface QuestionBankModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuestionBankModal({ open, onOpenChange, onSuccess }: QuestionBankModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.some(cat => cat.name === newCategory.trim())) {
      setCategories([...categories, { id: crypto.randomUUID(), name: newCategory.trim() }]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Insert the question bank
      const { data: bankData, error: bankError } = await supabase
        .from("question_banks")
        .insert({
          name: values.name,
          description: values.description || null,
        })
        .select()
        .single();

      if (bankError) throw bankError;

      // Insert all categories
      if (categories.length > 0) {
        const categoriesToInsert = categories.map(cat => ({
          name: cat.name,
          question_bank_id: bankData.id,
        }));

        const { error: categoriesError } = await supabase
          .from("categories")
          .insert(categoriesToInsert);

        if (categoriesError) throw categoriesError;
      }

      toast({
        title: "Success",
        description: "Question bank created successfully",
      });
      
      form.reset();
      setCategories([]);
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error) {
  const err = error as Error;
  toast({
    title: "Error",
    description: err.message || "Something went wrong",
    variant: "destructive",
  });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Question Bank</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter question bank name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description (optional)" 
                      className="resize-none" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Categories</FormLabel>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Add category" 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)} 
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((category) => (
                  <Badge key={category.id} variant="secondary" className="flex items-center space-x-1">
                    <span>{category.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category.id)}
                      className="ml-1 text-muted-foreground rounded-full hover:bg-muted h-4 w-4 inline-flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </Badge>
                ))}
                {categories.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No categories added yet. Add at least one category.
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button 
              className="mt-2 md:mt-0"
                variant="outline" 
                type="button" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || categories.length === 0}
              >
                {isSubmitting ? "Creating..." : "Create Question Bank"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
