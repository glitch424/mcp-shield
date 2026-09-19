def calculate_risk(tool_name: str) -> str:
    # Based on MVP specification
    low_risk = ["list_files", "search_notes", "read_note"]
    medium_risk = ["create_note"]
    high_risk = ["overwrite_note"]
    critical_risk = ["delete_note", "execute_shell", "write_outside_vault"]
    
    if tool_name in low_risk:
        return "Low"
    if tool_name in medium_risk:
        return "Medium"
    if tool_name in high_risk:
        return "High"
    if tool_name in critical_risk:
        return "Critical"
    
    return "Medium" # Default if unknown

def calculate_security_score(logs) -> int:
    score = 100
    for log in logs:
        if log.risk_level == "Critical":
            score -= 20
        elif log.risk_level == "High":
            score -= 10
        elif log.risk_level == "Medium":
            score -= 5
        elif log.risk_level == "Low":
            score -= 1
    
    return max(0, score)
