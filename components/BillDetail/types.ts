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
}

export interface BillItemsCardProps {
  items: BillItem[];
  total: number;
}

export interface DebtsListCardProps {
  debts: DebtItem[];
}

export interface OwedAmountCardProps {
  participant: Participant;
  amount: number;
}

export interface PaidByCardProps {
  participant: Participant;
}

export interface ParticipantsCardProps {
  participants: Participant[];
}

export interface TabBarProps {
  activeTab: "overall" | "balances";
  onTabChange: (tab: "overall" | "balances") => void;
}

export interface ExportButtonProps {
  onPress?: () => void;
}
