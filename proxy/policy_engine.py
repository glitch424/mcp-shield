import json
import os
from proxy.config import POLICY_FILE

class PolicyEngine:
    def __init__(self):
        self.policy = self.load_policy()

    def load_policy(self):
        if not os.path.exists(POLICY_FILE):
            return {
                "allowed_tools": [],
                "warning_tools": [],
                "blocked_tools": [],
                "restricted_paths": []
            }
        with open(POLICY_FILE, "r") as f:
            return json.load(f)

    def save_policy(self, policy_data):
        self.policy = policy_data
        with open(POLICY_FILE, "w") as f:
            json.dump(policy_data, f, indent=2)

    def evaluate(self, tool_name: str, arguments: dict) -> dict:
        # Returns a dict with severity, reason, policy_rule, recommendation
        if arguments:
            args_str = json.dumps(arguments).lower()
            for path in self.policy.get("restricted_paths", []):
                if path.lower() in args_str:
                    return {
                        "severity": "Block",
                        "reason": f"Access to restricted path: {path}",
                        "policy_rule": "restricted_paths",
                        "recommendation": "Use allowed paths only."
                    }

        if tool_name in self.policy.get("blocked_tools", []):
            return {
                "severity": "Block",
                "reason": "Tool blocked by MCP Shield security policy.",
                "policy_rule": "blocked_tools",
                "recommendation": "Contact administrator to request tool access."
            }
        
        if tool_name in self.policy.get("warning_tools", []):
            return {
                "severity": "Warning",
                "reason": "Tool is in warning list.",
                "policy_rule": "warning_tools",
                "recommendation": "Ensure usage complies with safety guidelines."
            }
        
        return {
            "severity": "Allow",
            "reason": "Tool allowed by default policy.",
            "policy_rule": "allowed_tools",
            "recommendation": "None"
        }
