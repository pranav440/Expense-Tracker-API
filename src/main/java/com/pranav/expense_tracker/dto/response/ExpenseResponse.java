package com.pranav.expense_tracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponse {
    private Long id;
    private String title;
    private int amount;
    private String category;
}