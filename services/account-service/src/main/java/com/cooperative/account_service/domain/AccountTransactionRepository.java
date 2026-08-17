package com.cooperative.account_service.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {

    Page<AccountTransaction> findBySourceAccountIdOrDestinationAccountId(
            Long sourceAccountId,
            Long destinationAccountId,
            Pageable pageable);
}
