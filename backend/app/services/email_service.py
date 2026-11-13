import os
import smtplib
import ssl
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import httpx

from app.core.config import get_settings
from app.services.qr_service import generate_qr_code_bytes

logger = logging.getLogger("eventhub.email")
settings = get_settings()

def build_ticket_html(
    attendee_name: str,
    event_title: str,
    event_date: str,
    event_location: str,
    registration_id: str,
    ticket_url: str,
    is_preview: bool = False
) -> str:
    """Builds a responsive, sky-blue and white branded HTML email template."""
    qr_img_src = "cid:ticket_qr" if not is_preview else f"/api/v1/tickets/{registration_id}"

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Ticket for {event_title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Sky Blue Header -->
          <tr>
            <td style="background-color: #0284C7; padding: 24px 30px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #E0F2FE; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Official Event Pass</p>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 700; line-height: 1.3;">{event_title}</h1>
            </td>
          </tr>

          <!-- QR Code Section -->
          <tr>
            <td align="center" style="background-color: #F8FAFC; padding: 28px 20px; border-bottom: 2px dashed #E2E8F0;">
              <div style="background-color: #FFFFFF; padding: 12px; border-radius: 8px; border: 1px solid #E2E8F0; display: inline-block;">
                <img src="{qr_img_src}" alt="Ticket QR Code" width="200" height="200" style="display: block; border-radius: 4px;" />
              </div>
              <p style="margin: 12px 0 0 0; font-family: monospace; font-size: 11px; color: #64748B;">
                Ref: EH-{registration_id[:8].upper()}
              </p>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #475569; font-weight: 500;">
                Present this QR code on your phone at the entrance
              </p>
            </td>
          </tr>

          <!-- Attendee & Event Details -->
          <tr>
            <td style="padding: 24px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-bottom: 14px;">
                    <p style="margin: 0; font-size: 11px; color: #94A3B8; text-transform: uppercase; font-weight: 600;">Attendee Name</p>
                    <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600; color: #0F172A;">{attendee_name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 14px;">
                    <p style="margin: 0; font-size: 11px; color: #94A3B8; text-transform: uppercase; font-weight: 600;">Date & Time</p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; font-weight: 500; color: #334155;">{event_date}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="margin: 0; font-size: 11px; color: #94A3B8; text-transform: uppercase; font-weight: 600;">Location / Venue</p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; font-weight: 500; color: #334155;">{event_location}</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <a href="{ticket_url}" target="_blank" style="display: inline-block; background-color: #0284C7; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">
                      View Digital Pass on Web →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 16px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                Powered by EventHub • You received this because you registered for this event.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_ticket_confirmation_email(
    to_email: str,
    attendee_name: str,
    event_title: str,
    event_date: str,
    event_location: str,
    registration_id: str,
    ticket_token: str,
):
    """
    Sends an event pass with embedded scannable QR code directly to the attendee's email.
    Works with:
    1. Free Gmail SMTP or any custom SMTP
    2. Resend API (if configured)
    3. Safe Local Dev Preview (saves full email to disk if no credentials configured)
    """
    if not to_email or "@" not in to_email:
        logger.warning(f"Skipping ticket email: invalid address '{to_email}'")
        return

    frontend_url = settings.FRONTEND_URL.rstrip("/")
    ticket_url = f"{frontend_url}/ticket/{registration_id}"

    # 1. Generate QR Code bytes
    qr_bytes = generate_qr_code_bytes(ticket_token)

    # 2. Check if SMTP credentials exist
    smtp_user = settings.SMTP_USER.strip()
    smtp_pass = settings.SMTP_PASS.strip()
    smtp_from = settings.SMTP_FROM.strip() or smtp_user or "tickets@eventhub.local"

    # Option A: Send via SMTP (Brevo or Gmail SMTP - Verified)
    if smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart("related")
            msg["Subject"] = f"Your Ticket: {event_title} 🎟️"
            msg["From"] = f"EventHub <{smtp_from}>"
            msg["To"] = to_email

            # Alternative part (text + html)
            alt_part = MIMEMultipart("alternative")
            plain_text = (
                f"Hello {attendee_name},\n\n"
                f"Your registration for {event_title} is confirmed!\n\n"
                f"Date: {event_date}\n"
                f"Location: {event_location}\n"
                f"Ticket ID: EH-{registration_id[:8].upper()}\n\n"
                f"View your digital pass online:\n{ticket_url}\n\n"
                f"Please present the QR code on your pass at the entrance."
            )
            alt_part.attach(MIMEText(plain_text, "plain"))

            html_content = build_ticket_html(
                attendee_name=attendee_name,
                event_title=event_title,
                event_date=event_date,
                event_location=event_location,
                registration_id=registration_id,
                ticket_url=ticket_url,
                is_preview=False
            )
            alt_part.attach(MIMEText(html_content, "html"))
            msg.attach(alt_part)

            # Inline QR Image for CID reference
            qr_image = MIMEImage(qr_bytes, _subtype="png")
            qr_image.add_header("Content-ID", "<ticket_qr>")
            qr_image.add_header("Content-Disposition", "inline", filename=f"ticket_qr_{registration_id[:8]}.png")
            msg.attach(qr_image)

            # Connect and send
            if settings.SMTP_PORT == 465:
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context) as server:
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_from, [to_email], msg.as_string())
            else:
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    if settings.SMTP_USE_TLS:
                        server.starttls(context=ssl.create_default_context())
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_from, [to_email], msg.as_string())

            logger.info(f"Successfully sent ticket pass email via SMTP to {to_email}")
            print(f"📧 [EMAIL DELIVERED] Sent QR ticket for '{event_title}' to {to_email} via SMTP")
            return
        except Exception as e:
            logger.error(f"Failed to send email via SMTP to {to_email}: {e}")
            print(f"⚠️ [SMTP ERROR] Failed to send email to {to_email}: {e}")

    # Option B: Send via Brevo REST API (300 free emails/day)
    elif settings.BREVO_API_KEY.strip():
        try:
            import base64
            qr_b64 = base64.b64encode(qr_bytes).decode("utf-8")
            html_content = build_ticket_html(
                attendee_name=attendee_name,
                event_title=event_title,
                event_date=event_date,
                event_location=event_location,
                registration_id=registration_id,
                ticket_url=ticket_url,
                is_preview=False
            )
            sender_email = settings.BREVO_SENDER_EMAIL.strip() or "anutosh.yadaw2506@gmail.com"
            resp = httpx.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={
                    "api-key": settings.BREVO_API_KEY.strip(),
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                json={
                    "sender": {"name": "EventHub Tickets", "email": sender_email},
                    "to": [{"email": to_email, "name": attendee_name}],
                    "subject": f"Your Ticket: {event_title} 🎟️",
                    "htmlContent": html_content,
                    "attachment": [
                        {
                            "name": f"EventPass_QR_{registration_id[:8]}.png",
                            "content": qr_b64
                        }
                    ]
                },
                timeout=12.0
            )
            if resp.status_code in [200, 201]:
                logger.info(f"Successfully sent ticket pass email via Brevo to {to_email}")
                print(f"📧 [EMAIL DELIVERED] Sent QR ticket for '{event_title}' to {to_email} via Brevo")
                return
            else:
                logger.error(f"Brevo API error: {resp.text}")
                print(f"⚠️ [BREVO ERROR] Status {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.error(f"Failed to send email via Brevo to {to_email}: {e}")
            print(f"⚠️ [BREVO ERROR] {e}")

    # Option B: Send via Resend API if key is present
    elif settings.RESEND_API_KEY.strip():
        try:
            import base64
            qr_b64 = base64.b64encode(qr_bytes).decode("utf-8")
            html_content = build_ticket_html(
                attendee_name=attendee_name,
                event_title=event_title,
                event_date=event_date,
                event_location=event_location,
                registration_id=registration_id,
                ticket_url=ticket_url,
                is_preview=False
            )
            resp = httpx.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY.strip()}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": smtp_from or "EventHub <onboarding@resend.dev>",
                    "to": [to_email],
                    "subject": f"Your Ticket: {event_title} 🎟️",
                    "html": html_content,
                    "attachments": [
                        {
                            "filename": f"EventPass_QR_{registration_id[:8]}.png",
                            "content": qr_b64,
                        }
                    ]
                },
                timeout=10.0
            )
            if resp.status_code in [200, 201]:
                logger.info(f"Successfully sent ticket pass email via Resend to {to_email}")
                print(f"📧 [EMAIL DELIVERED] Sent QR ticket for '{event_title}' to {to_email} via Resend")
                return
            else:
                logger.error(f"Resend error: {resp.text}")
                print(f"⚠️ [RESEND ERROR] Status {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.error(f"Failed to send email via Resend to {to_email}: {e}")
            print(f"⚠️ [RESEND ERROR] {e}")

    # Option C: Local Dev Mode (No SMTP credentials configured yet)
    # Save the exact HTML email to sent_emails/ so it can be previewed immediately!
    try:
        import base64
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        emails_dir = os.path.join(backend_dir, "sent_emails")
        os.makedirs(emails_dir, exist_ok=True)
        
        qr_b64 = base64.b64encode(qr_bytes).decode("utf-8")
        preview_html = build_ticket_html(
            attendee_name=attendee_name,
            event_title=event_title,
            event_date=event_date,
            event_location=event_location,
            registration_id=registration_id,
            ticket_url=ticket_url,
            is_preview=True
        ).replace('src="/api/v1/tickets/' + registration_id + '"', f'src="data:image/png;base64,{qr_b64}"')

        file_path = os.path.join(emails_dir, f"ticket_{registration_id[:8]}_{to_email.replace('@', '_at_')}.html")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(preview_html)

        print(f"📬 [TICKET EMAIL PREVIEW SAVED] Recipient: {to_email} | File: {file_path}")
        logger.info(f"Ticket email preview saved to {file_path}")
    except Exception as e:
        logger.error(f"Error saving ticket email preview: {e}")
