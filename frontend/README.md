# Expense Tracker - React Frontend

A clean, responsive React frontend designed to work with the **Expense Tracker Spring Boot REST API**.

---

## 🚀 Features

1. **Add Expense Form**:
   - Fields: Amount (positive integer validation), Category dropdown (with custom category support), Title/Note field (non-empty validation), and Date picker.
   - Submits `POST /expenses` with JSON payload `{ title, amount, category }`.
   - Supports editing existing records (`PUT /expenses/{id}`).

2. **Expense List Table**:
   - Displays all expenses with ID, Title / Note, Category pill, Amount, Date, and Actions.
   - **Edit Action**: Loads the expense into the form and updates via `PUT /expenses/{id}`.
   - **Delete Action**: Confirmation prompt preventing accidental deletion, then executes `DELETE /expenses/{id}`.
   - **Pagination**: Supports page navigation and page size selection (5, 10, 25, 50) using Spring Data JPA pageable parameters (`?page=0&size=10&sortBy=id&direction=desc`).

3. **Filter & Sort Bar**:
   - **Category Filter**: Directly triggers backend search endpoint `GET /expenses/search?category={category}`.
   - **Date Range Filter**: Filters records by date range.
   - **Sorting**: Allows sorting by `id`, `amount`, `title`, or `category` in `asc` or `desc` order (`GET /expenses?sortBy=...&direction=...`).
   - Displays active API endpoint being invoked.

4. **Summary View**:
   - Metric cards: Total Spent ($), Total Transactions, Average Spending per Transaction, Top Spending Category.
   - Category-wise Breakdown: Visual progress bar distribution with amounts and percentages for each category.

5. **Error & State Handling**:
   - Shows network status for backend connectivity (`http://localhost:8080`).
   - Centralized error alerts capturing backend Spring Boot validation messages (e.g. 400 Bad Request message from `@RestControllerAdvice`).
   - Empty state screens for when no expenses exist or filters match nothing.
   - Loading spinners during network calls.

---

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **HTTP Client**: Axios with centralized error interceptor & base URL config
- **Styling**: Modern, lightweight, responsive custom CSS (zero heavy runtime CSS-in-JS dependencies)
- **Icons & UI**: Unicode emojis & CSS progress tracks for high performance and zero bloat

---

## 🔌 API Endpoint Integration

| Component | HTTP Method | Endpoint | Description |
|-----------|-------------|----------|-------------|
| Expense List | `GET` | `/expenses?page={p}&size={s}&sortBy={sort}&direction={dir}` | Fetch paginated & sorted expenses |
| Filter Bar | `GET` | `/expenses/search?category={category}` | Fetch expenses matching a category |
| Add Form | `POST` | `/expenses` | Create a new expense (`{ title, amount, category }`) |
| Edit Form | `PUT` | `/expenses/{id}` | Update existing expense (`{ title, amount, category }`) |
| Delete Button | `DELETE` | `/expenses/{id}` | Remove an expense record |

---

## ⚙️ Configuration & Setup

### 1. Prerequisites
- Node.js 18+ (tested on Node v23)
- Spring Boot backend running on `http://localhost:8080`

### 2. Environment Variables
Create or inspect `.env` in the `frontend` root:
```env
VITE_API_BASE_URL=http://localhost:8080
```
*Note: Vite dev server also has a built-in proxy in `vite.config.ts` forwarding `/expenses` and `/users` to `http://localhost:8080` to prevent CORS issues during development.*

### 3. Install & Run
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```
Dev server starts at `http://localhost:5173`.
