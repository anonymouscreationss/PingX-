#!/usr/bin/env python3
"""
Advanced Ping Server with Traffic Optimization
Provides real ping measurement and simulated traffic routing optimization
"""

import asyncio
import json
import time
import subprocess
import platform
import socket
from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="PingBooster API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class PingRequest(BaseModel):
    host: str
    count: int = 4
    timeout: int = 5

class OptimizeRequest(BaseModel):
    host: str
    optimization_level: int = 1

class PingResult(BaseModel):
    host: str
    latency: float
    packet_loss: float
    status: str
    timestamp: float
    optimized: bool = False

# Global storage
ping_results: List[PingResult] = []
connected_clients: List[WebSocket] = []

def get_ping_command(host: str, count: int = 4) -> List[str]:
    """Get platform-specific ping command"""
    system = platform.system().lower()
    
    if system == "windows":
        return ["ping", "-n", str(count), host]
    else:
        return ["ping", "-c", str(count), host]

async def measure_ping(host: str, count: int = 4, timeout: int = 5) -> PingResult:
    """Measure ping to a specific host"""
    try:
        start_time = time.time()
        
        # Use subprocess to run ping command
        cmd = get_ping_command(host, count)
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(), 
                timeout=timeout
            )
        except asyncio.TimeoutError:
            process.kill()
            return PingResult(
                host=host,
                latency=999.0,
                packet_loss=100.0,
                status="timeout",
                timestamp=time.time()
            )
        
        output = stdout.decode('utf-8')
        
        # Parse ping output
        latency, packet_loss = parse_ping_output(output)
        
        result = PingResult(
            host=host,
            latency=latency,
            packet_loss=packet_loss,
            status="success" if latency < 999 else "failed",
            timestamp=time.time()
        )
        
        # Store result
        ping_results.append(result)
        if len(ping_results) > 1000:
            ping_results[:] = ping_results[-1000:]
        
        return result
        
    except Exception as e:
        print(f"Ping error for {host}: {e}")
        return PingResult(
            host=host,
            latency=999.0,
            packet_loss=100.0,
            status="error",
            timestamp=time.time()
        )

def parse_ping_output(output: str) -> tuple[float, float]:
    """Parse ping command output to extract latency and packet loss"""
    lines = output.split('\n')
    latency = 999.0
    packet_loss = 100.0
    
    try:
        for line in lines:
            line = line.lower()
            
            # Parse latency (works for both Windows and Unix)
            if 'time=' in line or 'time<' in line:
                if 'time=' in line:
                    time_part = line.split('time=')[1].split()[0]
                else:
                    time_part = line.split('time<')[1].split()[0]
                
                # Extract numeric value
                time_str = ''.join(c for c in time_part if c.isdigit() or c == '.')
                if time_str:
                    latency = min(float(time_str), latency)
            
            # Parse packet loss
            if '% loss' in line or '% packet loss' in line:
                parts = line.split('%')
                for i, part in enumerate(parts):
                    if 'loss' in parts[i] if i < len(parts) else False:
                        # Look for number before %
                        numbers = ''.join(c for c in part if c.isdigit() or c == '.')
                        if numbers:
                            packet_loss = float(numbers)
                            break
    
    except Exception as e:
        print(f"Parse error: {e}")
    
    return latency, packet_loss

async def optimize_connection(host: str, level: int = 1) -> PingResult:
    """Simulate connection optimization"""
    # First measure baseline
    baseline = await measure_ping(host, count=2)
    
    # Simulate optimization delay
    await asyncio.sleep(1 + level)
    
    # Measure optimized ping (simulate improvement)
    optimized = await measure_ping(host, count=2)
    
    # Apply optimization factor
    improvement_factor = 0.7 - (level * 0.1)  # Better optimization with higher level
    optimized.latency = max(optimized.latency * improvement_factor, 5.0)
    optimized.optimized = True
    
    return optimized

# API Endpoints
@app.get("/")
async def root():
    return {"message": "PingBooster API Server", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}

@app.post("/api/ping")
async def ping_endpoint(request: PingRequest):
    """Perform ping test"""
    result = await measure_ping(request.host, request.count, request.timeout)
    
    # Broadcast to WebSocket clients
    await broadcast_to_clients({
        "type": "ping_result",
        "data": result.dict()
    })
    
    return result

@app.post("/api/optimize")
async def optimize_endpoint(request: OptimizeRequest):
    """Optimize connection to host"""
    result = await optimize_connection(request.host, request.optimization_level)
    
    # Broadcast to WebSocket clients
    await broadcast_to_clients({
        "type": "optimization_complete",
        "data": result.dict()
    })
    
    return {"success": True, "result": result}

@app.get("/api/ping-history")
async def get_ping_history():
    """Get recent ping history"""
    return {"results": ping_results[-50:]}  # Last 50 results

@app.get("/api/servers")
async def get_servers():
    """Get list of test servers"""
    servers = [
        {"id": "1", "name": "Google DNS", "host": "8.8.8.8", "location": "Global", "flag": "🌍"},
        {"id": "2", "name": "Cloudflare", "host": "1.1.1.1", "location": "Global", "flag": "🌍"},
        {"id": "3", "name": "OpenDNS", "host": "208.67.222.222", "location": "US", "flag": "🇺🇸"},
        {"id": "4", "name": "Quad9", "host": "9.9.9.9", "location": "Global", "flag": "🌍"},
        {"id": "5", "name": "Level3", "host": "4.2.2.2", "location": "US", "flag": "🇺🇸"},
    ]
    return {"servers": servers}

# WebSocket handling
async def broadcast_to_clients(message: dict):
    """Broadcast message to all connected WebSocket clients"""
    if connected_clients:
        disconnected = []
        for client in connected_clients:
            try:
                await client.send_text(json.dumps(message))
            except:
                disconnected.append(client)
        
        # Remove disconnected clients
        for client in disconnected:
            if client in connected_clients:
                connected_clients.remove(client)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    
    # Send recent history to new client
    await websocket.send_text(json.dumps({
        "type": "ping_history",
        "data": [result.dict() for result in ping_results[-20:]]
    }))
    
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in connected_clients:
            connected_clients.remove(websocket)

if __name__ == "__main__":
    print("🚀 Starting PingBooster Python Backend...")
    print("📊 Real ping measurement server")
    print("🔧 Traffic optimization engine")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )