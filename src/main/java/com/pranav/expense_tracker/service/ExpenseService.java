package com.pranav.expense_tracker.service;

import com.pranav.expense_tracker.dto.request.CreateExpenseRequest;
import com.pranav.expense_tracker.dto.response.ExpenseResponse;
import com.pranav.expense_tracker.entity.Expense;
import com.pranav.expense_tracker.entity.User;
import com.pranav.expense_tracker.exception.ExpenseNotFoundException;
import com.pranav.expense_tracker.exception.UserNotFoundException;
import com.pranav.expense_tracker.mapper.ExpenseMapper;
import com.pranav.expense_tracker.repositry.ExpenseRepository;
import com.pranav.expense_tracker.repositry.UserRepositry;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseService.class);

    private final ExpenseRepository expenseRepository;
    private final UserRepositry userRepositry;

    public ExpenseResponse saveExpense(CreateExpenseRequest request) {
        logger.info("Creating expense with title: {}", request.getTitle());
        Expense expense = ExpenseMapper.toEntity(request);
        Expense savedExpense = expenseRepository.save(expense);
        logger.info("Expense saved successfully with id: {}", savedExpense.getId());
        return ExpenseMapper.toResponse(savedExpense);
    }

    public Page<ExpenseResponse> findAllExpenses(Pageable pageable) {
        logger.info("Fetching expenses - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<ExpenseResponse> expenses = expenseRepository.findAll(pageable)
                .map(ExpenseMapper::toResponse);
        logger.info("Expenses found: {} of total {}", expenses.getNumberOfElements(), expenses.getTotalElements());
        return expenses;
    }

    public ExpenseResponse findExpenseById(Long id) {
        logger.info("Fetching expense with id: {}", id);
        Expense expense = expenseRepository.findById(id).orElseThrow(() -> {
            logger.warn("Expense not found with id: {}", id);
            return new ExpenseNotFoundException("Expense not found for id :" + id);
        });
        return ExpenseMapper.toResponse(expense);
    }

    public List<ExpenseResponse> findExpenseByCategory(String category) {
        logger.info("Fetching expenses by category: {}", category);
        List<ExpenseResponse> expenses = expenseRepository.findByCategory(category)
                .stream()
                .map(ExpenseMapper::toResponse)
                .toList();
        if (expenses.isEmpty()) {
            logger.warn("No expenses found for category: {}", category);
        } else {
            logger.info("Expenses found for category {}: {}", category, expenses.size());
        }
        return expenses;
    }

    public ExpenseResponse updateExpense(Long id, CreateExpenseRequest request) {
        logger.info("Updating expense with id: {}", id);
        Expense existingExpense = expenseRepository.findById(id).orElseThrow(() -> {
            logger.warn("Expense not found for update with id: {}", id);
            return new ExpenseNotFoundException("Expense not found for id :" + id);
        });

        existingExpense.setTitle(request.getTitle());
        existingExpense.setAmount(request.getAmount());
        existingExpense.setCategory(request.getCategory());

        Expense updatedExpense = expenseRepository.save(existingExpense);
        logger.info("Expense updated successfully with id: {}", updatedExpense.getId());
        return ExpenseMapper.toResponse(updatedExpense);
    }

    public void deleteExpense(Long id) {
        logger.info("Deleting expense with id: {}", id);
        expenseRepository.deleteById(id);
        logger.info("Expense deleted successfully with id: {}", id);
    }

    public ExpenseResponse createExpenseForUser(Long userId, CreateExpenseRequest request) {
        logger.info("Creating expense for user with id: {}", userId);
        User user = userRepositry.findById(userId).orElseThrow(() -> {
            logger.warn("User not found with id: {}", userId);
            return new UserNotFoundException("User not found with id :" + userId);
        });

        Expense expense = ExpenseMapper.toEntity(request);
        user.addExpense(expense);

        Expense savedExpense = expenseRepository.save(expense);
        logger.info("Expense created for user {} with expense id: {}", userId, savedExpense.getId());
        return ExpenseMapper.toResponse(savedExpense);
    }

    public List<ExpenseResponse> findExpensesByUserId(Long userId) {
        logger.info("Fetching expenses for user with id: {}", userId);
        userRepositry.findById(userId).orElseThrow(() -> {
            logger.warn("User not found with id: {}", userId);
            return new UserNotFoundException("User not found with id :" + userId);
        });

        List<ExpenseResponse> expenses = expenseRepository.findByUserId(userId)
                .stream()
                .map(ExpenseMapper::toResponse)
                .toList();
        logger.info("Expenses found for user {}: {}", userId, expenses.size());
        return expenses;
    }
}
