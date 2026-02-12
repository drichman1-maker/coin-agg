from cryptography.fernet import Fernet
import os
import sys

# Load key from env - MUST be set in production
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

if not ENCRYPTION_KEY:
    if os.getenv("APP_ENV") == "production":
        print("FATAL: ENCRYPTION_KEY environment variable must be set in production!")
        sys.exit(1)
    else:
        # Dev mode: generate and warn
        print("WARNING: ENCRYPTION_KEY not set. Generating temporary key for development.")
        print("WARNING: All encrypted data will be lost on restart!")
        ENCRYPTION_KEY = Fernet.generate_key().decode()

cipher_suite = Fernet(ENCRYPTION_KEY.encode())

def encrypt_data(data: str) -> str:
    if not data: return data
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt_data(token: str) -> str:
    if not token: return token
    try:
        return cipher_suite.decrypt(token.encode()).decode()
    except Exception as e:
        # Log but don't crash - data may be from old key
        print(f"Decryption error: {e}")
        return "[ENCRYPTED]"
