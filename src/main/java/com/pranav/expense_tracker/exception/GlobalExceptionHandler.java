package com.pranav.expense_tracker.exception;

import com.pranav.expense_tracker.dto.response.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ExpenseNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleExpenseNotFound(
            ExpenseNotFoundException ex){
        logger.error("Expense Not Found: {}", ex.getMessage());

        ErrorResponse error =
                new ErrorResponse(
                        LocalDateTime.now(),
                        HttpStatus.NOT_FOUND.value(),
                        ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(error);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(
            UserNotFoundException ex){
        logger.error("User Not Found: {}", ex.getMessage());

        ErrorResponse error =
                new ErrorResponse(
                        LocalDateTime.now(),
                        HttpStatus.NOT_FOUND.value(),
                        ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex){

        String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        logger.error("Validation Failed: {}", message);

        ErrorResponse error =
                new ErrorResponse(
                        LocalDateTime.now(),
                        HttpStatus.BAD_REQUEST.value(),
                        message);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(error);
    }
}
