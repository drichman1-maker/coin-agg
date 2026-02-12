from pydantic import BaseModel, field_validator
from typing import Optional, Literal
from datetime import datetime

class DraftBase(BaseModel):
    content: str
    type: Literal['email', 'social', 'support']

class DraftCreate(DraftBase):
    pass

class DraftResponse(DraftBase):
    id: int
    app_id: str
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True

class BotTaskCreate(BaseModel):
    type: Literal['email', 'social']
    payload: dict
    
    @field_validator('payload')
    @classmethod
    def validate_payload(cls, v):
        if not isinstance(v, dict):
            raise ValueError('payload must be a dictionary')
        # Limit payload size to prevent abuse
        import json
        if len(json.dumps(v)) > 10000:  # 10KB limit
            raise ValueError('payload too large')
        return v
