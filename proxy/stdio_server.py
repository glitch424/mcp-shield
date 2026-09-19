import sys
import json
from proxy.transport import StdioTransport
from proxy.policy_engine import PolicyEngine
from proxy.risk_engine import calculate_risk
from proxy.logger import log_request
from proxy.prompt_injection import scan_for_injection

def main():
    transport = StdioTransport()
    policy_engine = PolicyEngine()
    
    transport.start()
    
    for line in sys.stdin:
        if not line.strip():
            continue
            
        try:
            request = json.loads(line)
        except json.JSONDecodeError:
            continue
            
        method = request.get("method")
        req_id = request.get("id")
        
        if not method:
            continue
        
        if method in ["initialize", "tools/list", "resources/list", "prompts/list"]:
            print(f"[Proxy] Received {method}", file=sys.stderr)
            transport.send(request)
            print(f"[Proxy] Forwarded {method}", file=sys.stderr)
            response = transport.wait_for_response(req_id)
            print(f"[Proxy] Response {response}", file=sys.stderr)
            if response:
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()
            else:
                print(f"[Proxy] ERROR: Timeout waiting for response to {method} (id={req_id})", file=sys.stderr)

        elif method.startswith("notifications/"):
            print(f"[Proxy] Received notification {method}", file=sys.stderr)
            transport.send(request)
            print(f"[Proxy] Forwarded notification {method}", file=sys.stderr)
            continue
                
        elif method == "tools/call":
            params = request.get("params", {})
            tool_name = params.get("name", "unknown")
            arguments = params.get("arguments", {})
            
            print(f"[Proxy] Received tools/call: {tool_name}", file=sys.stderr)
            
            # Policy Evaluation
            eval_result = policy_engine.evaluate(tool_name, arguments)
            decision = eval_result["severity"]
            reason = eval_result["reason"]
            risk = calculate_risk(tool_name)
            
            if decision == "Block":
                print(f"[Proxy] BLOCKED tools/call: {tool_name} reason={reason}", file=sys.stderr)
                log_request(tool_name, json.dumps(arguments), risk, decision, reason, "Error")
                shield_resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    f"[BLOCKED BY MCP SHIELD]\n"
                                    f"Security Notice: Action '{tool_name}' was intercepted and BLOCKED by MCP Shield.\n"
                                    f"Policy Rule Matched: {eval_result.get('policy_rule')}\n"
                                    f"Severity: {eval_result.get('severity', 'Block')}\n"
                                    f"Reason: {reason}\n"
                                    f"Recommendation: {eval_result.get('recommendation')}\n"
                                    f"Status: Access denied by MCP Shield security policy."
                                )
                            }
                        ],
                        "isError": False
                    }
                }
                sys.stdout.write(json.dumps(shield_resp) + "\n")
                sys.stdout.flush()
                continue
                
            # If Allowed / Warning, forward to Obsidian MCP
            print(f"[Proxy] Forwarded tools/call: {tool_name}", file=sys.stderr)
            transport.send(request)
            response = transport.wait_for_response(req_id)
            print(f"[Proxy] Response tools/call: {response}", file=sys.stderr)

            if response and response.get("result"):
                # Check for prompt injection in reading note tools
                if tool_name in ["read_note", "obsidian_get_file_contents", "obsidian_batch_get_file_contents"]:
                    content = response["result"].get("content", [])
                    if isinstance(content, list) and len(content) > 0:
                        text_content = ""
                        for item in content:
                            if isinstance(item, dict) and "text" in item:
                                text_content += item.get("text", "") + "\n"
                        
                        injection = scan_for_injection(text_content)
                        if injection:
                            print(f"[Proxy] Prompt injection detected in {tool_name}: {injection}", file=sys.stderr)
                            decision = "Block" if injection["level"] == "Critical" else "Warning"
                            reason = f"Prompt injection detected ({injection['pattern']})"
                            risk = injection["level"]
                            
                            if decision == "Block":
                                response = {
                                    "jsonrpc": "2.0",
                                    "id": req_id,
                                    "result": {
                                        "content": [
                                            {
                                                "type": "text",
                                                "text": (
                                                    f"[BLOCKED BY MCP SHIELD - PROMPT INJECTION DETECTED]\n"
                                                    f"Security Alert: The content of this note was BLOCKED and quarantined by MCP Shield.\n"
                                                    f"Detected Signature: '{injection['pattern']}'\n"
                                                    f"Severity: {injection['level']}\n"
                                                    f"Policy Rule Matched: prompt_injection\n"
                                                    f"Reason: Untrusted prompt injection pattern was detected in the file content.\n"
                                                    f"Recommendation: The note contains instructions attempting to manipulate AI instructions. Content has been quarantined by MCP Shield.\n"
                                                    f"Status: Content withheld by MCP Shield security proxy."
                                                )
                                            }
                                        ],
                                        "isError": False
                                    }
                                }
                
                log_request(tool_name, json.dumps(arguments), risk, decision, reason, "Success" if decision != "Block" else "Error")
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()
            else:
                log_request(tool_name, json.dumps(arguments), risk, decision, "Downstream Error", "Error")
                if response:
                    sys.stdout.write(json.dumps(response) + "\n")
                else:
                    timeout_resp = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": "[MCP SHIELD] Downstream Obsidian MCP Server timed out or returned an invalid response."
                                }
                            ],
                            "isError": False
                        }
                    }
                    sys.stdout.write(json.dumps(timeout_resp) + "\n")
                sys.stdout.flush()
        else:
            print(f"[Proxy] Received {method} (id={req_id})", file=sys.stderr)
            transport.send(request)
            print(f"[Proxy] Forwarded {method}", file=sys.stderr)
            if req_id is not None:
                response = transport.wait_for_response(req_id)
                print(f"[Proxy] Response {response}", file=sys.stderr)
                if response:
                    sys.stdout.write(json.dumps(response) + "\n")
                    sys.stdout.flush()

if __name__ == "__main__":
    main()
