
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, X, Upload } from 'lucide-react';
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
}

interface QuestionFormProps {
  categoryId: string;
  initialData: Question | null;
  allCategories: Category[];
  onFormSubmitted: () => void;
}

export const QuestionForm = ({ 
  categoryId, 
  initialData, 
  allCategories, 
  onFormSubmitted 
}: QuestionFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData({ ...formData, tags });
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
      // For single choice, uncheck all other options
      newOptions = newOptions.map(option => ({
        ...option,
        isCorrect: option.id === id
      }));
    } else {
      // For multiple choice, toggle the selected option
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      
      // In a real app, you would upload the file to a server and get a URL back
      // For now, we'll just set a placeholder URL
      setFormData({
        ...formData,
        imageUrl: 'https://example.com/image.jpg'
      });
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setFormData({
      ...formData,
      imageUrl: ''
    });
  };

  const validateForm = (): boolean => {
    if (!formData.text.trim()) {
      toast({
        title: "Validation Error",
        description: "Question text is required",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.categoryId) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.options.some(opt => opt.isCorrect)) {
      toast({
        title: "Validation Error",
        description: "At least one correct answer must be selected",
        variant: "destructive"
      });
      return false;
    }
    
    if (formData.options.some(opt => !opt.text.trim())) {
      toast({
        title: "Validation Error",
        description: "All option texts are required",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // First, save the question to get the ID
      let questionId = formData.id;
      
      if (initialData) {
        // Update existing question
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
        // Create new question
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
      
      // Handle options
      if (initialData) {
        // Delete existing options
        const { error: deleteError } = await supabase
          .from('question_options')
          .delete()
          .eq('question_id', questionId);
          
        if (deleteError) throw deleteError;
      }
      
      // Insert new options
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
        <div>
          <Label htmlFor="text">Question Text *</Label>
          <Textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleTextChange}
            placeholder="Enter the question text"
            className="min-h-[100px]"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {allCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            name="tags"
            value={formData.tags.join(', ')}
            onChange={handleTagsChange}
            placeholder="Enter tags, separated by commas"
          />
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
            <Label>Answer Options *</Label>
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
                        className="mt-0.5" 
                      />
                    </RadioGroup>
                  ) : (
                    <Checkbox
                      id={`checkbox-${option.id}`}
                      checked={option.isCorrect}
                      onCheckedChange={(checked) => 
                        handleOptionCorrectChange(option.id, checked === true)
                      }
                      className="mt-0.5"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    value={option.text}
                    onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
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
            {formData.imageUrl ? (
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-2 border rounded flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                    {selectedFile ? (
                      <img 
                        src={URL.createObjectURL(selectedFile)} 
                        alt="Selected" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div>Image</div>
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    {selectedFile?.name || 'Image uploaded'}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label 
                  htmlFor="image-upload" 
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-500">
                      Click to upload image
                    </p>
                  </div>
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleFileChange}
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 
            (initialData ? "Updating..." : "Creating...") : 
            (initialData ? "Update Question" : "Create Question")
          }
        </Button>
      </div>
    </form>
  );
};
