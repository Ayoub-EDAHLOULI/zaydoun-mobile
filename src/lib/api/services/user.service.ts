import { apiClient } from "@/lib/api/client";
import { API_CONFIG } from "@/lib/api/config";
import { User } from "@/types/auth.types";

const USERS = API_CONFIG.ENDPOINTS.USERS;

export interface UserStats {
  totalCost: number | null;
  totalMessages: number;
  totalConversations: number;
  costDelta: number | null;
  messagesDelta: number | null;
  dailyBreakdown: Array<{ date: string; cost: number; messages: number }>;
  topConversations: Array<{
    id: string;
    title: string;
    cost: number;
    messages: number;
  }>;
}

export interface AdminOverview {
  totalUsers: number;
  totalBooks: number;
}

export type StatsPeriod = "day" | "week" | "month" | "all";

export const userService = {
  listUsers(accessToken: string): Promise<User[]> {
    return apiClient.get<User[]>(USERS, accessToken);
  },

  getStats(
    accessToken: string,
    period: StatsPeriod = "week",
  ): Promise<UserStats> {
    return apiClient.get<UserStats>(
      `${USERS}/me/stats?period=${period}`,
      accessToken,
    );
  },
};
