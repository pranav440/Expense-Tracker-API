package com.pranav.expense_tracker.mapper;

import com.pranav.expense_tracker.dto.request.CreateExpenseRequest;
import com.pranav.expense_tracker.dto.response.ExpenseResponse;
import com.pranav.expense_tracker.entity.Expense;

public class ExpenseMapper {
    public static Expense toEntity(CreateExpenseRequest request){

        return Expense.builder()
                .title(request.getTitle())
                .amount(request.getAmount())
                .category(request.getCategory())
                .build();

    }
    public static ExpenseResponse toResponse(Expense expense){

        return ExpenseResponse.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .build();

    }
}