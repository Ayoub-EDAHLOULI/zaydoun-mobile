import { apiClient } from "@/lib/api/client";
import { API_CONFIG } from "@/lib/api/config";
import {
  ConversationSummary,
  ConversationDetail,
  CreateConversationDto,
  AddMessageDto,
  MessageData,
} from "@/types/conversations.types";

const CONV = API_CONFIG.ENDPOINTS.CONVERSATIONS;

export const conversationsService = {
  list(bookId?: string): Promise<ConversationSummary[]> {
    const query = bookId ? `?bookId=${bookId}` : "";
    return apiClient.get<ConversationSummary[]>(`${CONV}${query}`);
  },

  get(id: string): Promise<ConversationDetail> {
    return apiClient.get<ConversationDetail>(`${CONV}/${id}`);
  },

  create(data: CreateConversationDto): Promise<ConversationDetail> {
    return apiClient.post<ConversationDetail>(CONV, data);
  },

  addMessage(id: string, data: AddMessageDto): Promise<MessageData> {
    return apiClient.post<MessageData>(`${CONV}/${id}/messages`, data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${CONV}/${id}`);
  },
};
