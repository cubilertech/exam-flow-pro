import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  serialNumber: number;
  text: string;
  options: Option[];
  explanation: string;
  imageUrl?: string;
  categoryId: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  correctAnswerRate?: number;
}

export interface Category {
  id: string;
  name: string;
  examId: string;
  questionCount: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  categoryCount: number;
  isSubscription?: boolean;
  subscriptionType?: string;
}

interface QuestionsState {
  exams: Exam[];
  categories: Category[];
  questions: Question[];
  currentExam: Exam | null;
  currentCategory: Category | null;
  currentQuestion: Question | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: QuestionsState = {
  exams: [],
  categories: [],
  questions: [],
  currentExam: null,
  currentCategory: null,
  currentQuestion: null,
  isLoading: false,
  error: null,
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    fetchExamsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchExamsSuccess: (state, action: PayloadAction<Exam[]>) => {
      state.exams = action.payload;
      state.isLoading = false;
    },
    fetchExamsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchCategoriesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchCategoriesSuccess: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
      state.isLoading = false;
    },
    fetchCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchQuestionsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchQuestionsSuccess: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
      state.isLoading = false;
    },
    fetchQuestionsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCurrentExam: (state, action: PayloadAction<Exam | null>) => {
      state.currentExam = action.payload;
    },
    setCurrentCategory: (state, action: PayloadAction<Category | null>) => {
      state.currentCategory = action.payload;
    },
    setCurrentQuestion: (state, action: PayloadAction<Question | null>) => {
      state.currentQuestion = action.payload;
    },
    addQuestionStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    addQuestionSuccess: (state, action: PayloadAction<Question>) => {
      state.questions.push(action.payload);
      state.isLoading = false;
    },
    addQuestionFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateQuestionStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateQuestionSuccess: (state, action: PayloadAction<Question>) => {
      const index = state.questions.findIndex(q => q.id === action.payload.id);
      if (index !== -1) {
        state.questions[index] = action.payload;
      }
      state.isLoading = false;
    },
    updateQuestionFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    deleteQuestionStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteQuestionSuccess: (state, action: PayloadAction<string>) => {
      state.questions = state.questions.filter(q => q.id !== action.payload);
      state.isLoading = false;
    },
    deleteQuestionFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setExamSubscriptionType: (state, action: PayloadAction<{ examId: string, subscriptionType: string }>) => {
      const examIndex = state.exams.findIndex(e => e.id === action.payload.examId);
      if (examIndex !== -1) {
        state.exams[examIndex].isSubscription = true;
        state.exams[examIndex].subscriptionType = action.payload.subscriptionType;
      }
    },
    filterQuestionsBySubscription: (state, action: PayloadAction<string>) => {
      state.currentExam = state.exams.find(e => e.subscriptionType === action.payload) || null;
    },
  },
});

export const {
  fetchExamsStart,
  fetchExamsSuccess,
  fetchExamsFailure,
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchQuestionsStart,
  fetchQuestionsSuccess,
  fetchQuestionsFailure,
  setCurrentExam,
  setCurrentCategory,
  setCurrentQuestion,
  addQuestionStart,
  addQuestionSuccess,
  addQuestionFailure,
  updateQuestionStart,
  updateQuestionSuccess,
  updateQuestionFailure,
  deleteQuestionStart,
  deleteQuestionSuccess,
  deleteQuestionFailure,
  setExamSubscriptionType,
  filterQuestionsBySubscription,
} = questionsSlice.actions;

export default questionsSlice.reducer;
