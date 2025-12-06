export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export enum MessageContentType {
  TEXT = 'TEXT',
  ACCOUNT_FORM = 'ACCOUNT_FORM'
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  contentType?: MessageContentType;
  timestamp: Date;
  isThinking?: boolean;
}

export enum AccountType {
  LOCAL = 'LOCAL',
  NON_LOCAL = 'NON_LOCAL',
  UNSPECIFIED = 'UNSPECIFIED'
}

export interface UserAccount {
  accountNumber: string;
  name: string;
  balance: number;
  type: AccountType;
  identityCard: string;
  isVerified: boolean;
  employer?: string;
  salary?: string;
  passportFile?: string;
}

export enum AppState {
  WELCOME = 'WELCOME',
  CHATTING = 'CHATTING',
  BIOMETRIC_SCAN = 'BIOMETRIC_SCAN',
  DASHBOARD = 'DASHBOARD'
}

export interface Transaction {
  id: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  date: Date;
}