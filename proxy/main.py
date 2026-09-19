from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from proxy.routes import router
import uvicorn
import os

app = FastAPI(title="MCP Shield Proxy", version="1.0.0")

# Allow CORS for the dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For MVP, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("proxy.main:app", host="0.0.0.0", port=8000, reload=True)
