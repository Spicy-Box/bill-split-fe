// Data interfaces
export interface BillItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  participants: string[];
}

export interface Participant {
  name: string;
  user_id?: string;
  is_guest: boolean;
  avatar?: string;
}

// Helper function to get participant identifier
export function getParticipantId(participant: Participant): string {
  return participant.user_id || participant.name;
}

export interface ManualSplit {
  id: string;
  participantId: string;
  amount: number;
}

export type SplitMode = "equally" | "by_item" | "manual";

export interface SplitOption {
  id: SplitMode;
  label: string;
  icon: "equally" | "by-item" | "manually";
}


// Props interfaces
export interface BillHeaderProps {
  title: string;
  onBack: () => void;
  setBillName: React.Dispatch<React.SetStateAction<string>>;
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
  setTaxRate: React.Dispatch<React.SetStateAction<number>>
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
  manualSplits: ManualSplit[];
  participants: Participant[];
  hasItems: boolean;
  onUpdateManualSplit: (participantId: string, amount: number) => void;
  taxRate: number;
}
