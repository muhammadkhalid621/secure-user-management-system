"use client";

import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchJson } from "@/lib/api";
import type { ApiSuccessResponse, AuthPayload, SessionPayload, SafeUser } from "@/lib/types";

type AuthState = {
  user: SafeUser | null;
  socketToken: string | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  initialized: boolean;
};

const initialState: AuthState = {
  user: null,
  socketToken: null,
  status: "idle",
  error: null,
  initialized: false
};

export const bootstrapSession = createAsyncThunk(
  "auth/bootstrapSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchJson<ApiSuccessResponse<SessionPayload>>("/api/auth/session");
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to restore session");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (input: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetchJson<ApiSuccessResponse<AuthPayload>>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return {
        user: response.data.user,
        socketToken: response.data.tokens.accessToken
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (input: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetchJson<ApiSuccessResponse<AuthPayload>>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return {
        user: response.data.user,
        socketToken: response.data.tokens.accessToken
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Registration failed");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await fetchJson<ApiSuccessResponse<{ loggedOut: true }>>("/api/auth/logout", {
        method: "POST"
      });
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateSession(state, action: PayloadAction<SessionPayload | null>) {
      state.user = action.payload?.user ?? null;
      state.socketToken = action.payload?.socketToken ?? null;
      state.status = action.payload ? "authenticated" : "unauthenticated";
      state.initialized = true;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.socketToken = action.payload.socketToken;
        state.status = "authenticated";
        state.initialized = true;
        state.error = null;
      })
      .addCase(bootstrapSession.rejected, (state, action) => {
        state.user = null;
        state.socketToken = null;
        state.status = "unauthenticated";
        state.initialized = true;
        state.error = (action.payload as string | undefined) ?? null;
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.socketToken = action.payload.socketToken;
        state.status = "authenticated";
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = (action.payload as string | undefined) ?? "Login failed";
        state.initialized = true;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.socketToken = action.payload.socketToken;
        state.status = "authenticated";
        state.initialized = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = (action.payload as string | undefined) ?? "Registration failed";
        state.initialized = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.socketToken = null;
        state.status = "unauthenticated";
        state.initialized = true;
        state.error = null;
      });
  }
});

export const { hydrateSession } = authSlice.actions;
export const authReducer = authSlice.reducer;
