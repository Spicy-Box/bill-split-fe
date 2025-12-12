import { create } from "zustand";


interface EventState {
  participants: string[] | null;
  setParticipants: (participants: string[]) => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  participants: null,

  setParticipants: (participants: string[]) => {
    set({
      participants: participants
    })
  }
}))