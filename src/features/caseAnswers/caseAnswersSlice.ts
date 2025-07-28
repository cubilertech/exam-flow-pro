
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AnswerState {
  answers: {
    [questionId: string]: string;
  };
  sessionStats: {
    startTime: string | null;
    endTime: string | null;
    totalQuestions: number;
  };
}

const initialState: AnswerState = {
  answers: {},
  sessionStats: {
    startTime: null,
    endTime: null,
    totalQuestions: 0,
  },
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
      state.sessionStats = {
        startTime: null,
        endTime: null,
        totalQuestions: 0,
      };
    },
    startSession: (state, action: PayloadAction<{ totalQuestions: number }>) => {
      state.sessionStats.startTime = new Date().toISOString();
      state.sessionStats.totalQuestions = action.payload.totalQuestions;
    },
    endSession: (state) => {
      state.sessionStats.endTime = new Date().toISOString();
    },
  },
});

export const { saveAnswer, clearAnswers, removeAnswer, startSession, endSession } = caseAnswersSlice.actions;
export default caseAnswersSlice.reducer;
