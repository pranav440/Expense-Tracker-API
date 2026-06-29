package com.pranav.expense_tracker.exception;

import com.pranav.expense_tracker.entity.User;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
            super(message);
        }
    }
