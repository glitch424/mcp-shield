import re
import json
import os
from proxy.config import BASE_DIR

PATTERNS_FILE = os.path.join(BASE_DIR, "policies", "prompt_patterns.json")

def load_patterns():
    if os.path.exists(PATTERNS_FILE):
        with open(PATTERNS_FILE, "r") as f:
            return json.load(f)
    return {"warning_patterns": [], "critical_patterns": []}

def scan_for_injection(text: str) -> dict:
    """
    Scans the input text for common prompt injection phrases.
    Returns a dict with {"level": "...", "pattern": "..."} or None if no match.
    """
    if not text:
        return None
        
    text_lower = text.lower()
    patterns = load_patterns()
    
    for pattern in patterns.get("critical_patterns", []):
        if re.search(pattern, text_lower):
            return {"level": "Critical", "pattern": pattern}
            
    for pattern in patterns.get("warning_patterns", []):
        if re.search(pattern, text_lower):
            return {"level": "Warning", "pattern": pattern}
            
    return None
