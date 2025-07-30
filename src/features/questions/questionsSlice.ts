import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  serialNumber: string;
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
  examId?: string;
  questionBankId?: string;
  questionCount: number;
}

export interface QuestionBank {
  id: string;
  name: string;
  description: string | null;
  categoryCount?: number;
  question_bank_id?: string;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  categoryCount: number;
}

interface QuestionsState {
  questionBanks: QuestionBank[];
  categories: Category[];
  questions: Question[];
  exams: Exam[];
  currentQuestionBank: QuestionBank | null;
  currentCategory: Category | null;
  currentQuestion: Question | null;
  isLoading: boolean;
  error: string | null;
  activeQuestionBankId: string | null;
}

const initialState: QuestionsState = {
  questionBanks: [],
  categories: [],
  questions: [],
  exams: [],
  currentQuestionBank: null,
  currentCategory: null,
  currentQuestion: null,
  isLoading: false,
  error: null,
  activeQuestionBankId: null,
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    fetchQuestionBanksStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchQuestionBanksSuccess: (state, action: PayloadAction<QuestionBank[]>) => {
      state.questionBanks = action.payload;
      state.isLoading = false;
    },
    fetchQuestionBanksFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCurrentQuestionBank: (state, action: PayloadAction<QuestionBank | null>) => {
      state.currentQuestionBank = action.payload;
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
    setCurrentCategory: (state, action: PayloadAction<Category | null>) => {
      state.currentCategory = action.payload;
    },
    setCurrentQuestion: (state, action: PayloadAction<Question | null>) => {
      state.currentQuestion = action.payload;
    },
    setActiveQuestionBank: (state, action: PayloadAction<string | null>) => {
      state.activeQuestionBankId = action.payload;
    },
  },
});

export const {
  fetchQuestionBanksStart,
  fetchQuestionBanksSuccess,
  fetchQuestionBanksFailure,
  setCurrentQuestionBank,
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchQuestionsStart,
  fetchQuestionsSuccess,
  fetchQuestionsFailure,
  setCurrentCategory,
  setCurrentQuestion,
  setActiveQuestionBank,
} = questionsSlice.actions;

export default questionsSlice.reducer;
