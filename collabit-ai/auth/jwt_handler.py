import jwt
from flask import request
from config.settings import get_decoded_jwt_secret

def decode_jwt_from_cookie():
    """Extract and decode JWT from cookie"""
    try:
        token = request.cookies.get('accessToken')
        if not token:
            raise ValueError("No token found in cookies")
        decoded_secret = get_decoded_jwt_secret()
        decoded = jwt.decode(token, decoded_secret, algorithms=["HS512"])
        return decoded.get('sub')
    except Exception as e:
        print(f"JWT decode error: {e}")
        raise