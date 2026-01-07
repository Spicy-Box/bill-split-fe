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
  isLoading?: boolean;
}

export interface StatsCardProps {
  stats: EventStats;
  isLoading?: boolean;
}

export interface BillsListProps {
  bills: BillOverallItemRequest[];
  isLoading?: boolean;
  onDeleteBill?: (id: string) => void;
  onEditBill?: (id: string, title: string) => void;
}

export interface AddBillMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenCamera: () => void;
  onUploadBill: () => void;
  onCreateBill: () => void;
}
