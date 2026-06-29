package com.pranav.expense_tracker.repositry;

import com.pranav.expense_tracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense,Long> {
    List<Expense> findByCategory(String category);
    List<Expense> findByUserId(Long userId);
}