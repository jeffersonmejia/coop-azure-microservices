package com.cooperative.account_service.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByAccountNumber(String accountNumber);

    Optional<Account> findByAccountNumberAndUserId(String accountNumber, Long userId);

    List<Account> findByUserId(Long userId);

    Optional<Account> findFirstByUserIdAndStatus(Long userId, AccountStatus status);
}
