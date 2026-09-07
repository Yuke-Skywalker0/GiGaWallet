import hashlib
import hmac
from datetime import datetime, timedelta, timezone

import jwt
from cryptography.fernet import Fernet, InvalidToken
from fastapi import Cookie, HTTPException, status

from .config import settings

fernet = Fernet(settings.data_encryption_key.encode())

def owner_key(google_sub: str) -> str:
    return hmac.new(
        settings.user_index_secret.encode(),
        google_sub.encode(),
        hashlib.sha256
    ).hexdigest()

def encrypt_text(value: str) -> str:
    return fernet.encrypt(value.encode()).decode()

def decrypt_text(value: str) -> str:
    try:
        return fernet.decrypt(value.encode()).decode()
    except InvalidToken as exc:
        raise HTTPException(status_code=500, detail="Impossibile decifrare i dati.") from exc

def create_session(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_minutes)
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")

def current_user_id(finora_session: str | None = Cookie(default=None)) -> str:
    if not finora_session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Non autenticato.")

    try:
        payload = jwt.decode(finora_session, settings.jwt_secret, algorithms=["HS256"])
        return str(payload["sub"])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessione non valida.") from exc
