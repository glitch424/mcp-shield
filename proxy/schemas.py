from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime

class PolicyMetadata(BaseModel):
    version: str
    created_at: str
    updated_by: str

class MCPRequest(BaseModel):
    jsonrpc: str = "2.0"
    id: Optional[int] = None
    method: str
    params: Optional[Dict[str, Any]] = None

class MCPResponse(BaseModel):
    jsonrpc: str = "2.0"
    id: Optional[int] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None

class Policy(BaseModel):
    metadata: Optional[PolicyMetadata] = None
    allowed_tools: List[str]
    warning_tools: List[str]
    blocked_tools: List[str]
    restricted_paths: List[str]

class AuditLogEntry(BaseModel):
    id: Optional[int] = None
    timestamp: datetime
    tool_name: str
    arguments: str
    risk_level: str
    decision: str
    reason: str
    response_status: str

    class Config:
        from_attributes = True
