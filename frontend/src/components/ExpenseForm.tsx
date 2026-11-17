import React, { useState, useEffect } from 'react';
import { CreateExpenseRequest, ExpenseResponse } from '../types/expense';

interface ExpenseFormProps {
  onSubmit: (data: CreateExpenseRequest, clientDate?: string) => Promise<boolean>;
  editingExpense: ExpenseResponse | null;
  onCancelEdit: () => void;
  isLoading: boolean;
}

const DEFAULT_CATEGORIES = [
  'Food',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Housing',
  'Education',
  'Travel',
  'Other',
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  editingExpense,
  onCancelEdit,
  isLoading,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<{ title?: string; amount?: string; category?: string }>({});

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title || '');
      setAmount(editingExpense.amount ? editingExpense.amount.toString() : '');
      
      if (DEFAULT_CATEGORIES.includes(editingExpense.category)) {
        setCategory(editingExpense.category);
        setIsCustomCategory(false);
        setCustomCategory('');
      } else {
        setCategory('__custom__');
        setIsCustomCategory(true);
        setCustomCategory(editingExpense.category || '');
      }
    } else {
      resetForm();
    }
  }, [editingExpense]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory(DEFAULT_CATEGORIES[0]);
    setIsCustomCategory(false);
    setCustomCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: { title?: string; amount?: string; category?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title / Note is required';
    }

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    const numAmount = Math.round(Number(amount)); // Backend entity amount is int

    const payload: CreateExpenseRequest = {
      title: title.trim(),
      amount: numAmount,
      category: finalCategory,
    };

    const success = await onSubmit(payload, date);
    if (success && !editingExpense) {
      resetForm();
    }
  };

  return (
    <div className="card expense-form-card">
      <div className="card-header">
        <h3>{editingExpense ? '✏️ Edit Expense' : '➕ Add New Expense'}</h3>
        {editingExpense && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancelEdit}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Title / Note */}
        <div className="form-group">
          <label htmlFor="expense-title">
            Title / Note <span className="required">*</span>
          </label>
          <input
            id="expense-title"
            type="text"
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            placeholder="e.g., Grocery shopping, Taxi to office"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            disabled={isLoading}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
          <small className="form-hint">Maps to backend <code>title</code> field</small>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label htmlFor="expense-amount">
            Amount ($) <span className="required">*</span>
          </label>
          <input
            id="expense-amount"
            type="number"
            min="1"
            step="1"
            className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
            placeholder="e.g., 45"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            disabled={isLoading}
          />
          {errors.amount && <span className="error-text">{errors.amount}</span>}
          <small className="form-hint">Positive integer required by backend validation</small>
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="expense-category">
            Category <span className="required">*</span>
          </label>
          <select
            id="expense-category"
            className="form-control"
            value={isCustomCategory ? '__custom__' : category}
            onChange={(e) => {
              if (e.target.value === '__custom__') {
                setIsCustomCategory(true);
              } else {
                setIsCustomCategory(false);
                setCategory(e.target.value);
              }
              if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
            }}
            disabled={isLoading}
          >
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="__custom__">+ Custom Category...</option>
          </select>

          {isCustomCategory && (
            <input
              type="text"
              className={`form-control mt-2 ${errors.category ? 'is-invalid' : ''}`}
              placeholder="Enter custom category name"
              value={customCategory}
              onChange={(e) => {
                setCustomCategory(e.target.value);
                if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
              }}
              disabled={isLoading}
              autoFocus
            />
          )}
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>

        {/* Date Field */}
        <div className="form-group">
          <label htmlFor="expense-date">Date</label>
          <input
            id="expense-date"
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isLoading}
          />
          <small className="form-hint">
            Captured for client-side timeline &amp; date filtering (not stored in backend schema)
          </small>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Saving...</span>
            ) : editingExpense ? (
              'Save Changes (PUT)'
            ) : (
              'Add Expense (POST)'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
