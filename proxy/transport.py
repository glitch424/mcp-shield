import json
import time
from proxy.session_manager import SessionManager

class StdioTransport:
    def __init__(self):
        self.session = SessionManager()
        
    def start(self):
        self.session.start()

    def send(self, message: dict):
        self.session.send(message)

    def wait_for_response(self, request_id, timeout=60.0):
        start_time = time.time()
        while True:
            remaining = timeout - (time.time() - start_time)
            if remaining <= 0:
                return None

            response = self.session.get_response(timeout=remaining)

            if response is None:
                return None

            # Ignore notifications/events (no id)
            if "id" not in response:
                continue

            if response["id"] == request_id:
                return response

            # Re-queue non-matching responses
            self.session.put_response(response)
            time.sleep(0.01)
