export interface AuditLog {
    id: number;
    timestamp: string;
    tool_name: string;
    arguments: string;
    risk_level: string;
    decision: string;
    reason: string;
    response_status: string;
}

export interface Metrics {
    total_requests: number;
    allowed: number;
    blocked: number;
    warnings: number;
    security_score: number;
}

export interface Policies {
    allowed_tools: string[];
    warning_tools: string[];
    blocked_tools: string[];
    restricted_paths: string[];
}
