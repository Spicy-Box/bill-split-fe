import { create } from "zustand";
import { ItemReponse } from "@/interfaces/api/bill.api";



interface BillStore {
    parsedData: ItemReponse[] | null;
    tax: number;
    setParsedData: (data: ItemReponse[]) => void;
    setTax: (tax: number) => void;
    clearParsedData: () => void;
}

export const useBillStore = create<BillStore>((set) => ({
    parsedData: null,
    tax: 0,
    setParsedData: (data) => set({ parsedData: data }),
    setTax: (tax) => set({ tax }),
    clearParsedData: () => set({ parsedData: null }),
}));
