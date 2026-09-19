# MCP Shield Architecture

This diagram illustrates the high-level architecture, data flow, and core components of the MCP Shield project.

```mermaid
flowchart TD
    %% Define styles
    classDef client fill:#0D0F0A,stroke:#D4FF3D,stroke-width:2px,color:#F5F5F0
    classDef proxy fill:#111827,stroke:#22C55E,stroke-width:2px,color:#F5F5F0
    classDef server fill:#111827,stroke:#3b82f6,stroke-width:2px,color:#F5F5F0
    classDef frontend fill:#0A0B08,stroke:#D4FF3D,stroke-width:2px,color:#F5F5F0
    classDef storage fill:#1f2937,stroke:#8A8F85,stroke-width:2px,color:#F5F5F0
    classDef block fill:#7f1d1d,stroke:#EF4444,stroke-width:2px,color:#F5F5F0

    %% Client Layer
    Claude["Claude Desktop<br/>(AI Client)"]:::client

    %% Proxy Layer
    subgraph Proxy ["MCP Shield Proxy (Python)"]
        direction TB
        Stdio["Stdio Server<br/>(stdio_server.py)"]:::proxy
        
        subgraph RiskEngine ["Security & Risk Evaluation"]
            Policy["Policy Engine<br/>(policy_engine.py)"]:::proxy
            Injection["Prompt Injection Detector<br/>(prompt_injection.py)"]:::proxy
        end
        
        SessionManager["Session Manager<br/>(session_manager.py)"]:::proxy
        
        %% Flow within Proxy
        Stdio -->|Parse JSON-RPC| RiskEngine
        RiskEngine -->|Allowed| SessionManager
        RiskEngine -->|Blocked/Intercepted| Stdio
    end

    %% Storage Layer
    subgraph Data ["Local Storage"]
        Policies[("Policies<br/>(default_policy.json)")]:::storage
        Patterns[("Signatures<br/>(prompt_patterns.json)")]:::storage
        AuditDB[("Audit Database<br/>(SQLite / requests.json)")]:::storage
    end

    %% Target Server Layer
    DockerGateway["Downstream MCP Server<br/>(Docker Container)"]:::server
    LocalResources["Local Environment<br/>(e.g., Obsidian Vault)"]:::storage

    %% Frontend Layer
    subgraph UI ["MCP Shield Dashboard"]
        Frontend["React / Vite SPA<br/>(Night Ops Theme)"]:::frontend
        Backend["Dashboard API<br/>(FastAPI / SSE)"]:::frontend
    end

    %% Connections
    Claude <-->|JSON-RPC over stdio| Stdio
    SessionManager <-->|Persistent Subprocess| DockerGateway
    DockerGateway <-->|Read/Write| LocalResources

    Policy <..>|Read| Policies
    Injection <..>|Read| Patterns
    Stdio -.->|Write Logs| AuditDB

    Backend -.->|Read| AuditDB
    Backend -.->|Read/Write| Policies
    Frontend <-->|HTTP / SSE| Backend

    %% Block condition
    BlockNode["Explicit Text Warning<br/>[BLOCKED BY MCP SHIELD]"]:::block
    Stdio -.->|Returns as tool result| BlockNode
    BlockNode -.-> Claude
```

## Component Breakdown

1. **AI Client (Claude Desktop)**: Initiates tool calls via the Model Context Protocol over `stdio`. It connects to MCP Shield rather than the actual server.
2. **MCP Shield Proxy**: Intercepts all traffic. 
   - `stdio_server.py`: Listens to incoming requests and parses them.
   - `policy_engine.py` / `prompt_injection.py`: Evaluates the requested tool and its arguments against static policies and dynamic prompt injection patterns.
   - `session_manager.py`: A singleton that maintains a long-lived connection to the downstream Docker container (fixing timeouts and cold starts).
3. **Downstream MCP Server**: The actual execution environment (e.g., the Dockerized Obsidian Gateway) that interacts with local resources if the request is permitted.
4. **Dashboard**: A React-based web interface (styled in a dark SOC theme) that communicates with the backend API to visualize real-time telemetry, display audit logs, and manage security policies.
