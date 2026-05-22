export type MessageRole = "user" | "assistant";

export interface MessageData {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  sourcePage: number | null;
  audioPath: string | null;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  bookId: string;
  title: string | null;
  languageCode: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: MessageData | null;
}

export interface ConversationDetail {
  id: string;
  bookId: string;
  title: string | null;
  languageCode: string;
  createdAt: string;
  updatedAt: string;
  messages: MessageData[];
}

export interface CreateConversationDto {
  bookId: string;
  languageCode?: string;
}

export interface AddMessageDto {
  role: MessageRole;
  content: string;
  sourcePage?: number;
  audioPath?: string;
}
