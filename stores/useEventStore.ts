import { Participant } from "@/components/BillCreate";
import { create } from "zustand";


interface EventState {
  participants: Participant[] | [];
  event_id: string | null;
  setParticipants: (participants: Participant[]) => void;
  setEventId: (event_id: string) => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  participants: [],
  event_id: null,

  setParticipants: (participants) => {
    set({
      participants: participants
    })
  },

  setEventId: (event_id) => {
    set({
      event_id: event_id
    })
  }
}))