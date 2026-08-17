package com.cooperative.account_service.web;

import com.cooperative.account_service.security.CurrentUser;
import com.cooperative.account_service.service.AccountService;
import com.cooperative.account_service.web.dto.AccountResponse;
import com.cooperative.account_service.web.dto.DebitRequest;
import com.cooperative.account_service.web.dto.DebitResponse;
import com.cooperative.account_service.web.dto.TransactionResponse;
import com.cooperative.account_service.web.dto.TransferRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final CurrentUser currentUser;

    public AccountController(AccountService accountService, CurrentUser currentUser) {
        this.accountService = accountService;
        this.currentUser = currentUser;
    }

    @GetMapping("/me")
    public List<AccountResponse> myAccounts() {
        return accountService.getMyAccounts(currentUser.getUserId());
    }

    @GetMapping("/me/transactions")
    public Page<TransactionResponse> myTransactions(@PageableDefault(size = 20) Pageable pageable) {
        return accountService.getTransactions(currentUser.getUserId(), pageable);
    }

    @PostMapping("/transfer")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse transfer(@Valid @RequestBody TransferRequest request) {
        return accountService.transfer(currentUser.getUserId(), request);
    }

    @PostMapping("/debit")
    public DebitResponse debit(@Valid @RequestBody DebitRequest request) {
        return accountService.debit(currentUser.getUserId(), request);
    }
}
