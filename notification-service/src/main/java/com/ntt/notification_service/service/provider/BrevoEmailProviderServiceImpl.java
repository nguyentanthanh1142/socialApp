package com.ntt.notification_service.service.provider;

import com.ntt.notification_service.configuration.EmailProperties;
import com.ntt.notification_service.dto.EmailRequest;
import com.ntt.notification_service.dto.SendEmailRequest;
import com.ntt.notification_service.dto.Sender;
import com.ntt.notification_service.dto.response.EmailResponse;
import com.ntt.notification_service.exception.AppException;
import com.ntt.notification_service.exception.ErrorCode;
import com.ntt.notification_service.repository.httpclient.EmailClient;
import com.ntt.notification_service.service.EmailProviderService;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;

@Log4j2
@Service("brevoEmailProvider")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BrevoEmailProviderServiceImpl implements EmailProviderService {

    EmailClient emailClient;
    EmailProperties emailProperties;

    @Override
    public EmailResponse sendEmail(SendEmailRequest request) {

        Long templateId = null;
        if (request.getTemplateCode() != null && emailProperties.getTemplates() != null) {
            templateId = emailProperties.getTemplates().get(request.getTemplateCode());
        }

        if (templateId == null) {
            log.error("Template ID not found for code: {}", request.getTemplateCode());
            throw new AppException(ErrorCode.CANNOT_SEND_EMAIL);
        }

        EmailRequest emailRequest = EmailRequest.builder()
                .sender(Sender.builder()
                        .name(emailProperties.getSender().getName())
                        .email(emailProperties.getSender().getEmail())
                        .build())
                .to(List.of(request.getTo()))
                .subject(request.getSubject())
                .params(request.getParams())
                .templateId(templateId)
                .build();
        try{
            return emailClient.sendEmail(emailProperties.getApikey(),emailRequest);
        }
        catch(FeignException e){
            log.error("Brevo error detail: {}", e.contentUTF8());
            throw new AppException(ErrorCode.CANNOT_SEND_EMAIL);
        }
    }
}
