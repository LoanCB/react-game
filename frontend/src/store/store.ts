import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import notificationReducer from "./notificationSlice";
import userReducer from "./userSlice";

const store = configureStore({
  reducer: {
    notification: notificationReducer,
    user: userReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(api.middleware),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
