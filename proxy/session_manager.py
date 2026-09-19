import subprocess
import threading
import sys
import queue
import json
from proxy.config import OBSIDIAN_MCP_CMD

class SessionManager:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SessionManager, cls).__new__(cls)
                cls._instance._init_session()
            return cls._instance

    def _init_session(self):
        self.process = None
        self.response_queue = queue.Queue()
        self.reader_thread = None
        self.stderr_thread = None

    def start(self):
        if self.process is not None:
            return
        try:
            self.process = subprocess.Popen(
                OBSIDIAN_MCP_CMD,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            self.reader_thread = threading.Thread(target=self._read_stdout, daemon=True)
            self.reader_thread.start()
            self.stderr_thread = threading.Thread(target=self._read_stderr, daemon=True)
            self.stderr_thread.start()
        except Exception as e:
            print(f"Failed to start Obsidian MCP Server: {e}", file=sys.stderr)
            raise

    def _read_stdout(self):
        try:
            for line in self.process.stdout:
                line = line.strip()

                if not line:
                    continue

                try:
                    obj = json.loads(line)
                    self.response_queue.put(obj)
                except json.JSONDecodeError:
                    try:
                        print(f"[Gateway stdout] {line}", file=sys.stderr)
                    except Exception:
                        pass
        except Exception:
            pass

    def _read_stderr(self):
        try:
            for line in self.process.stderr:
                try:
                    print(f"[Docker Gateway] {line.strip()}", file=sys.stderr)
                except Exception:
                    break
        except Exception:
            pass

    def send(self, message: dict):
        if not self.process:
            self.start()
        try:
            msg_str = json.dumps(message) + "\n"
            self.process.stdin.write(msg_str)
            self.process.stdin.flush()
        except (BrokenPipeError, OSError):
            pass

    def get_response(self, timeout=10.0):
        try:
            return self.response_queue.get(timeout=timeout)
        except queue.Empty:
            return None
        
    def put_response(self, response):
        self.response_queue.put(response)
