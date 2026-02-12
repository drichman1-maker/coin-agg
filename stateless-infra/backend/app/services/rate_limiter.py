import redis.asyncio as redis
from fastapi import HTTPException
import os
import time
import logging

logger = logging.getLogger(__name__)
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

class RateLimiter:
    _instance = None
    _redis_pool = None

    def __new__(cls, requests_per_minute: int = 100):
        if cls._instance is None:
            # Simple lock-free singleton is fine if initialized during lifespan startup as we did
            cls._instance = super().__new__(cls)
            cls._instance.requests_per_minute = requests_per_minute
            try:
                cls._instance._redis_pool = redis.ConnectionPool.from_url(
                    REDIS_URL,
                    max_connections=50,
                    decode_responses=False,
                    socket_timeout=2.0,
                    socket_connect_timeout=2.0
                )
            except Exception as e:
                logger.error(f"Failed to initialize Redis pool for RateLimiter: {e}")
                cls._instance._redis_pool = None
        return cls._instance

    async def check_limit(self, key: str):
        if not key or not self._redis_pool:
            # Fail-open: if Redis down or no key, allow but log
            return True
            
        current_minute = int(time.time() // 60)
        redis_key = f"rate_limit:{key}:{current_minute}"
        
        try:
            r = redis.Redis(connection_pool=self._redis_pool)
            async with r.pipeline(transaction=True) as pipe:
                await pipe.incr(redis_key)
                await pipe.expire(redis_key, 65)
                result = await pipe.execute()
                
            request_count = result[0]
            if request_count > self.requests_per_minute:
                raise HTTPException(status_code=429, detail="Rate limit exceeded")
        except HTTPException:
            raise
        except Exception as e:
            # Fail-open if Redis fails during check
            logger.error(f"RateLimiter Redis failure for key {key}: {e}")
            return True
        
        return True

    async def close(self):
        if self._redis_pool:
            await self._redis_pool.disconnect()
