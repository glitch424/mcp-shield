import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'database', 'audit.db')}"
POLICY_FILE = os.path.join(BASE_DIR, "policies", "default_policy.json")
LOG_FILE = os.path.join(BASE_DIR, "logs", "requests.json")

# Docker MCP Gateway executable
DOCKER_PATH = r"C:\Users\sarth\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe"

# Launch the Docker MCP Gateway using your existing profile.
OBSIDIAN_MCP_CMD = [
    DOCKER_PATH,
    "mcp",
    "gateway",
    "run",
    "--profile",
    "sarthak"
]