
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuestionBankSubscriptions } from '@/hooks/useQuestionBankSubscriptions';
import { toast } from "sonner";

const formSchema = z.object({
  examType: z.enum(["test", "study"]),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  difficultyLevels: z.array(z.enum(["all", "easy", "medium", "hard"])).min(1, "Select at least one difficulty level"),
  numberOfQuestions: z.number()
    .int()
    .min(1, "At least 1 question")
    .max(30, "Maximum 30 questions"),
  timedMode: z.enum(["timed", "untimed"]),
  timeLimit: z.number().int().min(0).optional(),
  timeLimitType: z.enum(["total_time", "seconds_per_question"]).optional(),
  examName: z.string().min(3, "Exam name must be at least 3 characters"),
  minutes: z.number().int().min(0).max(180).optional(),
  seconds: z.number().int().min(0).max(59).optional(),
});

type NewExamFormValues = z.infer<typeof formSchema>;

interface NewExamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewExamModal: React.FC<NewExamModalProps> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { subscriptions } = useQuestionBankSubscriptions();
  const { user } = useAppSelector((state) => state.auth);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<NewExamFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examType: "test",
      categories: [],
      difficultyLevels: ["all"],
      numberOfQuestions: 10,
      timedMode: "untimed",
      timeLimitType: "seconds_per_question",
      timeLimit: 60,
      minutes: 0,
      seconds: 0,
      examName: "",
    },
  });
  
  const timedMode = form.watch("timedMode");
  const timeLimitType = form.watch("timeLimitType");
  
  // Auto-select the first subscription when opening the modal
  useEffect(() => {
    if (open && subscriptions.length > 0) {
      fetchCategoriesByQuestionBank(subscriptions[0].question_bank_id);
    }
  }, [open, subscriptions]);

  const fetchCategoriesByQuestionBank = async (questionBankId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('question_bank_id', questionBankId);
        
      if (error) throw error;
      
      const transformedCategories = data.map(cat => ({
        id: cat.id,
        name: cat.name,
        questionBankId: cat.question_bank_id || undefined,
        questionCount: 0
      }));
      
      setCategories(transformedCategories);
      
      form.setValue("categories", []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeLimit = (values: NewExamFormValues) => {
    if (values.timedMode === "untimed") {
      return null;
    }
    
    if (values.timeLimitType === "seconds_per_question") {
      return values.timeLimit;
    } else {
      // Convert total time (minutes and seconds) to seconds
      const totalSeconds = (values.minutes || 0) * 60 + (values.seconds || 0);
      return totalSeconds > 0 ? totalSeconds : 60; // Default to 60 seconds if no time specified
    }
  };

  const handleStartExam = async (values: NewExamFormValues) => {
    if (!user?.id) {
      toast.error('You must be logged in to create an exam');
      return;
    }
    
    if (subscriptions.length === 0) {
      toast.error('You need to have at least one question bank subscription');
      return;
    }

    try {
      setIsSaving(true);
      
      // Get the first subscription's question bank ID
      const questionBankId = subscriptions[0].question_bank_id;
      
      // Calculate the time limit based on the time mode and type
      const timeLimit = calculateTimeLimit(values);
      
      // 1. First save the exam to the database
      const { data: examData, error: examError } = await supabase
        .from('user_exams')
        .insert({
          user_id: user.id,
          name: values.examName,
          exam_type: values.examType,
          question_bank_id: questionBankId,
          category_ids: values.categories,
          difficulty_levels: values.difficultyLevels.filter(d => d !== "all") as string[],
          question_count: values.numberOfQuestions,
          is_timed: values.timedMode === "timed",
          time_limit: timeLimit,
          time_limit_type: values.timedMode === "timed" ? values.timeLimitType : null,
          completed: false
        })
        .select()
        .single();
      
      if (examError) throw examError;
      
      // 2. Fetch questions based on criteria
      let query = supabase
        .from('questions')
        .select('*, question_options(*)')
        .in('category_id', values.categories);

      if (!values.difficultyLevels.includes("all")) {
        const validDifficulties = values.difficultyLevels.filter(d => d !== "all") as ("easy" | "medium" | "hard")[];
        if (validDifficulties.length > 0) {
          query = query.in('difficulty', validDifficulties);
        }
      }
      
      const { data: questionsData, error: questionsError } = await query.limit(values.numberOfQuestions);
      
      if (questionsError) throw questionsError;
      
      if (!questionsData || questionsData.length === 0) {
        toast.error("No questions match your criteria");
        return;
      }
      
      // 3. Format the questions for the state
      const questions: Question[] = questionsData.map(q => ({
        id: q.id,
        serialNumber: parseInt(q.serial_number.replace(/\D/g, '')),
        text: q.text,
        options: q.question_options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.is_correct
        })),
        explanation: q.explanation || "",
        imageUrl: q.image_url || undefined,
        categoryId: q.category_id || "",
        tags: [],
        difficulty: q.difficulty || "medium",
        correctAnswerRate: q.answered_correctly_count && q.answered_count ? 
          (q.answered_correctly_count / q.answered_count) * 100 : undefined
      }));
      
      // 4. Start the exam
      dispatch(startTest({
        questions,
        examId: examData.id, // Store the exam ID in the state
        examName: values.examName
      }));
      
      onOpenChange(false);
      navigate('/exam/take');
      
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Failed to start the exam. Please try again.");
    } finally {
      setIsSaving(false);
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
                  {loading ? (
                    <div className="p-4 text-center">Loading categories...</div>
                  ) : categories.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No categories available. Please contact your administrator.
                    </div>
                  ) : (
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
                  )}
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
                                      return field.onChange(["all"]);
                                    } else if (checked) {
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
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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

            {timedMode === "timed" && (
              <>
                <FormField
                  control={form.control}
                  name="timeLimitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Limit Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time limit type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="seconds_per_question">Seconds per question</SelectItem>
                          <SelectItem value="total_time">Total time</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {timeLimitType === "seconds_per_question" && (
                  <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seconds per question</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            min={5} 
                            placeholder="60"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Time allowed for each question in seconds
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {timeLimitType === "total_time" && (
                  <div className="flex space-x-4">
                    <FormField
                      control={form.control}
                      name="minutes"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Minutes</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              min={0}
                              max={180}
                              placeholder="0"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seconds"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Seconds</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              min={0}
                              max={59}
                              placeholder="0"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </>
            )}

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
              <Button 
                type="submit" 
                disabled={form.getValues().categories.length === 0 || isSaving}
              >
                {isSaving ? "Creating..." : "Start Exam"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewExamModal;
