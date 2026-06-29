package com.pranav.expense_tracker.controller;

import com.pranav.expense_tracker.dto.request.CreateExpenseRequest;
import com.pranav.expense_tracker.dto.response.ExpenseResponse;
import com.pranav.expense_tracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> saveExpense(@Valid @RequestBody CreateExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.saveExpense(request));
    }

    @GetMapping
    public ResponseEntity<Page<ExpenseResponse>> getAllExpenses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(expenseService.findAllExpenses(PageRequest.of(page, size, sort)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.findExpenseById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ExpenseResponse>> getAllExpensesByCategory(@RequestParam String category){
        return ResponseEntity.ok(expenseService.findExpenseByCategory(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(@PathVariable Long id, @Valid @RequestBody CreateExpenseRequest request){
        return ResponseEntity.ok(expenseService.updateExpense(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id){
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}