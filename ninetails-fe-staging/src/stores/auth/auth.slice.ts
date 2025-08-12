import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { User } from '../../interfaces/auth';
import type { RootState } from '../store';

interface AuthState {
  user: User | null;
  token: string | null;
  userOperationInfo: any;
}

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, userOperationInfo: null } as AuthState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user, token } }: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = user;
      state.token = token;
    },

    removeCredentials: (state) => {
      state.user = null;
      state.token = null;
    },

    updateUserInfo: (state, payload) => {
      state.user = {
        ...state.user,
        ...payload.payload,
      };
    },

    setUserOperationInfo: (state, { payload }: PayloadAction<any>) => {
      state.userOperationInfo = payload;
    },

    updateUserOperationInfo: (state, { payload }: PayloadAction<any>) => {
      state.userOperationInfo = {
        ...state.userOperationInfo,
        ...payload,
      };
    },
  },
});

export const {
  setCredentials,
  removeCredentials,
  updateUserInfo,
  setUserOperationInfo,
  updateUserOperationInfo,
} = slice.actions;

export default slice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectUserOperationInfo = (state: RootState) => state.auth.userOperationInfo;
