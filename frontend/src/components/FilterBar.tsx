import React from 'react';

interface FilterBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  dateFrom: string;
  onDateFromChange: (date: string) => void;
  dateTo: string;
  onDateToChange: (date: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  direction: string;
  onDirectionChange: (dir: string) => void;
  onReset: () => void;
  onExportCsv: () => void;
  isFiltered: boolean;
  activeFilterEndpoint: string;
  isDemoMode: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchTermChange,
  selectedCategory,
  onCategoryChange,
  categories,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  sortBy,
  onSortByChange,
  direction,
  onDirectionChange,
  onReset,
  onExportCsv,
  isFiltered,
  activeFilterEndpoint,
  isDemoMode,
}) => {
  return (
    <div className="card filter-card">
      <div className="filter-header">
        <div className="filter-title-group">
          <h4>🔍 Filter &amp; Search</h4>
          <span className="api-endpoint-badge">
            {isDemoMode ? (
              <span className="badge badge-demo">Sandbox Store</span>
            ) : (
              <span>Endpoint: <code>{activeFilterEndpoint}</code></span>
            )}
          </span>
        </div>

        <div className="filter-header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onExportCsv}
            title="Export currently filtered expenses to CSV file"
          >
            📥 Export CSV
          </button>
          {isFiltered && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={onReset}
            >
              Clear Filters ✕
            </button>
          )}
        </div>
      </div>

      <div className="filter-grid">
        {/* Search by Text */}
        <div className="filter-item">
          <label htmlFor="filter-search">Search Title / Note</label>
          <input
            id="filter-search"
            type="text"
            className="form-control"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="filter-item">
          <label htmlFor="filter-category">Category</label>
          <select
            id="filter-category"
            className="form-control"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="filter-item">
          <label htmlFor="filter-date-from">From Date</label>
          <input
            id="filter-date-from"
            type="date"
            className="form-control"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>

        {/* Date To */}
        <div className="filter-item">
          <label htmlFor="filter-date-to">To Date</label>
          <input
            id="filter-date-to"
            type="date"
            className="form-control"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>

        {/* Sort By */}
        <div className="filter-item">
          <label htmlFor="filter-sort-by">Sort By</label>
          <select
            id="filter-sort-by"
            className="form-control"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            <option value="id">ID</option>
            <option value="amount">Amount</option>
            <option value="title">Title</option>
            <option value="category">Category</option>
          </select>
        </div>

        {/* Direction */}
        <div className="filter-item">
          <label htmlFor="filter-direction">Direction</label>
          <select
            id="filter-direction"
            className="form-control"
            value={direction}
            onChange={(e) => onDirectionChange(e.target.value)}
          >
            <option value="desc">Descending (High to Low / Newest)</option>
            <option value="asc">Ascending (Low to High / Oldest)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
