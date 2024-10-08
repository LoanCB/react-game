import { AlertColor } from '@mui/material';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationState = {
  isActiveSnackBar?: boolean;
  message: string | null;
  severity: AlertColor;
};
export const initialState: NotificationState = { isActiveSnackBar: false, message: null, severity: 'info' };

export const notificationSlice = createSlice({
  name: 'notification',
  initialState: initialState,
  reducers: {
    openSnackBar: (state, action: PayloadAction<NotificationState>) => {
      state.isActiveSnackBar = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity;
    },
    closeSnackBar: (state) => {
      state.isActiveSnackBar = false;
      state.message = null;
    },
  },
});

export const { openSnackBar, closeSnackBar } = notificationSlice.actions;
export default notificationSlice.reducer;
