// Data interfaces
export interface Participant {
  id: number;
  name: string;
}

// Props interfaces
export interface EventHeaderProps {
  selectedEmoji: string;
  onEmojiPress: () => void;
  onClose: () => void;
}

export interface EventNameAndCurrencyProps {
  eventName: string;
  currency: string;
  onEventNameChange: (text: string) => void;
  onCurrencyChange: (text: string) => void;
}

export interface ParticipantsListProps {
  participants: Participant[];
  onAddParticipant: () => void;
  onRemoveParticipant: (id: number) => void;
  onUpdateParticipant: (id: number, name: string) => void;
}
