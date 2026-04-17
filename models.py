from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base

class DomainEntry(Base):
    __tablename__ = "domain_entries"

    id = Column(Integer, primary_key=True, index=True)
    domain_name = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)