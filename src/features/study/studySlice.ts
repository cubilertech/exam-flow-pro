
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Question } from '../questions/questionsSlice';

export interface UserNote {
  questionId: string;
  note: string;
  updatedAt: string;
}

export interface FlaggedQuestion {
  questionId: string;
  flaggedAt: string;
}

export interface AnsweredQuestion {
  questionId: string;
  selectedOptions: string[];
  isCorrect: boolean;
  answeredAt: string;
}

export interface TestResult {
  id: string;
  testDate: string;
  categoryIds: string[];
  questionCount: number;
  correctCount: number;
  incorrectCount: number;
  score: number;
  timeTaken: number;
  answers: AnsweredQuestion[];
  timeStarted?: string;
  timeCompleted?: string;
  examId?: string;
  examName?: string;
}

interface StudyState {
  notes: UserNote[];
  flaggedQuestions: FlaggedQuestion[];
  answeredQuestions: AnsweredQuestion[];
  testResults: TestResult[];
  currentStudyMode: 'study' | 'test' | null;
  currentTestQuestions: Question[];
  currentTestStartTime: string | null;
  currentExamId: string | null; // Add exam ID field
  currentExamName: string | null; // Add exam name field
  isLoading: boolean;
  error: string | null;
}

const initialState: StudyState = {
  notes: [],
  flaggedQuestions: [],
  answeredQuestions: [],
  testResults: [],
  currentStudyMode: null,
  currentTestQuestions: [],
  currentTestStartTime: null,
  currentExamId: null,
  currentExamName: null,
  isLoading: false,
  error: null,
};

const studySlice = createSlice({
  name: 'study',
  initialState,
  reducers: {
    // Notes management
    addNote: (state, action: PayloadAction<UserNote>) => {
      const existingNoteIndex = state.notes.findIndex(
        note => note.questionId === action.payload.questionId
      );
      if (existingNoteIndex !== -1) {
        state.notes[existingNoteIndex] = action.payload;
      } else {
        state.notes.push(action.payload);
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter(note => note.questionId !== action.payload);
    },
    
    // Flagged questions management
    toggleFlagQuestion: (state, action: PayloadAction<string>) => {
      const questionId = action.payload;
      const existingIndex = state.flaggedQuestions.findIndex(
        item => item.questionId === questionId
      );
      
      if (existingIndex !== -1) {
        // If already flagged, remove it
        state.flaggedQuestions = state.flaggedQuestions.filter(
          item => item.questionId !== questionId
        );
      } else {
        // If not flagged, add it
        state.flaggedQuestions.push({
          questionId,
          flaggedAt: new Date().toISOString(),
        });
      }
    },
    
    // Study mode management
    setStudyMode: (state, action: PayloadAction<'study' | 'test' | null>) => {
      state.currentStudyMode = action.payload;
    },
    
    // Test management
    startTest: (state, action: PayloadAction<{
      questions: Question[], 
      examId?: string,
      examName?: string
    }>) => {
      state.currentTestQuestions = action.payload.questions;
      state.currentStudyMode = 'test';
      state.currentTestStartTime = new Date().toISOString();
      state.currentExamId = action.payload.examId || null;
      state.currentExamName = action.payload.examName || null;
      
      // Clear any previous answers for these questions
      const questionIds = action.payload.questions.map(q => q.id);
      state.answeredQuestions = state.answeredQuestions.filter(
        a => !questionIds.includes(a.questionId)
      );
    },
    
    answerQuestion: (state, action: PayloadAction<AnsweredQuestion>) => {
      const existingIndex = state.answeredQuestions.findIndex(
        item => item.questionId === action.payload.questionId
      );
      
      if (existingIndex !== -1) {
        state.answeredQuestions[existingIndex] = action.payload;
      } else {
        state.answeredQuestions.push(action.payload);
      }
    },
    
    submitTestResult: (state, action: PayloadAction<TestResult>) => {
      state.testResults.push(action.payload);
      state.currentTestQuestions = [];
      state.currentStudyMode = null;
      state.currentTestStartTime = null;
      state.currentExamId = null;
      state.currentExamName = null;
    },
    
    clearCurrentTest: (state) => {
      state.currentTestQuestions = [];
      state.currentStudyMode = null;
      state.currentTestStartTime = null;
      state.currentExamId = null;
      state.currentExamName = null;
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addNote,
  deleteNote,
  toggleFlagQuestion,
  setStudyMode,
  startTest,
  answerQuestion,
  submitTestResult,
  clearCurrentTest,
  setLoading,
  setError,
} = studySlice.actions;

export default studySlice.reducer;
