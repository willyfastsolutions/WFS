import os
from dotenv import load_dotenv

# Load .env file from parent directory (since app is inside backend/)
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(dotenv_path)

class Settings:
    def __init__(self):
        self.DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./willyfast.db")
        if self.DATABASE_URL.startswith("sqlite:///./"):
            backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            db_name = self.DATABASE_URL.replace("sqlite:///./", "")
            abs_db_path = os.path.abspath(os.path.join(backend_dir, db_name)).replace("\\", "/")
            self.DATABASE_URL = f"sqlite:///{abs_db_path}"
        
        # Enforce SECRET_KEY in production (non-SQLite database), fallback with warning in dev
        _secret = os.getenv("SECRET_KEY")
        dev_fallback = "94d07bb8924b17dfad858c4eb5850ab5f381f9640cbbf040c5fdf68c67c5f87b"
        
        # Check production constraints
        if not self.DATABASE_URL.startswith("sqlite"):
            # 1. Enforce secure SECRET_KEY
            if not _secret or _secret == dev_fallback:
                raise ValueError(
                    "CRITICAL SECURITY ERROR: SECRET_KEY environment variable must be set to a secure, "
                    "non-default value when using a production database."
                )
            
            # 2. Enforce SMTP credentials in production if MOCK_SMTP is not explicitly set to True
            mock_smtp_val = os.getenv("MOCK_SMTP", "True").lower() == "true"
            if not mock_smtp_val:
                essential_smtp_vars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"]
                for var in essential_smtp_vars:
                    if not os.getenv(var) or os.getenv(var) in ["localhost", "admin1234"]:
                        raise ValueError(
                            f"CRITICAL SECURITY ERROR: {var} environment variable must be configured "
                            f"with a secure production value when MOCK_SMTP is False in production."
                        )
        
        if not _secret:
            _secret = dev_fallback
            print("[SECURITY WARNING] SECRET_KEY not found in environment. Using development fallback key.")
            
        self.SECRET_KEY: str = _secret
        self.ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
        
        self.SMTP_HOST: str = os.getenv("SMTP_HOST", "localhost")
        self.SMTP_PORT: int = int(os.getenv("SMTP_PORT", "1025"))
        self.SMTP_USER: str = os.getenv("SMTP_USER", "support@willyfastsolutions.com")
        self.SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "admin1234")
        self.SMTP_FROM: str = os.getenv("SMTP_FROM", "support@willyfastsolutions.com")
        self.MOCK_SMTP: bool = os.getenv("MOCK_SMTP", "True").lower() == "true"

settings = Settings()
