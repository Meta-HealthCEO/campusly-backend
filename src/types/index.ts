export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T> {
  pagination: PaginationMeta;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}
