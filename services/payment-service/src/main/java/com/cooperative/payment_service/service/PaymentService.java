package com.cooperative.payment_service.service;

import com.cooperative.payment_service.client.AccountServiceClient;
import com.cooperative.payment_service.client.DebitResponse;
import com.cooperative.payment_service.domain.Payment;
import com.cooperative.payment_service.domain.PaymentRepository;
import com.cooperative.payment_service.domain.PaymentStatus;
import com.cooperative.payment_service.security.CurrentUser;
import com.cooperative.payment_service.web.dto.CreatePaymentRequest;
import com.cooperative.payment_service.web.dto.PaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AccountServiceClient accountServiceClient;
    private final CurrentUser currentUser;

    public PaymentService(
            PaymentRepository paymentRepository,
            AccountServiceClient accountServiceClient,
            CurrentUser currentUser) {
        this.paymentRepository = paymentRepository;
        this.accountServiceClient = accountServiceClient;
        this.currentUser = currentUser;
    }

    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request, String authorization) {
        Payment payment = new Payment();
        payment.setUserId(currentUser.getUserId());
        payment.setAccountNumber(request.accountNumber());
        payment.setAmount(request.amount());
        payment.setDescription(request.description());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setReference(UUID.randomUUID().toString());

        paymentRepository.save(payment);

        DebitResponse debitResult = accountServiceClient.requestDebit(payment, authorization);
        if (debitResult.success()) {
            payment.setStatus(PaymentStatus.COMPLETED);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(debitResult.message());
        }

        return PaymentResponse.from(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        return PaymentResponse.from(payment);
    }

    @Transactional(readOnly = true)
    public Page<PaymentResponse> listPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable)
                .map(PaymentResponse::from);
    }
}
