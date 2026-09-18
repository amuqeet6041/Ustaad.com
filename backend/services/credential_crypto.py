import os
from pathlib import Path

from cryptography.fernet import Fernet, InvalidToken
from dotenv import load_dotenv

# Load env vars from backend/.env (services/ -> backend/)
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

_fernet: Fernet | None = None


def _get_fernet() -> Fernet:
    """Build (and cache) a Fernet cipher from CREDENTIAL_ENCRYPTION_KEY.

    Fails closed: missing or invalid keys raise, never auto-generate at runtime.
    """
    global _fernet
    if _fernet is not None:
        return _fernet

    key = os.getenv("CREDENTIAL_ENCRYPTION_KEY")
    if not key:
        raise RuntimeError("CREDENTIAL_ENCRYPTION_KEY is not set in .env")

    try:
        _fernet = Fernet(key.encode("utf-8"))
    except (ValueError, TypeError) as exc:
        raise RuntimeError("CREDENTIAL_ENCRYPTION_KEY is invalid") from exc

    return _fernet


def encrypt_secret(value: str) -> str:
    if not value:
        raise ValueError("value must be a non-empty string")
    return _get_fernet().encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_secret(value: str) -> str:
    if not value:
        raise ValueError("value must be a non-empty string")
    try:
        return _get_fernet().decrypt(value.encode("utf-8")).decode("utf-8")
    except (InvalidToken, ValueError, TypeError) as exc:
        raise RuntimeError("Failed to decrypt credential") from exc