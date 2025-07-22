
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AnswerState {
  answers: {
    [questionId: string]: string;
  };
  sessionStartTime: number | null;
  totalQuestions: number;
}

const initialState: AnswerState = {
  answers: {},
  sessionStartTime: null,
  totalQuestions: 0,
};

const caseAnswersSlice = createSlice({
  name: "caseAnswers",
  initialState,
  reducers: {
    saveAnswer: (
      state,
      action: PayloadAction<{ questionId: string; answerHtml: string }>
    ) => {
      const { questionId, answerHtml } = action.payload;
      state.answers[questionId] = answerHtml;
    },
    removeAnswer: (state, action: PayloadAction<{ questionId: string }>) => {
      delete state.answers[action.payload.questionId];
    },
    clearAnswers: (state) => {
      state.answers = {};
      state.sessionStartTime = null;
      state.totalQuestions = 0;
    },
    setSessionStartTime: (state, action: PayloadAction<number>) => {
      state.sessionStartTime = action.payload;
    },
    setTotalQuestions: (state, action: PayloadAction<number>) => {
      state.totalQuestions = action.payload;
    },
  },
});

export const { 
  saveAnswer, 
  clearAnswers, 
  removeAnswer, 
  setSessionStartTime, 
  setTotalQuestions 
} = caseAnswersSlice.actions;
export default caseAnswersSlice.reducer;
