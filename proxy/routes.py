from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import EventSourceResponse
from proxy.schemas import Policy
from proxy.policy_engine import PolicyEngine
from proxy.risk_engine import calculate_risk, calculate_security_score
from proxy.logger import get_all_logs
import asyncio
import json

router = APIRouter()
policy_engine = PolicyEngine()

@router.get("/logs")
async def get_logs():
    logs = get_all_logs()
    return logs

@router.get("/metrics")
async def get_metrics():
    logs = get_all_logs()
    total = len(logs)
    allowed = sum(1 for log in logs if log.decision == "Allow")
    blocked = sum(1 for log in logs if log.decision == "Block")
    warnings = sum(1 for log in logs if log.decision == "Warning")
    score = calculate_security_score(logs)
    
    return {
        "total_requests": total,
        "allowed": allowed,
        "blocked": blocked,
        "warnings": warnings,
        "security_score": score
    }

@router.get("/policies")
async def get_policies():
    return policy_engine.policy

@router.post("/policies")
async def update_policies(policy: Policy):
    policy_engine.save_policy(policy.dict())
    return {"message": "Policy updated successfully"}

@router.get("/logs/live")
async def logs_live(request: Request):
    """
    Server-Sent Events endpoint for live dashboard updates.
    """
    async def event_generator():
        last_count = len(get_all_logs())
        while True:
            if await request.is_disconnected():
                break
                
            current_logs = get_all_logs()
            current_count = len(current_logs)
            
            if current_count > last_count:
                new_logs = current_logs[:current_count - last_count]
                # Send the update
                yield {
                    "event": "update",
                    "data": json.dumps({"refresh": True})
                }
                last_count = current_count
                
            await asyncio.sleep(1)

    return EventSourceResponse(event_generator())
