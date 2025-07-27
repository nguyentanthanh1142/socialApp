package com.ntt.notification_service.service;

import com.ntt.notification_service.dto.EmailRequest;
import com.ntt.notification_service.dto.SendEmailRequest;
import com.ntt.notification_service.dto.Sender;
import com.ntt.notification_service.dto.response.EmailResponse;
import com.ntt.notification_service.exception.AppException;
import com.ntt.notification_service.exception.ErrorCode;
import com.ntt.notification_service.repository.httpclient.EmailClient;
import feign.FeignException;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService {
    EmailClient emailClient;
    String apiKey = "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";
    public EmailResponse sendEmail(SendEmailRequest request){
        EmailRequest emailRequest = new EmailRequest().builder()
                .sender(Sender.builder()
                        .name("Thanh Nguyen")
                        .email("ntttyem1142@gmail.com")
                        .build())
                .to(List.of(request.getTo()))
                .subject(request.getSubject())
                .htmlContent(request.getHtmlContent())
                .build();
        try{
            return emailClient.sendEmail(apiKey,emailRequest);
        }
        catch(FeignException e){
        throw new AppException(ErrorCode.CANNOT_SEND_EMAIL);
        }
    }
}
