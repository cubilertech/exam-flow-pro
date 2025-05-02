import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Question } from '@/features/questions/questionsSlice';
import {
  setCurrentExam,
  startTest,
} from '@/features/study/studySlice';
import {
  useQuestionBankSubscriptions,
} from '@/hooks/useQuestionBankSubscriptions';
import { supabase } from '@/integrations/supabase/client';
import {
  useAppDispatch,
  useAppSelector,
} from '@/lib/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

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

interface CategoryCount {
  id: string;
  name: string;
  questionBankId: string;
  questionCount: number;
  difficultyCount: {
    easy: number;
    medium: number;
    hard: number;
  };
}

const NewExamModal: React.FC<NewExamModalProps> = ({ open, onOpenChange }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { subscriptions,activeQuestionBankId } = useQuestionBankSubscriptions();
  const { user } = useAppSelector((state) => state.auth);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedQuestionBank, setSelectedQuestionBank] = useState<string | null>(null);

  const form = useForm<NewExamFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examType: "test",
      categories: [],
      difficultyLevels: ["all"],
      numberOfQuestions: 1,
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
  
  const initialSelectedBank = useMemo(() => {
    if (subscriptions.length === 0) return null;
    
    return activeQuestionBankId 
      ? subscriptions.find(qb => qb.id === activeQuestionBankId)?.id || subscriptions[0].id
      : subscriptions[0].id;
  }, [subscriptions, activeQuestionBankId]);
  
  useEffect(() => {
    if (open && initialSelectedBank) {
      setSelectedQuestionBank(initialSelectedBank);
      fetchCategoriesByQuestionBank(initialSelectedBank);
    }
  }, [open, initialSelectedBank]);

  const fetchCategoriesByQuestionBank = async (questionBankId: string) => {
    try {
      setLoading(true);
      
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('question_bank_id', questionBankId);
        
      if (categoriesError) throw categoriesError;
      
      const categoriesWithCounts = await Promise.all(categoriesData.map(async (category) => {
        // First, query for all questions for this category
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('id, difficulty')
          .eq('category_id', category.id);
        
        if (questionsError) throw questionsError;
        
        // Count the occurrences of each difficulty level manually
        const difficultyCount = {
          easy: 0,
          medium: 0,
          hard: 0
        };
        
        questions?.forEach((question) => {
          if (question.difficulty in difficultyCount) {
            difficultyCount[question.difficulty as keyof typeof difficultyCount]++;
          }
        });
        
        return {
          id: category.id,
          name: category.name,
          questionBankId: category.question_bank_id,
          questionCount: questions?.length || 0,
          difficultyCount
        };
      }));
      
      setCategories(categoriesWithCounts);
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
      const totalSeconds = (values.minutes || 0) * 60 + (values.seconds || 0);
      return totalSeconds > 0 ? totalSeconds : 60;
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
      
      const questionBankId = selectedQuestionBank || subscriptions[0].id;
      
      const timeLimit = calculateTimeLimit(values);
      
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
      dispatch(startTest({
        questions,
        examId: examData.id,
        examName: values.examName,
      }));
      const isTimed = values.timedMode === "untimed" ? false : true
       dispatch(setCurrentExam({
              id: examData.id,
              name: values.examName,
              categoryIds: values.categories,
              difficultyLevels: values.difficultyLevels,
              questionCount: values.numberOfQuestions,
              isTimed: isTimed,
              timeLimit: values.timeLimit,
              timeLimitType: values.timeLimitType,
              examType: values.examType // Add the missing examType property
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
  // Calculate Total Questions
  const selectedCategories = form.watch('categories') || [];
  const totalQuestions =  categories
  .filter(cat => selectedCategories.includes(cat.id))
  .reduce((total, cat) => total + cat.questionCount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[501px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create a New Exam</DialogTitle>
          <DialogDescription>
            Customize your exam settings below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 px-4">
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
                          <TooltipProvider >
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <button type="button" className="focus:outline-none">
                                  <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" align="center" className="max-w-[200px]">
                                <p>Final response to a question used to determine score</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                      </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {subscriptions.length > 0 && (
                <FormItem>
                  <FormLabel>Question Bank</FormLabel>
                  <Select
                    value={selectedQuestionBank || undefined}
                    onValueChange={(value) => {
                      setSelectedQuestionBank(value);
                      fetchCategoriesByQuestionBank(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a question bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptions.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}

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
                        No categories available for the selected question bank.
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
                                    {category.name} ({category.questionCount})
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
  render={() => {
    const selectedCategories = form.watch('categories') || []; // Track selected categories

    return (
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
          ].map((item) => {
            // Calculate questionCount based on SELECTED categories only
            const questionCount = item.id === "all"
              ? categories
                  .filter(cat => selectedCategories.includes(cat.id))
                  .reduce((total, cat) => total + cat.questionCount, 0)
              : categories
                  .filter(cat => selectedCategories.includes(cat.id))
                  .reduce(
                    (total, cat) => 
                      total + (cat.difficultyCount[item.id as keyof typeof cat.difficultyCount] || 0), 
                    0
                  );

            const isDisabled = item.id !== "all" && questionCount === 0;

            return (
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
                            } else if (checked && !isDisabled) {
                              const newValue = field.value.filter(v => v !== "all");
                              return field.onChange([...newValue, item.id as any]);
                            } else {
                              return field.onChange(
                                field.value?.filter((value) => value !== item.id)
                              );
                            }
                          }}
                          disabled={isDisabled}
                          className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                        />
                      </FormControl>
                      <FormLabel className={`font-normal ${isDisabled ? "opacity-50" : ""}`}>
                        {item.label} ({questionCount})
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            );
          })}
        </div>
        <FormMessage />
      </FormItem>
    );
  }}
/>

              <FormField
                control={form.control}
                name="numberOfQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions (max {totalQuestions})</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        min={1} 
                        max={totalQuestions} 
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NewExamModal;
