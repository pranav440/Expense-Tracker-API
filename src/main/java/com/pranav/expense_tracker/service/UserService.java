package com.pranav.expense_tracker.service;

import com.pranav.expense_tracker.dto.request.CreateUserRequest;
import com.pranav.expense_tracker.dto.response.UserResponse;
import com.pranav.expense_tracker.entity.User;
import com.pranav.expense_tracker.exception.UserNotFoundException;
import com.pranav.expense_tracker.mapper.UserMapper;
import com.pranav.expense_tracker.repositry.UserRepositry;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepositry userRepositry;

    public UserResponse save(CreateUserRequest request) {
        logger.info("Creating user with email: {}", request.getEmail());
        User user = UserMapper.toUserEntity(request);
        User savedUser = userRepositry.save(user);
        logger.info("User saved successfully with id: {}", savedUser.getId());
        return UserMapper.toUserResponse(savedUser);
    }

    public UserResponse findById(Long id) {
        logger.info("Fetching user with id: {}", id);
        User user = userRepositry.findById(id).orElseThrow(() -> {
            logger.warn("User not found with id: {}", id);
            return new UserNotFoundException("User not found with id : " + id);
        });
        return UserMapper.toUserResponse(user);
    }

    public Page<UserResponse> findAll(Pageable pageable) {
        logger.info("Fetching users - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<UserResponse> users = userRepositry.findAll(pageable)
                .map(UserMapper::toUserResponse);
        logger.info("Users found: {} of total {}", users.getNumberOfElements(), users.getTotalElements());
        return users;
    }

    public void deleteById(Long id) {
        logger.info("Deleting user with id: {}", id);
        userRepositry.deleteById(id);
        logger.info("User deleted successfully with id: {}", id);
    }

    public UserResponse findByEmail(String email) {
        logger.info("Searching user by email: {}", email);
        User user = userRepositry.findByEmail(email).orElseThrow(() -> {
            logger.warn("User not found with email: {}", email);
            return new UserNotFoundException("User not found with email : " + email);
        });
        return UserMapper.toUserResponse(user);
    }

    public UserResponse updateUser(Long id, CreateUserRequest request) {
        logger.info("Updating user with id: {}", id);
        User existingUser = userRepositry.findById(id).orElseThrow(() -> {
            logger.warn("User not found for update with id: {}", id);
            return new UserNotFoundException("User not found with id : " + id);
        });

        existingUser.setName(request.getName());
        existingUser.setEmail(request.getEmail());

        User updatedUser = userRepositry.save(existingUser);
        logger.info("User updated successfully with id: {}", updatedUser.getId());
        return UserMapper.toUserResponse(updatedUser);
    }
}