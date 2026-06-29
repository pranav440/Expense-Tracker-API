package com.pranav.expense_tracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Positive(message = "Amount must be greater than 0")
    private int amount;
    @NotBlank(message = "Title cannot be empty")
    private String title;
    @NotBlank(message = "Category cannot be empty")
    private String category;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;
}

