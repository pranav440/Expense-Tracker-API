package com.pranav.expense_tracker.controller;

import com.pranav.expense_tracker.dto.request.CreateExpenseRequest;
import com.pranav.expense_tracker.dto.request.CreateUserRequest;
import com.pranav.expense_tracker.dto.response.ExpenseResponse;
import com.pranav.expense_tracker.dto.response.UserResponse;
import com.pranav.expense_tracker.service.ExpenseService;
import com.pranav.expense_tracker.service.UserService;
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
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController{

    private final UserService userService;
    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<UserResponse> saveUser(@Valid @RequestBody CreateUserRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.save(request));
    }

    @GetMapping
    public ResponseEntity<Page<UserResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction){
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(userService.findAll(PageRequest.of(page, size, sort)));
    }

    @GetMapping ("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id){
        return ResponseEntity.ok(userService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id){
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<UserResponse> findByEmail(@RequestParam String email){
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody CreateUserRequest request){
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PostMapping("/{userId}/expenses")
    public ResponseEntity<ExpenseResponse> createExpenseForUser(
            @PathVariable Long userId,
            @Valid @RequestBody CreateExpenseRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpenseForUser(userId, request));
    }

    @GetMapping("/{userId}/expenses")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByUser(@PathVariable Long userId){
        return ResponseEntity.ok(expenseService.findExpensesByUserId(userId));
    }
}