import { BalancesRepsonse, ItemReponse, PerUserShare } from "@/interfaces/api/bill.api";

// Data interfaces
export interface BillItem {
  id: string;
  name: string;
  price: number;
  person: string;
  quantity: number;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  amount: number;
}

export interface DebtItem {
  from: string;
  to: string;
  amount: number;
  fromAvatar: string;
  toAvatar: string;
}

// Props interfaces
export interface BillDetailHeaderProps {
  title: string;
  eventId: string;
}

export interface BillItemsCardProps {
  items: ItemReponse[];
  subTotal: number;
  tax: number;
  totalAmount: number;
  perUserShares?: PerUserShare[];
}

export interface DebtsListCardProps {
  debts: BalancesRepsonse[];
}

// export interface OwedAmountCardProps {
//   balance: BalancesRepsonse[];
// }

// export interface PaidByCardProps {
//   participant: Participant;
// }

export interface ParticipantsCardProps {
  participants: Participant[];
}

export interface TabBarProps {
  activeTab: "overall" | "balances";
  onTabChange: (tab: "overall" | "balances") => void;
}

export interface ExportButtonProps {
  onPress?: () => void;
  isLoading?: boolean;
}

export interface ParticipantDropdownProps {
  visible: boolean;
  itemId: string;
  items: ItemReponse[];
  participants: {
    name: string;
    user_id?: string | null;
    is_guest: boolean;
  }[];
  everyoneOption: string;
  onClose: () => void;
  onSelectParticipant: (itemId: string, participantId: string) => void;
}

// Helper function to get participant identifier
export function getParticipantId(participant: { name: string; user_id?: string | null; is_guest: boolean }): string {
  return participant.user_id || participant.name;
}
