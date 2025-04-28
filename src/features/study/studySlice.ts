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

export interface ExamData {
  id: string;
  name: string;
  categoryIds: string[];
  difficultyLevels: string[];
  questionCount: number;
  isTimed: boolean;
  timeLimit: number | null;
  timeLimitType: string | null;
  examType: 'study' | 'test';
}

interface StudyState {
  notes: UserNote[];
  flaggedQuestions: FlaggedQuestion[];
  answeredQuestions: AnsweredQuestion[];
  testResults: TestResult[];
  currentStudyMode: 'study' | 'test' | null;
  currentTestQuestions: Question[];
  currentTestStartTime: string | null;
  currentExamId: string | null;
  currentExamName: string | null;
  currentExam: ExamData | null;
  currentExamType: 'study' | 'test' | null;
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
  currentExam: null,
  currentExamType: null,
  isLoading: false,
  error: null,
};

const studySlice = createSlice({
  name: 'study',
  initialState,
  reducers: {
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
    
    toggleFlagQuestion: (state, action: PayloadAction<FlaggedQuestion>) => {
      const questionId = action.payload.questionId;
      const existingIndex = state.flaggedQuestions.findIndex(
        item => item.questionId === questionId
      );
      
      if (existingIndex !== -1) {
        state.flaggedQuestions = state.flaggedQuestions.filter(
          item => item.questionId !== questionId
        );
      } else {
        state.flaggedQuestions.push(action.payload);
      }
    },
    
    setStudyMode: (state, action: PayloadAction<'study' | 'test' | null>) => {
      state.currentStudyMode = action.payload;
    },
    
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
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setCurrentExam: (state, action: PayloadAction<ExamData>) => {
      state.currentExam = action.payload;
      state.currentExamId = action.payload.id;
      state.currentExamName = action.payload.name;
      state.currentExamType = action.payload.examType as 'study' | 'test';
    },
    
    startExam: (state, action: PayloadAction<{
      mode: 'study' | 'test',
      startTime: string
    }>) => {
      state.currentStudyMode = action.payload.mode;
      state.currentTestStartTime = action.payload.startTime;
    },
    
    loadExamQuestions: (state, action: PayloadAction<Question[]>) => {
      state.currentTestQuestions = action.payload;
    }
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
  setCurrentExam,
  startExam,
  loadExamQuestions,
} = studySlice.actions;

export default studySlice.reducer;
