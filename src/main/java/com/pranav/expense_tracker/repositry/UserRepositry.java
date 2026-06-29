package com.pranav.expense_tracker.repositry;

import com.pranav.expense_tracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepositry extends JpaRepository<User,Long>{
        Optional<User> findByEmail(String email);
        }