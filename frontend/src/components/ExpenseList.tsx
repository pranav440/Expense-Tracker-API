import React, { useState } from 'react';
import { Expense } from '../types/expense';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => Promise<boolean>;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
  pageSize: number;
  onPageSizeChange: (newSize: number) => void;
  isCustomFiltered: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  isLoading,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  pageSize,
  onPageSizeChange,
  isCustomFiltered,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const getCategoryColor = (cat: string) => {
    const hash = cat.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [210, 160, 280, 25, 340, 190, 45, 120];
    const hue = hues[hash % hues.length];
    return `hsl(${hue}, 70%, 45%)`;
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async (id: number) => {
    setIsDeleting(true);
    await onDelete(id);
    setIsDeleting(false);
    setDeletingId(null);
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  return (
    <div className="card expense-list-card">
      <div className="card-header">
        <div className="header-title-container">
          <h3>📋 Expenses ({isCustomFiltered ? expenses.length : totalElements})</h3>
          {isLoading && <span className="loading-tag">Updating...</span>}
        </div>

        <div className="page-size-selector">
          <label htmlFor="page-size-select">Show: </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="form-control-inline"
            disabled={isLoading}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {isLoading && expenses.length === 0 ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading expenses from backend...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💸</div>
          <h4>No expenses found</h4>
          <p>
            {isCustomFiltered
              ? 'No expenses matched your filter criteria. Try adjusting or clearing your filters.'
              : 'You haven\'t added any expenses yet. Use the form to record your first expense!'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="expense-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Title / Note</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ width: '120px' }}>Date</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => {
                const isItemDeleting = deletingId === expense.id;
                return (
                  <tr key={expense.id} className={isItemDeleting ? 'row-deleting' : ''}>
                    <td className="cell-id">#{expense.id}</td>
                    <td className="cell-title">
                      <strong>{expense.title}</strong>
                    </td>
                    <td className="cell-category">
                      <span
                        className="category-pill"
                        style={{
                          backgroundColor: `${getCategoryColor(expense.category)}18`,
                          color: getCategoryColor(expense.category),
                          borderColor: `${getCategoryColor(expense.category)}40`,
                        }}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td className="cell-amount" style={{ textAlign: 'right' }}>
                      <span className="amount-value">
                        ${Number(expense.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="cell-date">
                      {expense.date || <span className="text-muted">—</span>}
                    </td>
                    <td className="cell-actions" style={{ textAlign: 'center' }}>
                      {isItemDeleting ? (
                        <div className="delete-confirm-box">
                          <span className="confirm-prompt">Sure?</span>
                          <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            onClick={() => handleConfirmDelete(expense.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? '...' : 'Yes'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={handleCancelDelete}
                            disabled={isDeleting}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => onEdit(expense)}
                            title="Edit this expense (PUT /expenses/{id})"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteClick(expense.id)}
                            title="Delete this expense (DELETE /expenses/{id})"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar (when not filtering by custom category search that returns raw list) */}
      {totalPages > 1 && (
        <div className="pagination-bar">
          <div className="pagination-info">
            Page {currentPage + 1} of {totalPages} ({totalElements} total items)
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 0 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
            >
              ◀ Previous
            </button>
            <span className="current-page-badge">{currentPage + 1}</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage >= totalPages - 1 || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
