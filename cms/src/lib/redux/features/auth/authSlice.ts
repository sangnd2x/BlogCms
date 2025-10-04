import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const loadAuthFromStorage = (): AuthState => {
  if (typeof window !== "undefined") {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    const token = localStorage.getItem("access_token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    return {
      token,
      user,
      isAuthenticated: !!(token && user),
    };
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
};

const authSlice = createSlice({
  name: "Auth",
  initialState: loadAuthFromStorage(),
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; access_token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.isAuthenticated = true;

      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", action.payload.access_token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    clearCredentials: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
