// Data interfaces
export interface BillItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  participants: string[];
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMe?: boolean;
}

export interface ManualSplit {
  id: string;
  participantId: string;
  amount: number;
}

export type SplitMode = "equally" | "by-item" | "manually";

export interface SplitOption {
  id: SplitMode;
  label: string;
  icon: "equally" | "by-item" | "manually";
}

interface SplitAmount {
  participant: Participant;
  amount: number;
}

// Props interfaces
export interface BillHeaderProps {
  title: string;
  onBack: () => void;
}

export interface BillItemRowProps {
  item: BillItem;
  participantDisplayText: string;
  onUpdateName: (text: string) => void;
  onUpdateUnitPrice: (price: number) => void;
  onUpdateQuantity: (delta: number) => void;
  onRemove: () => void;
  onParticipantPress: () => void;
  mode?: SplitMode;
}

export interface BillItemInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onAdd: () => void;
}

export interface BillTotalsProps {
  subtotal: number;
  tax_rate: number;
  total: number;
}

export interface PaidByDropdownProps {
  visible: boolean;
  selectedId: string;
  participants: Participant[];
  onClose: () => void;
  onSelect: (participantId: string) => void;
}

export interface ParticipantDropdownProps {
  visible: boolean;
  itemId: string;
  items: BillItem[];
  participants: Participant[];
  everyoneOption: string;
  onClose: () => void;
  onSelectParticipant: (itemId: string, participantId: string) => void;
}

export interface SplitModeOptionsProps {
  selectedMode: SplitMode;
  onModeChange: (mode: SplitMode) => void;
  splitOptions: SplitOption[];
}

export interface ManualSplitItemProps {
  split: ManualSplit;
  participant: Participant | undefined;
  onUpdateManualSplit: (participantId: string, amount: number) => void;
}

export interface SplitResultListProps {
  mode: SplitMode;
  splitAmounts: SplitAmount[];
  manualSplits: ManualSplit[];
  participants: Participant[];
  hasItems: boolean;
  onUpdateManualSplit: (participantId: string, amount: number) => void;
  taxRate: number;
}
