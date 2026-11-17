import axios, { AxiosError } from 'axios';
import { CreateExpenseRequest, ExpenseResponse, PageResponse, BackendErrorResponse, Expense } from '../types/expense';

const BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<BackendErrorResponse>;
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message;
    }
    if (axiosErr.response?.status === 404) {
      return 'The requested resource was not found (404).';
    }
    if (axiosErr.response?.status === 500) {
      return 'Server error (500). Please check backend console / MySQL database connection.';
    }
    if (axiosErr.code === 'ERR_NETWORK') {
      return 'Cannot connect to Spring Boot backend at ' + BASE_URL + '. Ensure the backend is running on port 8080 and MySQL is active.';
    }
    return axiosErr.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// Initial seed data for Demo Mode
const INITIAL_DEMO_EXPENSES: Expense[] = [
  { id: 1, title: 'Whole Foods Grocery Run', amount: 125, category: 'Food', date: '2026-11-16' },
  { id: 2, title: 'Monthly Metro Card', amount: 65, category: 'Transportation', date: '2026-11-14' },
  { id: 3, title: 'Electric & Gas Utility Bill', amount: 80, category: 'Utilities', date: '2026-11-11' },
  { id: 4, title: 'Concert & Movie Tickets', amount: 75, category: 'Entertainment', date: '2026-11-09' },
  { id: 5, title: 'Office Ergonomic Chair', amount: 190, category: 'Shopping', date: '2026-11-07' },
  { id: 6, title: 'Dental Cleaning & Prescription', amount: 95, category: 'Healthcare', date: '2026-11-04' },
  { id: 7, title: 'Full-Stack Web Dev Course', amount: 49, category: 'Education', date: '2026-11-02' },
  { id: 8, title: 'Apartment Maintenance & Water', amount: 120, category: 'Housing', date: '2026-10-30' },
  { id: 9, title: 'Weekend Coffee & Brunch', amount: 38, category: 'Food', date: '2026-10-27' },
  { id: 10, title: 'Airport Ride / Rideshare', amount: 42, category: 'Transportation', date: '2026-10-24' },
];

class DemoStore {
  private expenses: Expense[] = [];
  private nextId = 11;

  constructor() {
    this.reset();
  }

  reset() {
    const saved = localStorage.getItem('demo_expenses_data');
    if (saved) {
      try {
        this.expenses = JSON.parse(saved);
        this.nextId = Math.max(...this.expenses.map((e) => e.id), 10) + 1;
        return;
      } catch {
        // Fall back to default
      }
    }
    this.expenses = [...INITIAL_DEMO_EXPENSES];
    this.save();
  }

  private save() {
    try {
      localStorage.setItem('demo_expenses_data', JSON.stringify(this.expenses));
    } catch {
      // Ignore
    }
  }

  getAll(page = 0, size = 10, sortBy = 'id', direction = 'desc'): PageResponse<ExpenseResponse> {
    const sorted = [...this.expenses].sort((a, b) => {
      let valA: string | number = (a as unknown as Record<string, string | number>)[sortBy] ?? a.id;
      let valB: string | number = (b as unknown as Record<string, string | number>)[sortBy] ?? b.id;
      if (typeof valA === 'string') {
        return direction === 'asc' 
          ? (valA as string).localeCompare(valB as string) 
          : (valB as string).localeCompare(valA as string);
      }
      return direction === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    });

    const start = page * size;
    const content = sorted.slice(start, start + size);
    const totalPages = Math.max(1, Math.ceil(sorted.length / size));

    return {
      content,
      totalPages,
      totalElements: sorted.length,
      last: page >= totalPages - 1,
      size,
      number: page,
      numberOfElements: content.length,
      first: page === 0,
      empty: content.length === 0,
    };
  }

  searchByCategory(category: string): ExpenseResponse[] {
    return this.expenses.filter((e) => e.category.toLowerCase() === category.toLowerCase());
  }

  getById(id: number): ExpenseResponse {
    const item = this.expenses.find((e) => e.id === id);
    if (!item) throw new Error(`Expense not found for id: ${id}`);
    return item;
  }

  create(req: CreateExpenseRequest, dateStr?: string): ExpenseResponse {
    const newItem: Expense = {
      id: this.nextId++,
      title: req.title,
      amount: req.amount,
      category: req.category,
      date: dateStr || new Date().toISOString().split('T')[0],
    };
    this.expenses.unshift(newItem);
    this.save();
    return newItem;
  }

  update(id: number, req: CreateExpenseRequest, dateStr?: string): ExpenseResponse {
    const index = this.expenses.findIndex((e) => e.id === id);
    if (index === -1) throw new Error(`Expense not found for id: ${id}`);
    const updated: Expense = {
      ...this.expenses[index],
      title: req.title,
      amount: req.amount,
      category: req.category,
      date: dateStr || this.expenses[index].date,
    };
    this.expenses[index] = updated;
    this.save();
    return updated;
  }

  delete(id: number): void {
    this.expenses = this.expenses.filter((e) => e.id !== id);
    this.save();
  }
}

export const demoStore = new DemoStore();

export const expenseApi = {
  async getAll(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
  }, isDemoMode = false): Promise<PageResponse<ExpenseResponse>> {
    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 150));
      return demoStore.getAll(params?.page, params?.size, params?.sortBy, params?.direction);
    }
    const response = await apiClient.get<PageResponse<ExpenseResponse>>('/expenses', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sortBy: params?.sortBy ?? 'id',
        direction: params?.direction ?? 'desc',
      },
    });
    return response.data;
  },

  async getById(id: number, isDemoMode = false): Promise<ExpenseResponse> {
    if (isDemoMode) {
      return demoStore.getById(id);
    }
    const response = await apiClient.get<ExpenseResponse>(`/expenses/${id}`);
    return response.data;
  },

  async getByCategory(category: string, isDemoMode = false): Promise<ExpenseResponse[]> {
    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 100));
      return demoStore.searchByCategory(category);
    }
    const response = await apiClient.get<ExpenseResponse[]>('/expenses/search', {
      params: { category },
    });
    return response.data;
  },

  async create(data: CreateExpenseRequest, clientDate?: string, isDemoMode = false): Promise<ExpenseResponse> {
    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 200));
      return demoStore.create(data, clientDate);
    }
    const response = await apiClient.post<ExpenseResponse>('/expenses', data);
    return response.data;
  },

  async update(id: number, data: CreateExpenseRequest, clientDate?: string, isDemoMode = false): Promise<ExpenseResponse> {
    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 200));
      return demoStore.update(id, data, clientDate);
    }
    const response = await apiClient.put<ExpenseResponse>(`/expenses/${id}`, data);
    return response.data;
  },

  async delete(id: number, isDemoMode = false): Promise<void> {
    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 150));
      demoStore.delete(id);
      return;
    }
    await apiClient.delete(`/expenses/${id}`);
  },
};
