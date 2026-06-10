import os
from dotenv import load_dotenv

# Load .env file from parent directory (since app is inside backend/)
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(dotenv_path)

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./willyfast.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "94d07bb8924b17dfad858c4eb5850ab5f381f9640cbbf040c5fdf68c67c5f87b")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
    
    SMTP_HOST: str = os.getenv("SMTP_HOST", "localhost")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "1025"))
    SMTP_USER: str = os.getenv("SMTP_USER", "support@willyfastsolutions.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "admin1234")
    SMTP_FROM: str = os.getenv("SMTP_FROM", "support@willyfastsolutions.com")
    MOCK_SMTP: bool = os.getenv("MOCK_SMTP", "True").lower() == "true"

settings = Settings()
