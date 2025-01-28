import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./../types/user/user";

type UserState = User | null;
export const initialState = null as UserState;

export const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      return { ...state, ...action.payload };
    },
    removeUser: () => null,
  },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
