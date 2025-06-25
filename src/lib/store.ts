
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '@/features/auth/authSlice';
import questionsReducer from '@/features/questions/questionsSlice';
import caseAnswersReducer from "@/features/caseAnswers/caseAnswersSlice";
import studyReducer from '@/features/study/studySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    questions: questionsReducer,
    study: studyReducer,
    caseAnswers: caseAnswersReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
