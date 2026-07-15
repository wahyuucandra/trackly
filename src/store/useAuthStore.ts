"use client";

import { create } from "zustand";
import type { Session } from "next-auth";

interface AuthState {
  session: Session | null;
  setSession: (session: Session | null) => void;
  isAdmin: boolean;
  isAO: boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  setSession: (session) =>
    set({
      session,
      isAdmin: session?.user?.role === "Admin",
      isAO: session?.user?.role === "AO",
    }),
  isAdmin: false,
  isAO: false,
}));