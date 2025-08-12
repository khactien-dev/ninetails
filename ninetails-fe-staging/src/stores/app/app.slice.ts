import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../store';

interface State {
  isTwoCollumn: boolean;
  isShowBackupData: boolean;
}

const slice = createSlice({
  name: 'app',
  initialState: { isTwoCollumn: true, isShowBackupData: false } as State,
  reducers: {
    changeCollumn: (state) => {
      state.isTwoCollumn = !state.isTwoCollumn;
    },

    toggleBackupData: (state) => {
      state.isShowBackupData = !state.isShowBackupData;
    },
  },
});

export const { changeCollumn, toggleBackupData } = slice.actions;

export default slice.reducer;

export const isTwoColumns = (state: RootState) => state.app?.isTwoCollumn;
export const isShowBackupData = (state: RootState) => state.app?.isShowBackupData;
