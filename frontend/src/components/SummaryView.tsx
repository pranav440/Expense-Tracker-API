import React, { useState } from 'react';
import { Expense } from '../types/expense';

interface SummaryViewProps {
  expenses: Expense[];
  title?: string;
}

interface CategoryAggregation {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  expenses,
  title = 'Summary Overview',
}) => {
  const [budgetLimit, setBudgetLimit] = useState<number>(1000);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState('1000');

  const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalCount = expenses.length;
  const averageSpent = totalCount > 0 ? Math.round(totalSpent / totalCount) : 0;

  // Group by category
  const categoryMap: { [cat: string]: { total: number; count: number } } = {};
  for (const exp of expenses) {
    const cat = exp.category || 'Uncategorized';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { total: 0, count: 0 };
    }
    categoryMap[cat].total += Number(exp.amount || 0);
    categoryMap[cat].count += 1;
  }

  const categoryBreakdown: CategoryAggregation[] = Object.keys(categoryMap)
    .map((cat) => ({
      category: cat,
      total: categoryMap[cat].total,
      count: categoryMap[cat].count,
      percentage: totalSpent > 0 ? Math.round((categoryMap[cat].total / totalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  const getCategoryColor = (cat: string) => {
    const hash = cat.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [210, 160, 280, 25, 340, 190, 45, 120];
    const hue = hues[hash % hues.length];
    return `hsl(${hue}, 70%, 45%)`;
  };

  const maxCategoryTotal = categoryBreakdown.length > 0 ? categoryBreakdown[0].total : 1;

  // Budget calculations
  const budgetUtilization = budgetLimit > 0 ? Math.min(100, Math.round((totalSpent / budgetLimit) * 100)) : 0;
  const isOverBudget = totalSpent > budgetLimit;

  const handleSaveBudget = () => {
    const val = Number(tempBudget);
    if (!isNaN(val) && val > 0) {
      setBudgetLimit(val);
    }
    setIsEditingBudget(false);
  };

  return (
    <div className="card summary-card">
      <div className="card-header">
        <div className="summary-title-container">
          <h3>📊 {title}</h3>
          <span className="summary-badge">{totalCount} Transactions</span>
        </div>

        {/* Budget Threshold Control */}
        <div className="budget-target-badge">
          {isEditingBudget ? (
            <div className="budget-edit-form">
              <span>Goal: $</span>
              <input
                type="number"
                min="10"
                step="50"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                className="budget-input"
                autoFocus
              />
              <button type="button" className="btn btn-primary btn-xs" onClick={handleSaveBudget}>
                Save
              </button>
            </div>
          ) : (
            <div className="budget-display" onClick={() => setIsEditingBudget(true)} title="Click to adjust monthly budget threshold">
              <span>Budget Goal: <strong>${budgetLimit.toLocaleString()}</strong> ✏️</span>
            </div>
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-box metric-primary">
          <div className="metric-label">Total Spent</div>
          <div className="metric-value">${totalSpent.toLocaleString()}</div>
          <div className="metric-subtext">Sum of visible records</div>
        </div>

        <div className="metric-box">
          <div className="metric-label">Budget Used</div>
          <div className="metric-value" style={{ color: isOverBudget ? 'var(--danger)' : 'inherit' }}>
            {budgetUtilization}%
          </div>
          <div className="metric-subtext">
            {isOverBudget ? '⚠️ Exceeded budget' : `$${(budgetLimit - totalSpent).toLocaleString()} remaining`}
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-label">Avg / Expense</div>
          <div className="metric-value">${averageSpent.toLocaleString()}</div>
          <div className="metric-subtext">Per transaction</div>
        </div>

        <div className="metric-box">
          <div className="metric-label">Top Category</div>
          <div className="metric-value text-truncate">
            {topCategory ? topCategory.category : 'N/A'}
          </div>
          <div className="metric-subtext">
            {topCategory ? `$${topCategory.total.toLocaleString()} (${topCategory.percentage}%)` : 'No records'}
          </div>
        </div>
      </div>

      {/* Budget Goal Progress Track */}
      <div className="budget-progress-container">
        <div className="budget-progress-labels">
          <span className="budget-label-text">
            Spending vs. Goal: <strong>${totalSpent.toLocaleString()}</strong> of ${budgetLimit.toLocaleString()}
          </span>
          <span className={`budget-status-pill ${isOverBudget ? 'pill-danger' : budgetUtilization > 80 ? 'pill-warning' : 'pill-success'}`}>
            {isOverBudget ? 'Over Budget' : budgetUtilization > 80 ? 'Near Limit' : 'Healthy'}
          </span>
        </div>
        <div className="progress-track" style={{ height: '10px' }}>
          <div
            className="progress-fill"
            style={{
              width: `${budgetUtilization}%`,
              backgroundColor: isOverBudget ? 'var(--danger)' : budgetUtilization > 80 ? 'var(--warning)' : 'var(--success)',
            }}
          />
        </div>
      </div>

      {/* Category Breakdown Section */}
      <div className="breakdown-section">
        <h4 className="breakdown-title">Category-wise Spending Breakdown</h4>

        {categoryBreakdown.length === 0 ? (
          <p className="text-muted text-center py-3">No expenses available for category breakdown.</p>
        ) : (
          <div className="category-bars-list">
            {categoryBreakdown.map((item) => {
              const color = getCategoryColor(item.category);
              const barWidth = Math.max(4, Math.round((item.total / maxCategoryTotal) * 100));

              return (
                <div key={item.category} className="category-bar-row">
                  <div className="category-bar-header">
                    <span className="cat-name">
                      <span
                        className="cat-indicator"
                        style={{ backgroundColor: color }}
                      />
                      <strong>{item.category}</strong>
                      <span className="cat-count">({item.count} {item.count === 1 ? 'item' : 'items'})</span>
                    </span>
                    <span className="cat-amounts">
                      <strong>${item.total.toLocaleString()}</strong>
                      <span className="cat-percentage">{item.percentage}%</span>
                    </span>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: color,
                      }}
                      title={`${item.category}: $${item.total} (${item.percentage}%)`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
