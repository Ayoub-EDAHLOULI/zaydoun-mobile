export type BookStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export interface BookSummary {
  id: string;
  title: string;
  author: string | null;
  language: string;
  totalPages: number;
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookDetail extends BookSummary {
  storagePath: string;
  stats: {
    totalChunks: number;
    totalConversations: number;
  };
}

export interface CreateBookDto {
  title: string;
  author?: string;
  language?: string;
}
