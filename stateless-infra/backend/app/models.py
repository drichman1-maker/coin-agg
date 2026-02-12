from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from .database import Base
import datetime

class Draft(Base):
    __tablename__ = "drafts"

    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(String, index=True) # Tenant ID
    type = Column(String) # 'email', 'social', 'support'
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Auto-delete target: e.g. 24h TTL
    expires_at = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1))

class Metric(Base):
    __tablename__ = "metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(String, index=True)
    metric_type = Column(String) # 'conversion', 'view'
    count = Column(Integer, default=0)
    period = Column(String) # '2023-10-27'

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(String, index=True)
    transaction_id = Column(String)
    status = Column(String) # 'active', 'expired'
    expires_at = Column(DateTime(timezone=True))
