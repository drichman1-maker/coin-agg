from fastapi import FastAPI, Depends, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from typing import Annotated

from .database import init_db, get_db
from . import models, schemas

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB
    await init_db()
    
    # Initialize global rate limiter
    global rate_limiter
    from .services.rate_limiter import RateLimiter
    rate_limiter = RateLimiter(requests_per_minute=100)
    
    # Start cleanup background task
    from .services import cleanup
    import asyncio
    cleanup_task = asyncio.create_task(cleanup.run_cleanup_loop())
    
    yield
    # Shutdown
    cleanup_task.cancel()
    await rate_limiter.close()

# ... existing app init ...

@app.post("/ios/register")
async def register_ios_token(
    token_data: dict, # { "token": "..." }
    x_app_id: Annotated[str, Header()]
):
    if not token_data or "token" not in token_data:
         raise HTTPException(status_code=400, detail="Invalid token data")
         
    token = token_data["token"]
    if len(token) > 256: # Basic sanity check for token length
         raise HTTPException(status_code=400, detail="Token too long")

    import redis.asyncio as redis
    import os
    r = redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"), socket_timeout=2.0)
    
    try:
        await r.setex(f"apns:{x_app_id}:{token}", 86400, "1")
    finally:
        await r.close()
    return {"status": "registered"}

@app.get("/subscriptions")
async def check_subscription(
    x_app_id: Annotated[str, Header()],
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select
    from . import models
    import datetime
    
    # Filter for active receipts only
    now = datetime.datetime.now(datetime.timezone.utc)
    stmt = select(models.Receipt).where(
        models.Receipt.app_id == x_app_id,
        models.Receipt.status == "active",
        models.Receipt.expires_at > now
    )
    result = await db.execute(stmt)
    receipts = result.scalars().all()
    return {"active": len(receipts) > 0, "receipts": receipts}

app = FastAPI(title="Stateless Infrastructure API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_tenant_context(request: Request, call_next):
    app_id = request.headers.get("X-App-ID")
    # For some paths (like health check or docs) we might skip this
    if request.url.path in ["/", "/docs", "/openapi.json", "/health"]:
        return await call_next(request)
        
    if not app_id:
        # Enforce stateless multi-tenancy
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=400, 
            content={"detail": "Missing X-App-ID header"}
        )
    
    # Adversarial Mitigation: Length and character limits to prevent bomb/injection
    if len(app_id) > 64 or not app_id.isalnum():
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=400, 
            content={"detail": "Invalid X-App-ID format"}
        )
        
    request.state.app_id = app_id
    
    # Rate Limiting - use global instance
    await rate_limiter.check_limit(app_id)

    response = await call_next(request)
    return response

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/drafts", response_model=schemas.DraftResponse)
async def create_draft(
    draft: schemas.DraftCreate,
    x_app_id: Annotated[str, Header()],
    db: AsyncSession = Depends(get_db)
):
    # Create draft logic
    from .services.encryption import encrypt_data
    
    new_draft = models.Draft(
        app_id=x_app_id,
        content=encrypt_data(draft.content),
        type=draft.type
    )
    db.add(new_draft)
    await db.commit()
    await db.refresh(new_draft)
    
    # Decrypt content before returning to client
    from .services.encryption import decrypt_data
    response_draft = schemas.DraftResponse(
        id=new_draft.id,
        app_id=new_draft.app_id,
        content=decrypt_data(new_draft.content),
        type=new_draft.type,
        created_at=new_draft.created_at,
        expires_at=new_draft.expires_at
    )
    return response_draft

@app.post("/bots/trigger")
async def trigger_bot(
    task: schemas.BotTaskCreate,
    x_app_id: Annotated[str, Header()],
):
    import json
    import redis.asyncio as redis
    import os
    import uuid
    
    redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
    r = redis.from_url(redis_url, socket_timeout=2.0)
    
    task_id = str(uuid.uuid4())
    task_data = {
        "id": task_id,
        "type": task.type,
        "app_id": x_app_id,
        "payload": task.payload
    }
    
    try:
        await r.rpush("bot-tasks", json.dumps(task_data))
    except Exception as e:
        raise HTTPException(status_code=503, detail="Task queue unavailable")
    finally:
        await r.close()
    
    return {"status": "queued", "task_id": task_id}
