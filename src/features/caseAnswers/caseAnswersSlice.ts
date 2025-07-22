import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AnswerState {
  answers: {
    [questionId: string]: string;
  };
}

const initialState: AnswerState = {
  answers: {},
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
    },
  },
});

export const { saveAnswer, clearAnswers, removeAnswer } = caseAnswersSlice.actions;
export default caseAnswersSlice.reducer;
