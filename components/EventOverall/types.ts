import { BillOverallItemRequest } from "@/interfaces/api/bill.api";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  paidBy: string;
}

export interface EventStats {
  myExpenses: number;
  totalExpenses: number;
}

export interface EventNameAndCurrency {
  name: string;
  date: string;
  emoji: string;
}

export interface EventHeaderProps {
  eventNameAndCurrency: EventNameAndCurrency;
}

export interface StatsCardProps {
  stats: EventStats;
}

export interface BillsListProps {
  bills: BillOverallItemRequest[];
  onDeleteBill: (billId: string) => void;
  onEditBill: (billId: string, currentTitle: string) => void;
}

export interface AddBillMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenCamera: () => void;
  onUploadBill: () => void;
  onCreateBill: () => void;
}
