const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  const filePath = req.url === '/' ? 'index.html' : req.url.slice(1);
  fs.readFile(path.join(__dirname, filePath), (err, data) => {
    if (err) {
      res.writeHead(404); res.end('Not Found'); return;
    }
    res.writeHead(200); res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

const rooms = {}; // room -> {users: [], history: []}

wss.on('connection', ws => {
  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    const room = msg.room || 'main';

    if (!rooms[room]) rooms[room] = { users: [], history: [] };

    if (!rooms[room].users.includes(ws)) {
      ws.room = room;
      rooms[room].users.push(ws);
    }

    // If draw event, store it
    if (msg.type === 'draw') rooms[room].history.push(msg);

    // Broadcast to all in room
    rooms[room].users.forEach(user => {
      if (user.readyState === WebSocket.OPEN) user.send(JSON.stringify(msg));
    });

    // Send full history to new users
    if (msg.type === 'join') {
      ws.send(JSON.stringify({ type: 'history', history: rooms[room].history }));
    }
  });

  ws.on('close', () => {
    if (ws.room) rooms[ws.room].users = rooms[ws.room].users.filter(u => u !== ws);
  });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
