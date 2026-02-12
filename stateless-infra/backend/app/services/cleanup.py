import asyncio
from sqlalchemy import delete
from sqlalchemy.future import select
from ..database import AsyncSessionLocal
from ..models import Draft
import datetime

async def run_cleanup_loop():
    consecutive_failures = 0
    max_failures = 5
    
    while True:
        try:
            async with AsyncSessionLocal() as db:
                print("[Cleanup] Running cleanup...")
                now = datetime.datetime.now(datetime.timezone.utc)
                stmt = delete(Draft).where(Draft.expires_at < now)
                result = await db.execute(stmt)
                await db.commit()
                if result.rowcount > 0:
                    print(f"[Cleanup] Deleted {result.rowcount} expired items.")
                
                # Reset failure counter on success
                consecutive_failures = 0
                
        except Exception as e:
            consecutive_failures += 1
            print(f"[Cleanup] Error (attempt {consecutive_failures}/{max_failures}): {e}")
            
            if consecutive_failures >= max_failures:
                print(f"[Cleanup] CRITICAL: Cleanup failed {max_failures} times consecutively!")
                # In production, send alert here (e.g., to Sentry, PagerDuty)
                # For now, continue trying with longer backoff
                await asyncio.sleep(300)  # 5 min backoff
                consecutive_failures = 0  # Reset to try again
                continue
        
        # Run every hour
        await asyncio.sleep(3600)
