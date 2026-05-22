import { apiClient } from "@/lib/api/client";
import { API_CONFIG } from "@/lib/api/config";
import { BookSummary, BookDetail, CreateBookDto } from "@/types/books.types";

const BOOKS = API_CONFIG.ENDPOINTS.BOOKS;

export const booksService = {
  list(): Promise<BookSummary[]> {
    return apiClient.get<BookSummary[]>(BOOKS);
  },

  get(id: string): Promise<BookDetail> {
    return apiClient.get<BookDetail>(`${BOOKS}/${id}`);
  },

  upload(file: File, data: CreateBookDto): Promise<BookSummary> {
    const form = new FormData();
    form.append("file", file);
    form.append("title", data.title);
    if (data.author) form.append("author", data.author);
    if (data.language) form.append("language", data.language);
    return apiClient.post<BookSummary>(BOOKS, form, undefined, true);
  },

  process(id: string): Promise<void> {
    return apiClient.post<void>(`${BOOKS}/${id}/process`, {});
  },

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${BOOKS}/${id}`);
  },
};
