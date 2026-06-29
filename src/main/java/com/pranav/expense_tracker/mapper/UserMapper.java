package com.pranav.expense_tracker.mapper;

import com.pranav.expense_tracker.dto.request.CreateExpenseRequest;
import com.pranav.expense_tracker.dto.request.CreateUserRequest;
import com.pranav.expense_tracker.dto.response.UserResponse;
import com.pranav.expense_tracker.entity.Expense;
import com.pranav.expense_tracker.entity.User;

public class UserMapper{
    public static User toUserEntity(CreateUserRequest Request){
        return User.builder()
                .name(Request.getName())
                .email(Request.getEmail())
                .build();
    }
    public static UserResponse toUserResponse(User user){
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}