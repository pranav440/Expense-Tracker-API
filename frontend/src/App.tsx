import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { FilterBar } from './components/FilterBar';
import { SummaryView } from './components/SummaryView';
import { expenseApi, getErrorMessage } from './services/api';
import { Expense, CreateExpenseRequest, ExpenseResponse } from './types/expense';

export const App: React.FC = () => {
  // Mode state: Live API vs Demo Sandbox (default: Live API)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Data state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseResponse | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('id');
  const [direction, setDirection] = useState<string>('desc');

  // Client-side date map to persist user-assigned dates
  const [dateMap, setDateMap] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('expense_dates');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveClientDate = (id: number, dateStr?: string) => {
    if (!dateStr) return;
    setDateMap((prev) => {
      const updated = { ...prev, [id]: dateStr };
      try {
        localStorage.setItem('expense_dates', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const toggleDemoMode = () => {
    const nextMode = !isDemoMode;
    setIsDemoMode(nextMode);
    localStorage.setItem('expense_tracker_mode', nextMode ? 'demo' : 'live');
    setErrorMessage(null);
    setCurrentPage(0);
  };

  // Active API endpoint label
  const activeFilterEndpoint = useMemo(() => {
    if (isDemoMode) return 'Demo Mode Sandbox';
    if (selectedCategory) {
      return `GET /expenses/search?category=${encodeURIComponent(selectedCategory)}`;
    }
    return `GET /expenses?page=${currentPage}&size=${pageSize}&sortBy=${sortBy}&direction=${direction}`;
  }, [isDemoMode, selectedCategory, currentPage, pageSize, sortBy, direction]);

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (selectedCategory && !isDemoMode) {
        // Backend search endpoint: GET /expenses/search?category=...
        const data = await expenseApi.getByCategory(selectedCategory, false);
        const mapped: Expense[] = data.map((exp) => ({
          ...exp,
          date: dateMap[exp.id] || '',
        }));
        setExpenses(mapped);
        setTotalPages(1);
        setTotalElements(mapped.length);
        setIsBackendHealthy(true);
      } else {
        const pageData = await expenseApi.getAll({
          page: currentPage,
          size: pageSize,
          sortBy,
          direction,
        }, isDemoMode);

        const mapped: Expense[] = pageData.content.map((exp) => ({
          ...exp,
          date: (exp as unknown as Expense).date || dateMap[exp.id] || '',
        }));

        setExpenses(mapped);
        setTotalPages(pageData.totalPages || 1);
        setTotalElements(pageData.totalElements || 0);

        const categoriesFound = Array.from(new Set(pageData.content.map((e) => e.category).filter(Boolean)));
        setAllCategories((prev) => Array.from(new Set([...prev, ...categoriesFound])));
        if (!isDemoMode) setIsBackendHealthy(true);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      if (!isDemoMode) setIsBackendHealthy(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, isDemoMode, currentPage, pageSize, sortBy, direction, dateMap]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Client-side text & date filtering
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    if (selectedCategory && isDemoMode) {
      result = result.filter((exp) => exp.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (exp) =>
          exp.title.toLowerCase().includes(term) ||
          exp.category.toLowerCase().includes(term) ||
          String(exp.id).includes(term)
      );
    }
    if (dateFrom) {
      result = result.filter((exp) => !exp.date || exp.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((exp) => !exp.date || exp.date <= dateTo);
    }
    return result;
  }, [expenses, selectedCategory, isDemoMode, searchTerm, dateFrom, dateTo]);

  // Handle Form Submit (Create / Update)
  const handleFormSubmit = async (
    payload: CreateExpenseRequest,
    clientDate?: string
  ): Promise<boolean> => {
    setIsMutating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (editingExpense) {
        const updated = await expenseApi.update(editingExpense.id, payload, clientDate, isDemoMode);
        saveClientDate(updated.id, clientDate);
        setSuccessMessage(`Expense #${updated.id} ("${updated.title}") updated successfully!`);
        setEditingExpense(null);
      } else {
        const created = await expenseApi.create(payload, clientDate, isDemoMode);
        saveClientDate(created.id, clientDate);
        setSuccessMessage(`Expense #${created.id} ("${created.title}") added successfully!`);
      }

      await fetchExpenses();
      return true;
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // Handle Delete
  const handleDeleteExpense = async (id: number): Promise<boolean> => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await expenseApi.delete(id, isDemoMode);
      setSuccessMessage(`Expense #${id} deleted successfully.`);
      await fetchExpenses();
      return true;
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      return false;
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredExpenses.length === 0) {
      alert('No expense records to export.');
      return;
    }
    const headers = ['ID', 'Title', 'Category', 'Amount', 'Date'];
    const rows = filteredExpenses.map((exp) => [
      exp.id,
      `"${exp.title.replace(/"/g, '""')}"`,
      `"${exp.category.replace(/"/g, '""')}"`,
      exp.amount,
      exp.date || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Edit initiation
  const handleEditClick = (expense: Expense) => {
    setEditingExpense({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setDateFrom('');
    setDateTo('');
    setSortBy('id');
    setDirection('desc');
    setCurrentPage(0);
  };

  const isFiltered = Boolean(searchTerm || selectedCategory || dateFrom || dateTo || sortBy !== 'id' || direction !== 'desc');

  return (
    <div className="app-layout">
      <Navbar
        backendUrl={import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}
        isBackendHealthy={isBackendHealthy}
        onRefresh={fetchExpenses}
        isLoading={isLoading}
        isDemoMode={isDemoMode}
        onToggleDemoMode={toggleDemoMode}
      />

      <main className="main-content">
        {/* Offline Banner with Demo Mode CTA */}
        {isBackendHealthy === false && !isDemoMode && (
          <div className="alert alert-offline-banner">
            <div className="alert-content">
              <strong>⚠️ Spring Boot Backend Offline:</strong> Cannot reach <code>http://localhost:8080</code>.
              Make sure MySQL and your Spring Boot application are running, or switch to Demo Mode to test the UI immediately.
            </div>
            <button
              type="button"
              className="btn btn-warning btn-sm"
              onClick={toggleDemoMode}
            >
              ⚡ Switch to Demo Sandbox
            </button>
          </div>
        )}

        {/* Global Notifications */}
        {errorMessage && isBackendHealthy !== false && (
          <div className="alert alert-danger" role="alert">
            <div className="alert-content">
              <strong>Error:</strong> {errorMessage}
            </div>
            <button
              type="button"
              className="alert-close"
              onClick={() => setErrorMessage(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert">
            <div className="alert-content">
              <strong>Success:</strong> {successMessage}
            </div>
            <button
              type="button"
              className="alert-close"
              onClick={() => setSuccessMessage(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}

        {/* Summary View (Total Spent, Count, Category-wise breakdown & bars) */}
        <SummaryView
          expenses={filteredExpenses}
          title={isFiltered ? 'Filtered Expense Summary' : 'Total Expense Analytics'}
        />

        {/* Main Grid: Form on Left, Filter & List on Right */}
        <div className="content-grid">
          {/* Left Column: Add / Edit Form */}
          <div className="grid-sidebar">
            <ExpenseForm
              onSubmit={handleFormSubmit}
              editingExpense={editingExpense}
              onCancelEdit={() => setEditingExpense(null)}
              isLoading={isMutating}
            />
          </div>

          {/* Right Column: Filter Bar & Expense List Table */}
          <div className="grid-main">
            <FilterBar
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={(cat) => {
                setSelectedCategory(cat);
                setCurrentPage(0);
              }}
              categories={allCategories.length > 0 ? allCategories : [
                'Food', 'Transportation', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Housing', 'Education', 'Other'
              ]}
              dateFrom={dateFrom}
              onDateFromChange={setDateFrom}
              dateTo={dateTo}
              onDateToChange={setDateTo}
              sortBy={sortBy}
              onSortByChange={(sort) => {
                setSortBy(sort);
                setCurrentPage(0);
              }}
              direction={direction}
              onDirectionChange={(dir) => {
                setDirection(dir);
                setCurrentPage(0);
              }}
              onReset={handleResetFilters}
              onExportCsv={handleExportCsv}
              isFiltered={isFiltered}
              activeFilterEndpoint={activeFilterEndpoint}
              isDemoMode={isDemoMode}
            />

            <ExpenseList
              expenses={filteredExpenses}
              isLoading={isLoading}
              onEdit={handleEditClick}
              onDelete={handleDeleteExpense}
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(0);
              }}
              isCustomFiltered={Boolean(searchTerm || selectedCategory || dateFrom || dateTo)}
            />
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>
          Expense Tracker Full-Stack Application &bull; Spring Boot REST API + React 18
        </p>
      </footer>
    </div>
  );
};

export default App;
