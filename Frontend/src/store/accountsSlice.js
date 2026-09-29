import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accounts: [],
  isLoading: false,
  error: null,
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    setAccounts(state, action) {
      state.accounts = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setAccountsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setAccountsError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearAccounts(state) {
      state.accounts = [];
      state.isLoading = false;
      state.error = null;
    },
    // Update a single account in the list (e.g. after status change)
    updateAccount(state, action) {
      const updated = action.payload;
      const idx = state.accounts.findIndex(
        (a) => a.accountNumber === updated.accountNumber
      );
      if (idx !== -1) {
        state.accounts[idx] = updated;
      }
    },
    // Append a newly created account
    addAccount(state, action) {
      state.accounts.push(action.payload);
    },
  },
});

export const {
  setAccounts,
  setAccountsLoading,
  setAccountsError,
  clearAccounts,
  updateAccount,
  addAccount,
} = accountsSlice.actions;

export default accountsSlice.reducer;
