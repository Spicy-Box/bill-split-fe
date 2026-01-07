import { Participant, SplitMode } from "@/components/BillCreate";

export interface ItemRequest {
  name: string;
  quantity: number;
  unit_price: number;
  split_type?: "everyone" | "custom";
  split_between?: Participant[];
}

export interface ManualShareRequest {
  user_name: Participant;
  amount: number;
}

export interface BillCreateRequest {
  event_id: string;
  title: string;
  bill_split_type: SplitMode;
  items: ItemRequest[];
  tax: number;
  paid_by: string;
  manual_shares?: ManualShareRequest[];
}

export interface BillOverallItemRequest {
  id: string;
  title: string;
  totalAmount: number;
  paidBy: Participant;
}

export interface ItemReponse {
  id: string;
  name: string;
  quantity: number;
  tax?: number;
  splitBetween: Participant[]; // danh sách userName
  splitType: "everyone" | "custom";
  totalPrice: number;
  unitPrice: number;
}

export interface PerUserShare {
  share: number;
  userName: Participant;
}

export interface BillByItemResponse {
  billSplitType: SplitMode; // "by_item"
  eventId: string;
  id: string;
  items: ItemReponse[];
  note: string;
  ownerId: string;
  paidBy: Participant; // userName
  perUserShares: PerUserShare[];
  subtotal: number;
  tax: number; // ví dụ: 10 (%)
  title: string;
  totalAmount: number;
}

export interface BalancesRepsonse {
  amountOwed: number;
  creditor: Participant;
  debtor: Participant;
}
