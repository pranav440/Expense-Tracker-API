package com.pranav.expense_tracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Name cannot be empty")
    private String name;
    @NotBlank(message = "Email cannot be empty")
    private String email;

    @OneToMany(mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<Expense> expenses = new ArrayList<>();

    public void addExpense(Expense expense) {
        expenses.add(expense);
        expense.setUser(this);
    }

    public void removeExpense(Expense expense) {
        expenses.remove(expense);
        expense.setUser(null);
    }
}