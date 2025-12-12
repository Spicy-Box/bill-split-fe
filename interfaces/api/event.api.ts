export const CurrencyObj = {
  VND: 1,
  JPY: 2,
  USD: 3,
};

export interface EventRequest {
  name: string;
  currency: number;
  participants: string[];
}

export interface EventReponse {
  id: string;
  name: string;
  creator: string;
  currency: number;
  participantsCount: number;
  totalAmount: number;
  createdAt: string;
}

export interface ExportDetailRepsonse {
  id: string;
  name: string;
  currency: number;
  createdAt: string;
  participants: string[];
  bills: object[];
}