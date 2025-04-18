import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, X, Upload, Image, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  serialNumber: string;
  text: string;
  options: Option[];
  explanation: string;
  imageUrl?: string;
  categoryId: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Category {
  id: string;
  name: string;
  questionBankId?: string;
}

interface QuestionFormProps {
  questionBankId: string;
  categoryId: string;
  initialData: Question | null;
  allCategories: Category[];
  onFormSubmitted: () => void;
}

export const QuestionForm = ({ 
  questionBankId,
  categoryId, 
  initialData, 
  allCategories, 
  onFormSubmitted 
}: QuestionFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Question>({
    id: initialData?.id || '',
    serialNumber: initialData?.serialNumber || '',
    text: initialData?.text || '',
    options: initialData?.options || [
      { id: uuidv4(), text: '', isCorrect: false },
      { id: uuidv4(), text: '', isCorrect: false },
      { id: uuidv4(), text: '', isCorrect: false },
      { id: uuidv4(), text: '', isCorrect: false }
    ],
    explanation: initialData?.explanation || '',
    imageUrl: initialData?.imageUrl || '',
    categoryId: initialData?.categoryId || categoryId,
    tags: initialData?.tags || [],
    difficulty: initialData?.difficulty || 'medium',
  });
  const [questionType, setQuestionType] = useState<'single' | 'multiple'>(
    initialData?.options.filter(o => o.isCorrect).length > 1 ? 'multiple' : 'single'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [validationErrors, setValidationErrors] = useState<{
    text?: string;
    categoryId?: string;
    options?: string;
    optionTexts?: string;
  }>({});

  useEffect(() => {
    if (questionBankId) {
      fetchCategories(questionBankId);
    }
  }, [questionBankId]);
  
  useEffect(() => {
    if (allCategories && allCategories.length > 0) {
      setCategories(allCategories);
    }
  }, [allCategories]);

  const fetchCategories = async (questionBankId: string) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("question_bank_id", questionBankId)
        .order("name");

      if (error) throw error;
      
      if (data) {
        setCategories(data.map(cat => ({
          id: cat.id,
          name: cat.name,
          questionBankId: cat.question_bank_id
        })));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      categoryId: value
    });
  };
  
  const handleOptionTextChange = (id: string, value: string) => {
    setFormData({
      ...formData,
      options: formData.options.map(option =>
        option.id === id ? { ...option, text: value } : option
      )
    });
  };

  const handleOptionCorrectChange = (id: string, checked: boolean) => {
    let newOptions = [...formData.options];
    
    if (questionType === 'single' && checked) {
      newOptions = newOptions.map(option => ({
        ...option,
        isCorrect: option.id === id
      }));
    } else {
      newOptions = newOptions.map(option =>
        option.id === id ? { ...option, isCorrect: checked } : option
      );
    }
    
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length < 8) {
      setFormData({
        ...formData,
        options: [
          ...formData.options,
          { id: uuidv4(), text: '', isCorrect: false }
        ]
      });
    }
  };

  const removeOption = (id: string) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter(option => option.id !== id)
      });
    } else {
      toast({
        title: "Cannot remove option",
        description: "A question must have at least 2 options.",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 2MB in size",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      
      await uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true);
      
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        throw bucketsError;
      }
      
      const bucketExists = buckets.some(b => b.name === 'question-images');
      
      if (!bucketExists) {
        const { data, error: createError } = await supabase.storage.createBucket('question-images', {
          public: true,
          fileSizeLimit: 2097152, // 2MB
        });
        
        if (createError) throw createError;
        console.log("Created new bucket:", data);
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = fileName;
      
      const { error: uploadError } = await supabase.storage
        .from('question-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('question-images')
        .getPublicUrl(filePath);
      
      console.log("Uploaded image URL:", publicUrl);
      
      setFormData({
        ...formData,
        imageUrl: publicUrl
      });
      
      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData({
      ...formData,
      imageUrl: ''
    });
  };

  const validateForm = (): boolean => {
    const errors: {
      text?: string;
      categoryId?: string;
      options?: string;
      optionTexts?: string;
    } = {};

    if (!formData.text.trim()) {
      errors.text = "Question text is required";
    }
    
    if (!formData.categoryId) {
      errors.categoryId = "Category is required";
    }
    
    if (!formData.options.some(opt => opt.isCorrect)) {
      errors.options = "At least one correct answer must be selected";
    }
    
    if (formData.options.some(opt => !opt.text.trim())) {
      errors.optionTexts = "All option texts are required";
    }

    setValidationErrors(errors);
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted errors before submitting",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      console.log("Submitting question with image URL:", formData.imageUrl);
      
      let questionId = formData.id;
      
      if (initialData) {
        const { error: questionError } = await supabase
          .from('questions')
          .update({
            text: formData.text,
            explanation: formData.explanation,
            image_url: formData.imageUrl,
            category_id: formData.categoryId,
            difficulty: formData.difficulty
          })
          .eq('id', questionId);
          
        if (questionError) throw questionError;
      } else {
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            text: formData.text,
            explanation: formData.explanation,
            image_url: formData.imageUrl,
            category_id: formData.categoryId,
            difficulty: formData.difficulty
          })
          .select('id');
          
        if (questionError) throw questionError;
        if (!questionData || questionData.length === 0) {
          throw new Error('Failed to create question');
        }
        
        questionId = questionData[0].id;
      }
      
      if (initialData) {
        const { error: deleteError } = await supabase
          .from('question_options')
          .delete()
          .eq('question_id', questionId);
          
        if (deleteError) throw deleteError;
      }
      
      const optionsToInsert = formData.options.map(opt => ({
        question_id: questionId,
        text: opt.text,
        is_correct: opt.isCorrect
      }));
      
      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(optionsToInsert);
        
      if (optionsError) throw optionsError;
      
      toast({
        title: "Success",
        description: initialData ? "Question updated successfully" : "Question created successfully",
      });
      
      onFormSubmitted();
    } catch (error: any) {
      console.error("Question save error:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${initialData ? 'update' : 'create'} question`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {Object.keys(validationErrors).length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please fix the following errors:
              <ul className="list-disc pl-4 mt-2">
                {Object.values(validationErrors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="text" className={validationErrors.text ? "text-destructive" : ""}>
            Question Text *
          </Label>
          <Textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleTextChange}
            placeholder="Enter the question text"
            className={cn(
              "min-h-[100px]",
              validationErrors.text && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>

        <div>
          <Label htmlFor="category" className={validationErrors.categoryId ? "text-destructive" : ""}>
            Category *
          </Label>
          <Select
            value={formData.categoryId}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger 
              id="category"
              className={validationErrors.categoryId ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Question Type</Label>
          <RadioGroup
            value={questionType}
            onValueChange={(value) => setQuestionType(value as 'single' | 'multiple')}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single">Single correct answer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multiple" id="multiple" />
              <Label htmlFor="multiple">Multiple correct answers</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className={validationErrors.options || validationErrors.optionTexts ? "text-destructive" : ""}>
              Answer Options *
            </Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addOption}
              disabled={formData.options.length >= 8}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Option
            </Button>
          </div>
          
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={option.id} className="flex items-start space-x-2">
                <div className="mt-3">
                  {questionType === 'single' ? (
                    <RadioGroup
                      value={formData.options.find(o => o.isCorrect)?.id || ''}
                      onValueChange={(value) => {
                        handleOptionCorrectChange(value, true);
                      }}
                    >
                      <RadioGroupItem 
                        value={option.id} 
                        id={`radio-${option.id}`} 
                        className={cn(
                          "mt-0.5",
                          validationErrors.options && "border-destructive"
                        )}
                      />
                    </RadioGroup>
                  ) : (
                    <Checkbox
                      id={`checkbox-${option.id}`}
                      checked={option.isCorrect}
                      onCheckedChange={(checked) => 
                        handleOptionCorrectChange(option.id, checked === true)
                      }
                      className={cn(
                        "mt-0.5",
                        validationErrors.options && "border-destructive"
                      )}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    value={option.text}
                    onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className={validationErrors.optionTexts ? "border-destructive" : ""}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(option.id)}
                  disabled={formData.options.length <= 2}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="explanation">Explanation</Label>
          <Textarea
            id="explanation"
            name="explanation"
            value={formData.explanation}
            onChange={handleTextChange}
            placeholder="Provide an explanation for the correct answer"
            className="min-h-[80px]"
          />
        </div>

        <div>
          <Label>Image (optional)</Label>
          <div className="mt-2">
            {imagePreview ? (
              <div className="space-y-2">
                <div className="relative w-full rounded-lg overflow-hidden border bg-background flex items-center justify-center">
                  <img 
                    src={imagePreview} 
                    alt="Question image" 
                    className="max-h-[200px] object-contain" 
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4 mr-2" /> Remove Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label 
                  htmlFor="image-upload" 
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image className="w-8 h-8 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-500">
                      Click to upload image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, GIF up to 2MB
                    </p>
                  </div>
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData({...formData, difficulty: value as 'easy' | 'medium' | 'hard'})}
          >
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-full h-2 mt-2 bg-gray-200 rounded overflow-hidden">
            <div 
              className={`h-full ${
                formData.difficulty === 'hard' 
                  ? 'bg-red-600' 
                  : formData.difficulty === 'medium' 
                    ? 'bg-yellow-600' 
                    : 'bg-green-600'
              }`}
              style={{ width: formData.difficulty === 'hard' ? '100%' : formData.difficulty === 'medium' ? '66%' : '33%' }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onFormSubmitted}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? 
            (initialData ? "Updating..." : "Creating...") : 
            (initialData ? "Update Question" : "Create Question")
          }
        </Button>
      </div>
    </form>
  );
};
