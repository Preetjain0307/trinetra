import pytest
from backend.app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token

def test_password_hashing_and_verification():
    raw_pass = "TacticalSecret@2026"
    hashed = get_password_hash(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_generation_and_decoding():
    user_email = "operator@trinetra.local"
    role = "Operator"
    token = create_access_token(subject=user_email, role=role)
    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == user_email
    assert payload.get("role") == role
