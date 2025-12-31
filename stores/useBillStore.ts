import { create } from "zustand";
import { ItemReponse } from "@/interfaces/api/bill.api";



interface BillStore {
    parsedData: ItemReponse[] | null;
    setParsedData: (data: ItemReponse[]) => void;
    clearParsedData: () => void;
}

export const useBillStore = create<BillStore>((set) => ({
    parsedData: null,
    setParsedData: (data) => set({ parsedData: data }),
    clearParsedData: () => set({ parsedData: null }),
}));
