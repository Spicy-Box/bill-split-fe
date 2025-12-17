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
