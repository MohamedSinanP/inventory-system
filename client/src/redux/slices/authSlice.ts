import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Auth } from "../../types/type";

const initialState: Auth = {
  user: null, // Changed to null to match Auth interface
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<Auth>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    removeAuth: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { setAuth, setAccessToken, removeAuth } = authSlice.actions;
export default authSlice.reducer;