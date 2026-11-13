import base64
import io
import secrets
import qrcode
from qrcode.image.pil import PilImage

def generate_ticket_token() -> str:
    """Generates an opaque, cryptographically random 32-byte token."""
    return f"TK-{secrets.token_urlsafe(32)}"

def generate_qr_code_bytes(token: str) -> bytes:
    """Generates a high-contrast QR code for the given token and returns raw PNG bytes."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(token)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0F172A", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()

def generate_qr_code_data_url(token: str) -> str:
    """Generates a QR code for the given token and returns a base64 PNG data URL."""
    img_bytes = generate_qr_code_bytes(token)
    b64_str = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"
