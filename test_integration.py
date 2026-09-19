import subprocess
import json
import sys
import unittest
import threading

class TestStdioServerIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.process = subprocess.Popen(
            [sys.executable, "-m", "proxy.stdio_server"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            cwd=r"c:\games\aws hackathon\mcp-shield"
        )
        def discard_stderr():
            for _ in cls.process.stderr:
                pass
        t = threading.Thread(target=discard_stderr, daemon=True)
        t.start()

        # Perform MCP Handshake
        init_msg = {
            "jsonrpc": "2.0",
            "id": 0,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "test-suite", "version": "1.0"}
            }
        }
        cls.process.stdin.write(json.dumps(init_msg) + "\n")
        cls.process.stdin.flush()
        cls.process.stdout.readline()

        cls.process.stdin.write(json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized"}) + "\n")
        cls.process.stdin.flush()

    @classmethod
    def tearDownClass(cls):
        cls.process.terminate()

    def test_delete_blocked_with_shield_banner(self):
        call_msg = {
            "jsonrpc": "2.0",
            "id": 101,
            "method": "tools/call",
            "params": {
                "name": "obsidian_delete_file",
                "arguments": {"filepath": "hello.md"}
            }
        }
        self.process.stdin.write(json.dumps(call_msg) + "\n")
        self.process.stdin.flush()

        resp = json.loads(self.process.stdout.readline())
        self.assertEqual(resp.get("id"), 101)
        self.assertIn("result", resp)
        text = resp["result"]["content"][0]["text"]
        self.assertIn("[BLOCKED BY MCP SHIELD]", text)
        self.assertIn("blocked_tools", text)
        self.assertIn("MCP Shield", text)

    def test_prompt_injection_blocked_with_shield_banner(self):
        call_msg = {
            "jsonrpc": "2.0",
            "id": 102,
            "method": "tools/call",
            "params": {
                "name": "obsidian_get_file_contents",
                "arguments": {"filepath": "injection-test.md"}
            }
        }
        self.process.stdin.write(json.dumps(call_msg) + "\n")
        self.process.stdin.flush()

        resp = json.loads(self.process.stdout.readline())
        self.assertEqual(resp.get("id"), 102)
        self.assertIn("result", resp)
        text = resp["result"]["content"][0]["text"]
        self.assertIn("[BLOCKED BY MCP SHIELD - PROMPT INJECTION DETECTED]", text)
        self.assertIn("ignore previous instructions", text)
        self.assertIn("MCP Shield", text)

if __name__ == "__main__":
    unittest.main()
