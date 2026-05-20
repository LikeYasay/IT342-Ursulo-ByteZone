package edu.cit.ursulo.bytezone.shared;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@bytezone.app}")
    private String fromAddress;

    private final boolean enabled;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username:}") String smtpUsername) {
        this.mailSender = mailSender;
        this.enabled = smtpUsername != null && !smtpUsername.isBlank();
        if (!this.enabled) {
            log.warn("[EmailService] SMTP credentials not configured. Email sending is DISABLED. " +
                    "Set SMTP_USERNAME and SMTP_PASSWORD environment variables to enable.");
        }
    }

    public void sendRegistrationEmail(String toEmail, String fullName) {
        String subject = "Welcome to ByteZone, " + fullName + "!";
        String body = """
                <html><body style="font-family:sans-serif;background:#000;color:#fff;padding:32px;">
                  <h1 style="color:#39d5ff;">Welcome to <span style="color:#fff;">Byte</span><span style="color:#39d5ff;">Zone</span>!</h1>
                  <p>Hi <strong>%s</strong>,</p>
                  <p>Your account has been created successfully. You can now log in and enjoy gaming sessions, book stations, and order snacks!</p>
                  <p style="color:#8a8f98;font-size:12px;">If you did not create this account, please ignore this email.</p>
                </body></html>
                """.formatted(fullName);
        send(toEmail, subject, body);
    }

    public void sendOrderReadyEmail(String toEmail, String fullName, Long orderId) {
        String subject = "Your ByteZone Order #" + orderId + " is Ready!";
        String body = """
                <html><body style="font-family:sans-serif;background:#000;color:#fff;padding:32px;">
                  <h1 style="color:#39d5ff;">Order Ready!</h1>
                  <p>Hi <strong>%s</strong>,</p>
                  <p>Your snack order <strong>#%d</strong> is now <strong>READY</strong> for pickup at your station.</p>
                  <p>Enjoy your gaming session! 🎮</p>
                </body></html>
                """.formatted(fullName, orderId);
        send(toEmail, subject, body);
    }

    public void sendPaymentConfirmedEmail(String toEmail, String fullName, Long paymentId) {
        String subject = "ByteZone Payment #" + paymentId + " Confirmed";
        String body = """
                <html><body style="font-family:sans-serif;background:#000;color:#fff;padding:32px;">
                  <h1 style="color:#39d5ff;">Payment Confirmed!</h1>
                  <p>Hi <strong>%s</strong>,</p>
                  <p>Your payment <strong>#%d</strong> has been confirmed. Thank you!</p>
                  <p style="color:#8a8f98;font-size:12px;">ByteZone Gaming Cafe</p>
                </body></html>
                """.formatted(fullName, paymentId);
        send(toEmail, subject, body);
    }

    private void send(String to, String subject, String htmlBody) {
        if (!enabled) {
            log.info("[EmailService] Skipping email to {} — SMTP not configured.", to);
            return;
        }
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(msg);
            log.info("[EmailService] Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("[EmailService] Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
