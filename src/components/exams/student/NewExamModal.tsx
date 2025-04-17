
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Info } from "lucide-react";
import { fetchCategoriesStart, fetchCategoriesSuccess, fetchCategoriesFailure } from '@/features/questions/questionsSlice';
import { startTest } from '@/features/study/studySlice';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/features/questions/questionsSlice';

// Define form schema
const formSchema = z.object({
  examType: z.enum(["test", "study"]),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  difficultyLevels: z.array(z.enum(["all", "easy", "medium", "hard"])).min(1, "Select at least one difficulty level"),
  numberOfQuestions: z.string().transform(val => parseInt(val, 10))
    .refine(val => !isNaN(val) && val > 0 && val <= 30, "Enter a number between 1 and 30"),
  timedMode: z.enum(["timed", "untimed"]),
  examName: z.string().min(3, "Exam name must be at least 3 characters"),
});

type NewExamFormValues = z.infer<typeof formSchema>;

interface NewExamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewExamModal: React.FC<NewExamModalProps> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { categories } = useAppSelector((state) => state.questions);
  
  const form = useForm<NewExamFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examType: "test",
      categories: [],
      difficultyLevels: ["all"],
      numberOfQuestions: "10", // String to match the input type
      timedMode: "untimed",
      examName: "",
    },
  });

  // Fetch categories when modal opens
  useEffect(() => {
    if (open && categories.length === 0) {
      const fetchCategories = async () => {
        try {
          dispatch(fetchCategoriesStart());
          const { data, error } = await supabase
            .from('categories')
            .select('*');
            
          if (error) throw error;
          
          // Transform the data to match Category type
          const transformedCategories = data.map(cat => ({
            id: cat.id,
            name: cat.name,
            questionBankId: cat.question_bank_id || undefined,
            questionCount: 0 // Provide a default value
          }));
          
          dispatch(fetchCategoriesSuccess(transformedCategories));
        } catch (error) {
          console.error('Error fetching categories:', error);
          dispatch(fetchCategoriesFailure((error as Error).message));
        }
      };
      
      fetchCategories();
    }
  }, [open, categories.length, dispatch]);

  const handleStartExam = async (values: NewExamFormValues) => {
    console.log("Starting exam with values:", values);
    
    try {
      // Fetch questions based on selected filters
      let query = supabase
        .from('questions')
        .select('*')
        .in('category_id', values.categories);

      // Apply difficulty filter if not "all"
      if (!values.difficultyLevels.includes("all")) {
        // Use only valid difficulty levels for the query
        const validDifficulties = values.difficultyLevels.filter(d => d !== "all") as ("easy" | "medium" | "hard")[];
        if (validDifficulties.length > 0) {
          query = query.in('difficulty', validDifficulties);
        }
      }
      
      // Limit to requested number of questions
      const { data: questionsData, error } = await query.limit(values.numberOfQuestions);
      
      if (error) throw error;
      
      if (!questionsData || questionsData.length === 0) {
        // Show a message that no questions match criteria
        console.error("No questions match your criteria");
        return;
      }
      
      // Transform the data to match Question type
      const questions: Question[] = questionsData.map(q => ({
        id: q.id,
        serialNumber: parseInt(q.serial_number.replace(/\D/g, '')), // Extract number from serial
        text: q.text,
        options: [], // Will be populated later if needed
        explanation: q.explanation || "",
        imageUrl: q.image_url || undefined,
        categoryId: q.category_id || "",
        tags: [], // Default empty array
        difficulty: q.difficulty || "medium",
        correctAnswerRate: q.answered_correctly_count && q.answered_count ? 
          (q.answered_correctly_count / q.answered_count) * 100 : undefined
      }));
      
      // Start the test with the fetched questions
      dispatch(startTest(questions));
      
      // Close the modal
      onOpenChange(false);
      
      // Navigate to the exam page
      navigate('/exam/take');
      
    } catch (error) {
      console.error("Error starting exam:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a New Exam</DialogTitle>
          <DialogDescription>
            Customize your exam settings below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleStartExam)} className="space-y-6">
            <FormField
              control={form.control}
              name="examType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Exam Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="test" id="test" />
                        </FormControl>
                        <FormLabel htmlFor="test" className="font-normal">
                          Test
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="study" id="study" />
                        </FormControl>
                        <FormLabel htmlFor="study" className="font-normal flex items-center">
                          Study
                          <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                          <span className="sr-only">Final response to a question used to determine score</span>
                        </FormLabel>
                        <FormDescription className="text-xs mt-0">
                          Final response to a question used to determine score
                        </FormDescription>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categories"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Categories</FormLabel>
                    <FormDescription>
                      Select the categories you want to include in your exam.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <FormField
                        key={category.id}
                        control={form.control}
                        name="categories"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={category.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, category.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== category.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {category.name} ({category.questionCount || 0})
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficultyLevels"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Difficulty Level</FormLabel>
                    <FormDescription>
                      Select the difficulty levels to include in your exam.
                    </FormDescription>
                  </div>
                  <div className="flex gap-4">
                    {[
                      { id: "all", label: "All" },
                      { id: "easy", label: "Easy" },
                      { id: "medium", label: "Medium" },
                      { id: "hard", label: "Hard" },
                    ].map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="difficultyLevels"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id as any)}
                                  onCheckedChange={(checked) => {
                                    if (item.id === "all" && checked) {
                                      // If "All" is checked, uncheck others
                                      return field.onChange(["all"]);
                                    } else if (checked) {
                                      // If any other is checked, uncheck "All"
                                      const newValue = field.value.filter(v => v !== "all");
                                      return field.onChange([...newValue, item.id as any]);
                                    } else {
                                      return field.onChange(
                                        field.value?.filter((value) => value !== item.id)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numberOfQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Questions (max 30)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      min={1} 
                      max={30} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timedMode"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Timed Mode</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="untimed" id="untimed" />
                        </FormControl>
                        <FormLabel htmlFor="untimed" className="font-normal">
                          Untimed
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="timed" id="timed" />
                        </FormControl>
                        <FormLabel htmlFor="timed" className="font-normal">
                          Timed
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="examName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a name for your exam" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Start Exam</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewExamModal;
