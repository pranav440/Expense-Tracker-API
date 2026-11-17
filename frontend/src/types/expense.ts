export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date?: string;
}

export interface CreateExpenseRequest {
  title: string;
  amount: number;
  category: string;
}

export interface ExpenseResponse {
  id: number;
  title: string;
  amount: number;
  category: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
    sort?: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset?: number;
    paged?: boolean;
    unpaged?: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface ExpenseFilterParams {
  category?: string;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'id' | 'amount' | 'title' | 'category';
  direction?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface BackendErrorResponse {
  timestamp: string;
  status: number;
  message: string;
}
