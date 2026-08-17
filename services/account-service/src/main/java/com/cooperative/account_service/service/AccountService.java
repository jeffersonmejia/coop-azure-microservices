package com.cooperative.account_service.service;

import com.cooperative.account_service.domain.Account;
import com.cooperative.account_service.domain.AccountRepository;
import com.cooperative.account_service.domain.AccountStatus;
import com.cooperative.account_service.domain.AccountTransaction;
import com.cooperative.account_service.domain.AccountTransactionRepository;
import com.cooperative.account_service.domain.TransactionStatus;
import com.cooperative.account_service.domain.TransactionType;
import com.cooperative.account_service.web.dto.AccountResponse;
import com.cooperative.account_service.web.dto.DebitRequest;
import com.cooperative.account_service.web.dto.DebitResponse;
import com.cooperative.account_service.web.dto.TransactionResponse;
import com.cooperative.account_service.web.dto.TransferRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private static final BigDecimal INITIAL_BALANCE = new BigDecimal("1000.00");

    private final AccountRepository accountRepository;
    private final AccountTransactionRepository transactionRepository;

    public AccountService(
            AccountRepository accountRepository,
            AccountTransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public List<AccountResponse> getMyAccounts(Long userId) {
        ensureAccount(userId);
        return accountRepository.findByUserId(userId).stream()
                .map(AccountResponse::from)
                .toList();
    }

    @Transactional
    public Page<TransactionResponse> getTransactions(Long userId, Pageable pageable) {
        Account account = ensureAccount(userId);
        Page<AccountTransaction> page = transactionRepository
                .findBySourceAccountIdOrDestinationAccountId(account.getId(), account.getId(), pageable);
        return toResponses(page);
    }

    @Transactional
    public TransactionResponse transfer(Long userId, TransferRequest request) {
        Account source = ensureAccount(userId);

        if (source.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Source account is not active");
        }
        if (request.destinationAccount().equals(source.getAccountNumber())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source and destination accounts must be different");
        }

        Account destination = accountRepository.findByAccountNumber(request.destinationAccount())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Destination account not found"));
        if (destination.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Destination account is not active");
        }

        BigDecimal amount = request.amount();
        if (amount.compareTo(source.getBalance()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient balance");
        }

        source.setBalance(source.getBalance().subtract(amount));
        destination.setBalance(destination.getBalance().add(amount));

        AccountTransaction transaction = new AccountTransaction();
        transaction.setSourceAccountId(source.getId());
        transaction.setDestinationAccountId(destination.getId());
        transaction.setAmount(amount);
        transaction.setType(TransactionType.TRANSFER);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setReference(UUID.randomUUID().toString());
        transactionRepository.save(transaction);

        return TransactionResponse.from(transaction, source.getAccountNumber(), destination.getAccountNumber());
    }

    @Transactional
    public DebitResponse debit(Long userId, DebitRequest request) {
        Account account = accountRepository.findByAccountNumberAndUserId(request.accountNumber(), userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            return DebitResponse.failure("Account is not active");
        }
        if (request.amount().compareTo(account.getBalance()) > 0) {
            return DebitResponse.failure("Insufficient balance");
        }

        account.setBalance(account.getBalance().subtract(request.amount()));

        AccountTransaction transaction = new AccountTransaction();
        transaction.setSourceAccountId(account.getId());
        transaction.setAmount(request.amount());
        transaction.setType(TransactionType.PAYMENT);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setReference(request.reference());
        transactionRepository.save(transaction);

        return DebitResponse.success(transaction.getId());
    }

    private Account ensureAccount(Long userId) {
        return accountRepository.findFirstByUserIdAndStatus(userId, AccountStatus.ACTIVE)
                .orElseGet(() -> createDefaultAccount(userId));
    }

    private Account createDefaultAccount(Long userId) {
        Account account = new Account();
        account.setAccountNumber(generateAccountNumber(userId));
        account.setUserId(userId);
        account.setBalance(INITIAL_BALANCE);
        account.setStatus(AccountStatus.ACTIVE);
        Account saved = accountRepository.save(account);

        AccountTransaction deposit = new AccountTransaction();
        deposit.setDestinationAccountId(saved.getId());
        deposit.setAmount(INITIAL_BALANCE);
        deposit.setType(TransactionType.DEPOSIT);
        deposit.setStatus(TransactionStatus.COMPLETED);
        deposit.setReference("initial-deposit-" + saved.getId());
        transactionRepository.save(deposit);

        return saved;
    }

    private String generateAccountNumber(Long userId) {
        return String.format("%010d", 1_000_000_000L + userId);
    }

    private Page<TransactionResponse> toResponses(Page<AccountTransaction> page) {
        Set<Long> accountIds = new HashSet<>();
        page.getContent().forEach(transaction -> {
            if (transaction.getSourceAccountId() != null) {
                accountIds.add(transaction.getSourceAccountId());
            }
            if (transaction.getDestinationAccountId() != null) {
                accountIds.add(transaction.getDestinationAccountId());
            }
        });
        Map<Long, String> accountNumbers = accountRepository.findAllById(accountIds).stream()
                .collect(Collectors.toMap(Account::getId, Account::getAccountNumber, (a, b) -> a));
        return page.map(transaction -> TransactionResponse.from(
                transaction,
                transaction.getSourceAccountId() == null ? null : accountNumbers.get(transaction.getSourceAccountId()),
                transaction.getDestinationAccountId() == null ? null : accountNumbers.get(transaction.getDestinationAccountId())));
    }
}
