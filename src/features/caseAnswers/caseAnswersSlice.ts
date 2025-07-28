
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SessionData {
  startTime?: string;
  endTime?: string;
  totalQuestions?: number;
  caseId?: string;
  subjectId?: string;
  examId?: string;
}

interface AnswerState {
  answers: {
    [questionId: string]: string;
  };
  session: SessionData;
}

const initialState: AnswerState = {
  answers: {},
  session: {},
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
      state.session = {};
    },
    startSession: (
      state,
      action: PayloadAction<{ totalQuestions: number; caseId: string; subjectId: string; examId: string }>
    ) => {
      state.session = {
        startTime: new Date().toISOString(),
        totalQuestions: action.payload.totalQuestions,
        caseId: action.payload.caseId,
        subjectId: action.payload.subjectId,
        examId: action.payload.examId,
      };
    },
    endSession: (state) => {
      state.session.endTime = new Date().toISOString();
    },
  },
});

export const { saveAnswer, clearAnswers, removeAnswer, startSession, endSession } = caseAnswersSlice.actions;
export default caseAnswersSlice.reducer;
