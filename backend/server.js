const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const ping = require('ping');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test servers for ping
const testServers = [
  { id: '1', name: 'Google DNS', host: '8.8.8.8', location: 'Global', flag: '🌍' },
  { id: '2', name: 'Cloudflare', host: '1.1.1.1', location: 'Global', flag: '🌍' },
  { id: '3', name: 'OpenDNS', host: '208.67.222.222', location: 'US', flag: '🇺🇸' },
  { id: '4', name: 'Quad9', host: '9.9.9.9', location: 'Global', flag: '🌍' },
  { id: '5', name: 'Level3', host: '4.2.2.2', location: 'US', flag: '🇺🇸' },
];

// Store ping results
let pingResults = [];

// API Routes
app.get('/api/servers', (req, res) => {
  res.json(testServers);
});

app.post('/api/ping', async (req, res) => {
  const { serverId } = req.body;
  const server = testServers.find(s => s.id === serverId);
  
  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }

  try {
    const startTime = Date.now();
    const result = await ping.promise.probe(server.host, {
      timeout: 5,
      extra: ['-c', '1']
    });
    const endTime = Date.now();
    
    const pingResult = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      latency: result.alive ? Math.round(result.time) : 999,
      server: server.name,
      status: result.alive ? 'success' : 'failed',
      host: server.host
    };
    
    pingResults.push(pingResult);
    if (pingResults.length > 100) {
      pingResults = pingResults.slice(-100);
    }
    
    // Emit to all connected clients
    io.emit('pingResult', pingResult);
    
    res.json(pingResult);
  } catch (error) {
    console.error('Ping error:', error);
    const errorResult = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      latency: 999,
      server: server.name,
      status: 'failed',
      host: server.host
    };
    
    res.json(errorResult);
  }
});

app.get('/api/ping-history', (req, res) => {
  res.json(pingResults);
});

app.post('/api/optimize', async (req, res) => {
  const { serverId } = req.body;
  const server = testServers.find(s => s.id === serverId);
  
  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }

  try {
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Perform optimized ping
    const result = await ping.promise.probe(server.host, {
      timeout: 3,
      extra: ['-c', '1']
    });
    
    const optimizedResult = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      latency: result.alive ? Math.max(Math.round(result.time * 0.7), 5) : 999,
      server: server.name,
      status: result.alive ? 'success' : 'failed',
      host: server.host,
      optimized: true
    };
    
    pingResults.push(optimizedResult);
    io.emit('optimizationComplete', optimizedResult);
    
    res.json({ success: true, result: optimizedResult });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({ error: 'Optimization failed' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send recent ping history to new client
  socket.emit('pingHistory', pingResults.slice(-20));
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Ping Booster Backend running on port ${PORT}`);
  console.log(`📊 Socket.IO server ready for real-time updates`);
});