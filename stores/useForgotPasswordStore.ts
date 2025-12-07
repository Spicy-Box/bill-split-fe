import { create } from "zustand";

interface ForgotPasswordState {
  email: string | null;
  setEmail: (email: string) => void;
}

export const useForgotPasswordStore = create<ForgotPasswordState>((set, get) => ({
  email: null,

  setEmail: (email) => {
    set({
      email: email,
    });
  },
}));
