package com.ntt.notification_service.service;

import com.ntt.notification_service.dto.SendEmailRequest;
import com.ntt.notification_service.dto.response.EmailResponse;
import org.springframework.beans.factory.annotation.Value;
import com.ntt.notification_service.exception.AppException;
import com.ntt.notification_service.exception.ErrorCode;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.stereotype.Service;

import java.util.Map;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService {

    Map<String, EmailProviderService> emailProviders;

    @Value("${spring.notification.email.provider:brevoEmailProvider}")
    @NonFinal
    String currentProvider;


    public EmailResponse sendEmail(SendEmailRequest request) {
        EmailProviderService provider = emailProviders.get(currentProvider);

        if (provider == null) {
            throw new AppException(ErrorCode.CANNOT_SEND_EMAIL);
        }

        return provider.sendEmail(request);
    }
}
