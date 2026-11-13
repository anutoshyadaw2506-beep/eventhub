import base64
import io
import secrets
import qrcode
from qrcode.image.pil import PilImage

def generate_ticket_token() -> str:
    """Generates an opaque, cryptographically random 32-byte token."""
    return f"TK-{secrets.token_urlsafe(32)}"

def generate_qr_code_data_url(token: str) -> str:
    """Generates a QR code for the given token and returns a base64 PNG data URL."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(token)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#1E1B4B", back_color="white")  # Matching purple-white SaaS theme
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_bytes = buffer.getvalue()
    b64_str = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"
