from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.db.database import settings


def _encode_password(password: str) -> bytes:
    return password.encode("utf-8")[:72]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        _encode_password(password),
        bcrypt.gensalt(),
    ).decode("utf-8")


def verify_password(
    password: str,
    password_hash: str,
) -> bool:
    return bcrypt.checkpw(
        _encode_password(password),
        password_hash.encode("utf-8"),
    )


def create_access_token(subject: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )

    payload = {
        "sub": subject,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
    except jwt.PyJWTError:
        return None

    return payload.get("sub")
