package com.ntt.notification_service.service;

import com.ntt.notification_service.dto.SendEmailRequest;
import com.ntt.notification_service.dto.response.EmailResponse;

public interface EmailProviderService {

    EmailResponse sendEmail(SendEmailRequest request);
}
