import { apiClient } from "@/lib/api/client";
import { API_CONFIG } from "@/lib/api/config";
import { xhrUpload } from "@/lib/api/xhrUpload";
import { BookSummary, BookDetail, CreateBookDto } from "@/types/books.types";

const BOOKS = API_CONFIG.ENDPOINTS.BOOKS;

export const booksService = {
  list(): Promise<BookSummary[]> {
    return apiClient.get<BookSummary[]>(BOOKS);
  },

  get(id: string): Promise<BookDetail> {
    return apiClient.get<BookDetail>(`${BOOKS}/${id}`);
  },

  upload(
    file: { uri: string; name: string; mimeType: string },
    data: CreateBookDto,
  ): Promise<BookSummary> {
    return xhrUpload<BookSummary>(BOOKS, {
      file: { uri: file.uri, name: file.name, type: file.mimeType },
      title: data.title,
      author: data.author,
      language: data.language,
    });
  },

  process(id: string): Promise<void> {
    return apiClient.post<void>(`${BOOKS}/${id}/process`, {});
  },

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${BOOKS}/${id}`);
  },
};
