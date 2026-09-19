from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import Base, AuditLog
from proxy.config import DATABASE_URL
import json
import os
from datetime import datetime
from proxy.config import LOG_FILE

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def log_request(tool_name: str, arguments: str, risk_level: str, decision: str, reason: str, response_status: str):
    db = SessionLocal()
    log_entry = AuditLog(
        tool_name=tool_name,
        arguments=arguments,
        risk_level=risk_level,
        decision=decision,
        reason=reason,
        response_status=response_status
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    db.close()
    
    # Also log to JSON file
    log_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "tool_name": tool_name,
        "arguments": arguments,
        "risk_level": risk_level,
        "decision": decision,
        "reason": reason,
        "response_status": response_status
    }
    
    logs = []
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, "r") as f:
                logs = json.load(f)
        except:
            pass
    logs.append(log_data)
    with open(LOG_FILE, "w") as f:
        json.dump(logs, f, indent=2)

def get_all_logs():
    db = SessionLocal()
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    db.close()
    return logs
