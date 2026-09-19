import subprocess
import json
import threading
from proxy.config import OBSIDIAN_MCP_CMD

class Forwarder:
    def __init__(self):
        # We will mock the forwarder for the MVP since we might not have a real Obsidian MCP server running
        # In a real scenario, this would connect via stdio to the Obsidian MCP server
        pass

    def forward(self, request_json: dict) -> dict:
        """
        Simulate forwarding to Obsidian MCP Server.
        For tools/call, we will return a mock success response.
        """
        method = request_json.get("method")
        
        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": request_json.get("id"),
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {},
                    "serverInfo": {
                        "name": "obsidian-mcp-mock",
                        "version": "1.0.0"
                    }
                }
            }
        
        elif method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": request_json.get("id"),
                "result": {
                    "tools": [
                        {"name": "list_files", "description": "List files", "inputSchema": {"type": "object"}},
                        {"name": "read_note", "description": "Read a note", "inputSchema": {"type": "object"}},
                        {"name": "create_note", "description": "Create note", "inputSchema": {"type": "object"}},
                        {"name": "delete_note", "description": "Delete note", "inputSchema": {"type": "object"}}
                    ]
                }
            }
            
        elif method == "tools/call":
            tool_name = request_json.get("params", {}).get("name")
            return {
                "jsonrpc": "2.0",
                "id": request_json.get("id"),
                "result": {
                    "content": [{"type": "text", "text": f"Successfully executed {tool_name}"}]
                }
            }
            
        else:
            return {
                "jsonrpc": "2.0",
                "id": request_json.get("id"),
                "error": {"code": -32601, "message": "Method not found"}
            }
