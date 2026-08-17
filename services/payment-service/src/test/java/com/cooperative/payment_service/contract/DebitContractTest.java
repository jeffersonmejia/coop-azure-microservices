package com.cooperative.payment_service.contract;

import com.cooperative.payment_service.client.DebitRequest;
import com.cooperative.payment_service.client.DebitResponse;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DebitContractTest {

    @Test
    void test_debit_request_has_required_fields() {
        DebitRequest request = new DebitRequest("1000000001", java.math.BigDecimal.valueOf(100), "ref-001");

        assertThat(request.accountNumber()).isEqualTo("1000000001");
        assertThat(request.amount()).isEqualByComparingTo(java.math.BigDecimal.valueOf(100));
        assertThat(request.reference()).isEqualTo("ref-001");
    }

    @Test
    void test_debit_response_success_structure() {
        DebitResponse response = DebitResponse.ok(42L);

        assertThat(response.success()).isTrue();
        assertThat(response.transactionId()).isEqualTo(42L);
        assertThat(response.message()).isEqualTo("Debit applied");
    }

    @Test
    void test_debit_response_failure_structure() {
        DebitResponse response = DebitResponse.failure("Insufficient balance");

        assertThat(response.success()).isFalse();
        assertThat(response.message()).isEqualTo("Insufficient balance");
        assertThat(response.transactionId()).isNull();
    }

    @Test
    void test_debit_response_json_format() {
        DebitResponse successResponse = DebitResponse.ok(1L);
        DebitResponse failureResponse = DebitResponse.failure("error");

        assertThat(successResponse).hasFieldOrProperty("success");
        assertThat(successResponse).hasFieldOrProperty("transactionId");
        assertThat(failureResponse).hasFieldOrProperty("success");
        assertThat(failureResponse).hasFieldOrProperty("message");
    }
}
