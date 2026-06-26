import time
from typing import Dict, List

class InMemoryRateLimiter:
    def __init__(self, limit: int = 5, window_seconds: int = 60):
        self.limit = limit
        self.window_seconds = window_seconds
        # dict key: IP address string, value: list of request timestamps (float)
        self.requests: Dict[str, List[float]] = {}

    def is_rate_limited(self, ip: str) -> bool:
        now = time.time()
        
        # Initialize or clean up old timestamps outside the window
        if ip in self.requests:
            self.requests[ip] = [t for t in self.requests[ip] if now - t < self.window_seconds]
        else:
            self.requests[ip] = []

        if len(self.requests[ip]) >= self.limit:
            return True

        self.requests[ip].append(now)
        return False

# Limiter for login endpoint: 5 attempts per 60 seconds per IP
login_limiter = InMemoryRateLimiter(limit=5, window_seconds=60)
