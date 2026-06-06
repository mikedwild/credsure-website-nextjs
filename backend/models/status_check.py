from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone

class StatusCheck(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    service_name: str
    status: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    service_name: str
    status: str
