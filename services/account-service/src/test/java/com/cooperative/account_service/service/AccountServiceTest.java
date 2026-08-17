package com.cooperative.account_service.service;

import com.cooperative.account_service.domain.Account;
import com.cooperative.account_service.domain.AccountRepository;
import com.cooperative.account_service.domain.AccountStatus;
import com.cooperative.account_service.domain.AccountTransactionRepository;
import com.cooperative.account_service.web.dto.DebitRequest;
import com.cooperative.account_service.web.dto.DebitResponse;
import com.cooperative.account_service.web.dto.TransferRequest;
import com.cooperative.account_service.web.dto.TransactionResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private AccountTransactionRepository transactionRepository;

    @InjectMocks
    private AccountService accountService;

    private Account createAccount(Long id, Long userId, String number, BigDecimal balance, AccountStatus status) {
        Account a = new Account();
        a.setId(id);
        a.setUserId(userId);
        a.setAccountNumber(number);
        a.setBalance(balance);
        a.setStatus(status);
        return a;
    }

    @Test
    void test_getMyAccounts_creates_default_account_if_none_exists() {
        when(accountRepository.findFirstByUserIdAndStatus(1L, AccountStatus.ACTIVE)).thenReturn(Optional.empty());
        Account saved = createAccount(1L, 1L, "1000000001", new BigDecimal("1000.00"), AccountStatus.ACTIVE);
        when(accountRepository.save(any(Account.class))).thenReturn(saved);
        when(accountRepository.findByUserId(1L)).thenReturn(List.of(saved));

        var accounts = accountService.getMyAccounts(1L);

        assertThat(accounts).hasSize(1);
        assertThat(accounts.get(0).balance()).isEqualByComparingTo(new BigDecimal("1000.00"));
    }

    @Test
    void test_getMyAccounts_returns_existing_accounts() {
        Account existing = createAccount(1L, 1L, "1000000001", new BigDecimal("500.00"), AccountStatus.ACTIVE);
        when(accountRepository.findFirstByUserIdAndStatus(1L, AccountStatus.ACTIVE)).thenReturn(Optional.of(existing));
        when(accountRepository.findByUserId(1L)).thenReturn(List.of(existing));

        var accounts = accountService.getMyAccounts(1L);

        assertThat(accounts).hasSize(1);
        assertThat(accounts.get(0).accountNumber()).isEqualTo("1000000001");
    }

    @Test
    void test_transfer_success() {
        Account source = createAccount(1L, 1L, "1000000001", new BigDecimal("1000.00"), AccountStatus.ACTIVE);
        Account destination = createAccount(2L, 2L, "1000000002", new BigDecimal("500.00"), AccountStatus.ACTIVE);
        when(accountRepository.findFirstByUserIdAndStatus(1L, AccountStatus.ACTIVE)).thenReturn(Optional.of(source));
        when(accountRepository.findByAccountNumber("1000000002")).thenReturn(Optional.of(destination));
        when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TransactionResponse response = accountService.transfer(1L, new TransferRequest("1000000002", new BigDecimal("200.00")));

        assertThat(source.getBalance()).isEqualByComparingTo(new BigDecimal("800.00"));
        assertThat(destination.getBalance()).isEqualByComparingTo(new BigDecimal("700.00"));
        assertThat(response.amount()).isEqualByComparingTo(new BigDecimal("200.00"));
    }

    @Test
    void test_transfer_insufficient_balance_throws_409() {
        Account source = createAccount(1L, 1L, "1000000001", new BigDecimal("100.00"), AccountStatus.ACTIVE);
        Account destination = createAccount(2L, 2L, "1000000002", new BigDecimal("500.00"), AccountStatus.ACTIVE);
        when(accountRepository.findFirstByUserIdAndStatus(1L, AccountStatus.ACTIVE)).thenReturn(Optional.of(source));
        when(accountRepository.findByAccountNumber("1000000002")).thenReturn(Optional.of(destination));

        assertThatThrownBy(() -> accountService.transfer(1L, new TransferRequest("1000000002", new BigDecimal("200.00"))))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void test_transfer_to_self_throws_400() {
        Account source = createAccount(1L, 1L, "1000000001", new BigDecimal("1000.00"), AccountStatus.ACTIVE);
        when(accountRepository.findFirstByUserIdAndStatus(1L, AccountStatus.ACTIVE)).thenReturn(Optional.of(source));

        assertThatThrownBy(() -> accountService.transfer(1L, new TransferRequest("1000000001", new BigDecimal("100.00"))))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void test_transfer_destination_not_found_throws_404() {
        Account source = createAccount(1L, 1L, "1000000001", new BigDecimal("1000.00"), AccountStatus.ACTIVE);
        when(accountRepository.findFirstByUserIdAndStatus(1L, AccountStatus.ACTIVE)).thenReturn(Optional.of(source));
        when(accountRepository.findByAccountNumber("9999999999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.transfer(1L, new TransferRequest("9999999999", new BigDecimal("100.00"))))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void test_debit_success() {
        Account account = createAccount(1L, 1L, "1000000001", new BigDecimal("500.00"), AccountStatus.ACTIVE);
        when(accountRepository.findByAccountNumberAndUserId("1000000001", 1L)).thenReturn(Optional.of(account));
        when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DebitResponse response = accountService.debit(1L, new DebitRequest("1000000001", new BigDecimal("100.00"), "ref-001"));

        assertThat(response.success()).isTrue();
        assertThat(account.getBalance()).isEqualByComparingTo(new BigDecimal("400.00"));
    }

    @Test
    void test_debit_insufficient_balance_returns_failure() {
        Account account = createAccount(1L, 1L, "1000000001", new BigDecimal("50.00"), AccountStatus.ACTIVE);
        when(accountRepository.findByAccountNumberAndUserId("1000000001", 1L)).thenReturn(Optional.of(account));

        DebitResponse response = accountService.debit(1L, new DebitRequest("1000000001", new BigDecimal("100.00"), "ref-001"));

        assertThat(response.success()).isFalse();
        assertThat(response.message()).containsIgnoringCase("insufficient");
    }

    @Test
    void test_debit_account_not_found_throws_404() {
        when(accountRepository.findByAccountNumberAndUserId("9999999999", 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.debit(1L, new DebitRequest("9999999999", new BigDecimal("100.00"), "ref")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
    }
}
