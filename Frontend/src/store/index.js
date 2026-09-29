import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import accountsReducer from "./accountsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
  },
});

export default store;
