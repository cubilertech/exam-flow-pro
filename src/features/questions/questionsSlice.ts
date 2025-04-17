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
  examId?: string;
  questionBankId?: string;
  questionCount: number;
}

export interface QuestionBank {
  id: string;
  name: string;
  description: string | null;
  categoryCount?: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  categoryCount: number;
  isSubscription?: boolean;
  subscriptionType?: string;
  questionBankId?: string;
}

interface QuestionsState {
  questionBanks: QuestionBank[];
  exams: Exam[];
  categories: Category[];
  questions: Question[];
  currentQuestionBank: QuestionBank | null;
  currentExam: Exam | null;
  currentCategory: Category | null;
  currentQuestion: Question | null;
  isLoading: boolean;
  error: string | null;
  activeQuestionBankId: string | null;
}

const initialState: QuestionsState = {
  questionBanks: [],
  exams: [],
  categories: [],
  questions: [],
  currentQuestionBank: null,
  currentExam: null,
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
    addQuestionBankStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    addQuestionBankSuccess: (state, action: PayloadAction<QuestionBank>) => {
      state.questionBanks.push(action.payload);
      state.isLoading = false;
    },
    addQuestionBankFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateQuestionBankStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateQuestionBankSuccess: (state, action: PayloadAction<QuestionBank>) => {
      const index = state.questionBanks.findIndex(qb => qb.id === action.payload.id);
      if (index !== -1) {
        state.questionBanks[index] = action.payload;
      }
      state.isLoading = false;
    },
    updateQuestionBankFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    deleteQuestionBankStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteQuestionBankSuccess: (state, action: PayloadAction<string>) => {
      state.questionBanks = state.questionBanks.filter(qb => qb.id !== action.payload);
      state.isLoading = false;
    },
    deleteQuestionBankFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
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
  addQuestionBankStart,
  addQuestionBankSuccess,
  addQuestionBankFailure,
  updateQuestionBankStart,
  updateQuestionBankSuccess,
  updateQuestionBankFailure,
  deleteQuestionBankStart,
  deleteQuestionBankSuccess,
  deleteQuestionBankFailure,
  setActiveQuestionBank,
} = questionsSlice.actions;

export default questionsSlice.reducer;
